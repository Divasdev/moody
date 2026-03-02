import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const AURA_ENGINE_URL = "http://127.0.0.1:8000/api/v1/recommend";

// ─── Types ────────────────────────────────────────────────────
interface AuraResponse {
   spotify: {
      target_valence: number;
      target_energy: number;
      target_danceability: number;
   };
   movies: { title: string; synopsis: string }[];
   youtube_query: string;
}

interface SpotifyTrackItem {
   id: string;
   name: string;
   uri: string;
   duration_ms: number;
   artists: { name: string }[];
   album: {
      name: string;
      images: { url: string }[];
   };
   external_urls: { spotify: string };
}

interface YouTubeItem {
   id: { videoId: string };
   snippet: {
      title: string;
      description: string;
      thumbnails: {
         medium: { url: string };
      };
      channelTitle: string;
   };
}

// ─── Spotify search helper ────────────────────────────────────
function buildMoodQuery(features: AuraResponse["spotify"]): string {
   const tags: string[] = [];

   if (features.target_valence > 0.7) tags.push("happy vibes");
   else if (features.target_valence < 0.3) tags.push("sad songs");
   else tags.push("chill mood");

   if (features.target_energy > 0.7) tags.push("high energy");
   else if (features.target_energy < 0.3) tags.push("calm ambient");

   if (features.target_danceability > 0.7) tags.push("dance playlist");

   return tags.join(" ");
}

async function fetchSpotifyTracks(
   accessToken: string,
   features: AuraResponse["spotify"]
): Promise<SpotifyTrackItem[]> {
   const query = buildMoodQuery(features);
   const params = new URLSearchParams({
      q: query,
      type: "track",
      limit: "20",
      market: "US",
   });

   const res = await fetch(`${SPOTIFY_API_BASE}/search?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
   });

   if (!res.ok) {
      const err = await res.text();
      console.error("[Spotify] Search failed:", res.status, err);
      return [];
   }

   const data = await res.json();
   return (data?.tracks?.items ?? []).map((t: SpotifyTrackItem) => ({
      name: t.name,
      artists: t.artists.map((a) => a.name).join(", "),
      album: t.album.name,
      albumArt: t.album.images?.[0]?.url ?? "",
      duration: t.duration_ms,
      url: t.external_urls.spotify,
   }));
}

// ─── YouTube search helper ────────────────────────────────────
async function fetchYouTubeVideos(query: string) {
   const apiKey = process.env.YOUTUBE_API_KEY;
   if (!apiKey) {
      console.error("[YouTube] YOUTUBE_API_KEY not set");
      return [];
   }

   const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "6",
      key: apiKey,
   });

   const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
   );

   if (!res.ok) {
      const err = await res.text();
      console.error("[YouTube] Search failed:", res.status, err);
      return [];
   }

   const data = await res.json();
   return (data?.items ?? []).map((item: YouTubeItem) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? "",
      channel: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
   }));
}

// ─── POST handler ─────────────────────────────────────────────
export async function POST(req: Request) {
   try {
      // 1. Auth check
      const session = await getServerSession(authOptions);
      if (!session?.accessToken) {
         return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 }
         );
      }

      // 2. Parse body
      const body = await req.json();
      const userMood = body?.user_mood;
      if (!userMood || typeof userMood !== "string") {
         return NextResponse.json(
            { error: "user_mood is required" },
            { status: 400 }
         );
      }

      // 3. Call the Python Aura Engine
      const auraRes = await fetch(AURA_ENGINE_URL, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ user_mood: userMood }),
      });

      if (!auraRes.ok) {
         const errData = await auraRes.json().catch(() => ({}));
         return NextResponse.json(
            {
               error:
                  errData?.detail ||
                  `Aura Engine error (${auraRes.status})`,
            },
            { status: auraRes.status }
         );
      }

      const aura: AuraResponse = await auraRes.json();

      // 4. Fetch Spotify + YouTube concurrently
      const [tracks, videos] = await Promise.all([
         fetchSpotifyTracks(session.accessToken as string, aura.spotify),
         fetchYouTubeVideos(aura.youtube_query),
      ]);

      // 5. Return combined response
      return NextResponse.json({
         tracks,
         movies: aura.movies,
         videos,
      });
   } catch (error) {
      console.error("[Orchestrator] Unexpected error:", error);
      return NextResponse.json(
         {
            error:
               error instanceof Error
                  ? error.message
                  : "Something went wrong",
         },
         { status: 500 }
      );
   }
}
