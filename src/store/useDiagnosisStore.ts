import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DiagnosisRecord, DiagnosisType } from "@/types/diagnosis";

interface DiagnosisState {
  records: DiagnosisRecord[];
  
  // CRUD
  addRecord: (record: Omit<DiagnosisRecord, "id" | "createdAt" | "updatedAt">) => string;
  updateRecord: (id: string, result: string) => void;
  deleteRecord: (id: string) => void;
  
  // Queries
  getRecordById: (id: string) => DiagnosisRecord | undefined;
  getRecordsByProduct: (productId: string) => DiagnosisRecord[];
  getRecordsByType: (type: DiagnosisType) => DiagnosisRecord[];
  getRecentRecords: (limit?: number) => DiagnosisRecord[];
}

export const useDiagnosisStore = create<DiagnosisState>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (recordData) => {
        const id = `diag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const newRecord: DiagnosisRecord = {
          ...recordData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
        
        return id;
      },

      updateRecord: (id, result) => {
        const now = new Date().toISOString();
        set((state) => ({
          records: state.records.map((record) =>
            record.id === id
              ? { ...record, result, updatedAt: now }
              : record
          ),
        }));
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
      name: "geo-nexus-diagnosis",
    }
  )
);
