"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
export function ChoicesChart({ data }: { data: { name: string; total: number }[] }) {
  return (<div className="h-56"><ResponsiveContainer><BarChart data={data} layout="vertical" margin={{ left: 0 }}>
    <XAxis type="number" allowDecimals={false} fontSize={11} /><YAxis type="category" dataKey="name" width={110} fontSize={10} />
    <Tooltip /><Bar dataKey="total" name="Respostas" fill="var(--chart-1)" radius={4} /></BarChart></ResponsiveContainer></div>);
}
