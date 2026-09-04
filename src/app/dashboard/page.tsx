import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import {
  getGenreCounts,
  getTopArtists,
  getTopTracks,
  TimeRange,
} from "@/lib/spotify";
import TimeRangeToggle from "@/components/TimeRangeToggle";
import GenreChart from "@/components/GenreChart";
import PlaylistButton from "@/components/PlaylistButton";
import ShareCard from "@/components/ShareCard";
import Image from "next/image";

const RANGE_LABELS: Record<TimeRange, string> = {
  short_term: "Last 4 Weeks",
  medium_term: "Last 6 Months",
  long_term: "All Time",
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  if (!session?.accessToken) redirect("/");

  const { range } = await searchParams;
  const timeRange: TimeRange =
    range === "short_term" || range === "long_term" ? range : "medium_term";

  const [{ items: allArtists }, { items: tracks }] = await Promise.all([
    getTopArtists(session.accessToken, timeRange, 50),
    getTopTracks(session.accessToken, timeRange, 10),
  ]);

  const artists = allArtists.slice(0, 10);
  const genres = getGenreCounts(allArtists);

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="flex items-start justify-between mb-12">
          <div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted mb-3">
              {RANGE_LABELS[timeRange]}
            </p>
            <h1 className="font-display italic text-5xl sm:text-6xl text-paper">
              Your chart.
            </h1>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="font-sans text-xs text-muted hover:text-paper transition-colors">
              Sign out
            </button>
          </form>
        </header>

        <div className="mb-12">
          <TimeRangeToggle active={timeRange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          <ChartList title="Top Tracks" items={tracks.map((t) => ({
            id: t.id,
            title: t.name,
            subtitle: t.artists.map((a) => a.name).join(", "),
            image: t.album.images[0]?.url,
          }))} />

          <ChartList title="Top Artists" items={artists.map((a) => ({
            id: a.id,
            title: a.name,
            subtitle: (a.genres ?? []).slice(0, 2).join(" · ") || "—",
            image: a.images[0]?.url,
          }))} />
        </div>

        <section className="mb-16">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted mb-6">
            Genre Breakdown
          </p>
          <GenreChart data={genres} />
        </section>

        <section className="mb-16">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted mb-6">
            Take It With You
          </p>
          <PlaylistButton timeRange={timeRange} />
        </section>

        <section>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted mb-6">
            Share Card
          </p>
          <ShareCard
            artists={artists.map((a) => ({
              name: a.name,
              image: a.images[0]?.url,
              genres: a.genres,
            }))}
            tracks={tracks.map((t) => ({
              name: t.name,
              artist: t.artists.map((a) => a.name).join(", "),
              image: t.album.images[0]?.url,
            }))}
            topGenre={genres[0]?.genre}
            rangeLabel={RANGE_LABELS[timeRange]}
          />
        </section>
      </div>
    </main>
  );
}

function ChartList({
  title,
  items,
}: {
  title: string;
  items: { id: string; title: string; subtitle: string; image?: string }[];
}) {
  return (
    <div>
      <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted mb-6">
        {title}
      </p>
      <ol className="space-y-1">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="flex items-center gap-4 py-2 border-b border-line/60"
          >
            <span className="font-display italic text-lg text-amber w-6 tabular">
              {String(i + 1).padStart(2, "0")}
            </span>
            {item.image && (
              <Image
                src={item.image}
                alt=""
                width={40}
                height={40}
                className="rounded"
                unoptimized
              />
            )}
            <div className="min-w-0">
              <p className="font-sans text-sm text-paper truncate">
                {item.title}
              </p>
              <p className="font-sans text-xs text-muted truncate">
                {item.subtitle}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
