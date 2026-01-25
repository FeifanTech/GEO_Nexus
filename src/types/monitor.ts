/**
 * AI 搜索排名监测类型定义
 */

// 支持的 AI 模型/搜索引擎
export type AIModel = 
  | "gpt4"           // GPT-4 / ChatGPT
  | "claude"         // Claude
  | "kimi"           // Kimi (月之暗面)
  | "qwen"           // 通义千问
  | "wenxin"         // 文心一言
  | "doubao"         // 豆包
  | "perplexity";    // Perplexity

// 排名结果
export interface RankingResult {
  model: AIModel;
  position: number | null;    // 排名位置，null 表示未出现
  mentioned: boolean;         // 是否被提及
  sentiment: "positive" | "neutral" | "negative" | null;  // 情感倾向
  context: string;            // AI 回复中的相关上下文
  citations: string[];        // 引用来源
  fullResponse: string;       // 完整回复
  timestamp: string;
}

// 单次监测任务
export interface MonitorTask {
  id: string;
  queryId: string;            // 关联的问题 ID
  query: string;              // 问题内容快照
  targetBrand: string;        // 目标品牌
  models: AIModel[];          // 测试的模型列表
  results: RankingResult[];   // 各模型的结果
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  completedAt: string | null;
}

// 监测历史记录（用于趋势分析）
export interface MonitorHistory {
  queryId: string;
  brandName: string;
  records: Array<{
    date: string;
    model: AIModel;
    position: number | null;
    mentioned: boolean;
  }>;
}

// 监测任务表单
export type MonitorTaskFormData = {
  queryIds: string[];         // 要监测的问题 ID 列表
  targetBrand: string;        // 目标品牌
  models: AIModel[];          // 要测试的模型
};

// AI 模型配置
export const AI_MODEL_CONFIG: Record<AIModel, { 
  name: string; 
  icon: string; 
  color: string;
  description: string;
}> = {
  gpt4: { 
    name: "GPT-4", 
    icon: "🤖", 
    color: "bg-emerald-100 text-emerald-700",
    description: "OpenAI GPT-4 / ChatGPT"
  },
  claude: { 
    name: "Claude", 
    icon: "🧠", 
    color: "bg-orange-100 text-orange-700",
    description: "Anthropic Claude"
  },
  kimi: { 
    name: "Kimi", 
    icon: "🌙", 
    color: "bg-indigo-100 text-indigo-700",
    description: "月之暗面 Kimi"
  },
  qwen: { 
    name: "通义千问", 
    icon: "💬", 
    color: "bg-blue-100 text-blue-700",
    description: "阿里巴巴通义千问"
  },
  wenxin: { 
    name: "文心一言", 
    icon: "📝", 
    color: "bg-red-100 text-red-700",
    description: "百度文心一言"
  },
  doubao: { 
    name: "豆包", 
    icon: "🫛", 
    color: "bg-cyan-100 text-cyan-700",
    description: "字节跳动豆包"
  },
  perplexity: { 
    name: "Perplexity", 
    icon: "🔍", 
    color: "bg-violet-100 text-violet-700",
    description: "Perplexity AI 搜索"
  },
};

// 默认监测模型
export const DEFAULT_MONITOR_MODELS: AIModel[] = ["qwen", "kimi", "wenxin"];
