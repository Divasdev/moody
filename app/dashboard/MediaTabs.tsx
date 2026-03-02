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
   tracks: TrackResult[];
   playlist: PlaylistResult | null;
   formatDuration: (ms: number) => string;
}

export default function MediaTabs({
   tracks,
   playlist,
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
            <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -8 }}
               transition={{ duration: 0.25, ease: "easeInOut" }}
            >
               {activeTab === "music" && (
                  <MusicPanel
                     tracks={tracks}
                     playlist={playlist}
                     formatDuration={formatDuration}
                  />
               )}
               {activeTab === "watch" && <WatchPanel />}
               {activeTab === "video" && <VideoPanel />}
            </motion.div>
         </AnimatePresence>
      </div>
   );
}

/* ─── Music Panel (existing Spotify track list) ─── */
function MusicPanel({
   tracks,
   playlist,
   formatDuration,
}: {
   tracks: TrackResult[];
   playlist: PlaylistResult | null;
   formatDuration: (ms: number) => string;
}) {
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
            {playlist ? (
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
                        Playlist Created
                     </p>
                     <h3 className="text-lg font-bold gradient-text">
                        {playlist.name}
                     </h3>
                     <p className="text-sm text-white/40 mt-1">
                        {playlist.trackCount} tracks added to your Spotify
                     </p>
                  </div>
                  <a
                     href={playlist.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="spotify-btn !py-2.5 !px-5 !text-sm no-underline"
                  >
                     Open in Spotify
                  </a>
               </div>
            ) : (
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
            )}
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

/* ─── Watch Panel (placeholder) ─── */
function WatchPanel() {
   return (
      <div className="glass-card p-10 text-center mt-4">
         <span className="text-4xl mb-4 block">🎬</span>
         <h3 className="text-lg font-semibold text-white/80 mb-2">
            Shows &amp; Movies
         </h3>
         <p className="text-white/40 text-sm max-w-sm mx-auto">
            Mood-matched show and movie recommendations are coming soon.
            We&apos;ll suggest the perfect binge based on how you feel.
         </p>
         <div className="grid grid-cols-3 gap-3 mt-6 opacity-30">
            {[1, 2, 3].map((i) => (
               <div
                  key={i}
                  className="aspect-[2/3] rounded-xl bg-white/5 border border-white/5"
               />
            ))}
         </div>
      </div>
   );
}

/* ─── Video Panel (placeholder) ─── */
function VideoPanel() {
   return (
      <div className="glass-card p-10 text-center mt-4">
         <span className="text-4xl mb-4 block">▶️</span>
         <h3 className="text-lg font-semibold text-white/80 mb-2">
            YouTube Videos
         </h3>
         <p className="text-white/40 text-sm max-w-sm mx-auto">
            Mood-driven YouTube video suggestions are on the way.
            Chill playlists, lo-fi streams, and more — matched to your vibe.
         </p>
         <div className="grid grid-cols-2 gap-3 mt-6 opacity-30">
            {[1, 2].map((i) => (
               <div
                  key={i}
                  className="aspect-video rounded-xl bg-white/5 border border-white/5"
               />
            ))}
         </div>
      </div>
   );
}
