// Task status for Kanban columns
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

// Task priority levels
export type TaskPriority = "low" | "medium" | "high" | "urgent";

// Task type/category
export type TaskType = 
  | "pdp_optimize"      // 详情页优化
  | "content_publish"   // 内容发布
  | "review_collect"    // 评论收集
  | "competitor_track"  // 竞品追踪
  | "geo_diagnosis"     // GEO 诊断
  | "other";            // 其他

// Checklist item within a task
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Main Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  productId: string | null;  // Associated product
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  checklist: ChecklistItem[];
  assignee: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Form data for creating/editing tasks
export type TaskFormData = Omit<Task, "id" | "createdAt" | "updatedAt">;

// Kanban column definition
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
}

// Predefined columns
export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "todo", title: "待处理", color: "bg-slate-100" },
  { id: "in_progress", title: "进行中", color: "bg-blue-50" },
  { id: "review", title: "待审核", color: "bg-amber-50" },
  { id: "done", title: "已完成", color: "bg-green-50" },
];

// Task type labels
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  pdp_optimize: "详情页优化",
  content_publish: "内容发布",
  review_collect: "评论收集",
  competitor_track: "竞品追踪",
  geo_diagnosis: "GEO 诊断",
  other: "其他任务",
};

// Priority labels and colors
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "低", color: "bg-slate-100 text-slate-600" },
  medium: { label: "中", color: "bg-blue-100 text-blue-700" },
  high: { label: "高", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "紧急", color: "bg-red-100 text-red-700" },
};
