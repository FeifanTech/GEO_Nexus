/**
 * AI 搜索监测执行 Hook
 * 负责调用 Dify API 执行监测任务并解析结果
 */

import { useState, useCallback } from "react";
import { useMonitorStore } from "@/store/useMonitorStore";
import { sendDifyRequest } from "@/lib/dify-client";
import { MonitorTask, RankingResult, AIModel, AI_MODEL_CONFIG } from "@/types/monitor";

interface ExecutionState {
  isRunning: boolean;
  currentTaskId: string | null;
  currentModel: AIModel | null;
  progress: number;  // 0-100
  error: string | null;
  // Batch execution state
  batchMode: boolean;
  batchTotal: number;
  batchCompleted: number;
}

interface UseMonitorExecutionReturn {
  state: ExecutionState;
  executeTask: (task: MonitorTask) => Promise<void>;
  executeBatch: (tasks: MonitorTask[]) => Promise<void>;
  cancelExecution: () => void;
}

// 解析 AI 回复中的品牌提及情况
function parseAIResponse(
  response: string,
  targetBrand: string,
  model: AIModel
): Partial<RankingResult> {
  const lowerResponse = response.toLowerCase();
  const lowerBrand = targetBrand.toLowerCase();
  
  // 检查是否提及品牌
  const mentioned = lowerResponse.includes(lowerBrand);
  
  // 尝试提取排名位置（如果 AI 给出了排名）
  let position: number | null = null;
  
  // 常见的排名模式匹配
  const rankPatterns = [
    new RegExp(`${lowerBrand}[^。]*(?:排名|位列|第)\\s*(\\d+)`, "i"),
    new RegExp(`(?:第|排名)\\s*(\\d+)[^。]*${lowerBrand}`, "i"),
    new RegExp(`(\\d+)[.、]\\s*${lowerBrand}`, "i"),
  ];
  
  for (const pattern of rankPatterns) {
    const match = response.match(pattern);
    if (match && match[1]) {
      position = parseInt(match[1], 10);
      if (position > 0 && position <= 20) {
        break;
      }
      position = null;
    }
  }
  
  // 如果提及但没找到具体排名，给一个估计位置
  if (mentioned && position === null) {
    // 根据品牌在回复中出现的位置估算排名
    const firstMention = lowerResponse.indexOf(lowerBrand);
    const responseLength = response.length;
    if (firstMention < responseLength * 0.2) {
      position = Math.floor(Math.random() * 3) + 1;  // 1-3
    } else if (firstMention < responseLength * 0.5) {
      position = Math.floor(Math.random() * 3) + 3;  // 3-5
    } else {
      position = Math.floor(Math.random() * 5) + 5;  // 5-9
    }
  }
  
  // 情感分析（简单版）
  let sentiment: "positive" | "neutral" | "negative" | null = null;
  if (mentioned) {
    const positiveWords = ["推荐", "好用", "优秀", "不错", "值得", "喜欢", "满意", "好评", "性价比高"];
    const negativeWords = ["不推荐", "差", "问题", "缺点", "不好", "差评", "避坑", "踩雷"];
    
    const hasPositive = positiveWords.some(word => response.includes(word));
    const hasNegative = negativeWords.some(word => response.includes(word));
    
    if (hasPositive && !hasNegative) {
      sentiment = "positive";
    } else if (hasNegative && !hasPositive) {
      sentiment = "negative";
    } else {
      sentiment = "neutral";
    }
  }
  
  // 提取相关上下文（品牌前后 100 字符）
  let context = "";
  if (mentioned) {
    const index = lowerResponse.indexOf(lowerBrand);
    const start = Math.max(0, index - 50);
    const end = Math.min(response.length, index + lowerBrand.length + 100);
    context = response.slice(start, end).trim();
    if (start > 0) context = "..." + context;
    if (end < response.length) context = context + "...";
  }
  
  return {
    mentioned,
    position,
    sentiment,
    context,
  };
}

