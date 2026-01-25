"use client";

import { useState } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { useProductStore } from "@/store/useProductStore";
import {
  Task,
  TaskStatus,
  KANBAN_COLUMNS,
  TASK_TYPE_LABELS,
  PRIORITY_CONFIG,
} from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Calendar,
  User,
  CheckSquare,
  Square,
  ChevronRight,
  MoreHorizontal,
  Package,
} from "lucide-react";

interface KanbanBoardProps {
  onTaskClick: (task: Task) => void;
}

export function KanbanBoard({ onTaskClick }: KanbanBoardProps) {
  const { tasks, moveTask } = useTaskStore();
  const { products } = useProductStore();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Get tasks grouped by status
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        // Sort by priority first, then by updated date
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  };

  // Get product name by ID
  const getProductName = (productId: string | null) => {
    if (!productId) return null;
    const product = products.find((p) => p.id === productId);
    return product?.name || null;
  };

  // Calculate checklist progress
  const getChecklistProgress = (task: Task) => {
    if (task.checklist.length === 0) return null;
    const completed = task.checklist.filter((item) => item.completed).length;
    return { completed, total: task.checklist.length };
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask) {
      moveTask(draggedTask, status);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Format due date
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `逾期 ${Math.abs(diffDays)} 天`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: "今天截止", isOverdue: false };
    } else if (diffDays === 1) {
      return { text: "明天截止", isOverdue: false };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} 天后`, isOverdue: false };
    } else {
      return { text: date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }), isOverdue: false };
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const isDropTarget = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-[320px]"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Card
              className={`h-full transition-colors ${
                isDropTarget ? "ring-2 ring-slate-400" : ""
              } ${column.color}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {column.title}
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 min-h-[400px]">
                {columnTasks.map((task) => {
                  const productName = getProductName(task.productId);
                  const checklistProgress = getChecklistProgress(task);
                  const dueInfo = formatDueDate(task.dueDate);
                  const priorityConfig = PRIORITY_CONFIG[task.priority];
                  const isDragging = draggedTask === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskClick(task)}
                      className={`group bg-white rounded-lg border border-slate-200 p-3 cursor-pointer
                        hover:border-slate-300 hover:shadow-sm transition-all
                        ${isDragging ? "opacity-50 rotate-2 scale-105" : ""}`}
                    >
                      {/* Header: Type + Priority */}
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {TASK_TYPE_LABELS[task.type]}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Badge className={`text-xs ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-medium text-sm text-slate-900 mb-2 line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Product Association */}
                      {productName && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                          <Package className="h-3 w-3" />
                          <span className="truncate">{productName}</span>
                        </div>
                      )}

                      {/* Checklist Progress */}
                      {checklistProgress && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            {checklistProgress.completed === checklistProgress.total ? (
                              <CheckSquare className="h-3 w-3 text-green-500" />
                            ) : (
                              <Square className="h-3 w-3" />
                            )}
                            <span>
                              {checklistProgress.completed}/{checklistProgress.total}
                            </span>
                          </div>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{
                                width: `${(checklistProgress.completed / checklistProgress.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer: Due Date + Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {dueInfo ? (
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              dueInfo.isOverdue ? "text-red-500" : "text-slate-500"
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            <span>{dueInfo.text}</span>
                          </div>
                        ) : (
                          <span />
                        )}
                        {task.assignee && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <User className="h-3 w-3" />
                            <span>{task.assignee}</span>
                          </div>
                        )}
                      </div>

                      {/* Drag Handle (visible on hover) */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 cursor-grab">
                        <GripVertical className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}

                {/* Empty State */}
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400">
                      拖拽任务到此列
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
