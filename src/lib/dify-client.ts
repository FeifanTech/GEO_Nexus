/**
 * Dify API Client for Frontend
 * 
 * 统一 API 调用，通过 task_type 区分不同任务：
 * 
 * GEO 诊断类：
 * - diagnosis_rank      : 排名检查
 * - diagnosis_competitor: 竞品分析
 * - diagnosis_sentiment : 舆情审计
 * 
 * 内容生成类：
 * - content_pdp    : PDP 摘要
 * - content_review : 评论脚本
 * - content_social : 种草文案
 * 
 * AI 监测类：
 * - monitor_search : AI 搜索监测
 */

// ============ Types ============

export interface DifyMessage {
  id: string;
  conversation_id: string;
  answer: string;
  created_at: number;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export interface DifyStreamEvent {
  event:
    | "message"
    | "agent_message"
    | "agent_thought"
    | "message_file"
    | "message_end"
    | "message_replace"
    | "workflow_started"
    | "workflow_finished"
    | "node_started"
    | "node_finished"
    | "error"
    | "ping";
  task_id?: string;
  message_id?: string;
  conversation_id?: string;
  answer?: string;
  created_at?: number;
  metadata?: Record<string, unknown>;
  workflow_run_id?: string;
  data?: {
    id?: string;
    title?: string;
    outputs?: Record<string, unknown>;
    status?: string;
    error?: string;
  };
}

// 任务类型
export type TaskType =
  // 诊断类
  | "diagnosis_rank"
  | "diagnosis_competitor"
  | "diagnosis_sentiment"
  // 内容类
  | "content_pdp"
  | "content_review"
  | "content_social"
  // 监测类
  | "monitor_search";

// 统一请求参数
export interface DifyRequestParams {
  task_type: TaskType;
  inputs: Record<string, string>;
  query?: string;  // Chat 类型任务需要
  user: string;
  conversation_id?: string;
}

export interface StreamCallbacks {
  onMessage?: (content: string, isFirstChunk: boolean) => void;
  onComplete?: (fullContent: string, conversationId?: string) => void;
  onError?: (error: Error) => void;
}

// ============ SSE Parser ============

function parseSSEEvent(line: string): DifyStreamEvent | null {
  if (!line.startsWith("data: ")) return null;

  const data = line.slice(6);
  if (data === "[DONE]") return null;

  try {
    return JSON.parse(data) as DifyStreamEvent;
  } catch {
    console.warn("Failed to parse SSE event:", data);
    return null;
  }
}

// ============ Stream Handler ============

async function handleStream(
  response: Response,
  callbacks: StreamCallbacks
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  let isFirstChunk = true;
  let conversationId: string | undefined;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (buffer.trim()) {
          const lines = buffer.split("\n");
          for (const line of lines) {
            if (line.trim()) {
              const event = parseSSEEvent(line);
              if (event?.answer) {
                fullContent += event.answer;
                callbacks.onMessage?.(event.answer, isFirstChunk);
                isFirstChunk = false;
              }
              if (event?.conversation_id) {
                conversationId = event.conversation_id;
              }
            }
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;

        const event = parseSSEEvent(line);
        if (!event) continue;

        if (event.event === "error") {
          throw new Error(
            (event as unknown as { message?: string }).message ||
              "Stream error from Dify"
          );
        }

        if (event.event === "message" || event.event === "agent_message") {
          if (event.answer) {
            fullContent += event.answer;
            callbacks.onMessage?.(event.answer, isFirstChunk);
            isFirstChunk = false;
          }
          if (event.conversation_id) {
            conversationId = event.conversation_id;
          }
        }

        if (event.event === "message_end") {
          if (event.conversation_id) {
            conversationId = event.conversation_id;
          }
        }
      }
    }

    callbacks.onComplete?.(fullContent, conversationId);
  } catch (error) {
    callbacks.onError?.(
      error instanceof Error ? error : new Error("Unknown error")
    );
    throw error;
  } finally {
    reader.releaseLock();
  }
}

// ============ 统一 API 调用 ============

/**
 * 发送 Dify 请求（流式响应）
 */
export async function sendDifyRequest(
  params: DifyRequestParams,
  callbacks: StreamCallbacks
): Promise<void> {
  const response = await fetch("/api/dify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...params,
      response_mode: "streaming",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "请求失败");
  }

  await handleStream(response, callbacks);
}

/**
 * 发送 Dify 请求（阻塞响应）
 */
export async function sendDifyRequestBlocking(
  params: DifyRequestParams
): Promise<DifyMessage> {
  const response = await fetch("/api/dify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...params,
      response_mode: "blocking",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "请求失败");
  }

  return response.json();
}

// ============ 便捷方法 ============

/**
 * GEO 诊断
 */
export async function sendDiagnosis(
  params: {
    type: "rank" | "competitor" | "sentiment";
    query: string;
    user: string;
    inputs?: Record<string, string>;
    conversation_id?: string;
  },
  callbacks: StreamCallbacks
): Promise<void> {
  const taskType = `diagnosis_${params.type}` as TaskType;
  return sendDifyRequest(
    {
      task_type: taskType,
      query: params.query,
      user: params.user,
      inputs: params.inputs || {},
      conversation_id: params.conversation_id,
    },
    callbacks
  );
}

/**
 * 内容生成
 */
export async function generateContent(
  params: {
    type: "pdp" | "review" | "social";
    inputs: Record<string, string>;
    user: string;
  },
  callbacks: StreamCallbacks
): Promise<void> {
  const taskType = `content_${params.type}` as TaskType;
  return sendDifyRequest(
    {
      task_type: taskType,
      inputs: params.inputs,
      user: params.user,
    },
    callbacks
  );
}

/**
 * AI 搜索监测
 */
export async function monitorSearch(
  params: {
    query: string;
    targetBrand: string;
    models: string[];
    user: string;
  },
  callbacks: StreamCallbacks
): Promise<void> {
  return sendDifyRequest(
    {
      task_type: "monitor_search",
      query: params.query,
      inputs: {
        target_brand: params.targetBrand,
        models: params.models.join(","),
        search_query: params.query,
      },
      user: params.user,
    },
    callbacks
  );
}

// ============ React Hook Helper ============

/**
 * 创建流式消息处理器
 */
export function createStreamHandler(
  setContent: (updater: (prev: string) => string) => void,
  onComplete?: (fullContent: string, conversationId?: string) => void,
  onError?: (error: Error) => void
): StreamCallbacks {
  return {
    onMessage: (chunk, isFirstChunk) => {
      if (isFirstChunk) {
        setContent(() => chunk);
      } else {
        setContent((prev) => prev + chunk);
      }
    },
    onComplete: (fullContent, conversationId) => {
      onComplete?.(fullContent, conversationId);
    },
    onError: (error) => {
      console.error("Stream error:", error);
      onError?.(error);
    },
  };
}

// ============ 向后兼容（旧 API）============

/** @deprecated Use sendDiagnosis instead */
export async function sendChatMessage(
  params: { query: string; user: string; inputs?: Record<string, string>; conversation_id?: string },
  callbacks: StreamCallbacks
): Promise<void> {
  return sendDiagnosis(
    { type: "rank", ...params },
    callbacks
  );
}

/** @deprecated Use generateContent instead */
export async function generateCompletion(
  params: { inputs: Record<string, string>; user: string },
  callbacks: StreamCallbacks
): Promise<void> {
  return generateContent(
    { type: "pdp", ...params },
    callbacks
  );
}
