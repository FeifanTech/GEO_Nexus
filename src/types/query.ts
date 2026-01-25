/**
 * 问题库类型定义
 * 用于 AI 搜索排名监测
 */

// 问题类型/意图分类
export type QueryIntent = 
  | "category_search"     // 品类搜索："什么面霜好用"
  | "brand_search"        // 品牌直搜："XX品牌怎么样"
  | "competitor_compare"  // 竞品对比："A和B哪个好"
  | "scenario_search"     // 场景需求："送礼买什么"
  | "problem_solve"       // 问题解决："皮肤干燥用什么"
  | "recommendation"      // 推荐请求："推荐一款xxx"
  | "review_inquiry"      // 评价询问："xxx口碑怎么样"
  | "other";              // 其他

// 问题优先级
export type QueryPriority = "high" | "medium" | "low";

// 问题状态
export type QueryStatus = "active" | "paused" | "archived";

// 单个搜索问题
export interface SearchQuery {
  id: string;
  question: string;           // 问题内容
  intent: QueryIntent;        // 问题意图
  priority: QueryPriority;    // 优先级
  status: QueryStatus;        // 状态
  productIds: string[];       // 关联产品
  competitorIds: string[];    // 关联竞品
  expectedBrands: string[];   // 期望出现的品牌
  keywords: string[];         // 关键词标签
  notes: string;              // 备注
  createdAt: string;
  updatedAt: string;
}

// 问题表单数据
export type SearchQueryFormData = Omit<SearchQuery, "id" | "createdAt" | "updatedAt">;

// 意图标签配置
export const QUERY_INTENT_CONFIG: Record<QueryIntent, { label: string; color: string; description: string }> = {
  category_search: { 
    label: "品类搜索", 
    color: "bg-blue-100 text-blue-700",
    description: "用户搜索某个品类的产品，如「什么面霜好用」"
  },
  brand_search: { 
    label: "品牌直搜", 
    color: "bg-purple-100 text-purple-700",
    description: "用户直接搜索品牌信息，如「XX品牌怎么样」"
  },
  competitor_compare: { 
    label: "竞品对比", 
    color: "bg-orange-100 text-orange-700",
    description: "用户对比多个品牌/产品，如「A和B哪个好」"
  },
  scenario_search: { 
    label: "场景需求", 
    color: "bg-green-100 text-green-700",
    description: "基于使用场景的搜索，如「送礼买什么」"
  },
  problem_solve: { 
    label: "问题解决", 
    color: "bg-red-100 text-red-700",
    description: "解决具体问题，如「皮肤干燥用什么」"
  },
  recommendation: { 
    label: "推荐请求", 
    color: "bg-teal-100 text-teal-700",
    description: "直接请求推荐，如「推荐一款xxx」"
  },
  review_inquiry: { 
    label: "评价询问", 
    color: "bg-amber-100 text-amber-700",
    description: "询问产品口碑评价，如「xxx口碑怎么样」"
  },
  other: { 
    label: "其他", 
    color: "bg-slate-100 text-slate-700",
    description: "其他类型的问题"
  },
};

// 优先级配置
export const QUERY_PRIORITY_CONFIG: Record<QueryPriority, { label: string; color: string }> = {
  high: { label: "高优先", color: "bg-red-100 text-red-700" },
  medium: { label: "中优先", color: "bg-amber-100 text-amber-700" },
  low: { label: "低优先", color: "bg-slate-100 text-slate-600" },
};
