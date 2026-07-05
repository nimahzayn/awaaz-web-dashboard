"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BRAND_COLORS } from "@/constants/colors";

interface SlopeDataPoint {
  participant: string;
  before: number;
  after: number;
}

interface SlopeChartProps {
  data: SlopeDataPoint[];
  height?: number;
}

export function SlopeChart({ data, height = 300 }: SlopeChartProps) {
  const slopeData = data.flatMap((d) => [
    { participant: d.participant, stage: "Before", score: d.before },
    { participant: d.participant, stage: "After", score: d.after },
  ]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={slopeData}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 12, fill: "#6B6B68" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[1, 5]}
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
        {data.map((d, i) => {
          const colors = [
            BRAND_COLORS.primary,
            BRAND_COLORS.purple,
            BRAND_COLORS.blue,
            BRAND_COLORS.coral,
            BRAND_COLORS.green,
            BRAND_COLORS.yellow,
            BRAND_COLORS.lime,
          ];
          const pointData = [
            { stage: "Before", score: d.before },
            { stage: "After", score: d.after },
          ];
          return (
            <Line
              key={d.participant}
              data={pointData}
              type="monotone"
              dataKey="score"
              stroke={colors[i % colors.length]}
              strokeWidth={1.5}
              dot={{ r: 3 }}
              name={d.participant}
              legendType="none"
            />
          );
        })}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
