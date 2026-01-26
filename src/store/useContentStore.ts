import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ContentRecord, ContentType } from "@/types/content";

interface ContentState {
  records: ContentRecord[];
  
  // CRUD
  addRecord: (record: Omit<ContentRecord, "id" | "createdAt">) => string;
  deleteRecord: (id: string) => void;
  
  // Queries
  getRecordById: (id: string) => ContentRecord | undefined;
  getRecordsByProduct: (productId: string) => ContentRecord[];
  getRecordsByType: (type: ContentType) => ContentRecord[];
  getRecentRecords: (limit?: number) => ContentRecord[];
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (recordData) => {
        const id = `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const newRecord: ContentRecord = {
          ...recordData,
          id,
          createdAt: now,
        };
        
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
        
        return id;
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
        }));
      },

      getRecordById: (id) => {
        return get().records.find((record) => record.id === id);
      },

      getRecordsByProduct: (productId) => {
        return get()
          .records
          .filter((record) => record.productId === productId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getRecordsByType: (type) => {
        return get()
          .records
          .filter((record) => record.type === type)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getRecentRecords: (limit = 10) => {
        return get()
          .records
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      },
    }),
    {
      name: "geo-nexus-content",
    }
  )
);
