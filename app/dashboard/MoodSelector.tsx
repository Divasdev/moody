"use client";

import { useState } from "react";
import { MOODS, Mood } from "@/lib/spotify";
import MediaTabs from "./MediaTabs";

interface PlaylistResult {
   name: string;
   url: string;
   trackCount: number;
}

interface TrackResult {
   name: string;
   artists: string;
   album: string;
   albumArt: string;
   duration: number;
   url: string;
}

export default function MoodSelector() {
   const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
   const [isGenerating, setIsGenerating] = useState(false);
   const [playlist, setPlaylist] = useState<PlaylistResult | null>(null);
   const [tracks, setTracks] = useState<TrackResult[]>([]);
   const [error, setError] = useState<string | null>(null);

   const handleGenerate = async () => {
      if (!selectedMood) return;

      setIsGenerating(true);
      setError(null);
      setPlaylist(null);
      setTracks([]);

      try {
         const res = await fetch("/api/playlist/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mood: selectedMood }),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || "Failed to generate playlist");
         }

         setPlaylist(data.playlist);
         setTracks(data.tracks);
      } catch (err: unknown) {
         setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
         setIsGenerating(false);
      }
   };

   const formatDuration = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
   };

   return (
      <div className="w-full max-w-2xl mx-auto">
         {/* Mood Grid */}
         <div className="grid grid-cols-3 gap-3 mb-8">
            {MOODS.map((mood) => (
               <button
                  key={mood.key}
                  onClick={() => {
                     setSelectedMood(mood.key);
                     setPlaylist(null);
                     setTracks([]);
                     setError(null);
                  }}
                  className={`mood-btn group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${selectedMood === mood.key
                     ? "border-white/30 bg-white/10 scale-[1.02] shadow-lg"
                     : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10"
                     }`}
                  style={
                     selectedMood === mood.key
                        ? {
                           boxShadow: `0 0 40px ${mood.color}20, 0 0 80px ${mood.color}10`,
                        }
                        : {}
                  }
               >
                  {/* Glow effect behind emoji */}
                  <div
                     className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{
                        background: `radial-gradient(circle at center, ${mood.color}15 0%, transparent 70%)`,
                     }}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                     <span className="text-3xl">{mood.emoji}</span>
                     <span
                        className="text-sm font-medium transition-colors duration-300"
                        style={{
                           color: selectedMood === mood.key ? mood.color : "rgba(255,255,255,0.5)",
                        }}
                     >
                        {mood.label}
                     </span>
                  </div>
               </button>
            ))}
         </div>

         {/* Generate Button */}
         <button
            onClick={handleGenerate}
            disabled={!selectedMood || isGenerating}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${!selectedMood || isGenerating
               ? "bg-white/5 text-white/20 cursor-not-allowed"
               : "spotify-btn"
               }`}
         >
            {isGenerating ? (
               <span className="inline-flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Crafting your playlist...
               </span>
            ) : selectedMood ? (
               `Generate ${MOODS.find((m) => m.key === selectedMood)?.emoji
               } ${MOODS.find((m) => m.key === selectedMood)?.label
               } Playlist`
            ) : (
               "Select a mood to begin"
            )}
         </button>

         {/* Error */}
         {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-fade-in">
               {error}
            </div>
         )}

         {/* Media Hub Tabs */}
         <MediaTabs
            tracks={tracks}
            playlist={playlist}
            formatDuration={formatDuration}
         />
      </div>
   );
}
