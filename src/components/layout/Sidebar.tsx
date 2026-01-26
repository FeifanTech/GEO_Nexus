"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Stethoscope,
  Factory,
  Globe,
  Kanban,
  Target,
  HelpCircle,
  Radar,
  FileText,
  Settings,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// 主菜单导航
const mainNavigation = [
  {
    name: "工作台",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "产品管理",
    href: "/product-manager",
    icon: Package,
  },
  {
    name: "竞品管理",
    href: "/competitors",
    icon: Target,
  },
];

// GEO 核心功能
const geoNavigation = [
  {
    name: "GEO 诊断",
    href: "/geo-diagnosis",
    icon: Stethoscope,
  },
  {
    name: "AI 排名监测",
    href: "/ai-monitor",
    icon: Radar,
  },
  {
    name: "问题库",
    href: "/query-library",
    icon: HelpCircle,
  },
];

// 运营工具
const toolsNavigation = [
  {
    name: "内容工厂",
    href: "/content-factory",
    icon: Factory,
  },
  {
    name: "作业流",
    href: "/workflow",
    icon: Kanban,
  },
  {
    name: "监测报告",
    href: "/report",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <item.icon
          className={cn(
            "h-5 w-5 flex-shrink-0",
            isActive ? "text-slate-900" : "text-slate-400"
          )}
        />
        {item.name}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 overflow-y-auto">
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-200">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-600">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          GEO Nexus
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {/* 主菜单 */}
        <p className="px-3 mb-2 text-xs font-medium text-slate-400 tracking-wider uppercase">
          数据管理
        </p>
        {mainNavigation.map(renderNavItem)}

        <Separator className="my-3" />

        {/* GEO 功能 */}
        <p className="px-3 mb-2 text-xs font-medium text-slate-400 tracking-wider uppercase">
          GEO 监测
        </p>
        {geoNavigation.map(renderNavItem)}

        <Separator className="my-3" />

        {/* 运营工具 */}
        <p className="px-3 mb-2 text-xs font-medium text-slate-400 tracking-wider uppercase">
          运营工具
        </p>
        {toolsNavigation.map(renderNavItem)}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 mb-2",
            pathname === "/settings"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Settings className={cn(
            "h-5 w-5 flex-shrink-0",
            pathname === "/settings" ? "text-slate-900" : "text-slate-400"
          )} />
          系统设置
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
            <span className="text-sm font-medium text-slate-600">用</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">用户</span>
            <span className="text-xs text-slate-500">user@example.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
