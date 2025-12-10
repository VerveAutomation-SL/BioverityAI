"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function ShopNavbar({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = fullName
    ? fullName.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Image
          src="/assets/images/logo.png"
          alt="Logo"
          width={55}
          height={55}
          className="cursor-pointer"
          onClick={() => router.push("/dashboard")}
        />

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-md hover:scale-105 transition"
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 bg-white shadow-lg rounded-lg border w-40 py-2 text-sm">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
