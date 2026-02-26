const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

// Mood-to-audio-feature mappings for Spotify's recommendation engine
const MOOD_PARAMS: Record<
   string,
   {
      seed_genres: string[];
      target_energy?: number;
      target_valence?: number;
      target_tempo?: number;
      target_danceability?: number;
      target_acousticness?: number;
      target_instrumentalness?: number;
   }
> = {
   happy: {
      seed_genres: ["pop", "happy", "dance"],
      target_energy: 0.8,
      target_valence: 0.9,
      target_tempo: 120,
      target_danceability: 0.75,
   },
   chill: {
      seed_genres: ["chill", "ambient", "indie"],
      target_energy: 0.3,
      target_valence: 0.5,
      target_tempo: 90,
      target_acousticness: 0.6,
   },
   sad: {
      seed_genres: ["sad", "acoustic", "singer-songwriter"],
      target_energy: 0.2,
      target_valence: 0.15,
      target_tempo: 75,
      target_acousticness: 0.7,
   },
   energetic: {
      seed_genres: ["electronic", "work-out", "power-pop"],
      target_energy: 0.95,
      target_valence: 0.7,
      target_tempo: 140,
      target_danceability: 0.85,
   },
   focus: {
      seed_genres: ["study", "ambient", "classical"],
      target_energy: 0.35,
      target_valence: 0.4,
      target_instrumentalness: 0.7,
      target_tempo: 100,
   },
   romantic: {
      seed_genres: ["romance", "r-n-b", "soul"],
      target_energy: 0.45,
      target_valence: 0.65,
      target_tempo: 95,
      target_acousticness: 0.5,
   },
};

export type Mood = keyof typeof MOOD_PARAMS;

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
      const error = await res.json().catch(() => ({}));
      throw new Error(
         `Spotify API error (${res.status}): ${error?.error?.message || res.statusText}`
      );
   }

   return res.json();
}

export async function getRecommendations(mood: Mood, accessToken: string, limit = 20) {
   const params = MOOD_PARAMS[mood];
   if (!params) throw new Error(`Unknown mood: ${mood}`);

   const query = new URLSearchParams({
      seed_genres: params.seed_genres.join(","),
      limit: String(limit),
   });

   // Add target audio features
   if (params.target_energy !== undefined) query.set("target_energy", String(params.target_energy));
   if (params.target_valence !== undefined) query.set("target_valence", String(params.target_valence));
   if (params.target_tempo !== undefined) query.set("target_tempo", String(params.target_tempo));
   if (params.target_danceability !== undefined) query.set("target_danceability", String(params.target_danceability));
   if (params.target_acousticness !== undefined) query.set("target_acousticness", String(params.target_acousticness));
   if (params.target_instrumentalness !== undefined) query.set("target_instrumentalness", String(params.target_instrumentalness));

   const data = await spotifyFetch(
      `${SPOTIFY_API_BASE}/recommendations?${query.toString()}`,
      accessToken
   );

   return data.tracks as SpotifyTrack[];
}

export async function createPlaylist(
   userId: string,
   name: string,
   description: string,
   accessToken: string
) {
   const data = await spotifyFetch(
      `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
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
