export interface Product {
  id: string;
  name: string;
  selling_points: string[];
  target_users: string;
  competitors: string;         // 竞品名称（文本描述，向后兼容）
  competitorIds?: string[];    // 关联的竞品 ID 列表
}

export type ProductFormData = Omit<Product, "id">;
