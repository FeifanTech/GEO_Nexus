"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useProductStore } from "@/store/useProductStore";
import { useDiagnosisStore } from "@/store/useDiagnosisStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { sendDiagnosis, createStreamHandler } from "@/lib/dify-client";
import { DiagnosisType, DIAGNOSIS_TYPE_CONFIG } from "@/types/diagnosis";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Stethoscope,
  Package,
  TrendingUp,
  Users,
  MessageSquareWarning,
  Loader2,
  Play,
  RotateCcw,
  AlertCircle,
  Sparkles,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Diagnosis mode configuration
const DIAGNOSIS_MODES = [
  {
    id: "rank",
    name: "排名检查",
    icon: TrendingUp,
    description: "检查产品在各渠道的排名表现",
    promptTemplate: (product: string) =>
      `请分析以下产品的排名表现。提供搜索可见性、电商平台排名的洞察，并给出优化建议。\n\n产品信息：\n${product}`,
  },
  {
    id: "competitor",
    name: "竞品分析",
    icon: Users,
    description: "与竞品进行对比分析",
    promptTemplate: (product: string) =>
      `请将此产品与竞争对手进行对比分析。分析优势、劣势、市场定位，并提供战略建议。\n\n产品信息：\n${product}`,
  },
  {
    id: "sentiment",
    name: "情绪审计",
    icon: MessageSquareWarning,
    description: "分析用户负面情绪和评价",
    promptTemplate: (product: string) =>
      `请分析此产品可能存在的负面情绪和用户痛点。识别问题领域，并建议如何改进以解决用户反馈。\n\n产品信息：\n${product}`,
  },
] as const;

type DiagnosisMode = (typeof DIAGNOSIS_MODES)[number]["id"];

