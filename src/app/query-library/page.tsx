"use client";

import { useState, useEffect } from "react";
import { useQueryStore } from "@/store/useQueryStore";
import { useProductStore } from "@/store/useProductStore";
import { useCompetitorStore } from "@/store/useCompetitorStore";
import {
  SearchQuery,
  SearchQueryFormData,
  QueryIntent,
  QueryPriority,
  QueryStatus,
  QUERY_INTENT_CONFIG,
  QUERY_PRIORITY_CONFIG,
} from "@/types/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Trash2,
  Save,
  Edit2,
  Search,
  HelpCircle,
  Tag,
  Filter,
  Play,
  Pause,
  Archive,
  CheckSquare,
  X,
} from "lucide-react";

const emptyFormData: SearchQueryFormData = {
  question: "",
  intent: "category_search",
  priority: "medium",
  status: "active",
  productIds: [],
  competitorIds: [],
  expectedBrands: [],
  keywords: [],
  notes: "",
};

export default function QueryLibraryPage() {
  const { toast } = useToast();
  const { queries, addQuery, updateQuery, deleteQuery, bulkUpdateStatus } = useQueryStore();
  const { products } = useProductStore();
  const { competitors } = useCompetitorStore();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIntent, setFilterIntent] = useState<QueryIntent | "all">("all");
  const [filterStatus, setFilterStatus] = useState<QueryStatus | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuery, setEditingQuery] = useState<SearchQuery | null>(null);
  const [formData, setFormData] = useState<SearchQueryFormData>(emptyFormData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Temp inputs
  const [newKeyword, setNewKeyword] = useState("");
  const [newBrand, setNewBrand] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter queries
  const filteredQueries = queries.filter((query) => {
    const matchesSearch =
      query.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIntent = filterIntent === "all" || query.intent === filterIntent;
    const matchesStatus = filterStatus === "all" || query.status === filterStatus;
    return matchesSearch && matchesIntent && matchesStatus;
  });

  // Stats
  const stats = {
    total: queries.length,
    active: queries.filter((q) => q.status === "active").length,
    byIntent: Object.keys(QUERY_INTENT_CONFIG).reduce((acc, intent) => {
      acc[intent as QueryIntent] = queries.filter((q) => q.intent === intent).length;
      return acc;
    }, {} as Record<QueryIntent, number>),
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingQuery(null);
    setNewKeyword("");
    setNewBrand("");
  };

  const handleNewQuery = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditQuery = (query: SearchQuery) => {
    setEditingQuery(query);
    setFormData({
      question: query.question,
      intent: query.intent,
      priority: query.priority,
      status: query.status,
      productIds: [...query.productIds],
      competitorIds: [...query.competitorIds],
      expectedBrands: [...query.expectedBrands],
      keywords: [...query.keywords],
      notes: query.notes,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.question.trim()) {
      toast({ title: "请输入问题内容", variant: "destructive" });
      return;
    }

    if (editingQuery) {
      updateQuery(editingQuery.id, formData);
      toast({ title: "问题已更新" });
    } else {
      addQuery(formData);
      toast({ title: "问题已添加" });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteQuery(id);
    toast({ title: "问题已删除" });
  };

  const handleBulkAction = (status: QueryStatus) => {
    if (selectedIds.length === 0) return;
    bulkUpdateStatus(selectedIds, status);
    toast({ title: `已更新 ${selectedIds.length} 个问题的状态` });
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQueries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQueries.map((q) => q.id));
    }
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, newKeyword.trim()],
    }));
    setNewKeyword("");
  };

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  const addBrand = () => {
    if (!newBrand.trim()) return;
    setFormData((prev) => ({
      ...prev,
      expectedBrands: [...prev.expectedBrands, newBrand.trim()],
    }));
    setNewBrand("");
  };

  const removeBrand = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      expectedBrands: prev.expectedBrands.filter((_, i) => i !== index),
    }));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">问题库</h1>
          <p className="mt-1 text-slate-500">管理 AI 搜索监测的问题列表</p>
        </div>
        <Button onClick={handleNewQuery} className="gap-2">
          <Plus className="h-4 w-4" />
          添加问题
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">问题总数</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">启用中</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Play className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">品类搜索</p>
                <p className="text-2xl font-bold text-blue-600">{stats.byIntent.category_search || 0}</p>
              </div>
              <Search className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">竞品对比</p>
                <p className="text-2xl font-bold text-orange-600">{stats.byIntent.competitor_compare || 0}</p>
              </div>
              <Tag className="h-8 w-8 text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="搜索问题或关键词..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterIntent} onValueChange={(v) => setFilterIntent(v as QueryIntent | "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="问题类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {Object.entries(QUERY_INTENT_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as QueryStatus | "all")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="paused">暂停</SelectItem>
                <SelectItem value="archived">归档</SelectItem>
              </SelectContent>
            </Select>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-slate-500">已选 {selectedIds.length} 项</span>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("active")}>
                  <Play className="h-3 w-3 mr-1" /> 启用
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("paused")}>
                  <Pause className="h-3 w-3 mr-1" /> 暂停
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("archived")}>
                  <Archive className="h-3 w-3 mr-1" /> 归档
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Query List */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">问题列表</CardTitle>
            {filteredQueries.length > 0 && (
              <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                <CheckSquare className="h-4 w-4 mr-1" />
                {selectedIds.length === filteredQueries.length ? "取消全选" : "全选"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredQueries.length > 0 ? (
            <div className="space-y-3">
              {filteredQueries.map((query) => {
                const intentConfig = QUERY_INTENT_CONFIG[query.intent];
                const priorityConfig = QUERY_PRIORITY_CONFIG[query.priority];
                const isSelected = selectedIds.includes(query.id);

                return (
                  <div
                    key={query.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isSelected ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(query.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={intentConfig.color}>{intentConfig.label}</Badge>
                          <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
                          {query.status === "paused" && (
                            <Badge variant="outline" className="text-amber-600">暂停</Badge>
                          )}
                          {query.status === "archived" && (
                            <Badge variant="outline" className="text-slate-400">归档</Badge>
                          )}
                        </div>
                        <p className="font-medium text-slate-900 mb-2">{query.question}</p>
                        {query.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {query.keywords.map((kw, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                #{kw}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {query.expectedBrands.length > 0 && (
                          <p className="text-xs text-slate-500">
                            期望品牌：{query.expectedBrands.join("、")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditQuery(query)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(query.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="h-12 w-12 text-slate-200 mb-4" />
              <p className="text-slate-500 mb-4">
                {searchTerm || filterIntent !== "all" || filterStatus !== "all"
                  ? "没有符合条件的问题"
                  : "暂无问题，点击添加"}
              </p>
              <Button onClick={handleNewQuery} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                添加问题
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuery ? "编辑问题" : "添加问题"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question">问题内容 *</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
                placeholder="例如：什么面霜好用？XX品牌和YY品牌哪个好？"
                rows={2}
              />
            </div>

            {/* Intent & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>问题类型</Label>
                <Select
                  value={formData.intent}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, intent: v as QueryIntent }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUERY_INTENT_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {QUERY_INTENT_CONFIG[formData.intent].description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>优先级</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, priority: v as QueryPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUERY_PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Keywords */}
            <div className="space-y-2">
              <Label>关键词标签</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.keywords.map((kw, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    #{kw}
                    <button onClick={() => removeKeyword(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="输入关键词..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Expected Brands */}
            <div className="space-y-2">
              <Label>期望出现的品牌</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.expectedBrands.map((brand, index) => (
                  <Badge key={index} className="bg-green-50 text-green-700 gap-1">
                    {brand}
                    <button onClick={() => removeBrand(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="输入品牌名..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBrand();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addBrand}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="其他说明..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {editingQuery && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(editingQuery.id);
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {editingQuery ? "保存" : "添加"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
