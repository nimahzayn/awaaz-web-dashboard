"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/constants/colors";
import type { ChartDataPoint } from "@/types";

interface BarChartProps {
  data: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function BarChart({
  data,
  dataKey = "value",
  xAxisKey = "name",
  color = CHART_COLORS[0],
  height = 300,
  showGrid = true,
  showLegend = false,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
        )}
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
        {showLegend && <Legend />}
        <Bar
          dataKey={dataKey}
          fill={color}
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
