"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProductStore } from "@/store/useProductStore";
import { useMonitorStore } from "@/store/useMonitorStore";
import { useDiagnosisStore } from "@/store/useDiagnosisStore";
import { useContentStore } from "@/store/useContentStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useQueryStore } from "@/store/useQueryStore";
import { useCompetitorStore } from "@/store/useCompetitorStore";
import { AI_MODEL_CONFIG, AIModel } from "@/types/monitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Key,
  Globe,
  Building,
  Radar,
  Palette,
  Database,
  Trash2,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import {
  exportProducts,
  exportCompetitors,
  exportQueries,
  exportMonitorTasks,
  exportDiagnosisRecords,
  exportContentRecords,
  exportAllData,
} from "@/lib/export-utils";

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { products } = useProductStore();
  const { tasks: monitorTasks } = useMonitorStore();
  const { records: diagnosisRecords } = useDiagnosisStore();
  const { records: contentRecords } = useContentStore();
  const { tasks: workflowTasks } = useTaskStore();
  const { queries } = useQueryStore();
  const { competitors } = useCompetitorStore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  
  // Local form state
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
    toast({
      title: "设置已保存",
      description: "系统设置已更新",
    });
  };

  const handleReset = () => {
    resetSettings();
    setFormData(settings);
    setResetDialogOpen(false);
    toast({
      title: "设置已重置",
      description: "已恢复默认设置",
    });
  };

  const handleClearAllData = () => {
    // Clear all localStorage
    const keys = Object.keys(localStorage).filter(k => k.startsWith('geo-nexus'));
    keys.forEach(k => localStorage.removeItem(k));
    setClearDataDialogOpen(false);
    toast({
      title: "数据已清除",
      description: "所有本地数据已删除，页面将刷新",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const toggleModel = (model: AIModel) => {
    const currentModels = formData.defaultModels;
    if (currentModels.includes(model)) {
      setFormData({
        ...formData,
        defaultModels: currentModels.filter(m => m !== model),
      });
    } else {
      setFormData({
        ...formData,
        defaultModels: [...currentModels, model],
      });
    }
  };

  // Calculate data stats
  const dataStats = {
    products: mounted ? products.length : 0,
    competitors: mounted ? competitors.length : 0,
    queries: mounted ? queries.length : 0,
    monitorTasks: mounted ? monitorTasks.length : 0,
    diagnosisRecords: mounted ? diagnosisRecords.length : 0,
    contentRecords: mounted ? contentRecords.length : 0,
    workflowTasks: mounted ? workflowTasks.length : 0,
  };

  const totalRecords = Object.values(dataStats).reduce((a, b) => a + b, 0);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            系统设置
          </h1>
          <p className="mt-1 text-slate-500">
            配置系统参数和 Dify API 连接
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setResetDialogOpen(true)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置设置
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存设置
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dify API Configuration */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-slate-600" />
                Dify API 配置
              </CardTitle>
              <CardDescription>
                配置 Dify 工作流 API 连接参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="difyApiKey">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="difyApiKey"
                      type={showApiKey ? "text" : "password"}
                      value={formData.difyApiKey}
                      onChange={(e) => setFormData({ ...formData, difyApiKey: e.target.value })}
                      placeholder="app-xxxxxxxxxxxxxxxx"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  在 Dify 应用设置中获取 API Key
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difyBaseUrl">API Base URL</Label>
                <Input
                  id="difyBaseUrl"
                  value={formData.difyBaseUrl}
                  onChange={(e) => setFormData({ ...formData, difyBaseUrl: e.target.value })}
                  placeholder="https://api.dify.ai/v1"
                />
                <p className="text-xs text-slate-500">
                  默认为 Dify 官方 API 地址，私有化部署请修改
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                {formData.difyApiKey ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">API Key 已配置</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-amber-700">请配置 API Key 以启用 AI 功能</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-slate-600" />
                基本设置
              </CardTitle>
              <CardDescription>
                设置公司和品牌信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">公司名称</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="您的公司名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultBrand">默认品牌</Label>
                <Input
                  id="defaultBrand"
                  value={formData.defaultBrand}
                  onChange={(e) => setFormData({ ...formData, defaultBrand: e.target.value })}
                  placeholder="默认监测的品牌名称"
                />
                <p className="text-xs text-slate-500">
                  创建监测任务时的默认目标品牌
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Settings */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Radar className="h-5 w-5 text-slate-600" />
                监测设置
              </CardTitle>
              <CardDescription>
                配置 AI 搜索监测参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>默认监测模型</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(AI_MODEL_CONFIG) as AIModel[]).map((model) => {
                    const config = AI_MODEL_CONFIG[model];
                    const isSelected = formData.defaultModels.includes(model);
                    return (
                      <div
                        key={model}
                        onClick={() => toggleModel(model)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config.icon}</span>
                          <span className="font-medium text-sm">{config.name}</span>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-blue-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  已选择 {formData.defaultModels.length} 个模型
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>创建后自动执行</Label>
                  <p className="text-xs text-slate-500">
                    创建监测任务后自动开始执行
                  </p>
                </div>
                <Switch
                  checked={formData.autoExecuteOnCreate}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoExecuteOnCreate: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* UI Settings */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-slate-600" />
                界面设置
              </CardTitle>
              <CardDescription>
                自定义界面显示偏好
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>语言</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value: "zh-CN" | "en-US") =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-CN">简体中文</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>主题</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value: "light" | "dark" | "system") =>
                      setFormData({ ...formData, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">浅色</SelectItem>
                      <SelectItem value="dark">深色</SelectItem>
                      <SelectItem value="system">跟随系统</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Data Stats */}
        <div className="space-y-6">
          {/* Data Overview */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-slate-600" />
                数据概览
              </CardTitle>
              <CardDescription>
                本地存储数据统计
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">产品</span>
                <Badge variant="secondary">{dataStats.products}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">竞品</span>
                <Badge variant="secondary">{dataStats.competitors}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">监测问题</span>
                <Badge variant="secondary">{dataStats.queries}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">监测任务</span>
                <Badge variant="secondary">{dataStats.monitorTasks}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">诊断记录</span>
                <Badge variant="secondary">{dataStats.diagnosisRecords}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">内容记录</span>
                <Badge variant="secondary">{dataStats.contentRecords}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-600">工作流任务</span>
                <Badge variant="secondary">{dataStats.workflowTasks}</Badge>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between p-2 font-medium">
                <span className="text-slate-900">总计</span>
                <Badge>{totalRecords} 条记录</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-slate-600" />
                数据导出
              </CardTitle>
              <CardDescription>
                导出数据为 CSV 格式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  exportProducts(products);
                  toast({ title: "导出成功", description: "产品数据已导出" });
                }}
                disabled={dataStats.products === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                导出产品 ({dataStats.products})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  exportCompetitors(competitors);
                  toast({ title: "导出成功", description: "竞品数据已导出" });
                }}
                disabled={dataStats.competitors === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                导出竞品 ({dataStats.competitors})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  exportQueries(queries);
                  toast({ title: "导出成功", description: "问题库已导出" });
                }}
                disabled={dataStats.queries === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                导出问题库 ({dataStats.queries})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  exportMonitorTasks(monitorTasks);
                  toast({ title: "导出成功", description: "监测任务已导出" });
                }}
                disabled={dataStats.monitorTasks === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                导出监测任务 ({dataStats.monitorTasks})
              </Button>
              <Separator />
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => {
                  exportAllData({
                    products,
                    competitors,
                    queries,
                    monitorTasks,
                    diagnosisRecords,
                    contentRecords,
                  });
                  toast({ title: "导出成功", description: "数据汇总已导出" });
                }}
                disabled={totalRecords === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                导出全部数据汇总
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-white border-red-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                危险操作
              </CardTitle>
              <CardDescription>
                以下操作不可撤销，请谨慎操作
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setClearDataDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                清除所有数据
              </Button>
              <p className="text-xs text-slate-500 mt-2 text-center">
                将删除所有本地存储的产品、监测、诊断等数据
              </p>
            </CardContent>
          </Card>

          {/* Version Info */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mx-auto mb-3">
                  <Globe className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-900">GEO Nexus Platform</h3>
                <p className="text-sm text-slate-500">v1.0.0</p>
                <p className="text-xs text-slate-400 mt-2">
                  © 2026 GEO Nexus
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reset Settings Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置设置</DialogTitle>
            <DialogDescription>
              确定要将所有设置恢复为默认值吗？此操作不会删除您的数据。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleReset}>
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Data Dialog */}
      <Dialog open={clearDataDialogOpen} onOpenChange={setClearDataDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              清除所有数据
            </DialogTitle>
            <DialogDescription>
              此操作将删除所有本地存储的数据，包括：
              <ul className="mt-2 space-y-1 text-sm">
                <li>• {dataStats.products} 个产品</li>
                <li>• {dataStats.competitors} 个竞品</li>
                <li>• {dataStats.monitorTasks} 条监测记录</li>
                <li>• {dataStats.diagnosisRecords} 条诊断记录</li>
                <li>• {dataStats.contentRecords} 条内容记录</li>
              </ul>
              <p className="mt-3 font-semibold text-red-600">
                此操作无法撤销！
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDataDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleClearAllData}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
