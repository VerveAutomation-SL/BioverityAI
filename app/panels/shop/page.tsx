"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ShopPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1) Get current user
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      // 2) Fetch profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        router.replace("/login");
        return;
      }

      // 3) Check if role is shop
      if (profile.role !== "shop") {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <span className="text-slate-600">Loading…</span>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Shop Panel</h1>
      <p className="mt-2 text-slate-600">You are logged in as a shop user.</p>
    </div>
  );
}
