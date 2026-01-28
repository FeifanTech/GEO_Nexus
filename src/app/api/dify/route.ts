import { NextRequest } from "next/server";

/**
 * 统一 Dify API 路由
 *
 * 所有 AI 功能通过一个 Dify 应用处理，通过 task_type 区分任务类型：
 *
 * task_type 类型：
 * - "diagnosis_rank"      : GEO 诊断 - 排名检查
 * - "diagnosis_competitor": GEO 诊断 - 竞品分析
 * - "diagnosis_sentiment" : GEO 诊断 - 舆情审计
 * - "content_pdp"         : 内容生成 - PDP 摘要
 * - "content_review"      : 内容生成 - 评论脚本
 * - "content_social"      : 内容生成 - 种草文案
 * - "monitor_search"      : AI 搜索监测
 */

const DIFY_API_BASE_URL =
  process.env.DIFY_API_BASE_URL || "https://api.dify.ai/v1";
const DIFY_API_KEY = process.env.DIFY_API_KEY;

// 开发环境禁用 SSL 验证（解决证书问题）
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// 判断是 Chat 类型还是 Completion 类型
// Chat 类型需要 query 参数，Completion 类型只需要 inputs
type AppType = "chat" | "completion";

function getAppType(taskType: string): AppType {
  // 诊断类任务使用 Chat 模式（支持多轮对话）
  if (taskType.startsWith("diagnosis_") || taskType === "monitor_search") {
    return "chat";
  }
  // 内容生成类任务使用 Completion 模式（单次生成）
  return "completion";
}

function getEndpoint(appType: AppType): string {
  return appType === "chat" ? "/chat-messages" : "/completion-messages";
}

export interface UnifiedRequestBody {
  task_type: string;
  inputs: Record<string, string>;
  query?: string;  // Chat 模式需要
  user: string;
  conversation_id?: string;
  response_mode?: "streaming" | "blocking";
  // 支持从前端传递 API Key（可选，优先级高于环境变量）
  dify_api_key?: string;
  dify_base_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: UnifiedRequestBody = await request.json();

    // 优先使用请求中的 API Key，回退到环境变量
    const apiKey = body.dify_api_key || DIFY_API_KEY;
    const baseUrl = body.dify_base_url || DIFY_API_BASE_URL;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "DIFY_API_KEY is not configured",
          message: "请在设置页面配置 Dify API Key，或在环境变量中设置 DIFY_API_KEY"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    if (!body.task_type) {
      return new Response(
        JSON.stringify({ error: "task_type is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const appType = getAppType(body.task_type);
    const endpoint = getEndpoint(appType);

    // 构建请求体
    const requestBody: Record<string, unknown> = {
      inputs: {
        ...body.inputs,
        task_type: body.task_type,  // 将 task_type 也传给 Dify
      },
      user: body.user,
      response_mode: body.response_mode || "streaming",
    };

    // Chat 模式需要 query 参数
    if (appType === "chat") {
      requestBody.query = body.query || body.inputs.query || "";
      if (body.conversation_id) {
        requestBody.conversation_id = body.conversation_id;
      }
    }

    console.log(`[Dify API] Task: ${body.task_type}, Type: ${appType}, Endpoint: ${endpoint}`);

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dify API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Dify API error",
          status: response.status,
          details: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 流式响应
    if (requestBody.response_mode === "streaming") {
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                break;
              }
              controller.enqueue(value);
            }
          } catch (error) {
            console.error("Stream error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 阻塞响应
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
