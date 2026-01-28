import { create } from "zustand";
import { Product } from "@/types/product";
import { api } from "@/lib/api-client";

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Omit<Product, "id">>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setCurrentProduct: (product: Product | null) => void;
  clearError: () => void;
}

// 字段名转换助手
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDBFormat(product: any) {
  return {
    name: product.name,
    category: product.category,
    description: product.description || product.competitors,
    sellingPoints: product.selling_points || product.sellingPoints || [],
    targetUsers: product.target_users || product.targetUsers,
    priceRange: product.price_range || product.priceRange,
    competitorIds: product.competitorIds || [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFrontendFormat(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    description: dbProduct.description,
    selling_points: dbProduct.sellingPoints || [],
    target_users: dbProduct.targetUsers || "",
    price_range: dbProduct.priceRange,
    competitors: dbProduct.description,
    competitorIds: dbProduct.competitorIds || [],
    createdAt: dbProduct.createdAt,
    updatedAt: dbProduct.updatedAt,
  };
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  loading: false,
  error: null,

  fetchProducts: async () => {
    // 只在首次加载或products为空时显示loading
    const shouldShowLoading = get().products.length === 0;
    if (shouldShowLoading) {
      set({ loading: true, error: null });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbProducts = await api.get<any[]>('/api/products');
      const products = dbProducts.map(toFrontendFormat);
      set({ products, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      set({ error: message, loading: false });
    }
  },

  addProduct: async (productData) => {
    // 乐观更新：立即创建临时产品
    const tempId = `temp_${Date.now()}`;
    const optimisticProduct: Product = {
      id: tempId,
      name: productData.name || "",
      category: productData.category,
      description: productData.description,
      selling_points: productData.selling_points || [],
      target_users: productData.target_users || "",
      price_range: productData.price_range,
      competitors: productData.competitors,
      competitorIds: productData.competitorIds || [],
    };

    // 立即添加到列表（乐观更新）
    set((state) => ({
      products: [...state.products, optimisticProduct],
      loading: true,
    }));

    try {
      const dbData = toDBFormat(productData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbProduct = await api.post<any>('/api/products', dbData);
      const newProduct = toFrontendFormat(dbProduct);

      // 用真实数据替换临时数据
      set((state) => ({
        products: state.products.map((p) => (p.id === tempId ? newProduct : p)),
        loading: false,
      }));
      return newProduct;
    } catch (error) {
      // 如果失败，移除临时产品
      set((state) => ({
        products: state.products.filter((p) => p.id !== tempId),
        error: error instanceof Error ? error.message : '未知错误',
        loading: false,
      }));
      return null;
    }
  },

  updateProduct: async (id, productData) => {
    // 乐观更新：立即更新UI
    const previousState = get();
    const dbData = toDBFormat(productData);

    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...productData } : p
      ),
      currentProduct:
        state.currentProduct?.id === id
          ? { ...state.currentProduct, ...productData }
          : state.currentProduct,
      loading: true,
    }));

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbProduct = await api.put<any>(`/api/products/${id}`, dbData);
      const updatedProduct = toFrontendFormat(dbProduct);

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        currentProduct: state.currentProduct?.id === id ? updatedProduct : state.currentProduct,
        loading: false,
      }));
    } catch (error) {
      // 如果失败，恢复之前的状态
      set({
        products: previousState.products,
        currentProduct: previousState.currentProduct,
        error: error instanceof Error ? error.message : '未知错误',
        loading: false,
      });
    }
  },

  deleteProduct: async (id) => {
    // 乐观更新：立即从列表移除
    const previousState = get();

    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
      loading: true,
    }));

    try {
      await api.delete(`/api/products/${id}`);
      set({ loading: false });
    } catch (error) {
      // 如果失败，恢复之前的状态
      set({
        products: previousState.products,
        currentProduct: previousState.currentProduct,
        error: error instanceof Error ? error.message : '未知错误',
        loading: false,
      });
    }
  },

  setCurrentProduct: (product) => set({ currentProduct: product }),
  clearError: () => set({ error: null }),
}));
