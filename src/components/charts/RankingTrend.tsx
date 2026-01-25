"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIModel, AI_MODEL_CONFIG } from "@/types/monitor";

interface TrendDataPoint {
  date: string;
  [key: string]: number | string | null;  // model names as keys
}

interface RankingTrendProps {
  data: TrendDataPoint[];
  models: AIModel[];
  title?: string;
}

// Model colors for chart lines
const MODEL_COLORS: Record<AIModel, string> = {
  gpt4: "#10b981",      // emerald
  claude: "#f97316",    // orange
  kimi: "#6366f1",      // indigo
  qwen: "#3b82f6",      // blue
  wenxin: "#ef4444",    // red
  doubao: "#06b6d4",    // cyan
  perplexity: "#8b5cf6", // violet
};

export function RankingTrend({ data, models, title = "排名趋势" }: RankingTrendProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            暂无趋势数据
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                reversed  // Lower rank number = better position
                domain={[1, 10]}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={{ stroke: "#e2e8f0" }}
                label={{
                  value: "排名",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "#64748b" },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number | null, name: string) => {
                  if (value === null) return ["未出现", name];
                  return [`第 ${value} 位`, name];
                }}
                labelFormatter={(label) => `日期: ${label}`}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => {
                  const model = value as AIModel;
                  return AI_MODEL_CONFIG[model]?.name || value;
                }}
              />
              {models.map((model) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  name={model}
                  stroke={MODEL_COLORS[model]}
                  strokeWidth={2}
                  dot={{ fill: MODEL_COLORS[model], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Mention rate trend chart
interface MentionTrendProps {
  data: Array<{
    date: string;
    mentionRate: number;
    totalTests: number;
  }>;
  title?: string;
}

export function MentionTrend({ data, title = "提及率趋势" }: MentionTrendProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-slate-400">
            暂无趋势数据
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "提及率"]}
              />
              <Line
                type="monotone"
                dataKey="mentionRate"
                name="提及率"
                stroke="#10b981"
                strokeWidth={2}
                fill="#10b981"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Generate mock trend data for demo
export function generateMockTrendData(days: number = 7): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const models: AIModel[] = ["qwen", "kimi", "wenxin"];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    const point: TrendDataPoint = { date: dateStr };
    models.forEach((model) => {
      // Random position between 1-10, with some null values
      const mentioned = Math.random() > 0.2;
      point[model] = mentioned ? Math.floor(Math.random() * 8) + 1 : null;
    });
    data.push(point);
  }
  
  return data;
}

export function generateMockMentionData(days: number = 7) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    data.push({
      date: dateStr,
      mentionRate: 40 + Math.random() * 40,  // 40-80%
      totalTests: Math.floor(Math.random() * 10) + 5,
    });
  }
  return data;
}
