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
import { BRAND_COLORS } from "@/constants/colors";
import type { ChartDataPoint } from "@/types";

interface GroupedBarChartProps {
  data: ChartDataPoint[];
  groups: { key: string; label: string; color: string }[];
  xAxisKey?: string;
  height?: number;
}

export function GroupedBarChart({
  data,
  groups,
  xAxisKey = "name",
  height = 320,
}: GroupedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 11, fill: "#6B6B68" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 5]}
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
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
        />
        {groups.map((group) => (
          <Bar
            key={group.key}
            dataKey={group.key}
            name={group.label}
            fill={group.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export const ABC_GROUP_CONFIG = [
  { key: "A", label: "A — Original Before", color: BRAND_COLORS.blue },
  { key: "B", label: "B — Retrospective Before", color: BRAND_COLORS.coral },
  { key: "C", label: "C — After Workshop", color: BRAND_COLORS.green },
];