export default function GeoDiagnosisPage() {
  const { products } = useProductStore();
  const { addRecord, getRecentRecords, deleteRecord } = useDiagnosisStore();
  const { settings } = useSettingsStore();
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [activeMode, setActiveMode] = useState<DiagnosisMode>("rank");
  const [diagnosisResult, setDiagnosisResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [showHistory, setShowHistory] = useState(false);
  
  // Get history records
  const recentDiagnoses = mounted ? getRecentRecords(10) : [];

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (outputRef.current && isRunning) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [diagnosisResult, isRunning]);

  // Get selected product
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Get current mode config
  const currentMode = DIAGNOSIS_MODES.find((m) => m.id === activeMode)!;

  // Build product JSON for prompt
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

  // Start diagnosis
  const handleStartDiagnosis = async () => {
    if (!selectedProduct) {
      toast({
        title: "请选择产品",
        description: "请先从顶部下拉框选择一个产品进行诊断",
        variant: "destructive",
      });
      return;
    }

    // 检查 API Key 配置
    if (!settings.difyApiKey) {
      toast({
        title: "未配置 API Key",
        description: "请先在设置页面配置 Dify API Key",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setDiagnosisResult("");
    setError(null);

    const productJson = buildProductJson();
    const prompt = currentMode.promptTemplate(productJson);

    try {
      await sendDiagnosis(
        {
          type: activeMode,
          query: prompt,
          user: `user-${Date.now()}`,
          inputs: {
            product_name: selectedProduct.name,
            product_json: productJson,
          },
          conversation_id: conversationId,
          // 传递设置中的 API Key 和 Base URL
          dify_api_key: settings.difyApiKey,
          dify_base_url: settings.difyBaseUrl,
        },
        createStreamHandler(
          setDiagnosisResult,
          (fullContent, newConversationId) => {
            setIsRunning(false);
            setConversationId(newConversationId);
            
            // Save to history
            addRecord({
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              type: activeMode as DiagnosisType,
              query: prompt,
              result: fullContent,
              conversationId: newConversationId,
            });
            
            toast({
              title: "诊断完成",
              description: `${currentMode.name}分析已完成，结果已保存到历史记录`,
            });
          },
          (err) => {
            setIsRunning(false);
            setError(err.message);
            toast({
              title: "诊断失败",
              description: err.message,
              variant: "destructive",
            });
          }
        )
      );
    } catch (err) {
      setIsRunning(false);
      const message = err instanceof Error ? err.message : "未知错误";
      setError(message);
      toast({
        title: "诊断失败",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Reset diagnosis
  const handleReset = () => {
    setDiagnosisResult("");
    setError(null);
    setConversationId(undefined);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          GEO 诊断
        </h1>
        <p className="mt-1 text-slate-500">
          AI 驱动的产品诊断工具，帮助您分析排名、竞品和用户情绪
        </p>
      </div>

      {/* Product Selector */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-500" />
            选择诊断产品
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProductId}
            onValueChange={(value) => {
              setSelectedProductId(value);
              handleReset();
            }}
          >
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="请选择要诊断的产品..." />
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
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedProduct.selling_points.slice(0, 4).map((point, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {point}
                  </Badge>
                ))}
                {selectedProduct.selling_points.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedProduct.selling_points.length - 4} 更多
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-medium">目标用户：</span>
                {selectedProduct.target_users || "未设置"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnosis Tabs */}
      <Tabs
        value={activeMode}
        onValueChange={(value) => {
          setActiveMode(value as DiagnosisMode);
          handleReset();
        }}
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          {DIAGNOSIS_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <TabsTrigger
                key={mode.id}
                value={mode.id}
                className="gap-2"
                disabled={isRunning}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{mode.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {DIAGNOSIS_MODES.map((mode) => (
          <TabsContent key={mode.id} value={mode.id} className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Mode Info & Controls */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <mode.icon className="h-5 w-5 text-slate-600" />
                    {mode.name}
                  </CardTitle>
                  <CardDescription>{mode.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      诊断内容
                    </p>
                    <p className="text-sm text-slate-700">
                      {mode.id === "rank" &&
                        "分析产品在搜索引擎和电商平台的排名表现，提供优化建议"}
                      {mode.id === "competitor" &&
                        "深入对比分析竞争对手，识别差异化优势和市场机会"}
                      {mode.id === "sentiment" &&
                        "挖掘用户负面反馈和潜在问题，制定改进策略"}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handleStartDiagnosis}
                      disabled={isRunning || !selectedProductId}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          诊断中...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          开始诊断
                        </>
                      )}
                    </Button>

                    {(diagnosisResult || error) && (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleReset}
                        disabled={isRunning}
                      >
                        <RotateCcw className="h-4 w-4" />
                        重置
                      </Button>
                    )}
                  </div>

                  {!selectedProductId && (
                    <p className="text-xs text-center text-slate-400">
                      请先选择产品后再开始诊断
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Right: Output Area */}
              <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-slate-900">
                      诊断结果
                    </CardTitle>
                    <CardDescription>
                      {isRunning
                        ? "AI 正在分析中..."
                        : diagnosisResult
                        ? "分析完成"
                        : "点击开始诊断查看结果"}
                    </CardDescription>
                  </div>
                  {isRunning && (
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      流式输出
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      </div>
                      <p className="text-sm font-medium text-red-600 mb-1">
                        诊断失败
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={handleStartDiagnosis}
                      >
                        重试
                      </Button>
                    </div>
                  ) : diagnosisResult || isRunning ? (
                    <div
                      ref={outputRef}
                      className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <article className="prose prose-slate prose-sm max-w-none">
                        <ReactMarkdown>{diagnosisResult}</ReactMarkdown>
                        {isRunning && (
                          <span className="inline-block w-2 h-4 ml-0.5 bg-slate-400 animate-pulse" />
                        )}
                      </article>
                      {!diagnosisResult && isRunning && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">等待响应...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                        <Stethoscope className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        准备开始诊断
                      </h3>
                      <p className="text-sm text-slate-500 max-w-sm">
                        选择产品和诊断模式后，点击「开始诊断」按钮，AI
                        将对产品进行深度分析
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Diagnosis History Section */}
      <Card className="mt-6 bg-white border-slate-200 shadow-sm">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setShowHistory(!showHistory)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-slate-600" />
              诊断历史
              {recentDiagnoses.length > 0 && (
                <Badge variant="secondary">{recentDiagnoses.length}</Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm">
              {showHistory ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          <CardDescription>
            查看过往的诊断记录
          </CardDescription>
        </CardHeader>
        
        {showHistory && (
          <CardContent>
            {recentDiagnoses.length > 0 ? (
              <div className="space-y-3">
                {recentDiagnoses.map((record) => {
                  const typeConfig = DIAGNOSIS_TYPE_CONFIG[record.type];
                  return (
                    <div 
                      key={record.id} 
                      className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{typeConfig.icon}</span>
                          <div>
                            <span className="font-medium">{record.productName}</span>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${typeConfig.color}`}
                            >
                              {typeConfig.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {new Date(record.createdAt).toLocaleString("zh-CN")}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRecord(record.id);
                              toast({
                                title: "已删除",
                                description: "诊断记录已删除",
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <details className="mt-2">
                        <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
                          查看诊断结果
                        </summary>
                        <div className="mt-2 p-3 bg-slate-50 rounded-lg max-h-[300px] overflow-y-auto">
                          <article className="prose prose-slate prose-sm max-w-none">
                            <ReactMarkdown>{record.result}</ReactMarkdown>
                          </article>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>暂无诊断历史</p>
                <p className="text-sm">完成诊断后，结果将自动保存在这里</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
