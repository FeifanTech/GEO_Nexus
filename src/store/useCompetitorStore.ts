import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Competitor, CompetitorFormData } from "@/types/competitor";

interface CompetitorState {
  competitors: Competitor[];
  currentCompetitor: Competitor | null;
  
  // CRUD operations
  addCompetitor: (data: CompetitorFormData) => string;
  updateCompetitor: (id: string, data: Partial<CompetitorFormData>) => void;
  deleteCompetitor: (id: string) => void;
  setCurrentCompetitor: (competitor: Competitor | null) => void;
  
  // Queries
  getCompetitorById: (id: string) => Competitor | undefined;
  getCompetitorsByCategory: (category: string) => Competitor[];
  searchCompetitors: (query: string) => Competitor[];
}

export const useCompetitorStore = create<CompetitorState>()(
  persist(
    (set, get) => ({
      competitors: [],
      currentCompetitor: null,

      addCompetitor: (data) => {
        const id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const newCompetitor: Competitor = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          competitors: [...state.competitors, newCompetitor],
        }));
        
        return id;
      },

      updateCompetitor: (id, data) => {
        set((state) => ({
          competitors: state.competitors.map((comp) =>
            comp.id === id
              ? { ...comp, ...data, updatedAt: new Date().toISOString() }
              : comp
          ),
        }));
      },

      deleteCompetitor: (id) => {
        set((state) => ({
          competitors: state.competitors.filter((comp) => comp.id !== id),
          currentCompetitor:
            state.currentCompetitor?.id === id ? null : state.currentCompetitor,
        }));
      },

      setCurrentCompetitor: (competitor) => {
        set({ currentCompetitor: competitor });
      },

      getCompetitorById: (id) => {
        return get().competitors.find((comp) => comp.id === id);
      },

      getCompetitorsByCategory: (category) => {
        return get().competitors.filter((comp) => comp.category === category);
      },

      searchCompetitors: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().competitors.filter(
          (comp) =>
            comp.name.toLowerCase().includes(lowerQuery) ||
            comp.category.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: "geo-nexus-competitors",
    }
  )
);
