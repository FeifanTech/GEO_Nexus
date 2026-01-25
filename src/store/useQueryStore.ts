import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SearchQuery, SearchQueryFormData, QueryIntent, QueryStatus } from "@/types/query";

interface QueryState {
  queries: SearchQuery[];
  
  // CRUD
  addQuery: (data: SearchQueryFormData) => string;
  updateQuery: (id: string, data: Partial<SearchQueryFormData>) => void;
  deleteQuery: (id: string) => void;
  
  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: QueryStatus) => void;
  
  // Queries
  getQueryById: (id: string) => SearchQuery | undefined;
  getQueriesByIntent: (intent: QueryIntent) => SearchQuery[];
  getActiveQueries: () => SearchQuery[];
  getQueriesByProduct: (productId: string) => SearchQuery[];
}

export const useQueryStore = create<QueryState>()(
  persist(
    (set, get) => ({
      queries: [],

      addQuery: (data) => {
        const id = `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const newQuery: SearchQuery = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          queries: [...state.queries, newQuery],
        }));
        
        return id;
      },

      updateQuery: (id, data) => {
        set((state) => ({
          queries: state.queries.map((query) =>
            query.id === id
              ? { ...query, ...data, updatedAt: new Date().toISOString() }
              : query
          ),
        }));
      },

      deleteQuery: (id) => {
        set((state) => ({
          queries: state.queries.filter((query) => query.id !== id),
        }));
      },

      bulkUpdateStatus: (ids, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          queries: state.queries.map((query) =>
            ids.includes(query.id)
              ? { ...query, status, updatedAt: now }
              : query
          ),
        }));
      },

      getQueryById: (id) => {
        return get().queries.find((query) => query.id === id);
      },

      getQueriesByIntent: (intent) => {
        return get().queries.filter((query) => query.intent === intent);
      },

      getActiveQueries: () => {
        return get().queries.filter((query) => query.status === "active");
      },

      getQueriesByProduct: (productId) => {
        return get().queries.filter((query) => 
          query.productIds.includes(productId)
        );
      },
    }),
    {
      name: "geo-nexus-queries",
    }
  )
);
