import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto w-full max-w-3xl px-6 py-24 flex-1 flex flex-col justify-center">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted mb-6">
          Your listening data &middot; on demand
        </p>

        <h1 className="font-display italic text-[15vw] sm:text-8xl leading-[0.9] text-paper mb-8">
          Sound Track,
          <br />
          <span className="text-amber not-italic">anytime.</span>
        </h1>

        <p className="font-sans text-lg text-muted max-w-md mb-12 leading-relaxed">
          Your top tracks, top artists, genre breakdowns, and a playlist
          built from your own listening history &mdash; on demand, whenever
          you want to look.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("spotify", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="group inline-flex items-center gap-3 bg-amber text-ink font-sans font-semibold px-6 py-3 rounded-full hover:bg-paper transition-colors"
          >
            Connect Spotify
            <span className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </button>
        </form>

        <div className="mt-24 border-t border-line pt-6 flex items-center gap-8 font-sans text-xs text-muted tabular">
          <span>01 &mdash; Top Tracks</span>
          <span>02 &mdash; Top Artists</span>
          <span>03 &mdash; Genres</span>
          <span>04 &mdash; Your Playlist</span>
        </div>
      </div>
    </main>
  );
}
