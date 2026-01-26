"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Package,
  Target,
  Stethoscope,
  Radar,
  HelpCircle,
  Factory,
  Kanban,
  FileText,
  Plus,
  Search,
  Inbox,
  FolderOpen,
  FileQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateType = 
  | "products" 
  | "competitors" 
  | "diagnosis" 
  | "monitor" 
  | "queries"
  | "content"
  | "tasks"
  | "reports"
  | "search"
  | "generic";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: typeof Package;
  title: string;
  description: string;
  actionLabel?: string;
  gradient: string;
}> = {
  products: {
    icon: Package,
    title: "还没有产品",
    description: "添加您的第一个产品，开始 GEO 优化之旅",
    actionLabel: "添加产品",
    gradient: "from-blue-500 to-indigo-500",
  },
  competitors: {
    icon: Target,
    title: "还没有竞品",
    description: "添加竞争对手，进行对比分析",
    actionLabel: "添加竞品",
    gradient: "from-purple-500 to-pink-500",
  },
  diagnosis: {
    icon: Stethoscope,
    title: "还没有诊断记录",
    description: "选择产品开始 GEO 诊断分析",
    actionLabel: "开始诊断",
    gradient: "from-emerald-500 to-teal-500",
  },
  monitor: {
    icon: Radar,
    title: "还没有监测任务",
    description: "创建监测任务，追踪 AI 搜索排名",
    actionLabel: "新建监测",
    gradient: "from-orange-500 to-amber-500",
  },
  queries: {
    icon: HelpCircle,
    title: "还没有监测问题",
    description: "添加要监测的搜索问题",
    actionLabel: "添加问题",
    gradient: "from-cyan-500 to-blue-500",
  },
  content: {
    icon: Factory,
    title: "还没有生成内容",
    description: "选择产品，使用 AI 生成营销内容",
    actionLabel: "开始生成",
    gradient: "from-rose-500 to-pink-500",
  },
  tasks: {
    icon: Kanban,
    title: "还没有任务",
    description: "创建任务来管理您的工作流程",
    actionLabel: "创建任务",
    gradient: "from-violet-500 to-purple-500",
  },
  reports: {
    icon: FileText,
    title: "还没有报告数据",
    description: "完成监测任务后，这里将显示报告",
    gradient: "from-slate-500 to-gray-500",
  },
  search: {
    icon: Search,
    title: "没有找到结果",
    description: "尝试使用不同的关键词搜索",
    gradient: "from-slate-400 to-slate-500",
  },
  generic: {
    icon: Inbox,
    title: "暂无数据",
    description: "这里还什么都没有",
    gradient: "from-slate-400 to-slate-500",
  },
};

export function EmptyState({
  type = "generic",
  title,
  description,
  actionLabel,
  onAction,
  className,
  children,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {/* Animated Icon */}
      <div className="relative mb-6">
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br opacity-20 blur-xl",
          config.gradient
        )} />
        <div className={cn(
          "relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br",
          config.gradient
        )}>
          <Icon className="h-10 w-10 text-white" />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-200 rounded-full" />
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-slate-300 rounded-full" />
      </div>
      
      {/* Text */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title || config.title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        {description || config.description}
      </p>
      
      {/* Action Button */}
      {(onAction || actionLabel || config.actionLabel) && (
        <Button 
          onClick={onAction}
          className={cn(
            "gap-2 bg-gradient-to-r",
            config.gradient,
            "hover:opacity-90"
          )}
        >
          <Plus className="h-4 w-4" />
          {actionLabel || config.actionLabel}
        </Button>
      )}
      
      {/* Custom children */}
      {children}
    </div>
  );
}

// Compact empty state for inline use
export function EmptyStateInline({
  icon: CustomIcon,
  message,
  className,
}: {
  icon?: typeof Package;
  message: string;
  className?: string;
}) {
  const Icon = CustomIcon || FolderOpen;
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 text-center text-slate-500",
      className
    )}>
      <Icon className="h-8 w-8 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// No results state for search
export function NoResults({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
        <FileQuestion className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">
        没有找到结果
      </h3>
      {query && (
        <p className="text-sm text-slate-500 mb-4">
          没有找到与 &ldquo;{query}&rdquo; 相关的内容
        </p>
      )}
      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          清除搜索
        </Button>
      )}
    </div>
  );
}
