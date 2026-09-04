const BASE_URL = "https://api.spotify.com/v1";

export type TimeRange = "short_term" | "medium_term" | "long_term";

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[]; name: string };
  external_urls: { spotify: string };
  uri: string;
  popularity?: number;
}

async function spotifyFetch(
  accessToken: string,
  path: string,
  init?: RequestInit
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify API error ${res.status}: ${body}`);
  }

  // Some endpoints (like playlist add tracks) return 201 with a body,
  // others return 204 with no body.
  if (res.status === 204) return null;
  return res.json();
}

export function getTopArtists(accessToken: string, timeRange: TimeRange, limit = 20) {
  return spotifyFetch(
    accessToken,
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`
  ) as Promise<{ items: SpotifyArtist[] }>;
}

export function getTopTracks(accessToken: string, timeRange: TimeRange, limit = 20) {
  return spotifyFetch(
    accessToken,
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
  ) as Promise<{ items: SpotifyTrack[] }>;
}

// Finds other tracks by an artist the user already likes, as a stand-in for
// real "similar music" recommendations (Spotify removed the Recommendations
// and Related Artists endpoints for new apps in Nov 2024).
export async function searchTracksByArtist(
  accessToken: string,
  artistName: string,
  limit = 10
) {
  const data = (await spotifyFetch(
    accessToken,
    `/search?type=track&limit=${limit}&q=${encodeURIComponent(`artist:"${artistName}"`)}`
  )) as { tracks: { items: SpotifyTrack[] } };
  return data.tracks.items;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  owner: { id: string };
}

const DISCOVERY_PLAYLIST_NAMES = [/discover weekly/i, /release radar/i];

// Spotify's own algorithmic playlists (Discover Weekly, Release Radar) live
// in the user's library as regular playlists owned by the "spotify" account.
// There's no dedicated endpoint for them, so we page through the user's
// playlists looking for a name match.
export async function findDiscoveryPlaylists(
  accessToken: string
): Promise<SpotifyPlaylist[]> {
  const found: SpotifyPlaylist[] = [];
  let path: string | null = "/me/playlists?limit=50";

  for (let page = 0; path && page < 4; page++) {
    const data = (await spotifyFetch(accessToken, path)) as {
      items: SpotifyPlaylist[];
      next: string | null;
    };
    for (const playlist of data.items) {
      if (
        playlist.owner?.id === "spotify" &&
        DISCOVERY_PLAYLIST_NAMES.some((re) => re.test(playlist.name))
      ) {
        found.push(playlist);
      }
    }
    path = data.next ? data.next.replace(BASE_URL, "") : null;
  }

  return found;
}

export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string,
  limit = 20
) {
  const data = (await spotifyFetch(
    accessToken,
    `/playlists/${playlistId}/items?limit=${limit}&fields=items(item(id,name,artists,album,external_urls,uri))`
  )) as { items: { item: SpotifyTrack | null }[] };

  return data.items
    .map((entry) => entry.item)
    .filter((track): track is SpotifyTrack => track !== null);
}

export function getMe(accessToken: string) {
  return spotifyFetch(accessToken, "/me") as Promise<{
    id: string;
    display_name: string;
    images: { url: string }[];
  }>;
}

// Aggregate genre frequency from a list of artists
export function getGenreCounts(artists: SpotifyArtist[]) {
  const counts: Record<string, number> = {};
  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      counts[genre] = (counts[genre] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

export async function createPlaylistFromTracks(
  accessToken: string,
  name: string,
  description: string,
  trackUris: string[]
) {
  const playlist = await spotifyFetch(accessToken, `/me/playlists`, {
    method: "POST",
    body: JSON.stringify({ name, description, public: false }),
  });

  await spotifyFetch(accessToken, `/playlists/${playlist.id}/items`, {
    method: "POST",
    body: JSON.stringify({ uris: trackUris }),
  });

  return playlist;
}
