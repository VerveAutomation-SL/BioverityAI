"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AddProductForm from "@/app/components/AddProductForm";
import ShopNavbar from "@/app/components/ShopNavbar";
import { Store } from "lucide-react";

interface Profile {
  role: string;
  org_id: string;
  full_name: string;
  username: string;
  email: string;
}

export default function ShopPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("role, org_id, full_name, username, email")
        .eq("id", user.id)
        .single();
      if (error || !prof) {
        router.replace("/login");
        return;
      }

      setProfile(prof);

      if (prof.role !== "shop") {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    })();
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-gray-600 font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 mt-20">
      <ShopNavbar fullName={profile.full_name || "User"} />
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  Shop Panel
                </h1>
                <p className="mt-2 text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  You are logged in as a shop user
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="hidden md:flex gap-4">
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 min-w-[120px]">
                <div className="text-2xl font-bold text-green-700">0</div>
                <div className="text-xs text-green-600 font-medium">Products</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl p-4 min-w-[120px]">
                <div className="text-2xl font-bold text-emerald-700">0</div>
                <div className="text-xs text-emerald-600 font-medium">Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <AddProductForm orgId={profile.org_id} />
      </div>
    </div>
  );
}