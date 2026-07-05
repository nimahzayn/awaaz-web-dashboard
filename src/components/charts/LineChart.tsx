"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/constants/colors";
import type { ChartDataPoint } from "@/types";

interface LineChartProps {
  data: ChartDataPoint[];
  lines: { key: string; label: string; color?: string }[];
  xAxisKey?: string;
  height?: number;
}

export function LineChart({
  data,
  lines,
  xAxisKey = "name",
  height = 300,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: "#6B6B68" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6B6B68" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid #E8E8E4",
            borderRadius: "12px",
            fontSize: "13px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
        {lines.map((line, i) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
