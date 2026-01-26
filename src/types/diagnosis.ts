// GEO Diagnosis History Types

export type DiagnosisType = "rank" | "competitor" | "sentiment";

export interface DiagnosisRecord {
  id: string;
  productId: string;
  productName: string;
  type: DiagnosisType;
  query: string;          // The prompt/query sent
  result: string;         // AI response (markdown)
  conversationId?: string; // For follow-up conversations
  createdAt: string;
  updatedAt: string;
}

export const DIAGNOSIS_TYPE_CONFIG: Record<DiagnosisType, {
  label: string;
  description: string;
  icon: string;
  color: string;
}> = {
  rank: {
    label: "排名检查",
    description: "检查产品在 AI 搜索中的排名",
    icon: "🏆",
    color: "bg-blue-100 text-blue-700",
  },
  competitor: {
    label: "竞品分析",
    description: "与竞争对手进行对比分析",
    icon: "⚔️",
    color: "bg-purple-100 text-purple-700",
  },
  sentiment: {
    label: "舆情审计",
    description: "分析产品口碑和用户情感",
    icon: "💬",
    color: "bg-amber-100 text-amber-700",
  },
};
