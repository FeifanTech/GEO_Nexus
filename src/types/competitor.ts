// Competitor interface
export interface Competitor {
  id: string;
  name: string;                    // 竞品名称
  category: string;                // 所属品类
  advantages: string[];            // 竞品优势
  disadvantages: string[];         // 竞品劣势
  priceRange: string;              // 价格区间
  targetAudience: string;          // 目标人群
  mainPlatforms: string[];         // 主要销售渠道
  notes: string;                   // 备注
  createdAt: string;
  updatedAt: string;
}

// Form data for creating/editing competitors
export type CompetitorFormData = Omit<Competitor, "id" | "createdAt" | "updatedAt">;

// Comparison dimension for analysis
export interface ComparisonDimension {
  id: string;
  name: string;
  description: string;
}

// Predefined comparison dimensions
export const COMPARISON_DIMENSIONS: ComparisonDimension[] = [
  { id: "price", name: "价格竞争力", description: "价格定位和性价比" },
  { id: "quality", name: "产品质量", description: "品质和做工水平" },
  { id: "brand", name: "品牌影响力", description: "品牌知名度和口碑" },
  { id: "service", name: "服务体验", description: "售前售后服务质量" },
  { id: "marketing", name: "营销能力", description: "推广和曝光能力" },
  { id: "innovation", name: "创新能力", description: "产品迭代和创新速度" },
];

// Common sales platforms
export const SALES_PLATFORMS = [
  "天猫",
  "京东",
  "拼多多",
  "抖音",
  "快手",
  "小红书",
  "得物",
  "唯品会",
  "官网",
  "线下门店",
];