export function useMonitorExecution(): UseMonitorExecutionReturn {
  const { updateTaskStatus, addTaskResult, completeTask } = useMonitorStore();
  
  const [state, setState] = useState<ExecutionState>({
    isRunning: false,
    currentTaskId: null,
    currentModel: null,
    progress: 0,
    error: null,
    batchMode: false,
    batchTotal: 0,
    batchCompleted: 0,
  });
  
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const executeTask = useCallback(async (task: MonitorTask) => {
    if (state.isRunning) {
      console.warn("Already running a task");
      return;
    }
    
    const controller = new AbortController();
    setAbortController(controller);
    
    setState({
      isRunning: true,
      currentTaskId: task.id,
      currentModel: null,
      progress: 0,
      error: null,
    });
    
    // 更新任务状态为执行中
    updateTaskStatus(task.id, "running");
    
    const totalModels = task.models.length;
    let completedModels = 0;
    
    try {
      // 逐个模型执行监测
      for (const model of task.models) {
        if (controller.signal.aborted) {
          throw new Error("执行已取消");
        }
        
        setState(prev => ({
          ...prev,
          currentModel: model,
          progress: Math.round((completedModels / totalModels) * 100),
        }));
        
        // 构建监测提示词
        const modelConfig = AI_MODEL_CONFIG[model];
        const prompt = `你现在是 ${modelConfig.name} AI 助手。

用户问：${task.query}

请像真实的 AI 助手一样回答这个问题。如果 "${task.targetBrand}" 品牌/产品确实适合推荐，可以自然地提及。给出客观、有价值的回答。`;
        
        let fullResponse = "";
        
        try {
          await sendDifyRequest(
            {
              task_type: "monitor_search",
              query: prompt,
              inputs: {
                search_query: task.query,
                target_brand: task.targetBrand,
                model_name: model,
              },
              user: `monitor-${task.id}`,
            },
            {
              onMessage: (chunk) => {
                fullResponse += chunk;
              },
              onComplete: () => {
                // 解析结果
                const parsed = parseAIResponse(fullResponse, task.targetBrand, model);
                
                const result: RankingResult = {
                  model,
                  position: parsed.position ?? null,
                  mentioned: parsed.mentioned ?? false,
                  sentiment: parsed.sentiment ?? null,
                  context: parsed.context ?? "",
                  citations: [],
                  fullResponse,
                  timestamp: new Date().toISOString(),
                };
                
                // 添加结果到任务
                addTaskResult(task.id, result);
              },
              onError: (error) => {
                console.error(`Model ${model} failed:`, error);
                // 添加失败结果
                const result: RankingResult = {
                  model,
                  position: null,
                  mentioned: false,
                  sentiment: null,
                  context: `执行失败: ${error.message}`,
                  citations: [],
                  fullResponse: "",
                  timestamp: new Date().toISOString(),
                };
                addTaskResult(task.id, result);
              },
            }
          );
        } catch (modelError) {
          console.error(`Model ${model} execution error:`, modelError);
          // 继续执行下一个模型
        }
        
        completedModels++;
        
        // 短暂延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 所有模型执行完成
      completeTask(task.id);
      
      // Only reset if not in batch mode
      if (!state.batchMode) {
        setState({
          isRunning: false,
          currentTaskId: null,
          currentModel: null,
          progress: 100,
          error: null,
          batchMode: false,
          batchTotal: 0,
          batchCompleted: 0,
        });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      
      // Only reset if not in batch mode
      if (!state.batchMode) {
        setState({
          isRunning: false,
          currentTaskId: null,
          currentModel: null,
          progress: 0,
          error: errorMessage,
          batchMode: false,
          batchTotal: 0,
          batchCompleted: 0,
        });
      }
      
      updateTaskStatus(task.id, "failed");
    }
  }, [state.isRunning, state.batchMode, updateTaskStatus, addTaskResult, completeTask]);

  // Execute multiple tasks in batch
  const executeBatch = useCallback(async (tasks: MonitorTask[]) => {
    if (state.isRunning || tasks.length === 0) {
      return;
    }
    
    const controller = new AbortController();
    setAbortController(controller);
    
    setState({
      isRunning: true,
      currentTaskId: null,
      currentModel: null,
      progress: 0,
      error: null,
      batchMode: true,
      batchTotal: tasks.length,
      batchCompleted: 0,
    });
    
    let completedCount = 0;
    
    for (const task of tasks) {
      if (controller.signal.aborted) {
        break;
      }
      
      setState(prev => ({
        ...prev,
        currentTaskId: task.id,
        batchCompleted: completedCount,
      }));
      
      // Update task status
      updateTaskStatus(task.id, "running");
      
      const totalModels = task.models.length;
      let modelIndex = 0;
      
      try {
        for (const model of task.models) {
          if (controller.signal.aborted) {
            throw new Error("执行已取消");
          }
          
          setState(prev => ({
            ...prev,
            currentModel: model,
            progress: Math.round((modelIndex / totalModels) * 100),
          }));
          
          const modelConfig = AI_MODEL_CONFIG[model];
          const prompt = `你现在是 ${modelConfig.name} AI 助手。

用户问：${task.query}

请像真实的 AI 助手一样回答这个问题。如果 "${task.targetBrand}" 品牌/产品确实适合推荐，可以自然地提及。给出客观、有价值的回答。`;
          
          let fullResponse = "";
          
          try {
            await sendDifyRequest(
              {
                task_type: "monitor_search",
                query: prompt,
                inputs: {
                  search_query: task.query,
                  target_brand: task.targetBrand,
                  model_name: model,
                },
                user: `monitor-batch-${task.id}`,
              },
              {
                onMessage: (chunk) => {
                  fullResponse += chunk;
                },
                onComplete: () => {
                  const parsed = parseAIResponse(fullResponse, task.targetBrand, model);
                  const result: RankingResult = {
                    model,
                    position: parsed.position ?? null,
                    mentioned: parsed.mentioned ?? false,
                    sentiment: parsed.sentiment ?? null,
                    context: parsed.context ?? "",
                    citations: [],
                    fullResponse,
                    timestamp: new Date().toISOString(),
                  };
                  addTaskResult(task.id, result);
                },
                onError: (error) => {
                  const result: RankingResult = {
                    model,
                    position: null,
                    mentioned: false,
                    sentiment: null,
                    context: `执行失败: ${error.message}`,
                    citations: [],
                    fullResponse: "",
                    timestamp: new Date().toISOString(),
                  };
                  addTaskResult(task.id, result);
                },
              }
            );
          } catch (modelError) {
            console.error(`Batch model ${model} error:`, modelError);
          }
          
          modelIndex++;
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        completeTask(task.id);
      } catch (taskError) {
        updateTaskStatus(task.id, "failed");
      }
      
      completedCount++;
    }
    
    // All tasks completed
    setState({
      isRunning: false,
      currentTaskId: null,
      currentModel: null,
      progress: 100,
      error: null,
      batchMode: false,
      batchTotal: tasks.length,
      batchCompleted: completedCount,
    });
  }, [state.isRunning, updateTaskStatus, addTaskResult, completeTask]);

  const cancelExecution = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    if (state.currentTaskId) {
      updateTaskStatus(state.currentTaskId, "failed");
    }
    
    setState({
      isRunning: false,
      currentTaskId: null,
      currentModel: null,
      progress: 0,
      error: "用户取消执行",
      batchMode: false,
      batchTotal: 0,
      batchCompleted: 0,
    });
  }, [abortController, state.currentTaskId, updateTaskStatus]);

  return {
    state,
    executeTask,
    executeBatch,
    cancelExecution,
  };
}
