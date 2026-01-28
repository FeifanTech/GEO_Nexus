export interface Product {
  id: string;
  name: string;
  category?: string;
  description?: string;
  selling_points: string[];       // 前端使用 snake_case
  target_users: string;           // 前端使用 snake_case
  price_range?: string;           // 前端使用 snake_case
  competitors?: string;           // 向后兼容
  competitorIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProductFormData = Omit<Product, "id" | "createdAt" | "updatedAt">;
