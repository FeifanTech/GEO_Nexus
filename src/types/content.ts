// Content Factory History Types

export type ContentType = "pdp" | "review" | "social";

export interface ContentRecord {
  id: string;
  productId: string;
  productName: string;
  type: ContentType;
  platform?: string;       // For social content: 小红书/知乎/逛逛
  batchCount?: number;     // For reviews: number of reviews generated
  content: string;         // Generated content
  createdAt: string;
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, {
  label: string;
  description: string;
  icon: string;
  color: string;
}> = {
  pdp: {
    label: "PDP 摘要",
    description: "产品详情页 AI 摘要",
    icon: "📄",
    color: "bg-blue-100 text-blue-700",
  },
  review: {
    label: "评论脚本",
    description: "口碑评论批量生成",
    icon: "💬",
    color: "bg-green-100 text-green-700",
  },
  social: {
    label: "种草文案",
    description: "社交媒体推广内容",
    icon: "📱",
    color: "bg-pink-100 text-pink-700",
  },
};
