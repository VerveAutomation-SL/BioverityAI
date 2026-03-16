"use client";

import { useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

function FederationContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      router.push("/login");
      return;
    }

    supabase.auth.setSession({
      access_token,
      refresh_token,
    }).then(() => {
      router.push("/panels/admin");
    });
  }, []);

  return <div style={{ padding: 20 }}>Logging you into Bioverity...</div>;
}

export default function FederationLoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Preparing login...</div>}>
      <FederationContent />
    </Suspense>
  );
}