"use client";

import { useState, useEffect } from "react";
import { useCompetitorStore } from "@/store/useCompetitorStore";
import { Competitor, CompetitorFormData, SALES_PLATFORMS } from "@/types/competitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Save,
  Edit2,
  Search,
  Target,
  TrendingUp,
  TrendingDown,
  Building2,
  Tag,
  Users,
  ShoppingCart,
  X,
  StickyNote,
} from "lucide-react";

const emptyFormData: CompetitorFormData = {
  name: "",
  category: "",
  advantages: [],
  disadvantages: [],
  priceRange: "",
  targetAudience: "",
  mainPlatforms: [],
  notes: "",
};

export default function CompetitorsPage() {
  const { toast } = useToast();
  const {
    competitors,
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,
  } = useCompetitorStore();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [formData, setFormData] = useState<CompetitorFormData>(emptyFormData);

  // Temp inputs for array fields
  const [newAdvantage, setNewAdvantage] = useState("");
  const [newDisadvantage, setNewDisadvantage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter competitors by search query
  const filteredCompetitors = competitors.filter(
    (comp) =>
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique categories
  const categories = Array.from(new Set(competitors.map((c) => c.category).filter(Boolean)));

  // Reset form
  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingCompetitor(null);
    setNewAdvantage("");
    setNewDisadvantage("");
  };

  // Open dialog for new competitor
  const handleNewCompetitor = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open dialog for editing competitor
  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setFormData({
      name: competitor.name,
      category: competitor.category,
      advantages: [...competitor.advantages],
      disadvantages: [...competitor.disadvantages],
      priceRange: competitor.priceRange,
      targetAudience: competitor.targetAudience,
      mainPlatforms: [...competitor.mainPlatforms],
      notes: competitor.notes,
    });
    setIsDialogOpen(true);
  };

  // Save competitor
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "请输入竞品名称",
        variant: "destructive",
      });
      return;
    }

    if (editingCompetitor) {
      updateCompetitor(editingCompetitor.id, formData);
      toast({ title: "竞品信息已更新" });
    } else {
      addCompetitor(formData);
      toast({ title: "竞品已添加" });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  // Delete competitor
  const handleDelete = (id: string) => {
    deleteCompetitor(id);
    toast({ title: "竞品已删除" });
  };

  // Add advantage
  const addAdvantage = () => {
    if (!newAdvantage.trim()) return;
    setFormData((prev) => ({
      ...prev,
      advantages: [...prev.advantages, newAdvantage.trim()],
    }));
    setNewAdvantage("");
  };

  // Remove advantage
  const removeAdvantage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      advantages: prev.advantages.filter((_, i) => i !== index),
    }));
  };

  // Add disadvantage
  const addDisadvantage = () => {
    if (!newDisadvantage.trim()) return;
    setFormData((prev) => ({
      ...prev,
      disadvantages: [...prev.disadvantages, newDisadvantage.trim()],
    }));
    setNewDisadvantage("");
  };

  // Remove disadvantage
  const removeDisadvantage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      disadvantages: prev.disadvantages.filter((_, i) => i !== index),
    }));
  };

  // Toggle platform
  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      mainPlatforms: prev.mainPlatforms.includes(platform)
        ? prev.mainPlatforms.filter((p) => p !== platform)
        : [...prev.mainPlatforms, platform],
    }));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            竞品管理
          </h1>
          <p className="mt-1 text-slate-500">
            管理竞品信息，分析竞争优劣势
          </p>
        </div>
        <Button onClick={handleNewCompetitor} className="gap-2">
          <Plus className="h-4 w-4" />
          添加竞品
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="搜索竞品名称或品类..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {categories.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">品类：</span>
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => setSearchQuery(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">竞品总数</p>
                <p className="text-2xl font-bold">{competitors.length}</p>
              </div>
              <Target className="h-8 w-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">涉及品类</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Tag className="h-8 w-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">平均优势项</p>
                <p className="text-2xl font-bold">
                  {competitors.length > 0
                    ? (
                        competitors.reduce((acc, c) => acc + c.advantages.length, 0) /
                        competitors.length
                      ).toFixed(1)
                    : "0"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Grid */}
      {filteredCompetitors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompetitors.map((competitor) => (
            <Card
              key={competitor.id}
              className="bg-white border-slate-200 hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-slate-400" />
                      {competitor.name}
                    </CardTitle>
                    {competitor.category && (
                      <Badge variant="secondary" className="mt-1">
                        {competitor.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCompetitor(competitor)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(competitor.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Price & Target */}
                <div className="flex items-center gap-4 text-sm">
                  {competitor.priceRange && (
                    <span className="text-slate-600">
                      💰 {competitor.priceRange}
                    </span>
                  )}
                  {competitor.targetAudience && (
                    <span className="text-slate-600 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {competitor.targetAudience}
                    </span>
                  )}
                </div>

                {/* Advantages */}
                {competitor.advantages.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      优势
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {competitor.advantages.slice(0, 3).map((adv, i) => (
                        <Badge key={i} className="bg-green-50 text-green-700 text-xs">
                          {adv}
                        </Badge>
                      ))}
                      {competitor.advantages.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{competitor.advantages.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Disadvantages */}
                {competitor.disadvantages.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      劣势
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {competitor.disadvantages.slice(0, 3).map((dis, i) => (
                        <Badge key={i} className="bg-red-50 text-red-700 text-xs">
                          {dis}
                        </Badge>
                      ))}
                      {competitor.disadvantages.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{competitor.disadvantages.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Platforms */}
                {competitor.mainPlatforms.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" />
                      主要渠道
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {competitor.mainPlatforms.map((platform, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? "未找到匹配的竞品" : "暂无竞品数据"}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {searchQuery ? "尝试其他搜索词" : "点击上方按钮添加第一个竞品"}
            </p>
            {!searchQuery && (
              <Button onClick={handleNewCompetitor} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                添加竞品
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompetitor ? "编辑竞品" : "添加竞品"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">竞品名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="例如：竞品 A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">所属品类</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="例如：护肤品"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceRange">价格区间</Label>
                <Input
                  id="priceRange"
                  value={formData.priceRange}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, priceRange: e.target.value }))
                  }
                  placeholder="例如：¥199-299"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">目标人群</Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, targetAudience: e.target.value }))
                  }
                  placeholder="例如：25-35岁女性"
                />
              </div>
            </div>

            <Separator />

            {/* Advantages */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                竞品优势
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.advantages.map((adv, index) => (
                  <Badge key={index} className="bg-green-50 text-green-700 gap-1">
                    {adv}
                    <button onClick={() => removeAdvantage(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newAdvantage}
                  onChange={(e) => setNewAdvantage(e.target.value)}
                  placeholder="输入优势点..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAdvantage();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addAdvantage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Disadvantages */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                竞品劣势
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.disadvantages.map((dis, index) => (
                  <Badge key={index} className="bg-red-50 text-red-700 gap-1">
                    {dis}
                    <button onClick={() => removeDisadvantage(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newDisadvantage}
                  onChange={(e) => setNewDisadvantage(e.target.value)}
                  placeholder="输入劣势点..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDisadvantage();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addDisadvantage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Platforms */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                主要销售渠道
              </Label>
              <div className="flex flex-wrap gap-2">
                {SALES_PLATFORMS.map((platform) => (
                  <Badge
                    key={platform}
                    variant={formData.mainPlatforms.includes(platform) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                备注
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="其他需要记录的信息..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {editingCompetitor && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(editingCompetitor.id);
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
                {editingCompetitor ? "保存更改" : "添加竞品"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
