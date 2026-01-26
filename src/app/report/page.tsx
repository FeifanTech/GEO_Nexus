"use client";

import { useState, useEffect, useRef } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useMonitorStore } from "@/store/useMonitorStore";
import { useQueryStore } from "@/store/useQueryStore";
import { AI_MODEL_CONFIG, AIModel } from "@/types/monitor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Printer,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ReportPage() {
  const { products } = useProductStore();
  const { getTasksByStatus } = useMonitorStore();
  const { queries } = useQueryStore();

  const [mounted, setMounted] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Calculate statistics
  const completedTasks = getTasksByStatus("completed");
  const totalResults = completedTasks.flatMap(t => t.results);
  
  const mentionedResults = totalResults.filter(r => r.mentioned);
  const overallMentionRate = totalResults.length > 0 
    ? Math.round((mentionedResults.length / totalResults.length) * 100) 
    : 0;

  // Group results by model
  const resultsByModel = (Object.keys(AI_MODEL_CONFIG) as AIModel[]).map(model => {
    const modelResults = totalResults.filter(r => r.model === model);
    const mentioned = modelResults.filter(r => r.mentioned).length;
    const avgPosition = modelResults
      .filter(r => r.position !== null)
      .reduce((sum, r) => sum + (r.position || 0), 0) / Math.max(modelResults.filter(r => r.position !== null).length, 1);
    
    return {
      model,
      config: AI_MODEL_CONFIG[model],
      total: modelResults.length,
      mentioned,
      mentionRate: modelResults.length > 0 ? Math.round((mentioned / modelResults.length) * 100) : 0,
      avgPosition: avgPosition || null,
    };
  }).filter(r => r.total > 0);

  // Get recent completed tasks for detail
  const recentCompletedTasks = completedTasks.slice(0, 10);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Control Bar - Hidden in Print */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/ai-monitor">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回监测
              </Button>
            </Link>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择产品" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部产品</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              打印 / 导出 PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="max-w-4xl mx-auto py-8 px-6 print:py-0 print:px-0">
        {/* Report Header */}
        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-3xl font-bold text-slate-900 print:text-2xl">
            GEO AI 搜索监测报告
          </h1>
          <p className="text-slate-500 mt-2">
            生成时间：{new Date().toLocaleString("zh-CN")}
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm text-slate-600">
            <span>监测任务：{completedTasks.length} 次</span>
            <span>覆盖问题：{queries.length} 个</span>
            <span>分析模型：{resultsByModel.length} 个</span>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">📊 综合评估</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-slate-50 rounded-lg print:bg-white print:border">
                <div className="text-3xl font-bold text-slate-900">
                  {overallMentionRate}%
                </div>
                <div className="text-sm text-slate-500 mt-1">整体提及率</div>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                  {overallMentionRate >= 50 ? (
                    <><TrendingUp className="h-3 w-3 text-green-500" /> <span className="text-green-600">表现良好</span></>
                  ) : overallMentionRate >= 30 ? (
                    <><Minus className="h-3 w-3 text-amber-500" /> <span className="text-amber-600">需要优化</span></>
                  ) : (
                    <><TrendingDown className="h-3 w-3 text-red-500" /> <span className="text-red-600">亟需改进</span></>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg print:bg-white print:border">
                <div className="text-3xl font-bold text-slate-900">
                  {resultsByModel.length > 0 
                    ? Math.round(resultsByModel.reduce((sum, r) => sum + (r.avgPosition || 10), 0) / resultsByModel.length)
                    : "--"
                  }
                </div>
                <div className="text-sm text-slate-500 mt-1">平均排名</div>
                <div className="text-xs text-slate-400 mt-2">
                  越低越好（1=第一名）
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg print:bg-white print:border">
                <div className="text-3xl font-bold text-slate-900">
                  {resultsByModel.filter(r => r.mentionRate > 0).length}/{resultsByModel.length}
                </div>
                <div className="text-sm text-slate-500 mt-1">有效覆盖</div>
                <div className="text-xs text-slate-400 mt-2">
                  AI 模型覆盖率
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model Performance */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">🤖 各 AI 模型表现</CardTitle>
          </CardHeader>
          <CardContent>
            {resultsByModel.length > 0 ? (
              <div className="space-y-3">
                {resultsByModel.map((result) => (
                  <div 
                    key={result.model}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg print:bg-white print:border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{result.config.icon}</span>
                      <div>
                        <div className="font-medium text-slate-900">{result.config.name}</div>
                        <div className="text-xs text-slate-500">
                          {result.total} 次查询
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {result.mentionRate}%
                        </div>
                        <div className="text-xs text-slate-500">提及率</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {result.avgPosition ? `#${Math.round(result.avgPosition)}` : "--"}
                        </div>
                        <div className="text-xs text-slate-500">平均排名</div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          result.mentionRate >= 50 
                            ? "border-green-300 text-green-700" 
                            : result.mentionRate >= 30 
                            ? "border-amber-300 text-amber-700"
                            : "border-red-300 text-red-700"
                        }
                      >
                        {result.mentionRate >= 50 ? "优秀" : result.mentionRate >= 30 ? "一般" : "较差"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                暂无监测数据，请先执行监测任务
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Comparison Chart */}
        {resultsByModel.length > 0 && (
          <Card className="mb-6 print:shadow-none print:border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">📈 模型提及率对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] print:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={resultsByModel.map(r => ({
                      name: r.config.name,
                      rate: r.mentionRate,
                      icon: r.config.icon,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, '提及率']}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                      {resultsByModel.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={
                            entry.mentionRate >= 50 ? '#22c55e' : 
                            entry.mentionRate >= 30 ? '#f59e0b' : '#ef4444'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-500"></span> 优秀 (≥50%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-500"></span> 一般 (30-50%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-500"></span> 较差 (&lt;30%)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Tasks Detail */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">📋 监测任务明细</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompletedTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 font-medium text-slate-600">监测问题</th>
                      <th className="text-center py-2 font-medium text-slate-600">目标品牌</th>
                      <th className="text-center py-2 font-medium text-slate-600">提及情况</th>
                      <th className="text-right py-2 font-medium text-slate-600">完成时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentCompletedTasks.map((task) => {
                      const mentionedCount = task.results.filter(r => r.mentioned).length;
                      const allMentioned = mentionedCount === task.results.length;
                      const noneMentioned = mentionedCount === 0;
                      
                      return (
                        <tr key={task.id}>
                          <td className="py-2 max-w-[200px] truncate">
                            {task.query}
                          </td>
                          <td className="py-2 text-center text-slate-600">
                            {task.targetBrand}
                          </td>
                          <td className="py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {allMentioned ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : noneMentioned ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              )}
                              <span className={
                                allMentioned ? "text-green-600" : 
                                noneMentioned ? "text-red-600" : "text-amber-600"
                              }>
                                {mentionedCount}/{task.results.length}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 text-right text-slate-500">
                            {task.completedAt 
                              ? new Date(task.completedAt).toLocaleString("zh-CN", { 
                                  month: "short", 
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "--"
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                暂无已完成的监测任务
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="print:shadow-none print:border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">💡 优化建议</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-700">
              {overallMentionRate < 30 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-500">●</span>
                  <span>整体提及率较低，建议加强品牌在各AI平台的内容曝光和SEO优化。</span>
                </li>
              )}
              {resultsByModel.some(r => r.mentionRate === 0) && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">●</span>
                  <span>
                    部分AI模型（{resultsByModel.filter(r => r.mentionRate === 0).map(r => r.config.name).join("、")}）
                    完全未提及品牌，需要针对性优化。
                  </span>
                </li>
              )}
              {resultsByModel.some(r => r.avgPosition && r.avgPosition > 5) && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">●</span>
                  <span>平均排名靠后，建议优化产品描述和关键词，提升在AI回答中的优先级。</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-500">●</span>
                <span>建议定期监测（每周至少1次），持续跟踪品牌在AI搜索中的表现变化。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">●</span>
                <span>针对主要竞品进行对比监测，了解竞争态势。</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 mt-8 print:mt-6">
          <p>本报告由 GEO Nexus Platform 自动生成</p>
          <p className="mt-1">© {new Date().getFullYear()} GEO Nexus - AI 搜索优化平台</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border {
            border: 1px solid #e2e8f0 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:mt-6 {
            margin-top: 1.5rem !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
