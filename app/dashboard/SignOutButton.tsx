"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
   return (
      <button
         onClick={() => signOut({ callbackUrl: "/" })}
         className="px-6 py-3 rounded-full border border-white/10 bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer"
      >
         Sign Out
      </button>
   );
}
