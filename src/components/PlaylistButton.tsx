"use client";

import { useState } from "react";
import { TimeRange } from "@/lib/spotify";

export default function PlaylistButton({ timeRange }: { timeRange: TimeRange }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [url, setUrl] = useState<string | null>(null);

  async function generate() {
    setState("loading");
    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeRange }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setUrl(data.url);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-3 items-start">
      <button
        onClick={generate}
        disabled={state === "loading"}
        className="font-sans text-sm bg-violet text-ink font-semibold px-5 py-2.5 rounded-full hover:bg-paper transition-colors disabled:opacity-50"
      >
        {state === "loading"
          ? "Building playlist…"
          : state === "done"
          ? "Built another →"
          : "Generate playlist (top tracks + similar)"}
      </button>

      {state === "done" && url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-sans text-xs text-amber underline underline-offset-4"
        >
          Open in Spotify
        </a>
      )}

      {state === "error" && (
        <p className="font-sans text-xs text-muted">
          Something went wrong creating that playlist. Try again.
        </p>
      )}
    </div>
  );
}
