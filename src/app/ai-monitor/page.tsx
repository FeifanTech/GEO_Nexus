"use client";

import { useState, useEffect } from "react";
import { useQueryStore } from "@/store/useQueryStore";
import { useMonitorStore } from "@/store/useMonitorStore";
import { useProductStore } from "@/store/useProductStore";
import {
  AIModel,
  AI_MODEL_CONFIG,
  DEFAULT_MONITOR_MODELS,
  MonitorTask,
} from "@/types/monitor";
import { QUERY_INTENT_CONFIG } from "@/types/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Radar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  BarChart3,
  Activity,
  Zap,
  LineChart,
} from "lucide-react";
import { RankingTrend, MentionTrend, generateMockTrendData, generateMockMentionData } from "@/components/charts/RankingTrend";
import { GeoHealthScore, generateMockHealthData } from "@/components/charts/GeoHealthScore";

export default function AIMonitorPage() {
  const { toast } = useToast();
  const { queries, getActiveQueries } = useQueryStore();
  const { tasks, createTask, getRecentTasks, getTasksByStatus } = useMonitorStore();
  const { products } = useProductStore();

  const [mounted, setMounted] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [selectedQueryIds, setSelectedQueryIds] = useState<string[]>([]);
  const [targetBrand, setTargetBrand] = useState("");
  const [selectedModels, setSelectedModels] = useState<AIModel[]>(DEFAULT_MONITOR_MODELS);
  const [viewingTask, setViewingTask] = useState<MonitorTask | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeQueries = getActiveQueries();
  const recentTasks = getRecentTasks(20);
  const pendingTasks = getTasksByStatus("pending");
  const runningTasks = getTasksByStatus("running");
  const completedTasks = getTasksByStatus("completed");

  // Generate mock data for demo (replace with real data when available)
  const trendData = generateMockTrendData(7);
  const mentionData = generateMockMentionData(7);
  const healthData = generateMockHealthData();

  // Stats
  const stats = {
    totalTasks: tasks.length,
    completedToday: tasks.filter((t) => {
      if (!t.completedAt) return false;
      const today = new Date().toDateString();
      return new Date(t.completedAt).toDateString() === today;
    }).length,
    activeQueries: activeQueries.length,
    avgMentionRate: tasks.length > 0
      ? Math.round(
          tasks
            .filter((t) => t.status === "completed")
            .reduce((sum, t) => {
              const mentionedCount = t.results.filter((r) => r.mentioned).length;
              return sum + (t.results.length > 0 ? (mentionedCount / t.results.length) * 100 : 0);
            }, 0) / Math.max(completedTasks.length, 1)
        )
      : 0,
  };

  const toggleModel = (model: AIModel) => {
    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((m) => m !== model)
        : [...prev, model]
    );
  };

  const toggleQuerySelection = (queryId: string) => {
    setSelectedQueryIds((prev) =>
      prev.includes(queryId)
        ? prev.filter((id) => id !== queryId)
        : [...prev, queryId]
    );
  };

  const handleCreateTask = () => {
    if (selectedQueryIds.length === 0) {
      toast({ title: "请选择要监测的问题", variant: "destructive" });
      return;
    }
    if (!targetBrand.trim()) {
      toast({ title: "请输入目标品牌", variant: "destructive" });
      return;
    }
    if (selectedModels.length === 0) {
      toast({ title: "请选择至少一个 AI 模型", variant: "destructive" });
      return;
    }

    const query = queries.find((q) => q.id === selectedQueryIds[0]);
    createTask(
      {
        queryIds: selectedQueryIds,
        targetBrand: targetBrand.trim(),
        models: selectedModels,
      },
      query?.question || ""
    );

    toast({ title: "监测任务已创建", description: "任务将在 Dify 工作流配置完成后自动执行" });
    setIsNewTaskDialogOpen(false);
    setSelectedQueryIds([]);
    setTargetBrand("");
    setSelectedModels(DEFAULT_MONITOR_MODELS);
  };

  const getStatusIcon = (status: MonitorTask["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-slate-400" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: MonitorTask["status"]) => {
    switch (status) {
      case "pending":
        return "等待中";
      case "running":
        return "执行中";
      case "completed":
        return "已完成";
      case "failed":
        return "失败";
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            AI 搜索排名监测
          </h1>
          <p className="mt-1 text-slate-500">
            监测品牌在各大 AI 搜索引擎中的排名表现
          </p>
        </div>
        <Button onClick={() => setIsNewTaskDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          新建监测
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">监测总数</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
              <Radar className="h-8 w-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">今日完成</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">活跃问题</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeQueries}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">平均提及率</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgMentionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            数据概览
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <Clock className="h-4 w-4" />
            监测任务
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <LineChart className="h-4 w-4" />
            趋势分析
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Zap className="h-4 w-4" />
            模型状态
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Health Score */}
            <GeoHealthScore
              score={healthData.score}
              breakdown={healthData.breakdown}
              trend={healthData.trend}
            />

            {/* Quick Stats */}
            <Card className="bg-white border-slate-200 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">监测快报</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">本周监测</p>
                    <p className="text-2xl font-bold">{Math.min(tasks.length, 15)}</p>
                    <p className="text-xs text-green-600 mt-1">↑ 较上周增长 12%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">平均排名</p>
                    <p className="text-2xl font-bold">#3.2</p>
                    <p className="text-xs text-green-600 mt-1">↑ 提升 0.5 位</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">最佳表现模型</p>
                    <p className="text-2xl font-bold">🌙 Kimi</p>
                    <p className="text-xs text-slate-500 mt-1">提及率 78%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">待优化问题</p>
                    <p className="text-2xl font-bold text-amber-600">3</p>
                    <p className="text-xs text-slate-500 mt-1">排名低于预期</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini Trend Chart */}
          <MentionTrend data={mentionData} title="近7天提及率走势" />
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">最近监测任务</CardTitle>
              <CardDescription>查看和管理监测任务执行状态</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => {
                    const query = queries.find((q) => q.id === task.queryId);
                    const intentConfig = query ? QUERY_INTENT_CONFIG[query.intent] : null;

                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <span className="text-sm font-medium">
                                {getStatusLabel(task.status)}
                              </span>
                              {intentConfig && (
                                <Badge className={intentConfig.color}>{intentConfig.label}</Badge>
                              )}
                            </div>
                            <p className="font-medium text-slate-900 mb-1">{task.query || query?.question}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>目标品牌：{task.targetBrand}</span>
                              <span>模型：{task.models.map((m) => AI_MODEL_CONFIG[m].name).join("、")}</span>
                            </div>
                            {task.results.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {task.results.map((result, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className={result.mentioned ? "border-green-300 text-green-700" : "border-slate-300"}
                                  >
                                    {AI_MODEL_CONFIG[result.model].icon} {AI_MODEL_CONFIG[result.model].name}
                                    {result.position !== null && ` #${result.position}`}
                                    {result.mentioned ? " ✓" : " ✗"}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">
                              {new Date(task.createdAt).toLocaleString("zh-CN")}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingTask(task)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Radar className="h-12 w-12 text-slate-200 mb-4" />
                  <p className="text-slate-500 mb-4">暂无监测任务</p>
                  <Button onClick={() => setIsNewTaskDialogOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    创建首个监测
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <RankingTrend
              data={trendData}
              models={["qwen", "kimi", "wenxin"]}
              title="各模型排名趋势"
            />
            <MentionTrend
              data={mentionData}
              title="品牌提及率趋势"
            />
          </div>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">趋势洞察</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Kimi 表现最佳</p>
                    <p className="text-sm text-green-700">在 Kimi 中的平均排名从第 5 位提升至第 2 位，建议加强该渠道优化。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">文心一言待优化</p>
                    <p className="text-sm text-amber-700">品牌在文心一言中的提及率较低（约 45%），建议增加相关内容投放。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">整体趋势向好</p>
                    <p className="text-sm text-blue-700">近 7 天平均提及率从 52% 提升至 68%，GEO 优化策略初见成效。</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(AI_MODEL_CONFIG).map(([model, config]) => (
              <Card key={model} className="bg-white border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    {config.name}
                  </CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">监测次数</span>
                      <span className="font-medium">
                        {tasks.reduce(
                          (count, t) => count + t.results.filter((r) => r.model === model).length,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">提及率</span>
                      <span className="font-medium">
                        {(() => {
                          const modelResults = tasks.flatMap((t) =>
                            t.results.filter((r) => r.model === model)
                          );
                          if (modelResults.length === 0) return "N/A";
                          const mentionedCount = modelResults.filter((r) => r.mentioned).length;
                          return `${Math.round((mentionedCount / modelResults.length) * 100)}%`;
                        })()}
                      </span>
                    </div>
                    <Badge className={`${config.color} w-full justify-center mt-2`}>
                      {DEFAULT_MONITOR_MODELS.includes(model as AIModel) ? "默认启用" : "可选"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Dify 工作流配置提示</p>
                  <p className="text-sm text-amber-700 mt-1">
                    AI 搜索排名监测需要配置专门的 Dify Workflow 来调用各个大模型 API。
                    请在 Dify 中创建「AI 搜索监测」工作流，支持多模型并发查询。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建监测任务</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Target Brand */}
            <div className="space-y-2">
              <Label htmlFor="targetBrand">目标品牌 *</Label>
              <Input
                id="targetBrand"
                value={targetBrand}
                onChange={(e) => setTargetBrand(e.target.value)}
                placeholder="输入要监测的品牌名称..."
              />
            </div>

            <Separator />

            {/* Query Selection */}
            <div className="space-y-2">
              <Label>选择监测问题 *</Label>
              {activeQueries.length > 0 ? (
                <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-3">
                  {activeQueries.map((query) => {
                    const isSelected = selectedQueryIds.includes(query.id);
                    const intentConfig = QUERY_INTENT_CONFIG[query.intent];
                    return (
                      <div
                        key={query.id}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? "bg-slate-100 border border-slate-300" : "hover:bg-slate-50"
                        }`}
                        onClick={() => toggleQuerySelection(query.id)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4"
                          />
                          <Badge className={`${intentConfig.color} text-xs`}>
                            {intentConfig.label}
                          </Badge>
                          <span className="text-sm">{query.question}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 border rounded-lg">
                  暂无活跃问题，请先在问题库中添加
                </div>
              )}
              <p className="text-xs text-slate-500">已选择 {selectedQueryIds.length} 个问题</p>
            </div>

            <Separator />

            {/* Model Selection */}
            <div className="space-y-2">
              <Label>选择 AI 模型 *</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(AI_MODEL_CONFIG).map(([model, config]) => {
                  const isSelected = selectedModels.includes(model as AIModel);
                  return (
                    <div
                      key={model}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => toggleModel(model as AIModel)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{config.icon}</span>
                        <span className="font-medium text-sm">{config.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">已选择 {selectedModels.length} 个模型</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTask} className="gap-2">
              <Play className="h-4 w-4" />
              创建任务
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!viewingTask} onOpenChange={() => setViewingTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>监测详情</DialogTitle>
          </DialogHeader>
          {viewingTask && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-slate-500">问题</Label>
                <p className="font-medium">{viewingTask.query}</p>
              </div>
              <div>
                <Label className="text-slate-500">目标品牌</Label>
                <p className="font-medium">{viewingTask.targetBrand}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-slate-500 mb-2 block">各模型结果</Label>
                {viewingTask.results.length > 0 ? (
                  <div className="space-y-3">
                    {viewingTask.results.map((result, i) => {
                      const modelConfig = AI_MODEL_CONFIG[result.model];
                      return (
                        <Card key={i} className="bg-slate-50">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{modelConfig.icon}</span>
                                <span className="font-medium">{modelConfig.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {result.mentioned ? (
                                  <Badge className="bg-green-100 text-green-700">已提及</Badge>
                                ) : (
                                  <Badge variant="outline">未提及</Badge>
                                )}
                                {result.position !== null && (
                                  <Badge variant="secondary">排名 #{result.position}</Badge>
                                )}
                              </div>
                            </div>
                            {result.context && (
                              <p className="text-sm text-slate-600 mt-2 p-2 bg-white rounded border">
                                {result.context}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">暂无结果数据</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
