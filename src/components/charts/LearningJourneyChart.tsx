"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AreaDataPoint {
  stage: string;
  value: number;
}

interface LearningJourneyChartProps {
  data: AreaDataPoint[];
  color?: string;
  height?: number;
}

export function LearningJourneyChart({
  data,
  color = "#E8126E",
  height = 280,
}: LearningJourneyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id="learningJourneyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 12, fill: "#6B6B68" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 5]}
          tick={{ fontSize: 11, fill: "#6B6B68" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid #E8E8E4",
            borderRadius: "12px",
            fontSize: "13px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill="url(#learningJourneyGradient)"
          dot={{ r: 4, fill: color, stroke: "#FFFFFF", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: color, stroke: "#FFFFFF", strokeWidth: 2 }}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
