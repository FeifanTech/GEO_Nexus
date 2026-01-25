"use client";

import { useState, useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { generateContent, createStreamHandler } from "@/lib/dify-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Factory,
  Package,
  Sparkles,
  Copy,
  Check,
  FileText,
  MessageSquare,
  Share2,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";

// Platform styles for social posts
const PLATFORM_STYLES = [
  {
    id: "xiaohongshu",
    name: "小红书",
    description: "种草风格，多 Emoji，口语化",
    prompt: "请用小红书种草风格撰写，要求：1. 使用大量Emoji表情；2. 口语化表达；3. 分段清晰；4. 包含话题标签；5. 字数300-500字",
  },
  {
    id: "zhihu",
    name: "知乎",
    description: "专业测评，逻辑清晰，干货满满",
    prompt: "请用知乎专业测评风格撰写，要求：1. 逻辑清晰有条理；2. 数据和事实支撑；3. 客观中立的语气；4. 深度分析；5. 字数500-800字",
  },
  {
    id: "taobao",
    name: "逛逛",
    description: "购物分享，真实体验，种草安利",
    prompt: "请用淘宝逛逛购物分享风格撰写，要求：1. 真实购物体验；2. 突出性价比；3. 适当使用表情；4. 口语化但不过度；5. 字数200-400字",
  },
  {
    id: "douyin",
    name: "抖音",
    description: "短平快，吸引眼球，节奏感强",
    prompt: "请用抖音短视频文案风格撰写，要求：1. 开头吸引眼球；2. 节奏感强；3. 口语化；4. 适合配音朗读；5. 字数100-200字",
  },
] as const;

// Review scenarios
const REVIEW_SCENARIOS = [
  { id: "self_use", name: "自用体验", description: "个人使用后的真实感受" },
  { id: "gift", name: "送礼推荐", description: "作为礼物送人的体验" },
  { id: "compare", name: "对比评测", description: "与其他产品对比后的选择" },
  { id: "repurchase", name: "回购推荐", description: "多次购买的忠实用户" },
  { id: "newbie", name: "新手入门", description: "第一次尝试的新用户" },
];

// Task types configuration
const TASK_TYPES = [
  {
    id: "pdp_summary",
    name: "PDP 摘要",
    description: "产品详情页摘要，突出核心卖点",
    icon: FileText,
  },
  {
    id: "review_batch",
    name: "口碑评论",
    description: "批量生成多条不重复的用户评论",
    icon: MessageSquare,
  },
  {
    id: "social_post",
    name: "种草文案",
    description: "社交媒体帖子，支持多平台风格",
    icon: Share2,
  },
] as const;

type TaskType = (typeof TASK_TYPES)[number]["id"];
type PlatformStyle = (typeof PLATFORM_STYLES)[number]["id"];

interface GeneratedReview {
  id: string;
  content: string;
  scenario: string;
  copied: boolean;
}

export default function ContentFactoryPage() {
  const { products } = useProductStore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<TaskType>("pdp_summary");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review batch settings
  const [reviewCount, setReviewCount] = useState(5);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(["self_use", "gift"]);
  const [generatedReviews, setGeneratedReviews] = useState<GeneratedReview[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Social post settings
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformStyle>("xiaohongshu");

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get selected product
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Build product JSON
  const buildProductJson = () => {
    if (!selectedProduct) return "";
    return JSON.stringify(
      {
        name: selectedProduct.name,
        selling_points: selectedProduct.selling_points,
        target_users: selectedProduct.target_users,
        competitors: selectedProduct.competitors,
      },
      null,
      2
    );
  };

  // Generate single content
  const handleGenerateSingle = async (taskType: string, extraPrompt: string = "") => {
    if (!selectedProduct) {
      toast({
        title: "请选择产品",
        description: "请先从顶部下拉框选择一个产品",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setError(null);

    const productJson = buildProductJson();

    // Map task type to content type
    const contentType = taskType === "pdp_summary" ? "pdp" : taskType === "social_post" ? "social" : "review";

    try {
      await generateContent(
        {
          type: contentType as "pdp" | "review" | "social",
          inputs: {
            product_json: productJson,
            extra_prompt: extraPrompt,
          },
          user: `user-${Date.now()}`,
        },
        createStreamHandler(
          setGeneratedContent,
          () => {
            setIsGenerating(false);
            toast({
              title: "生成成功",
              description: "内容已生成完毕，可以复制使用",
            });
          },
          (err) => {
            setIsGenerating(false);
            setError(err.message);
            toast({
              title: "生成失败",
              description: err.message,
              variant: "destructive",
            });
          }
        )
      );
    } catch (err) {
      setIsGenerating(false);
      const message = err instanceof Error ? err.message : "未知错误";
      setError(message);
      toast({
        title: "生成失败",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Generate batch reviews
  const handleGenerateBatchReviews = async () => {
    if (!selectedProduct) {
      toast({
        title: "请选择产品",
        description: "请先从顶部下拉框选择一个产品",
        variant: "destructive",
      });
      return;
    }

    if (selectedScenarios.length === 0) {
      toast({
        title: "请选择场景",
        description: "请至少选择一个评论场景",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedReviews([]);
    setCurrentReviewIndex(0);
    setError(null);

    const productJson = buildProductJson();
    const scenarioNames = selectedScenarios
      .map((id) => REVIEW_SCENARIOS.find((s) => s.id === id)?.name)
      .join("、");

    // Generate reviews one by one
    for (let i = 0; i < reviewCount; i++) {
      const scenario = selectedScenarios[i % selectedScenarios.length];
      const scenarioInfo = REVIEW_SCENARIOS.find((s) => s.id === scenario);
      
      setCurrentReviewIndex(i + 1);

      const extraPrompt = `请生成第 ${i + 1} 条用户评论。
场景：${scenarioInfo?.name} - ${scenarioInfo?.description}
要求：
1. 评论要真实自然，像真实用户写的
2. 字数50-150字
3. 不要与之前的评论重复
4. 可以提及具体使用场景和感受
5. 适当包含产品卖点但不要太刻意`;

      try {
        let reviewContent = "";
        await generateContent(
          {
            type: "review",
            inputs: {
              product_json: productJson,
              extra_prompt: extraPrompt,
              review_index: (i + 1).toString(),
              total_reviews: reviewCount.toString(),
              scenarios: scenarioNames,
            },
            user: `user-${Date.now()}-${i}`,
          },
          {
            onMessage: (chunk) => {
              reviewContent += chunk;
            },
            onComplete: () => {
              setGeneratedReviews((prev) => [
                ...prev,
                {
                  id: `review-${Date.now()}-${i}`,
                  content: reviewContent.trim(),
                  scenario: scenarioInfo?.name || "",
                  copied: false,
                },
              ]);
            },
            onError: (err) => {
              console.error(`Review ${i + 1} failed:`, err);
            },
          }
        );
      } catch (err) {
        console.error(`Review ${i + 1} failed:`, err);
      }
    }

    setIsGenerating(false);
    setCurrentReviewIndex(0);
    toast({
      title: "批量生成完成",
      description: `已生成 ${reviewCount} 条评论`,
    });
  };

  // Generate social post with platform style
  const handleGenerateSocialPost = async () => {
    const platformInfo = PLATFORM_STYLES.find((p) => p.id === selectedPlatform);
    const extraPrompt = platformInfo?.prompt || "";
    await handleGenerateSingle("social_post", extraPrompt);
  };

  // Copy single review
  const handleCopyReview = async (reviewId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setGeneratedReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, copied: true } : r))
      );
      setTimeout(() => {
        setGeneratedReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, copied: false } : r))
        );
      }, 2000);
    } catch {
      toast({
        title: "复制失败",
        description: "无法访问剪贴板",
        variant: "destructive",
      });
    }
  };

  // Copy all reviews
  const handleCopyAllReviews = async () => {
    const allContent = generatedReviews.map((r, i) => `【评论 ${i + 1}】${r.scenario}\n${r.content}`).join("\n\n");
    try {
      await navigator.clipboard.writeText(allContent);
      toast({
        title: "复制成功",
        description: `已复制全部 ${generatedReviews.length} 条评论`,
      });
    } catch {
      toast({
        title: "复制失败",
        description: "无法访问剪贴板",
        variant: "destructive",
      });
    }
  };

  // Toggle scenario selection
  const toggleScenario = (scenarioId: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
      setIsCopied(true);
      toast({
        title: "复制成功",
        description: "内容已复制到剪贴板",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({
        title: "复制失败",
        description: "无法访问剪贴板",
        variant: "destructive",
      });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          内容工厂
        </h1>
        <p className="mt-1 text-slate-500">
          基于产品信息智能生成营销内容，支持批量生成和多平台风格
        </p>
      </div>

      {/* Product Selector */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-500" />
            选择产品
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="请选择要生成内容的产品..." />
            </SelectTrigger>
            <SelectContent>
              {products.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  暂无产品，请先在产品管理页面添加产品
                </div>
              ) : (
                products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <span>{product.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {product.selling_points.length} 个卖点
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {selectedProduct && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                <span className="font-medium">目标用户：</span>
                {selectedProduct.target_users || "未设置"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedProduct.selling_points.map((point, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {point}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Tabs */}
      <Tabs value={selectedTask} onValueChange={(v) => setSelectedTask(v as TaskType)}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          {TASK_TYPES.map((task) => {
            const Icon = task.icon;
            return (
              <TabsTrigger key={task.id} value={task.id} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{task.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* PDP Summary Tab */}
        <TabsContent value="pdp_summary" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">PDP 摘要生成</CardTitle>
                <CardDescription>生成产品详情页的 AI 摘要文本</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">
                    将自动提取产品核心卖点，生成适合放在详情页顶部的摘要文案，突出产品价值主张。
                  </p>
                </div>
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => handleGenerateSingle("pdp_summary")}
                  disabled={isGenerating || !selectedProductId}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      生成 PDP 摘要
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">生成结果</CardTitle>
                  <CardDescription>
                    {isGenerating ? "正在生成..." : generatedContent ? "生成完毕" : "等待生成"}
                  </CardDescription>
                </div>
                {generatedContent && !isGenerating && (
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {isCopied ? "已复制" : "复制"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                ) : generatedContent || isGenerating ? (
                  <div className="min-h-[200px] p-4 bg-slate-50 rounded-lg border">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {generatedContent || <span className="text-slate-400">等待生成...</span>}
                      {isGenerating && <span className="inline-block w-2 h-4 ml-0.5 bg-slate-400 animate-pulse" />}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Factory className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">选择产品后点击生成按钮</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Review Batch Tab */}
        <TabsContent value="review_batch" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">批量评论生成</CardTitle>
                <CardDescription>一次生成多条不重复的用户评论</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Review Count */}
                <div className="space-y-2">
                  <Label>生成数量</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={reviewCount}
                      onChange={(e) => setReviewCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-24"
                    />
                    <span className="text-sm text-slate-500">条（最多20条）</span>
                  </div>
                </div>

                <Separator />

                {/* Scenario Selection */}
                <div className="space-y-2">
                  <Label>评论场景</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {REVIEW_SCENARIOS.map((scenario) => (
                      <div
                        key={scenario.id}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all text-center ${
                          selectedScenarios.includes(scenario.id)
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => toggleScenario(scenario.id)}
                      >
                        <p className="text-sm font-medium">{scenario.name}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    已选 {selectedScenarios.length} 个场景，评论将循环使用这些场景
                  </p>
                </div>

                <Separator />

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleGenerateBatchReviews}
                  disabled={isGenerating || !selectedProductId || selectedScenarios.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      生成中 ({currentReviewIndex}/{reviewCount})...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      批量生成 {reviewCount} 条评论
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">生成结果</CardTitle>
                  <CardDescription>
                    {isGenerating
                      ? `正在生成第 ${currentReviewIndex} 条...`
                      : generatedReviews.length > 0
                      ? `共 ${generatedReviews.length} 条评论`
                      : "等待生成"}
                  </CardDescription>
                </div>
                {generatedReviews.length > 0 && !isGenerating && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyAllReviews}>
                      <Copy className="h-4 w-4" />
                      全部复制
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setGeneratedReviews([])}>
                      <Trash2 className="h-4 w-4" />
                      清空
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {generatedReviews.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {generatedReviews.map((review, index) => (
                      <div
                        key={review.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {review.scenario}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleCopyReview(review.id, review.content)}
                          >
                            {review.copied ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
                    <p className="text-slate-500">正在生成第 {currentReviewIndex} 条评论...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">设置数量和场景后点击生成按钮</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Post Tab */}
        <TabsContent value="social_post" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">种草文案生成</CardTitle>
                <CardDescription>选择平台风格，生成适配的种草内容</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label>选择平台风格</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORM_STYLES.map((platform) => (
                      <div
                        key={platform.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPlatform === platform.id
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => setSelectedPlatform(platform.id as PlatformStyle)}
                      >
                        <p className="font-medium text-sm">{platform.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{platform.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleGenerateSocialPost}
                  disabled={isGenerating || !selectedProductId}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      生成 {PLATFORM_STYLES.find((p) => p.id === selectedPlatform)?.name} 文案
                    </>
                  )}
                </Button>

                {generatedContent && !isGenerating && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleGenerateSocialPost}
                  >
                    <RefreshCw className="h-4 w-4" />
                    重新生成
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">生成结果</CardTitle>
                  <CardDescription>
                    {isGenerating
                      ? "正在生成..."
                      : generatedContent
                      ? `${PLATFORM_STYLES.find((p) => p.id === selectedPlatform)?.name} 风格`
                      : "等待生成"}
                  </CardDescription>
                </div>
                {generatedContent && !isGenerating && (
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                    {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {isCopied ? "已复制" : "复制"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                ) : generatedContent || isGenerating ? (
                  <div className="min-h-[300px] p-4 bg-slate-50 rounded-lg border">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {generatedContent || <span className="text-slate-400">等待生成...</span>}
                      {isGenerating && <span className="inline-block w-2 h-4 ml-0.5 bg-slate-400 animate-pulse" />}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Share2 className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">选择平台风格后点击生成按钮</p>
                  </div>
                )}
                {generatedContent && (
                  <div className="mt-2 flex justify-end">
                    <span className="text-xs text-slate-400">{generatedContent.length} 字符</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
