import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
  setCurrentProduct: (product: Product | null) => void;
}

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: [],
      currentProduct: null,

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: generateId(),
        };
        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },

      updateProduct: (id, productData) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...productData } : product
          ),
          currentProduct:
            state.currentProduct?.id === id
              ? { ...state.currentProduct, ...productData }
              : state.currentProduct,
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          currentProduct:
            state.currentProduct?.id === id ? null : state.currentProduct,
        }));
      },

      setCurrentProduct: (product) => {
        set({ currentProduct: product });
      },
    }),
    {
      name: "geo-nexus-products",
    }
  )
);
