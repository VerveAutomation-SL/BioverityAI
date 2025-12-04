"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AddProductForm from "@/app/components/AddProductForm";

export default function ShopPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<any>(null);

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
        .select("role, org_id")
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
      <div className="w-full h-[60vh] flex items-center justify-center">
        <span className="text-slate-600">Loading…</span>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Shop Panel</h1>
      <p className="mt-2 text-slate-600">You are logged in as a shop user.</p>

      <hr className="my-8" />

      <AddProductForm orgId={profile.org_id} />
    </div>
  );
}
