"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/app/components/ShopNavbar";
import { Users, PackageSearch } from "lucide-react";

export default function AdminHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return router.replace("/login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("role, org_id, full_name")
        .eq("id", user.id)
        .single();

      if (!prof || prof.role !== "admin") return router.replace("/login");

      setProfile(prof);
      setLoading(false);
    })();
  }, []);

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-gray-600 font-medium">
            Loading admin panel...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-56 h-56 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-green-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <ShopNavbar fullName={profile.full_name} role={profile.role} />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 blur-xl opacity-40 rounded-full"></div>
              <div className="relative bg-white p-3 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-700 via-green-600 to-blue-700 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-600 text-base max-w-xl mx-auto">
            Biometric identity verification and user management powered by BioVerity AI
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Registration card */}
          <div
            onClick={() => router.push("/panels/admin/user-registration")}
            className="cursor-pointer group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

            <div className="relative bg-white border-2 border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 blur-lg opacity-30 rounded-full"></div>
                <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl flex items-center justify-center border-2 border-emerald-200 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors">
                User Registration
              </h3>
              <p className="text-gray-600 mb-3 leading-relaxed text-sm">
                Register new users with biometric verification under your organization
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                  User Management
                </span>
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                  New User
                </span>
              </div>

              <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform text-sm">
                <span>Get Started</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Product card */}
          <div
            onClick={() => router.push("/panels/admin/products")}
            className="cursor-pointer group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

            <div className="relative bg-white border-2 border-blue-100 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 blur-lg opacity-30 rounded-full"></div>
                <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center border-2 border-blue-200 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <PackageSearch className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                Manage Products
              </h3>
              <p className="text-gray-600 mb-3 leading-relaxed text-sm">
                Add, update, and organize your shop's product inventory
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                  Inventory
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
                  Catalog
                </span>
              </div>

              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform text-sm">
                <span>Manage Now</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">
              System Online & Secure
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
