"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CHART_COLORS } from "@/constants/colors";
import type { ChartDataPoint } from "@/types";

interface DonutChartProps {
  data: ChartDataPoint[];
  dataKey?: string;
  nameKey?: string;
  colors?: readonly string[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function DonutChart({
  data,
  dataKey = "value",
  nameKey = "name",
  colors = CHART_COLORS,
  height = 280,
  innerRadius = 60,
  outerRadius = 90,
}: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid #E8E8E4",
            borderRadius: "12px",
            fontSize: "13px",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
