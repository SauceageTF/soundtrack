"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TimeRange } from "@/lib/spotify";

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "Last 4 weeks" },
  { value: "medium_term", label: "Last 6 months" },
  { value: "long_term", label: "All time" },
];

export default function TimeRangeToggle({ active }: { active: TimeRange }) {
  const router = useRouter();
  const params = useSearchParams();

  function setRange(range: TimeRange) {
    const next = new URLSearchParams(params.toString());
    next.set("range", range);
    router.push(`/dashboard?${next.toString()}`);
  }

  return (
    <div className="flex gap-1 bg-ink-raised border border-line rounded-full p-1 w-fit">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => setRange(r.value)}
          className={`font-sans text-xs px-4 py-2 rounded-full transition-colors ${
            active === r.value
              ? "bg-amber text-ink font-semibold"
              : "text-muted hover:text-paper"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
