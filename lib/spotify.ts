const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

// Mood-to-search-query mappings
// Since the /recommendations endpoint is deprecated for new dev-mode apps,
// we use Spotify's Search API with mood-related keywords instead.
const MOOD_SEARCH: Record<
  string,
  {
    queries: string[];
    description: string;
  }
> = {
  happy: {
    queries: [
      "happy vibes",
      "feel good songs",
      "upbeat pop hits",
      "sunny day music",
      "good mood playlist",
    ],
    description: "Upbeat and joyful",
  },
  chill: {
    queries: [
      "chill vibes",
      "lo-fi chill",
      "relaxing music",
      "mellow acoustic",
      "calm indie",
    ],
    description: "Relaxed and mellow",
  },
  sad: {
    queries: [
      "sad songs",
      "heartbreak ballads",
      "melancholy music",
      "emotional acoustic",
      "rainy day songs",
    ],
    description: "Emotional and reflective",
  },
  energetic: {
    queries: [
      "workout music",
      "high energy EDM",
      "pump up songs",
      "running playlist",
      "power workout hits",
    ],
    description: "High-energy and intense",
  },
  focus: {
    queries: [
      "study music",
      "focus instrumental",
      "concentration music",
      "deep focus",
      "ambient study beats",
    ],
    description: "Focused and productive",
  },
  romantic: {
    queries: [
      "love songs",
      "romantic R&B",
      "slow dance songs",
      "romantic ballads",
      "love playlist",
    ],
    description: "Warm and romantic",
  },
};

export type Mood = keyof typeof MOOD_SEARCH;

export const MOODS: { key: Mood; label: string; emoji: string; color: string }[] = [
  { key: "happy", label: "Happy", emoji: "☀️", color: "#FFD700" },
  { key: "chill", label: "Chill", emoji: "🌊", color: "#00CED1" },
  { key: "sad", label: "Sad", emoji: "🌧️", color: "#6495ED" },
  { key: "energetic", label: "Energetic", emoji: "⚡", color: "#FF4500" },
  { key: "focus", label: "Focus", emoji: "🧠", color: "#9B59B6" },
  { key: "romantic", label: "Romantic", emoji: "💕", color: "#FF69B4" },
];

async function spotifyFetch(url: string, accessToken: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorObj;
    try {
      errorObj = JSON.parse(errorText);
    } catch {
      errorObj = { message: errorText };
    }
    console.error(`[Spotify API Error] ${res.status} ${res.statusText} at ${url}`, errorObj);
    throw new Error(
      `Spotify API error (${res.status}): ${errorObj?.error?.message || res.statusText}`
    );
  }

  return res.json();
}

/**
 * Search for tracks matching a mood using Spotify's Search API.
 * Runs multiple mood-related search queries and deduplicates results.
 */
export async function searchTracksByMood(mood: Mood, accessToken: string, limit = 20) {
  const moodConfig = MOOD_SEARCH[mood];
  if (!moodConfig) throw new Error(`Unknown mood: ${mood}`);

  const allTracks: SpotifyTrack[] = [];
  const seenIds = new Set<string>();

  // Search with each query to get diverse results
  for (const query of moodConfig.queries) {
    if (allTracks.length >= limit) break;

    const perQuery = Math.min(10, limit - allTracks.length + 5); // fetch a few extra for dedup
    const params = new URLSearchParams({
      q: query,
      type: "track",
      limit: String(perQuery),
      market: "US",
    });

    try {
      const data = await spotifyFetch(
        `${SPOTIFY_API_BASE}/search?${params.toString()}`,
        accessToken
      );

      if (data?.tracks?.items) {
        for (const track of data.tracks.items) {
          if (!seenIds.has(track.id) && allTracks.length < limit) {
            seenIds.add(track.id);
            allTracks.push(track);
          }
        }
      }
    } catch (err) {
      console.error(`[Search] Query "${query}" failed:`, err);
      // Continue with remaining queries
    }
  }

  // Shuffle the tracks so the playlist doesn't feel grouped by query
  for (let i = allTracks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTracks[i], allTracks[j]] = [allTracks[j], allTracks[i]];
  }

  return allTracks;
}

export async function createPlaylist(
  name: string,
  description: string,
  accessToken: string
) {
  // Use /me/playlists — POST /users/{id}/playlists was removed in Feb 2026 for dev-mode apps
  const data = await spotifyFetch(
    `${SPOTIFY_API_BASE}/me/playlists`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        public: false,
      }),
    }
  );

  return data as { id: string; external_urls: { spotify: string } };
}

export async function addTracksToPlaylist(
  playlistId: string,
  trackUris: string[],
  accessToken: string
) {
  await spotifyFetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ uris: trackUris }),
    }
  );
}

export async function getCurrentUserProfile(accessToken: string) {
  return spotifyFetch(`${SPOTIFY_API_BASE}/me`, accessToken);
}

// Type for the track data we care about
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  external_urls: { spotify: string };
}
