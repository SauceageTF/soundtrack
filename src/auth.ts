import NextAuth, { customFetch } from "next-auth";
import Spotify from "next-auth/providers/spotify";

const CANONICAL_ORIGIN = (process.env.AUTH_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const CANONICAL_REDIRECT_URI = `${CANONICAL_ORIGIN}/api/auth/callback/spotify`;

async function fetchWithCanonicalRedirectUri(
  ...args: Parameters<typeof fetch>
) {
  const [input, init] = args;
  const url = typeof input === "string" ? input : input.toString();
  if (url.includes("accounts.spotify.com/api/token") && init?.body) {
    const params = new URLSearchParams(init.body.toString());
    if (params.get("redirect_uri") !== CANONICAL_REDIRECT_URI) {
      params.set("redirect_uri", CANONICAL_REDIRECT_URI);
      return fetch(input, { ...init, body: params.toString() });
    }
  }
  return fetch(input, init);
}

// Scopes: read top items, read profile, create/modify playlists
const SCOPES = [
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

async function refreshAccessToken(token: any) {
  try {
    const url = "https://accounts.spotify.com/api/token";
    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await response.json();
    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: { scope: SCOPES },
      },
      checks: ["pkce"],
      [customFetch]: fetchWithCanonicalRedirectUri,
    }),
  ],
  debug: true,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
        };
      }
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
    async redirect({ url }) {
      if (url.startsWith("/")) return `${CANONICAL_ORIGIN}${url}`;
      try {
        const parsed = new URL(url);
        return `${CANONICAL_ORIGIN}${parsed.pathname}${parsed.search}`;
      } catch {
        return CANONICAL_ORIGIN;
      }
    },
  },
  pages: {
    signIn: "/",
  },
});