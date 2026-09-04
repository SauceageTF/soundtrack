"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#e8a33d", "#9c8ff2", "#c9c3d6", "#7a7488", "#544f61"];

export default function GenreChart({
  data,
}: {
  data: { genre: string; count: number }[];
}) {
  const top = data.slice(0, 8);

  if (top.length === 0) {
    return (
      <p className="font-sans text-sm text-muted">
        Genre data isn&apos;t available for this account yet &mdash; it
        requires extended API access that we&apos;re in the process of
        getting approved.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(top.length * 40, 200)}>
      <BarChart data={top} layout="vertical" margin={{ left: 0, right: 24 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="genre"
          width={140}
          tick={{ fill: "#f4f1ea", fontSize: 12, fontFamily: "var(--font-sans)" }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
          {top.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
