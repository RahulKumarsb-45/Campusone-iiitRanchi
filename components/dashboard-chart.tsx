"use client"

import { useSyncExternalStore } from "react"
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

interface DashboardChartProps {
  type: "bar" | "pie"
  data?: { name: string; value: number }[]
  emptyMessage?: string
}

const emptySubscribe = () => () => {}

export function DashboardChart({ type, data = [], emptyMessage }: DashboardChartProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  if (!mounted) {
    return <div className="h-[280px] w-full animate-pulse rounded-md bg-muted/40"></div>
  }

  // Handle zero/empty data state
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[280px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-xs font-semibold text-muted-foreground">
          {emptyMessage || "No metrics recorded yet"}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/80">
          Data will automatically populate once platform interactions occur.
        </p>
      </div>
    )
  }

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`bar-cell-${index}`}
                fill={index % 2 === 0 ? "hsl(220, 80%, 55%)" : "hsl(260, 70%, 55%)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === "pie") {
    const COLORS = [
      "hsl(221, 83%, 53%)", // Primary Blue
      "hsl(142, 71%, 45%)", // Emerald
      "hsl(38, 92%, 50%)",  // Amber
      "hsl(262, 83%, 58%)", // Purple
      "hsl(346, 77%, 49%)", // Rose
      "hsl(199, 89%, 48%)", // Cyan
    ]

    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={88}
            innerRadius={48}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }: { name?: string; percent?: number }) =>
              `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return null
}
