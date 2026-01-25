"use client";

import { useState, useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
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
} from "lucide-react";
import Link from "next/link";

// Mock recent activities
const recentActivities = [
  {
    id: 1,
    action: "创建产品",
    item: "企业分析套件",
    time: "2 小时前",
    type: "product",
    status: "success",
  },
  {
    id: 2,
    action: "GEO 诊断完成",
    item: "市场定位分析",
    time: "5 小时前",
    type: "diagnosis",
    status: "success",
  },
  {
    id: 3,
    action: "内容生成",
    item: "产品详情页摘要 - 云平台",
    time: "1 天前",
    type: "content",
    status: "success",
  },
  {
    id: 4,
    action: "竞品分析",
    item: "Q4 战略复盘",
    time: "2 天前",
    type: "diagnosis",
    status: "warning",
  },
  {
    id: 5,
    action: "更新产品",
    item: "移动端 SDK Pro",
    time: "3 天前",
    type: "product",
    status: "success",
  },
];

export default function DashboardPage() {
  const { products } = useProductStore();
  const [mounted, setMounted] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate stats
  const totalProducts = mounted ? products.length : 0;
  const optimizationProgress = 73; // Mock: Average optimization progress
  const recentTasks = 12; // Mock: Recent tasks count
  const systemHealth = "正常"; // Mock: System health status


  // Stats cards configuration
  const statsCards = [
    {
      title: "产品总数",
      value: totalProducts.toString(),
      change: "本周 +2",
      icon: Package,
      trend: "up",
      href: "/product-manager",
    },
    {
      title: "优化进度",
      value: `${optimizationProgress}%`,
      change: "较上月 +5%",
      icon: TrendingUp,
      trend: "up",
      href: "/geo-diagnosis",
    },
    {
      title: "近期任务",
      value: recentTasks.toString(),
      change: "3 个待处理",
      icon: ListTodo,
      trend: "neutral",
      href: "/content-factory",
    },
    {
      title: "系统状态",
      value: systemHealth,
      change: "所有服务运行正常",
      icon: Activity,
      trend: "up",
      color: "text-emerald-600",
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
