"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  Area,
  ComposedChart,
} from "recharts";
import type { StatusLevel } from "@/lib/medical/knowledge/types";

interface TrendPoint {
  date: string;
  value: number;
}

interface TrendHistoryChartProps {
  data: TrendPoint[];
  rangeMin: number | null;
  rangeMax: number | null;
  unit: string;
  status: StatusLevel;
  height?: number;
}

const statusColors: Record<StatusLevel, string> = {
  normal: "#22c55e",
  borderline: "#f59e0b",
  abnormal: "#f97316",
  urgent: "#ef4444",
};

export function TrendHistoryChart({
  data,
  rangeMin,
  rangeMax,
  unit,
  status,
  height = 120,
}: TrendHistoryChartProps) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const allValues = [...values];
  if (rangeMin != null) allValues.push(rangeMin);
  if (rangeMax != null) allValues.push(rangeMax);

  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const padding = (dataMax - dataMin) * 0.15 || 1;

  const color = statusColors[status];

  // Build data for normal range area
  const chartData = data.map((d) => ({
    ...d,
    rangeMin: rangeMin ?? undefined,
    rangeMax: rangeMax ?? undefined,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[dataMin - padding, dataMax + padding]}
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          {/* Normal range band */}
          {rangeMin != null && rangeMax != null && (
            <Area
              dataKey="rangeMax"
              stroke="none"
              fill="#22c55e"
              fillOpacity={0.08}
              baseValue={rangeMin}
              isAnimationActive={false}
            />
          )}
          {/* Reference lines for range boundaries */}
          {rangeMin != null && (
            <ReferenceLine
              y={rangeMin}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
          )}
          {rangeMax != null && (
            <ReferenceLine
              y={rangeMax}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
          )}
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-card)",
              color: "var(--color-foreground)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(val) => [`${val} ${unit}`, "Value"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: color,
              stroke: "var(--color-card)",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: color,
              stroke: "var(--color-card)",
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
