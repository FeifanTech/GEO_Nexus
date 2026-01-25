import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, TaskFormData, TaskStatus, ChecklistItem } from "@/types/task";

interface TaskState {
  tasks: Task[];
  
  // CRUD operations
  addTask: (task: TaskFormData) => string;
  updateTask: (id: string, task: Partial<TaskFormData>) => void;
  deleteTask: (id: string) => void;
  
  // Status management
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  
  // Checklist management
  addChecklistItem: (taskId: string, text: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  deleteChecklistItem: (taskId: string, itemId: string) => void;
  
  // Queries
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByProduct: (productId: string) => Task[];
  getTaskById: (id: string) => Task | undefined;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (taskData) => {
        const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const newTask: Task = {
          ...taskData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        return id;
      },

      updateTask: (id, taskData) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      moveTask: (taskId, newStatus) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      addChecklistItem: (taskId, text) => {
        const itemId = `item-${Date.now()}`;
        const newItem: ChecklistItem = {
          id: itemId,
          text,
          completed: false,
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: [...task.checklist, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      toggleChecklistItem: (taskId, itemId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: task.checklist.map((item) =>
                    item.id === itemId
                      ? { ...item, completed: !item.completed }
                      : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      deleteChecklistItem: (taskId, itemId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: task.checklist.filter((item) => item.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status);
      },

      getTasksByProduct: (productId) => {
        return get().tasks.filter((task) => task.productId === productId);
      },

      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },
    }),
    {
      name: "geo-nexus-tasks",
    }
  )
);
