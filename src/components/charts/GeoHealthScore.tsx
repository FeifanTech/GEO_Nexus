"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GeoHealthScoreProps {
  score: number;  // 0-100
  breakdown?: {
    mentionRate: number;      // 提及率得分
    avgPosition: number;      // 平均排名得分
    sentimentScore: number;   // 情感得分
    coverageScore: number;    // 覆盖度得分
  };
  trend?: "up" | "down" | "stable";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function getScoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "优秀", color: "bg-green-100 text-green-700" };
  if (score >= 60) return { text: "良好", color: "bg-blue-100 text-blue-700" };
  if (score >= 40) return { text: "一般", color: "bg-amber-100 text-amber-700" };
  return { text: "需改进", color: "bg-red-100 text-red-700" };
}

function getGradientColor(score: number): string {
  if (score >= 80) return "from-green-500 to-emerald-500";
  if (score >= 60) return "from-blue-500 to-cyan-500";
  if (score >= 40) return "from-amber-500 to-yellow-500";
  return "from-red-500 to-orange-500";
}

export function GeoHealthScore({ score, breakdown, trend }: GeoHealthScoreProps) {
  const label = getScoreLabel(score);
  const gradientColor = getGradientColor(score);
  
  // Calculate the circle progress
  const circumference = 2 * Math.PI * 45;  // radius = 45
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          GEO 健康度
          {trend && (
            <span className={`text-sm ${
              trend === "up" ? "text-green-500" : 
              trend === "down" ? "text-red-500" : 
              "text-slate-400"
            }`}>
              {trend === "up" ? "↑ 上升" : trend === "down" ? "↓ 下降" : "→ 持平"}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r="45"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
              />
              {/* Progress circle */}
              <circle
                cx="56"
                cy="56"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`${gradientColor.includes('green') ? 'stop-green-500' : gradientColor.includes('blue') ? 'stop-blue-500' : gradientColor.includes('amber') ? 'stop-amber-500' : 'stop-red-500'}`} stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'} />
                  <stop offset="100%" className={`${gradientColor.includes('emerald') ? 'stop-emerald-500' : gradientColor.includes('cyan') ? 'stop-cyan-500' : gradientColor.includes('yellow') ? 'stop-yellow-500' : 'stop-orange-500'}`} stopColor={score >= 80 ? '#059669' : score >= 60 ? '#06b6d4' : score >= 40 ? '#eab308' : '#f97316'} />
                </linearGradient>
              </defs>
            </svg>
            {/* Score text in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <Badge className={`text-xs mt-1 ${label.color}`}>
                {label.text}
              </Badge>
            </div>
          </div>

          {/* Breakdown */}
          {breakdown && (
            <div className="flex-1 space-y-2">
              <BreakdownItem label="提及率" score={breakdown.mentionRate} />
              <BreakdownItem label="平均排名" score={breakdown.avgPosition} />
              <BreakdownItem label="情感得分" score={breakdown.sentimentScore} />
              <BreakdownItem label="覆盖度" score={breakdown.coverageScore} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownItem({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500 w-16">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            score >= 80 ? "bg-green-500" :
            score >= 60 ? "bg-blue-500" :
            score >= 40 ? "bg-amber-500" :
            "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium w-8 text-right">{score}</span>
    </div>
  );
}

// Calculate GEO health score from monitoring data
export function calculateGeoHealthScore(data: {
  mentionRate: number;      // 0-100 percentage
  avgPosition: number | null;  // 1-10, lower is better
  totalTests: number;
  positiveRatio: number;    // 0-1 ratio of positive sentiment
}): number {
  let score = 0;
  
  // Mention rate (40% weight)
  score += data.mentionRate * 0.4;
  
  // Average position (30% weight) - convert to 0-100 scale
  if (data.avgPosition !== null) {
    const positionScore = Math.max(0, (11 - data.avgPosition) / 10) * 100;
    score += positionScore * 0.3;
  } else {
    // If never mentioned, this component is 0
    score += 0;
  }
  
  // Sentiment (20% weight)
  score += data.positiveRatio * 100 * 0.2;
  
  // Coverage/frequency bonus (10% weight)
  const coverageScore = Math.min(data.totalTests / 20, 1) * 100;
  score += coverageScore * 0.1;
  
  return Math.round(score);
}

// Generate mock health data
export function generateMockHealthData() {
  return {
    score: Math.floor(Math.random() * 40) + 50,  // 50-90
    breakdown: {
      mentionRate: Math.floor(Math.random() * 30) + 60,  // 60-90
      avgPosition: Math.floor(Math.random() * 40) + 50,  // 50-90
      sentimentScore: Math.floor(Math.random() * 30) + 60,  // 60-90
      coverageScore: Math.floor(Math.random() * 40) + 40,  // 40-80
    },
    trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
  };
}
