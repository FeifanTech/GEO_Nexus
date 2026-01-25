"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { useProductStore } from "@/store/useProductStore";
import {
  Task,
  TaskFormData,
  TaskType,
  TaskPriority,
  TaskStatus,
  TASK_TYPE_LABELS,
  PRIORITY_CONFIG,
  KANBAN_COLUMNS,
} from "@/types/task";
import { KanbanBoard } from "@/components/workflow/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Save,
  X,
  CheckSquare,
  Square,
  Calendar,
  ListTodo,
  LayoutGrid,
  Filter,
} from "lucide-react";

export default function WorkflowPage() {
  const { toast } = useToast();
  const { tasks, addTask, updateTask, deleteTask, addChecklistItem, toggleChecklistItem, deleteChecklistItem } =
    useTaskStore();
  const { products } = useProductStore();

  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    productId: null,
    type: "pdp_optimize",
    status: "todo",
    priority: "medium",
    checklist: [],
    assignee: "",
    dueDate: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      productId: null,
      type: "pdp_optimize",
      status: "todo",
      priority: "medium",
      checklist: [],
      assignee: "",
      dueDate: null,
    });
    setSelectedTask(null);
  };

  // Open dialog for new task
  const handleNewTask = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open dialog for editing task
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      productId: task.productId,
      type: task.type,
      status: task.status,
      priority: task.priority,
      checklist: task.checklist,
      assignee: task.assignee,
      dueDate: task.dueDate,
    });
    setIsDialogOpen(true);
  };

  // Save task (create or update)
  const handleSaveTask = () => {
    if (!formData.title.trim()) {
      toast({
        title: "请输入任务标题",
        variant: "destructive",
      });
      return;
    }

    if (selectedTask) {
      // Update existing task
      updateTask(selectedTask.id, formData);
      toast({ title: "任务已更新" });
    } else {
      // Create new task
      addTask(formData);
      toast({ title: "任务已创建" });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  // Delete task
  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      toast({ title: "任务已删除" });
      setIsDialogOpen(false);
      resetForm();
    }
  };

  // Add checklist item
  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;

    if (selectedTask) {
      // Add to existing task
      addChecklistItem(selectedTask.id, newChecklistItem.trim());
      // Update local state
      setFormData((prev) => ({
        ...prev,
        checklist: [
          ...prev.checklist,
          { id: `item-${Date.now()}`, text: newChecklistItem.trim(), completed: false },
        ],
      }));
    } else {
      // Add to form data for new task
      setFormData((prev) => ({
        ...prev,
        checklist: [
          ...prev.checklist,
          { id: `item-${Date.now()}`, text: newChecklistItem.trim(), completed: false },
        ],
      }));
    }
    setNewChecklistItem("");
  };

  // Toggle checklist item
  const handleToggleChecklistItem = (itemId: string) => {
    if (selectedTask) {
      toggleChecklistItem(selectedTask.id, itemId);
    }
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  // Delete checklist item
  const handleDeleteChecklistItem = (itemId: string) => {
    if (selectedTask) {
      deleteChecklistItem(selectedTask.id, itemId);
    }
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== itemId),
    }));
  };

  // Stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            作业流管理
          </h1>
          <p className="mt-1 text-slate-500">
            管理待优化产品任务，跟踪工作进度
          </p>
        </div>
        <Button onClick={handleNewTask} className="gap-2">
          <Plus className="h-4 w-4" />
          新建任务
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">全部任务</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <LayoutGrid className="h-8 w-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">待处理</p>
                <p className="text-2xl font-bold text-slate-700">{stats.todo}</p>
              </div>
              <ListTodo className="h-8 w-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">进行中</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">已完成</p>
                <p className="text-2xl font-bold text-green-600">{stats.done}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <KanbanBoard onTaskClick={handleTaskClick} />

      {/* Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? "编辑任务" : "新建任务"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">任务标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="例如：优化 XX 产品详情页"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">任务描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="详细描述任务内容..."
                rows={3}
              />
            </div>

            {/* Row: Product + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>关联产品</Label>
                <Select
                  value={formData.productId || "none"}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, productId: v === "none" ? null : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择产品" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不关联产品</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>任务类型</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v as TaskType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row: Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as TaskStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KANBAN_COLUMNS.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>优先级</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, priority: v as TaskPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              key === "urgent"
                                ? "bg-red-500"
                                : key === "high"
                                ? "bg-orange-500"
                                : key === "medium"
                                ? "bg-blue-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row: Assignee + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">负责人</Label>
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, assignee: e.target.value }))}
                  placeholder="输入负责人姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">截止日期</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, dueDate: e.target.value || null }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Checklist */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                检查清单
              </Label>

              {/* Checklist Items */}
              <div className="space-y-2">
                {formData.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className="flex-shrink-0"
                    >
                      {item.completed ? (
                        <CheckSquare className="h-4 w-4 text-green-500" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        item.completed ? "line-through text-slate-400" : "text-slate-700"
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Checklist Item */}
              <div className="flex gap-2">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="添加检查项..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddChecklistItem}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Preset Checklist Suggestions */}
              {formData.checklist.length === 0 && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-2">常用检查项：</p>
                  <div className="flex flex-wrap gap-1">
                    {[
                      "详情页更新完成",
                      "评论已发布",
                      "竞品分析完成",
                      "SEO 优化检查",
                      "数据埋点确认",
                    ].map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-slate-100"
                        onClick={() => {
                          setNewChecklistItem(suggestion);
                        }}
                      >
                        + {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {selectedTask && (
                <Button variant="destructive" onClick={handleDeleteTask}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除任务
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveTask}>
                <Save className="h-4 w-4 mr-2" />
                {selectedTask ? "保存更改" : "创建任务"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
