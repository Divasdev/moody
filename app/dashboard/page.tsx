import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import SignOutButton from "./SignOutButton";

export default async function DashboardPage() {
   const session = await getServerSession(authOptions);

   if (!session) {
      redirect("/");
   }

   const userName = session.user?.name || "Music Lover";
   const userImage = session.user?.image;

   return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
         {/* Background Orbs */}
         <div className="orb orb-1" />
         <div className="orb orb-2" />
         <div className="orb orb-3" />

         {/* Noise Overlay */}
         <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] opacity-50 pointer-events-none z-0" />

         {/* Content */}
         <div className="relative z-10 flex flex-col items-center text-center">
            {/* Profile Picture */}
            <div className="animate-fade-in mb-8">
               <div className="profile-ring">
                  {userImage ? (
                     <Image
                        src={userImage}
                        alt={userName}
                        width={120}
                        height={120}
                        className="rounded-full"
                     />
                  ) : (
                     <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#7c3aed] to-[#1db954] flex items-center justify-center text-4xl font-bold">
                        {userName.charAt(0).toUpperCase()}
                     </div>
                  )}
               </div>
            </div>

            {/* Greeting */}
            <div className="animate-fade-in-delay-1 mb-2">
               <p className="text-white/40 text-sm uppercase tracking-[0.25em] mb-3">
                  Welcome back
               </p>
               <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                  <span className="gradient-text">{userName}</span>
               </h1>
            </div>

            {/* Card */}
            <div className="animate-fade-in-delay-2 glass-card p-8 mt-10 max-w-md w-full">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#1db954] animate-pulse" />
                  <span className="text-white/60 text-sm">Connected to Spotify</span>
               </div>
               <p className="text-white/40 text-sm leading-relaxed">
                  You&apos;re all set! Soon you&apos;ll be able to select your mood
                  and we&apos;ll generate the perfect playlist for you.
               </p>
            </div>

            {/* Sign Out */}
            <div className="animate-fade-in-delay-3 mt-10">
               <SignOutButton />
            </div>
         </div>
      </div>
   );
}
