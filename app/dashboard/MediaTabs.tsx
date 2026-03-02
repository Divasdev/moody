"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

import { MediaData } from "./MoodSelector";

type TabKey = "music" | "watch" | "video";

interface Tab {
   key: TabKey;
   label: string;
   icon: string;
}

const TABS: Tab[] = [
   { key: "music", label: "Music (Spotify)", icon: "🎵" },
   { key: "watch", label: "Watch (Shows/Movies)", icon: "🎬" },
   { key: "video", label: "Video (YouTube)", icon: "▶️" },
];

interface MediaTabsProps {
   mediaData: MediaData | null;
   isLoading: boolean;
   formatDuration: (ms: number) => string;
}

export default function MediaTabs({
   mediaData,
   isLoading,
   formatDuration,
}: MediaTabsProps) {
   const [activeTab, setActiveTab] = useState<TabKey>("music");

   return (
      <div className="w-full mt-8">
         {/* Tab Bar */}
         <div className="media-tab-bar">
            {TABS.map((tab) => (
               <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`media-tab ${activeTab === tab.key ? "media-tab-active" : ""}`}
               >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.key && (
                     <motion.div
                        className="media-tab-indicator"
                        layoutId="tab-indicator"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                     />
                  )}
               </button>
            ))}
         </div>

         {/* Tab Content with Crossfade */}
         <AnimatePresence mode="wait">
            {isLoading ? (
               <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
               >
                  <SkeletonLoader />
               </motion.div>
            ) : (
               <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
               >
                  {activeTab === "music" && (
                     <MusicPanel
                        mediaData={mediaData}
                        formatDuration={formatDuration}
                     />
                  )}
                  {activeTab === "watch" && <WatchPanel mediaData={mediaData} />}
                  {activeTab === "video" && <VideoPanel mediaData={mediaData} />}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

/* ─── Skeleton Loader ─── */
function SkeletonLoader() {
   return (
      <div className="mt-4 space-y-4 animate-pulse">
         <div className="glass-card p-6 mb-6">
            <div className="h-4 bg-white/10 rounded w-1/4 mb-4" />
            <div className="h-6 bg-white/10 rounded w-1/2 mb-2" />
            <div className="h-4 bg-white/10 rounded w-1/3" />
         </div>
         {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
               <div className="w-10 h-10 rounded-md bg-white/10" />
               <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
               </div>
            </div>
         ))}
      </div>
   );
}

/* ─── Music Panel (existing Spotify track list) ─── */
function MusicPanel({
   mediaData,
   formatDuration,
}: {
   mediaData: MediaData | null;
   formatDuration: (ms: number) => string;
}) {
   const tracks = mediaData?.tracks || [];
   if (tracks.length === 0) {
      return (
         <div className="glass-card p-10 text-center mt-4">
            <span className="text-4xl mb-4 block">🎧</span>
            <p className="text-white/40 text-sm">
               Select a mood and hit Generate to see your Spotify tracks here.
            </p>
         </div>
      );
   }

   return (
      <div className="mt-4 animate-fade-in">
         {/* Playlist header card */}
         <div className="glass-card p-6 mb-6">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#1db954] animate-pulse" />
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                     Your Mood Tracks
                  </p>
               </div>
               <h3 className="text-lg font-bold gradient-text">
                  {tracks.length} tracks curated for you
               </h3>
               <p className="text-sm text-white/30 mt-1">
                  Click any track to play it on Spotify
               </p>
            </div>
         </div>

         {/* Track list */}
         <div className="space-y-1">
            {tracks.map((track, idx) => (
               <a
                  key={idx}
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200 group no-underline"
               >
                  <span className="w-6 text-right text-xs text-white/20 font-mono group-hover:text-white/40">
                     {idx + 1}
                  </span>
                  {track.albumArt && (
                     <Image
                        src={track.albumArt}
                        alt={track.album}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                     />
                  )}
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-white/90 truncate">
                        {track.name}
                     </p>
                     <p className="text-xs text-white/40 truncate">
                        {track.artists}
                     </p>
                  </div>
                  <span className="text-xs text-white/20 font-mono">
                     {formatDuration(track.duration)}
                  </span>
               </a>
            ))}
         </div>
      </div>
   );
}

/* ─── Watch Panel (Movies/Shows) ─── */
function WatchPanel({ mediaData }: { mediaData: MediaData | null }) {
   const movies = mediaData?.movies || [];

   if (movies.length === 0) {
      return (
         <div className="glass-card p-10 text-center mt-4">
            <span className="text-4xl mb-4 block">🎬</span>
            <p className="text-white/40 text-sm">
               Select a mood and hit Generate to see your movie & show recommendations here.
            </p>
         </div>
      );
   }

   return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
         {movies.map((movie, idx) => (
            <div
               key={idx}
               className="glass-card p-5 hover:bg-white/[0.06] transition-colors duration-300"
            >
               <h3 className="text-lg font-bold gradient-text mb-2">
                  {movie.title}
               </h3>
               <p className="text-sm text-white/50 leading-relaxed">
                  {movie.synopsis}
               </p>
            </div>
         ))}
      </div>
   );
}

/* ─── Video Panel (YouTube) ─── */
function VideoPanel({ mediaData }: { mediaData: MediaData | null }) {
   const videos = mediaData?.videos || [];

   if (videos.length === 0) {
      return (
         <div className="glass-card p-10 text-center mt-4">
            <span className="text-4xl mb-4 block">▶️</span>
            <p className="text-white/40 text-sm">
               Select a mood and hit Generate to see your YouTube video recommendations here.
            </p>
         </div>
      );
   }

   return (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
         {videos.map((video, idx) => (
            <div
               key={idx}
               className="group relative flex flex-col gap-3 rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
            >
               <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/50 border border-white/10 shadow-lg">
                  <iframe
                     src={`https://www.youtube.com/embed/${video.videoId}`}
                     title={video.title}
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                     className="absolute top-0 left-0 w-full h-full border-0"
                  />
               </div>
               <div className="px-1">
                  <h4 className="text-sm font-semibold text-white/90 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                     {video.title}
                  </h4>
                  <p className="text-xs text-white/40 mt-1">{video.channel}</p>
               </div>
            </div>
         ))}
      </div>
   );
}
