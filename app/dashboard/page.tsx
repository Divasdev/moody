import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import SignOutButton from "./SignOutButton";
import MoodSelector from "./MoodSelector";

export default async function DashboardPage() {
   const session = await getServerSession(authOptions);

   if (!session) {
      redirect("/");
   }

   const userName = session.user?.name || "Music Lover";
   const userImage = session.user?.image;

   return (
      <div className="relative min-h-screen flex flex-col items-center overflow-hidden px-6 py-12">
         {/* Background Orbs */}
         <div className="orb orb-1" />
         <div className="orb orb-2" />
         <div className="orb orb-3" />

         {/* Noise Overlay */}
         <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] opacity-50 pointer-events-none z-0" />

         {/* Header */}
         <div className="relative z-10 flex flex-col items-center text-center mb-12">
            {/* Profile + Greeting */}
            <div className="animate-fade-in flex items-center gap-4 mb-6">
               <div className="profile-ring !p-[2px]">
                  {userImage ? (
                     <Image
                        src={userImage}
                        alt={userName}
                        width={48}
                        height={48}
                        className="rounded-full"
                     />
                  ) : (
                     <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#7c3aed] to-[#1db954] flex items-center justify-center text-lg font-bold">
                        {userName.charAt(0).toUpperCase()}
                     </div>
                  )}
               </div>
               <div className="text-left">
                  <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
                     Welcome back
                  </p>
                  <h1 className="text-xl font-bold gradient-text">
                     {userName}
                  </h1>
               </div>
            </div>

            {/* Tagline */}
            <div className="animate-fade-in-delay-1">
               <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
                  How are you <span className="gradient-text">feeling</span>?
               </h2>
               <p className="text-white/40 text-sm max-w-md">
                  Pick a mood and we&apos;ll craft the perfect Spotify playlist for you.
               </p>
            </div>
         </div>

         {/* Mood Selector */}
         <div className="relative z-10 animate-fade-in-delay-2 w-full flex justify-center">
            <MoodSelector />
         </div>

         {/* Sign Out */}
         <div className="relative z-10 animate-fade-in-delay-3 mt-16">
            <SignOutButton />
         </div>
      </div>
   );
}
