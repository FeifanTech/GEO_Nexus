"use client";

import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useMonitorStore } from "@/store/useMonitorStore";
import { useQueryStore } from "@/store/useQueryStore";
import {
  GeoRadar,
  mockGeoMetrics,
  benchmarkMetrics,
  calculateGeoScore,
} from "@/components/charts/GeoRadar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  TrendingUp,
  ListTodo,
  Activity,
  ArrowRight,
  Stethoscope,
  Factory,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Radar,
} from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  action: string;
  item: string;
  time: string;
  type: "product" | "diagnosis" | "content" | "monitor" | "task";
  status: "success" | "warning" | "pending";
}

export default function DashboardPage() {
  const { products } = useProductStore();
  const { tasks: workflowTasks } = useTaskStore();
  const { tasks: monitorTasks, getRecentTasks: getRecentMonitorTasks } = useMonitorStore();
  const { queries } = useQueryStore();
  const [mounted, setMounted] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [showComparison, setShowComparison] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized state update handlers
  const handleProductChange = useCallback((value: string) => {
    startTransition(() => {
      setSelectedProductId(value);
    });
  }, []);

  const toggleComparison = useCallback(() => {
    startTransition(() => {
      setShowComparison(prev => !prev);
    });
  }, []);

  // Calculate real stats
  const totalProducts = mounted ? products.length : 0;
  
  // Calculate optimization progress from monitor results
  const optimizationProgress = useMemo(() => {
    if (!mounted || monitorTasks.length === 0) return 0;
    const completedTasks = monitorTasks.filter(t => t.status === "completed");
    if (completedTasks.length === 0) return 0;
    const mentionRate = completedTasks.reduce((sum, task) => {
      const mentioned = task.results.filter(r => r.mentioned).length;
      return sum + (task.results.length > 0 ? (mentioned / task.results.length) * 100 : 0);
    }, 0) / completedTasks.length;
    return Math.round(mentionRate);
  }, [mounted, monitorTasks]);
  
  // Real task count from workflow
  const pendingTaskCount = mounted ? workflowTasks.filter(t => t.status === "todo" || t.status === "in_progress").length : 0;
  
  // System health based on recent activity
  const systemHealth = useMemo(() => {
    if (!mounted) return "检测中";
    const recentErrors = monitorTasks.filter(t => t.status === "failed").length;
    if (recentErrors > 3) return "异常";
    if (recentErrors > 0) return "警告";
    return "正常";
  }, [mounted, monitorTasks]);

  // Helper function to format time ago (memoized for performance)
  const formatTimeAgo = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString("zh-CN");
  }, []);

  // Generate real recent activities from stores
  const recentActivities = useMemo<ActivityItem[]>(() => {
    if (!mounted) return [];
    
    const activities: ActivityItem[] = [];
    
    // Add recent monitor tasks
    getRecentMonitorTasks(3).forEach((task) => {
      activities.push({
        id: `monitor-${task.id}`,
        action: "AI 监测",
        item: task.query.slice(0, 30) + (task.query.length > 30 ? "..." : ""),
        time: formatTimeAgo(task.createdAt),
        type: "monitor",
        status: task.status === "completed" ? "success" : task.status === "failed" ? "warning" : "pending",
      });
    });
    
    // Add recent workflow tasks
    workflowTasks.slice(0, 3).forEach((task) => {
      activities.push({
        id: `task-${task.id}`,
        action: task.status === "done" ? "完成任务" : "创建任务",
        item: task.title,
        time: formatTimeAgo(task.createdAt),
        type: "task",
        status: task.status === "done" ? "success" : task.status === "review" ? "warning" : "pending",
      });
    });
    
    // Add products as activities
    products.slice(0, 2).forEach((product) => {
      activities.push({
        id: `product-${product.id}`,
        action: "产品管理",
        item: product.name,
        time: "最近",
        type: "product",
        status: "success",
      });
    });
    
    return activities.slice(0, 5);
  }, [mounted, getRecentMonitorTasks, workflowTasks, products, formatTimeAgo]);

  // Stats cards configuration with real data
  const statsCards = [
    {
      title: "产品总数",
      value: totalProducts.toString(),
      change: `${queries.length} 个监测问题`,
      icon: Package,
      trend: "up" as const,
      href: "/product-manager",
    },
    {
      title: "AI 提及率",
      value: optimizationProgress > 0 ? `${optimizationProgress}%` : "--",
      change: `${monitorTasks.filter(t => t.status === "completed").length} 次监测`,
      icon: TrendingUp,
      trend: "up" as const,
      href: "/ai-monitor",
    },
    {
      title: "待处理任务",
      value: pendingTaskCount.toString(),
      change: `共 ${workflowTasks.length} 个任务`,
      icon: ListTodo,
      trend: "neutral" as const,
      href: "/workflow",
    },
    {
      title: "系统状态",
      value: systemHealth,
      change: systemHealth === "正常" ? "所有服务运行正常" : "部分服务需要关注",
      icon: Activity,
      trend: "up" as const,
      color: systemHealth === "正常" ? "text-emerald-600" : systemHealth === "警告" ? "text-amber-600" : "text-red-600",
    },
  ];

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case "product":
        return Package;
      case "diagnosis":
        return Stethoscope;
      case "content":
        return Factory;
      case "monitor":
        return Radar;
      case "task":
        return ListTodo;
      default:
        return FileText;
    }
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            已完成
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-50 text-amber-700 hover:bg-amber-50"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            待审核
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            <Clock className="h-3 w-3 mr-1" />
            进行中
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            进行中
          </Badge>
        );
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="relative z-10 space-y-8 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between slide-up fade-in">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
              GEO Nexus 工作台
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              欢迎回来！这里是您的智能分析中心，实时掌握产品表现和优化机会。
            </p>
          </div>
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <Link href="/geo-diagnosis" prefetch={true}>
              <Stethoscope className="h-4 w-4" />
              开始智能诊断
            </Link>
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 slide-up">
        {statsCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer scale-in"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                {stat.title}
              </CardTitle>
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl sm:text-3xl font-bold ${stat.color || "text-slate-900"}`}
              >
                {stat.value}
              </div>
              <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-xs text-slate-600">{stat.change}</span>
                {stat.href && (
                  <Link
                    href={stat.href}
                    prefetch={true}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                  >
                    查看 <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:gap-8 xl:grid-cols-5">
        {/* GEO Radar Chart */}
        <Card className="xl:col-span-2 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow scale-in" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 mb-1">
                  GEO 表现分析
                </CardTitle>
                <CardDescription className="text-slate-600">
                  五维度智能分析概览
                </CardDescription>
              </div>
              <Badge
                className="text-lg font-bold px-4 py-2 bg-blue-600 text-white border-0"
              >
                {calculateGeoScore(mockGeoMetrics)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Selector */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <Select
                value={selectedProductId}
                onValueChange={handleProductChange}
                disabled={isPending}
              >
                <SelectTrigger className="w-[220px] bg-white border-slate-300">
                  <SelectValue placeholder="选择产品" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部产品（平均）</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleComparison}
                disabled={isPending}
                className="bg-white border-slate-300 hover:bg-slate-100 hover:text-slate-900"
              >
                {showComparison ? "隐藏" : "显示"}基准对比
              </Button>
            </div>

            {/* Radar Chart */}
            <GeoRadar
              data={mockGeoMetrics}
              comparisonData={benchmarkMetrics}
              showComparison={showComparison}
              height={280}
            />

            {/* Dimension Legend */}
            <div className="mt-4 grid grid-cols-5 gap-2 text-center">
              {[
                { label: "权威", value: mockGeoMetrics.authority },
                { label: "相关", value: mockGeoMetrics.relevance },
                { label: "体验", value: mockGeoMetrics.experience },
                { label: "可信", value: mockGeoMetrics.trustworthiness },
                { label: "优化", value: mockGeoMetrics.optimization },
              ].map((dim) => (
                <div key={dim.label} className="text-xs">
                  <div className="font-medium text-slate-900">{dim.value}%</div>
                  <div className="text-slate-500">{dim.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="xl:col-span-3 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow scale-in" style={{ animationDelay: '750ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 mb-1">
                  智能动态
                </CardTitle>
                <CardDescription className="text-slate-600">
                  平台实时动态和重要操作记录
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-medium">
                查看全部
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">
                          {activity.action}
                        </div>
                        <div className="text-sm text-slate-600">{activity.item}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(activity.status)}
                      <div className="text-sm text-slate-500 min-w-[60px] text-right">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer overflow-hidden">
          <Link href="/product-manager" prefetch={true}>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">产品管理</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  智能创建和管理您的产品目录
                </p>
              </div>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer overflow-hidden">
          <Link href="/geo-diagnosis" prefetch={true}>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
                <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">智能诊断</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  AI 驱动的产品表现深度分析
                </p>
              </div>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer overflow-hidden">
          <Link href="/content-factory" prefetch={true}>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <Factory className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">内容工厂</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  AI 自动生成高质量营销内容
                </p>
              </div>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </CardContent>
          </Link>
        </Card>
      </div>
      </div>
    </div>
  );
}
