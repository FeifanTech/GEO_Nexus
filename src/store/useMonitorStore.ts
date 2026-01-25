import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MonitorTask, MonitorTaskFormData, RankingResult, AIModel } from "@/types/monitor";

interface MonitorState {
  tasks: MonitorTask[];
  
  // Task management
  createTask: (data: MonitorTaskFormData, queryContent: string) => string;
  updateTaskStatus: (id: string, status: MonitorTask["status"]) => void;
  addTaskResult: (taskId: string, result: RankingResult) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (id: string) => void;
  
  // Queries
  getTaskById: (id: string) => MonitorTask | undefined;
  getTasksByQuery: (queryId: string) => MonitorTask[];
  getRecentTasks: (limit?: number) => MonitorTask[];
  getTasksByStatus: (status: MonitorTask["status"]) => MonitorTask[];
  
  // Analytics
  getAveragePosition: (queryId: string, model: AIModel) => number | null;
  getMentionRate: (queryId: string) => number;
}

export const useMonitorStore = create<MonitorState>()(
  persist(
    (set, get) => ({
      tasks: [],

      createTask: (data, queryContent) => {
        const id = `monitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        // Create one task per query
        const newTasks: MonitorTask[] = data.queryIds.map((queryId, index) => ({
          id: index === 0 ? id : `${id}-${index}`,
          queryId,
          query: queryContent,
          targetBrand: data.targetBrand,
          models: data.models,
          results: [],
          status: "pending" as const,
          createdAt: now,
          completedAt: null,
        }));
        
        set((state) => ({
          tasks: [...state.tasks, ...newTasks],
        }));
        
        return id;
      },

      updateTaskStatus: (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task
          ),
        }));
      },

      addTaskResult: (taskId, result) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, results: [...task.results, result] }
              : task
          ),
        }));
      },

      completeTask: (taskId) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: "completed" as const, completedAt: now }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },

      getTasksByQuery: (queryId) => {
        return get().tasks.filter((task) => task.queryId === queryId);
      },

      getRecentTasks: (limit = 10) => {
        return get()
          .tasks
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status);
      },

      getAveragePosition: (queryId, model) => {
        const tasks = get().tasks.filter((task) => task.queryId === queryId);
        const positions = tasks
          .flatMap((task) => task.results)
          .filter((result) => result.model === model && result.position !== null)
          .map((result) => result.position as number);
        
        if (positions.length === 0) return null;
        return positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
      },

      getMentionRate: (queryId) => {
        const tasks = get().tasks.filter((task) => task.queryId === queryId);
        const results = tasks.flatMap((task) => task.results);
        
        if (results.length === 0) return 0;
        const mentionedCount = results.filter((r) => r.mentioned).length;
        return (mentionedCount / results.length) * 100;
      },
    }),
    {
      name: "geo-nexus-monitor",
    }
  )
);
