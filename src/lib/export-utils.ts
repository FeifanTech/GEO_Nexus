/**
 * Data Export Utilities
 * Supports CSV export for various data types
 */

// Generic CSV generation
export function generateCSV<T extends object>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return "";

  // Header row
  const header = columns.map((col) => `"${col.label}"`).join(",");

  // Data rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        if (value === null || value === undefined) return '""';
        if (Array.isArray(value)) return `"${value.join("; ")}"`;
        if (typeof value === "object") return `"${JSON.stringify(value)}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  return [header, ...rows].join("\n");
}

// Download CSV file
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for Excel compatibility with Chinese characters
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${formatDateForFilename(new Date())}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Format date for filename
function formatDateForFilename(date: Date): string {
  return date.toISOString().split("T")[0].replace(/-/g, "");
}

// ================== Export Functions ==================

import { Product } from "@/types/product";
import { Competitor } from "@/types/competitor";
import { MonitorTask, AI_MODEL_CONFIG } from "@/types/monitor";
import { SearchQuery, QUERY_INTENT_CONFIG } from "@/types/query";
import { DiagnosisRecord, DIAGNOSIS_TYPE_CONFIG } from "@/types/diagnosis";
import { ContentRecord, CONTENT_TYPE_CONFIG } from "@/types/content";

// Export Products
export function exportProducts(products: Product[]): void {
  const csv = generateCSV(products, [
    { key: "id", label: "ID" },
    { key: "name", label: "产品名称" },
    { key: "selling_points", label: "核心卖点" },
    { key: "target_users", label: "目标用户" },
    { key: "competitors", label: "竞品分析" },
  ]);
  downloadCSV(csv, "products");
}

// Export Competitors
export function exportCompetitors(competitors: Competitor[]): void {
  const csv = generateCSV(competitors, [
    { key: "id", label: "ID" },
    { key: "name", label: "竞品名称" },
    { key: "category", label: "品类" },
    { key: "advantages", label: "优势" },
    { key: "disadvantages", label: "劣势" },
    { key: "priceRange", label: "价格区间" },
    { key: "targetAudience", label: "目标人群" },
    { key: "mainPlatforms", label: "销售渠道" },
    { key: "notes", label: "备注" },
    { key: "createdAt", label: "创建时间" },
  ]);
  downloadCSV(csv, "competitors");
}

// Export Queries
export function exportQueries(queries: SearchQuery[]): void {
  const formattedQueries = queries.map((q) => ({
    ...q,
    intentLabel: QUERY_INTENT_CONFIG[q.intent]?.label || q.intent,
  }));
  
  const csv = generateCSV(formattedQueries, [
    { key: "id", label: "ID" },
    { key: "question", label: "问题" },
    { key: "intentLabel", label: "意图类型" },
    { key: "keywords", label: "关键词" },
    { key: "status", label: "状态" },
    { key: "createdAt", label: "创建时间" },
  ]);
  downloadCSV(csv, "queries");
}

// Export Monitor Tasks
export function exportMonitorTasks(tasks: MonitorTask[]): void {
  const formattedTasks = tasks.map((task) => {
    const mentionedCount = task.results.filter((r) => r.mentioned).length;
    const avgPosition = task.results
      .filter((r) => r.position !== null)
      .reduce((sum, r) => sum + (r.position || 0), 0) /
      Math.max(task.results.filter((r) => r.position !== null).length, 1);
    
    return {
      id: task.id,
      query: task.query,
      targetBrand: task.targetBrand,
      models: task.models.map((m) => AI_MODEL_CONFIG[m]?.name || m).join(", "),
      status: task.status,
      mentionRate: task.results.length > 0 
        ? `${Math.round((mentionedCount / task.results.length) * 100)}%` 
        : "-",
      avgPosition: avgPosition ? `#${Math.round(avgPosition)}` : "-",
      createdAt: task.createdAt,
      completedAt: task.completedAt || "-",
    };
  });
  
  const csv = generateCSV(formattedTasks, [
    { key: "id", label: "ID" },
    { key: "query", label: "监测问题" },
    { key: "targetBrand", label: "目标品牌" },
    { key: "models", label: "监测模型" },
    { key: "status", label: "状态" },
    { key: "mentionRate", label: "提及率" },
    { key: "avgPosition", label: "平均排名" },
    { key: "createdAt", label: "创建时间" },
    { key: "completedAt", label: "完成时间" },
  ]);
  downloadCSV(csv, "monitor_tasks");
}

// Export Diagnosis Records
export function exportDiagnosisRecords(records: DiagnosisRecord[]): void {
  const formattedRecords = records.map((r) => ({
    ...r,
    typeLabel: DIAGNOSIS_TYPE_CONFIG[r.type]?.label || r.type,
    resultPreview: r.result.slice(0, 200) + (r.result.length > 200 ? "..." : ""),
  }));
  
  const csv = generateCSV(formattedRecords, [
    { key: "id", label: "ID" },
    { key: "productName", label: "产品名称" },
    { key: "typeLabel", label: "诊断类型" },
    { key: "resultPreview", label: "诊断结果摘要" },
    { key: "createdAt", label: "创建时间" },
  ]);
  downloadCSV(csv, "diagnosis_records");
}

// Export Content Records
export function exportContentRecords(records: ContentRecord[]): void {
  const formattedRecords = records.map((r) => ({
    ...r,
    typeLabel: CONTENT_TYPE_CONFIG[r.type]?.label || r.type,
    contentPreview: r.content.slice(0, 200) + (r.content.length > 200 ? "..." : ""),
  }));
  
  const csv = generateCSV(formattedRecords, [
    { key: "id", label: "ID" },
    { key: "productName", label: "产品名称" },
    { key: "typeLabel", label: "内容类型" },
    { key: "platform", label: "平台" },
    { key: "contentPreview", label: "内容摘要" },
    { key: "createdAt", label: "创建时间" },
  ]);
  downloadCSV(csv, "content_records");
}

// Export all data as a combined report
export function exportAllData(data: {
  products: Product[];
  competitors: Competitor[];
  queries: SearchQuery[];
  monitorTasks: MonitorTask[];
  diagnosisRecords: DiagnosisRecord[];
  contentRecords: ContentRecord[];
}): void {
  // Create summary
  const summary = [
    { category: "产品", count: data.products.length },
    { category: "竞品", count: data.competitors.length },
    { category: "监测问题", count: data.queries.length },
    { category: "监测任务", count: data.monitorTasks.length },
    { category: "诊断记录", count: data.diagnosisRecords.length },
    { category: "内容记录", count: data.contentRecords.length },
  ];
  
  const csv = generateCSV(summary, [
    { key: "category", label: "数据类型" },
    { key: "count", label: "记录数量" },
  ]);
  
  downloadCSV(csv, "geo_nexus_summary");
}
