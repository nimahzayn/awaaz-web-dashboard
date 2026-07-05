"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/constants/colors";
import type { ChartDataPoint } from "@/types";

interface HorizontalBarChartProps {
  data: ChartDataPoint[];
  dataKey?: string;
  yAxisKey?: string;
  color?: string;
  height?: number;
}

export function HorizontalBarChart({
  data,
  dataKey = "value",
  yAxisKey = "name",
  color = CHART_COLORS[0],
  height = 300,
}: HorizontalBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: "#6B6B68" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey={yAxisKey}
          tick={{ fontSize: 12, fill: "#6B6B68" }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid #E8E8E4",
            borderRadius: "12px",
            fontSize: "13px",
          }}
        />
        <Bar
          dataKey={dataKey}
          fill={color}
          radius={[0, 6, 6, 0]}
          maxBarSize={24}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
