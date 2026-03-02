"use client";

import { useState } from "react";
import MediaTabs from "./MediaTabs";

interface TrackResult {
   name: string;
   artists: string;
   album: string;
   albumArt: string;
   duration: number;
   url: string;
}

interface MovieResult {
   title: string;
   synopsis: string;
}

interface VideoResult {
   videoId: string;
   title: string;
   description: string;
   thumbnail: string;
   channel: string;
   url: string;
}

export interface MediaData {
   tracks: TrackResult[];
   movies: MovieResult[];
   videos: VideoResult[];
}

export default function MoodSelector() {
   const [userInput, setUserInput] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [mediaData, setMediaData] = useState<MediaData | null>(null);

   const handleGenerate = async () => {
      const trimmedInput = userInput.trim();
      if (!trimmedInput) return;

      setIsLoading(true);
      setError(null);
      setMediaData(null);

      try {
         const res = await fetch("/api/orchestrator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_mood: trimmedInput }),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || "Failed to analyze vibe");
         }

         setMediaData(data as MediaData);
      } catch (err: unknown) {
         setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
         setIsLoading(false);
      }
   };

   // Format MS duration to M:SS
   const formatDuration = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
   };

   return (
      <div className="w-full max-w-2xl mx-auto">
         {/* Text Input Area */}
         <div className="mb-6">
            <textarea
               value={userInput}
               onChange={(e) => setUserInput(e.target.value)}
               placeholder="How are you feeling right now? (e.g., 'feeling nostalgic on a rainy night', 'need hype music for a workout')"
               className="w-full h-32 p-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#1db954]/50 focus:ring-1 focus:ring-[#1db954]/50 transition-all resize-none shadow-inner"
            />
         </div>

         {/* Generate Button */}
         <button
            onClick={handleGenerate}
            disabled={!userInput.trim() || isLoading}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${!userInput.trim() || isLoading
               ? "bg-white/5 text-white/20 cursor-not-allowed"
               : "spotify-btn"
               }`}
         >
            {isLoading ? (
               <span className="inline-flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Aura...
               </span>
            ) : (
               "Generate Vibe"
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
            mediaData={mediaData}
            isLoading={isLoading}
            formatDuration={formatDuration}
         />
      </div>
   );
}

