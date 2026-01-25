export interface Product {
  id: string;
  name: string;
  selling_points: string[];
  target_users: string;
  competitors: string;
}

export type ProductFormData = Omit<Product, "id">;
