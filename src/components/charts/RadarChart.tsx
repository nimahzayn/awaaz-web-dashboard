"use client";

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { BRAND_COLORS } from "@/constants/colors";

interface RadarDataPoint {
  subject: string;
  score: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
}

export function RadarChart({
  data,
  dataKey = "score",
  color = BRAND_COLORS.purple,
  height = 320,
}: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#E8E8E4" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "#6B6B68" }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#6B6B68" }}
        />
        <Tooltip
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid #E8E8E4",
            borderRadius: "12px",
            fontSize: "13px",
          }}
        />
        <Radar
          name="Score"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
