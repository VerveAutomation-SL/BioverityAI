"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function ShopNavbar({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-300"
          : "bg-slate-100/95 backdrop-blur-md border-b border-slate-300"
      }`}
    >
      <div className="max-w-7xl mx-auto px-10 sm:px-16 lg:px-32 h-20 flex items-center justify-between relative">

        {/* LOGO */}
        <Image
          src="/assets/images/logo.png"
          alt="Logo"
          width={55}
          height={55}
          className="cursor-pointer"
          onClick={() => router.push("/panels/shop")}
        />

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10">

          <button
            className="text-gray-700 hover:text-green-700 font-medium text-lg"
            onClick={() => router.push("/panels/shop/user-registration")}
          >
            User Registration
          </button>

          <button
            className="text-gray-700 hover:text-blue-700 font-medium text-lg"
            onClick={() => router.push("/panels/shop/products")}
          >
            Products
          </button>

        </div>

        {/* AVATAR */}
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
