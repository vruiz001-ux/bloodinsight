"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

const statusColors: Record<string, string> = {
  normal: "#22c55e",
  borderline: "#f59e0b",
  abnormal: "#f97316",
  urgent: "#ef4444",
};

export function Sparkline({
  data,
  color = statusColors.normal,
  height = 40,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const padding = (maxVal - minVal) * 0.15 || 1;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={[minVal - padding, maxVal + padding]} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { statusColors as sparklineColors };
