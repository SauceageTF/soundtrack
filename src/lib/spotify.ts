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
  userId: string,
  name: string,
  description: string,
  trackUris: string[]
) {
  const playlist = await spotifyFetch(accessToken, `/users/${userId}/playlists`, {
    method: "POST",
    body: JSON.stringify({ name, description, public: false }),
  });

  await spotifyFetch(accessToken, `/playlists/${playlist.id}/tracks`, {
    method: "POST",
    body: JSON.stringify({ uris: trackUris }),
  });

  return playlist;
}
