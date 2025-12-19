"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/app/components/ShopNavbar";
import { ShieldCheck } from "lucide-react";

export default function ServicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return router.replace("/login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("role, org_id, full_name, organization_logo")
        .eq("id", user.id)
        .single();

      if (!prof || prof.role !== "shop") {
        return router.replace("/panels/admin");
      }

      const { data: svc } = await supabase
        .from("user_services")
        .select("service_key")
        .eq("user_id", user.id);

      setServices(svc?.map((s) => s.service_key) || []);
      setProfile(prof);
      setLoading(false);
    })();
  }, []);

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="text-gray-600">Loading services...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 mt-20">
      <ShopNavbar
        fullName={profile.full_name}
        role={profile.role}
        organizationLogo={profile.organization_logo}
      />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
            Services
          </h1>
          <p className="text-gray-600 mt-2">
            Services enabled for your account
          </p>
        </div>

        {/* No services */}
        {services.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-xl p-8 border">
            No services have been enabled for your account.
          </div>
        )}

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.includes("authentication") && (
            <div
              onClick={() => router.push("/panels/shop/services/authentication")}
              className="cursor-pointer group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition"></div>

              <div className="relative bg-white border-2 border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 transition group-hover:shadow-xl">
                <div className="w-16 h-16 mx-auto bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>

                <h3 className="text-xl font-bold text-center">
                  Attendance
                </h3>

                <p className="text-sm text-gray-600 text-center mt-2">
                  Manage attendance features and access
                </p>

                <div className="text-center text-emerald-600 font-semibold mt-4 text-sm">
                  Open Attendance System
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
