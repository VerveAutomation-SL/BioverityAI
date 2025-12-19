"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { User, LogOut, KeyRound, ChevronDown } from "lucide-react";

interface ShopNavbarProps {
  fullName: string;
  role: "admin" | "shop";
  organizationLogo?: string | null;
  organizationName?: string;
  hideBrandLogo?: boolean;
}

export default function ShopNavbar({ 
  fullName, 
  role, 
  organizationLogo, 
  organizationName = "Organization",
  hideBrandLogo = false, 
}: ShopNavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const basePath = role === "admin" ? "/panels/admin" : "/panels/shop";

  const initials = fullName
    ? fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
      className={`fixed top-0 ${hideBrandLogo ? 'left-0' : 'left-0'} right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-300"
          : "bg-slate-100/95 backdrop-blur-md border-b border-slate-300"
      }`}
    >
      <div className={`h-20 flex items-center relative w-full ${hideBrandLogo ? 'pl-80' : ''}`}>
        {/* LOGO */}
        {!hideBrandLogo && (
          <div className="absolute left-10 sm:left-16 lg:left-32">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={55}
              height={55}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => router.push(basePath)}
            />
          </div>
        )}

        {/* ORGANIZATION NAME */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="px-6 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/60 shadow-sm">
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent whitespace-nowrap">
              {fullName}
            </span>
          </div>
        </div>

        {/* USER PROFILE SECTION */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer transition-all duration-200 group"
          >
            {/* Avatar/Logo */}
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all bg-white p-1">
              {organizationLogo && !logoError ? (
                <Image
                  src={organizationLogo}
                  alt="Organization Logo"
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                  unoptimized
                  onError={() => {
                    console.error("Failed to load organization logo:", organizationLogo);
                    setLogoError(true);
                  }}
                />
              ) : (
                <span className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-sm font-bold rounded-full">
                  {initials}
                </span>
              )}
            </div>
          </button>

          {/* DROPDOWN MENU */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-2xl border border-slate-200 w-64 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-md">
                      {organizationLogo && !logoError ? (
                        <Image
                          src={organizationLogo}
                          alt="Organization Logo"
                          width={48}
                          height={48}
                          className="object-contain w-full h-full"
                          unoptimized
                          onError={() => setLogoError(true)}
                        />
                      ) : (
                        <span className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-base font-bold">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {fullName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 text-gray-700"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(`${basePath}/change-password`);
                    }}
                  >
                    <KeyRound className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Change Password</span>
                  </button>

                  <button
                    className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}