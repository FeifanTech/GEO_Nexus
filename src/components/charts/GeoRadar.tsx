"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// GEO 5 Dimensions
export interface GeoMetrics {
  authority: number;      // 权威性 (0-100)
  relevance: number;      // 相关性 (0-100)
  experience: number;     // 体验度 (0-100)
  trustworthiness: number; // 可信度 (0-100)
  optimization: number;   // 优化度 (0-100)
}

interface GeoRadarProps {
  data: GeoMetrics;
  comparisonData?: GeoMetrics;
  showComparison?: boolean;
  height?: number;
}

// Transform metrics to chart data format
const transformData = (metrics: GeoMetrics, comparisonMetrics?: GeoMetrics) => {
  const dimensions = [
    { key: "authority", label: "权威性", fullMark: 100 },
    { key: "relevance", label: "相关性", fullMark: 100 },
    { key: "experience", label: "体验度", fullMark: 100 },
    { key: "trustworthiness", label: "可信度", fullMark: 100 },
    { key: "optimization", label: "优化度", fullMark: 100 },
  ];

  return dimensions.map((dim) => ({
    dimension: dim.label,
    value: metrics[dim.key as keyof GeoMetrics],
    comparison: comparisonMetrics
      ? comparisonMetrics[dim.key as keyof GeoMetrics]
      : undefined,
    fullMark: dim.fullMark,
  }));
};

export function GeoRadar({
  data,
  comparisonData,
  showComparison = false,
  height = 300,
}: GeoRadarProps) {
  const chartData = transformData(
    data,
    showComparison ? comparisonData : undefined
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid
          stroke="#e2e8f0"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: "#64748b", fontSize: 12 }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#94a3b8", fontSize: 10 }}
          tickCount={5}
          axisLine={false}
        />
        <Radar
          name="当前"
          dataKey="value"
          stroke="#0f172a"
          fill="#0f172a"
          fillOpacity={0.3}
          strokeWidth={2}
          dot={{
            r: 4,
            fill: "#0f172a",
            strokeWidth: 0,
          }}
          activeDot={{
            r: 6,
            fill: "#0f172a",
            stroke: "#fff",
            strokeWidth: 2,
          }}
        />
        {showComparison && comparisonData && (
          <Radar
            name="基准"
            dataKey="comparison"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{
              r: 3,
              fill: "#3b82f6",
              strokeWidth: 0,
            }}
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
          formatter={(value) => [`${value}%`, ""]}
          labelStyle={{ color: "#0f172a", fontWeight: 600 }}
        />
        {showComparison && comparisonData && (
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
            formatter={(value) => (
              <span className="text-sm text-slate-600">{value}</span>
            )}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Default/Mock data for demonstration
export const mockGeoMetrics: GeoMetrics = {
  authority: 72,
  relevance: 85,
  experience: 68,
  trustworthiness: 78,
  optimization: 63,
};

export const benchmarkMetrics: GeoMetrics = {
  authority: 80,
  relevance: 75,
  experience: 82,
  trustworthiness: 85,
  optimization: 70,
};

// Calculate overall score
export function calculateGeoScore(metrics: GeoMetrics): number {
  const weights = {
    authority: 0.25,
    relevance: 0.2,
    experience: 0.2,
    trustworthiness: 0.2,
    optimization: 0.15,
  };

  return Math.round(
    Object.entries(weights).reduce(
      (score, [key, weight]) =>
        score + metrics[key as keyof GeoMetrics] * weight,
      0
    )
  );
}
