"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

export interface ShareCardArtist {
  name: string;
  image?: string;
  genres?: string[];
}

export interface ShareCardTrack {
  name: string;
  artist: string;
  image?: string;
}

export default function ShareCard({
  artists,
  tracks,
  topGenre,
  rangeLabel,
}: {
  artists: ShareCardArtist[];
  tracks: ShareCardTrack[];
  topGenre?: string;
  rangeLabel: string;
}) {
  return (
    <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
      <Card
        name="overview"
        accent="var(--amber)"
        glow1="rgba(232,163,61,0.35)"
        glow2="rgba(156,143,242,0.28)"
        rangeLabel={rangeLabel}
      >
        <OverviewVariant
          artist={artists[0]}
          track={tracks[0]}
          topGenre={topGenre}
        />
      </Card>

      <Card
        name="top-tracks"
        accent="var(--violet)"
        glow1="rgba(156,143,242,0.35)"
        glow2="rgba(95,214,184,0.22)"
        rangeLabel={rangeLabel}
      >
        <TracksVariant tracks={tracks.slice(0, 5)} />
      </Card>

      <Card
        name="top-artists"
        accent="var(--rose)"
        glow1="rgba(242,120,154,0.35)"
        glow2="rgba(232,163,61,0.22)"
        rangeLabel={rangeLabel}
      >
        <ArtistsVariant artists={artists.slice(0, 5)} />
      </Card>
    </div>
  );
}

function Card({
  name,
  accent,
  glow1,
  glow2,
  rangeLabel,
  children,
}: {
  name: string;
  accent: string;
  glow1: string;
  glow2: string;
  rangeLabel: string;
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `soundtrack-${name}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="snap-center shrink-0 flex flex-col items-center gap-4">
      <div
        ref={cardRef}
        className="w-[280px] aspect-[9/16] bg-ink border rounded-2xl overflow-hidden relative flex flex-col"
        style={{
          borderColor: "color-mix(in srgb, " + accent + " 35%, var(--line))",
          backgroundImage: `radial-gradient(circle at 15% 0%, ${glow1}, transparent 55%), radial-gradient(circle at 100% 100%, ${glow2}, transparent 55%)`,
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <p className="font-display italic text-paper text-base">
            Sound Track, <span style={{ color: accent }}>anytime.</span>
          </p>
          <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-muted text-right leading-tight">
            {rangeLabel}
          </p>
        </div>

        <div className="flex-1 min-h-0 px-6 py-5 flex flex-col">
          {children}
        </div>

        <div className="px-6 pb-5 flex items-center justify-between">
          <div
            className="h-px flex-1 mr-4"
            style={{ background: "color-mix(in srgb, " + accent + " 30%, var(--line))" }}
          />
          <p className="font-sans text-[10px] tracking-[0.15em] text-muted whitespace-nowrap">
            soundtrack.app
          </p>
        </div>
      </div>

      <button
        onClick={download}
        disabled={busy}
        className="font-sans text-xs px-4 py-2 rounded-full border border-line text-paper transition-colors disabled:opacity-50"
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
      >
        {busy ? "Rendering…" : "Download"}
      </button>
    </div>
  );
}

function OverviewVariant({
  artist,
  track,
  topGenre,
}: {
  artist?: ShareCardArtist;
  track?: ShareCardTrack;
  topGenre?: string;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-6">
      {artist?.image && (
        <img
          src={artist.image}
          alt=""
          crossOrigin="anonymous"
          className="w-20 h-20 rounded-full object-cover border-2"
          style={{ borderColor: "var(--amber)" }}
        />
      )}
      <Stat label="Top Artist" value={artist?.name} color="var(--amber)" big />
      <Stat
        label="Top Track"
        value={track?.name}
        sub={track?.artist}
        color="var(--violet)"
      />
      <Stat label="Top Genre" value={topGenre} color="var(--rose)" />
    </div>
  );
}

function TracksVariant({ tracks }: { tracks: ShareCardTrack[] }) {
  const colors = ["var(--violet)", "var(--amber)", "var(--rose)", "var(--mint)", "var(--paper)"];
  return (
    <div className="flex-1 flex flex-col justify-center">
      <p className="font-sans text-[10px] tracking-[0.25em] uppercase mb-5" style={{ color: "var(--violet)" }}>
        Top Tracks
      </p>
      <ol className="space-y-3">
        {tracks.map((t, i) => (
          <li key={i} className="flex items-center gap-3">
            <span
              className="font-display italic text-sm w-4 shrink-0 tabular"
              style={{ color: colors[i % colors.length] }}
            >
              {i + 1}
            </span>
            {t.image ? (
              <img
                src={t.image}
                alt=""
                crossOrigin="anonymous"
                className="w-9 h-9 rounded object-cover shrink-0 border border-line"
              />
            ) : (
              <div className="w-9 h-9 rounded bg-ink-raised shrink-0 border border-line" />
            )}
            <div className="min-w-0">
              <p className="font-sans text-sm text-paper truncate leading-tight">
                {t.name}
              </p>
              <p className="font-sans text-[11px] text-muted truncate leading-tight">
                {t.artist}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ArtistsVariant({ artists }: { artists: ShareCardArtist[] }) {
  const colors = ["var(--rose)", "var(--amber)", "var(--violet)", "var(--mint)", "var(--paper)"];
  return (
    <div className="flex-1 flex flex-col justify-center">
      <p className="font-sans text-[10px] tracking-[0.25em] uppercase mb-5" style={{ color: "var(--rose)" }}>
        Top Artists
      </p>
      <ol className="space-y-3">
        {artists.map((a, i) => (
          <li key={i} className="flex items-center gap-3">
            <span
              className="font-display italic text-sm w-4 shrink-0 tabular"
              style={{ color: colors[i % colors.length] }}
            >
              {i + 1}
            </span>
            {a.image ? (
              <img
                src={a.image}
                alt=""
                crossOrigin="anonymous"
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-line"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-ink-raised shrink-0 border border-line" />
            )}
            <div className="min-w-0">
              <p className="font-sans text-sm text-paper truncate leading-tight">
                {a.name}
              </p>
              {a.genres && a.genres.length > 0 && (
                <p className="font-sans text-[11px] text-muted truncate leading-tight">
                  {a.genres.slice(0, 2).join(" · ")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  big,
  color,
}: {
  label: string;
  value?: string;
  sub?: string;
  big?: boolean;
  color: string;
}) {
  return (
    <div>
      <p
        className="font-sans text-[10px] tracking-[0.2em] uppercase mb-1"
        style={{ color }}
      >
        {label}
      </p>
      <p
        className={`font-display italic text-paper leading-tight truncate ${
          big ? "text-3xl" : "text-2xl"
        }`}
      >
        {value ?? "—"}
      </p>
      {sub && (
        <p className="font-sans text-xs text-muted truncate mt-0.5">{sub}</p>
      )}
    </div>
  );
}
