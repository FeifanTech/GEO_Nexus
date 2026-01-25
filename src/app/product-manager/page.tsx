"use client";

import { useState, useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { Product, ProductFormData } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Plus,
  Pencil,
  Trash2,
  Package,
  Target,
  Users,
  Swords,
  X,
  Save,
} from "lucide-react";

const emptyFormData: ProductFormData = {
  name: "",
  selling_points: [],
  target_users: "",
  competitors: "",
};

export default function ProductManagerPage() {
  const { products, currentProduct, addProduct, updateProduct, deleteProduct, setCurrentProduct } =
    useProductStore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [sellingPointInput, setSellingPointInput] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync form with current product
  useEffect(() => {
    if (currentProduct && isEditing) {
      setFormData({
        name: currentProduct.name,
        selling_points: [...currentProduct.selling_points],
        target_users: currentProduct.target_users,
        competitors: currentProduct.competitors,
      });
    }
  }, [currentProduct, isEditing]);

  const handleNewProduct = () => {
    setCurrentProduct(null);
    setFormData(emptyFormData);
    setSellingPointInput("");
    setIsEditing(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(emptyFormData);
    setSellingPointInput("");
    setCurrentProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "验证失败",
        description: "产品名称不能为空",
        variant: "destructive",
      });
      return;
    }

    if (currentProduct) {
      // Update existing product
      updateProduct(currentProduct.id, formData);
      toast({
        title: "更新成功",
        description: `产品 "${formData.name}" 已更新`,
      });
    } else {
      // Add new product
      addProduct(formData);
      toast({
        title: "创建成功",
        description: `产品 "${formData.name}" 已创建`,
      });
    }

    handleCancelEdit();
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast({
        title: "删除成功",
        description: `产品 "${productToDelete.name}" 已删除`,
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);

      if (currentProduct?.id === productToDelete.id) {
        handleCancelEdit();
      }
    }
  };

  const handleAddSellingPoint = () => {
    if (sellingPointInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        selling_points: [...prev.selling_points, sellingPointInput.trim()],
      }));
      setSellingPointInput("");
    }
  };

  const handleRemoveSellingPoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      selling_points: prev.selling_points.filter((_, i) => i !== index),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSellingPoint();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Product Manager
          </h1>
          <p className="mt-1 text-slate-500">
            管理您的产品信息，包括卖点、目标用户和竞品分析
          </p>
        </div>
        <Button onClick={handleNewProduct} className="gap-2">
          <Plus className="h-4 w-4" />
          新增产品
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Product List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">产品列表</CardTitle>
              <CardDescription>
                共 {products.length} 个产品
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                    <Package className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 mb-2">暂无产品</p>
                  <p className="text-xs text-slate-400">
                    点击上方「新增产品」按钮创建第一个产品
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        currentProduct?.id === product.id ? "bg-slate-50" : ""
                      }`}
                      onClick={() => setCurrentProduct(product)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-slate-900 truncate">
                            {product.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {product.selling_points.slice(0, 2).map((point, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs bg-slate-100 text-slate-600"
                              >
                                {point}
                              </Badge>
                            ))}
                            {product.selling_points.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-slate-100 text-slate-600"
                              >
                                +{product.selling_points.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProduct(product);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(product);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Detail/Form Panel */}
        <div className="lg:col-span-3">
          {isEditing ? (
            /* Edit/Create Form */
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">
                  {currentProduct ? "编辑产品" : "新增产品"}
                </CardTitle>
                <CardDescription>
                  {currentProduct
                    ? "修改产品信息后点击保存"
                    : "填写产品信息创建新产品"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      产品名称 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="输入产品名称"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>

                  {/* Selling Points */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-slate-400" />
                      核心卖点
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="输入卖点后按回车添加"
                        value={sellingPointInput}
                        onChange={(e) => setSellingPointInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddSellingPoint}
                      >
                        添加
                      </Button>
                    </div>
                    {formData.selling_points.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.selling_points.map((point, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="pl-3 pr-1 py-1 bg-slate-100 text-slate-700"
                          >
                            {point}
                            <button
                              type="button"
                              className="ml-1 p-0.5 hover:bg-slate-200 rounded"
                              onClick={() => handleRemoveSellingPoint(index)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Target Users */}
                  <div className="space-y-2">
                    <Label htmlFor="target_users" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      目标人群
                    </Label>
                    <Textarea
                      id="target_users"
                      placeholder="描述您的目标用户群体"
                      value={formData.target_users}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          target_users: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  {/* Competitors */}
                  <div className="space-y-2">
                    <Label htmlFor="competitors" className="flex items-center gap-2">
                      <Swords className="h-4 w-4 text-slate-400" />
                      竞品分析
                    </Label>
                    <Textarea
                      id="competitors"
                      placeholder="列出主要竞争对手及其特点"
                      value={formData.competitors}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          competitors: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      取消
                    </Button>
                    <Button type="submit" className="gap-2">
                      <Save className="h-4 w-4" />
                      {currentProduct ? "保存修改" : "创建产品"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : currentProduct ? (
            /* Product Detail View */
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      {currentProduct.name}
                    </CardTitle>
                    <CardDescription>产品详情</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleEditProduct(currentProduct)}
                    >
                      <Pencil className="h-4 w-4" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(currentProduct)}
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selling Points */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-slate-400" />
                    核心卖点
                  </h4>
                  {currentProduct.selling_points.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentProduct.selling_points.map((point, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-slate-100 text-slate-700"
                        >
                          {point}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">暂无卖点</p>
                  )}
                </div>

                <Separator />

                {/* Target Users */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-slate-400" />
                    目标人群
                  </h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {currentProduct.target_users || "暂未设置目标人群"}
                  </p>
                </div>

                <Separator />

                {/* Competitors */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-3">
                    <Swords className="h-4 w-4 text-slate-400" />
                    竞品分析
                  </h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {currentProduct.competitors || "暂未设置竞品分析"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Empty State */
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  选择或创建产品
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
                  从左侧列表选择一个产品查看详情，或点击「新增产品」按钮创建新产品
                </p>
                <Button onClick={handleNewProduct} className="gap-2">
                  <Plus className="h-4 w-4" />
                  新增产品
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除产品 &quot;{productToDelete?.name}&quot; 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
