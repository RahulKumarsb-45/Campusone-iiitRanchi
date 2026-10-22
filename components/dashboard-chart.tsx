"use client"

import { useEffect, useState } from "react"
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
}

export function DashboardChart({ type }: DashboardChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[300px] w-full animate-pulse rounded-md bg-muted"></div>
  }

  if (type === "bar") {
    const data = [
      { name: "Jan", value: 12 },
      { name: "Feb", value: 18 },
      { name: "Mar", value: 15 },
      { name: "Apr", value: 25 },
      { name: "May", value: 32 },
      { name: "Jun", value: 28 },
    ]

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === "pie") {
    const data = [
      { name: "Workshops", value: 35 },
      { name: "Seminars", value: 25 },
      { name: "Sports", value: 20 },
      { name: "Cultural", value: 15 },
      { name: "Other", value: 5 },
    ]

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return null
}
