"use client";

import { useState, useEffect, useMemo } from "react";
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
  Search,
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

  useEffect(() => {
    setMounted(true);
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
  const pendingTaskCount = mounted ? workflowTasks.filter(t => t.status === "待处理" || t.status === "进行中").length : 0;
  
  // System health based on recent activity
  const systemHealth = useMemo(() => {
    if (!mounted) return "检测中";
    const recentErrors = monitorTasks.filter(t => t.status === "failed").length;
    if (recentErrors > 3) return "异常";
    if (recentErrors > 0) return "警告";
    return "正常";
  }, [mounted, monitorTasks]);
  
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
        action: task.status === "已完成" ? "完成任务" : "创建任务",
        item: task.title,
        time: formatTimeAgo(task.createdAt),
        type: "task",
        status: task.status === "已完成" ? "success" : task.status === "待审核" ? "warning" : "pending",
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
  }, [mounted, getRecentMonitorTasks, workflowTasks, products]);

  // Helper function to format time ago
  function formatTimeAgo(dateString: string): string {
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
  }


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

  const getActivityIcon = (type: string) => {
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
  };

  const getStatusBadge = (status: string) => {
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
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            工作台
          </h1>
          <p className="mt-1 text-slate-500">
            欢迎回来！以下是您的 GEO 智能分析概览。
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/geo-diagnosis">
            <Stethoscope className="h-4 w-4" />
            开始诊断
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${stat.color || "text-slate-900"}`}
              >
                {stat.value}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">{stat.change}</span>
                {stat.href && (
                  <Link
                    href={stat.href}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
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
      <div className="grid gap-6 lg:grid-cols-5">
        {/* GEO Radar Chart */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">
                  GEO 表现
                </CardTitle>
                <CardDescription>
                  五维度分析概览
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-lg font-bold px-3 py-1"
              >
                {calculateGeoScore(mockGeoMetrics)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Product Selector */}
            <div className="mb-4 flex items-center gap-3">
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger className="w-[200px]">
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
                onClick={() => setShowComparison(!showComparison)}
                className={showComparison ? "bg-slate-100" : ""}
              >
                {showComparison ? "隐藏" : "显示"}基准
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
        <Card className="lg:col-span-3 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">
                  近期动态
                </CardTitle>
                <CardDescription>
                  您在平台上的最新操作记录
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-500">
                查看全部
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left font-medium text-slate-500">
                      操作
                    </th>
                    <th className="pb-3 text-left font-medium text-slate-500">
                      项目
                    </th>
                    <th className="pb-3 text-left font-medium text-slate-500">
                      状态
                    </th>
                    <th className="pb-3 text-right font-medium text-slate-500">
                      时间
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <tr
                        key={activity.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                              <Icon className="h-4 w-4 text-slate-600" />
                            </div>
                            <span className="font-medium text-slate-900">
                              {activity.action}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600">{activity.item}</td>
                        <td className="py-3">{getStatusBadge(activity.status)}</td>
                        <td className="py-3 text-right text-slate-400">
                          {activity.time}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/product-manager">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                <Package className="h-6 w-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">添加新产品</h3>
                <p className="text-sm text-slate-500">
                  创建和管理您的产品目录
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/geo-diagnosis">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                <Stethoscope className="h-6 w-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">运行诊断</h3>
                <p className="text-sm text-slate-500">
                  分析您的产品表现
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/content-factory">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                <Factory className="h-6 w-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">生成内容</h3>
                <p className="text-sm text-slate-500">
                  使用 AI 生成营销内容
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
