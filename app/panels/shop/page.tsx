"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/app/components/ShopNavbar";
import { PackageSearch, Layers } from "lucide-react";

export default function ShopHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<string[]>([]);

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
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-gray-600 font-medium">
            Loading shop panel...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 mt-20 relative overflow-hidden">
      <ShopNavbar fullName={profile.full_name} role={profile.role} />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Shop Panel
          </h1>
          <p className="text-gray-600 text-base max-w-xl mx-auto">
            Manage your products and inventory
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">

          {/* Product card */}
          <div
            onClick={() => router.push("/panels/shop/products")}
            className="cursor-pointer group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

            <div className="relative bg-white border-2 border-blue-100 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="mb-4 relative">
                <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center border-2 border-blue-200">
                  <PackageSearch className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                Manage Products
              </h3>

              <p className="text-gray-600 mb-3 leading-relaxed text-sm text-center">
                Add, update, and organize your shop’s product inventory
              </p>

              <div className="flex items-center justify-center text-blue-600 font-semibold text-sm">
                <span>Open Products</span>
              </div>
            </div>
          </div>

          {/* Services card */}
          {services.length > 0 && (
            <div
              onClick={() => router.push("/panels/shop/services")}
              className="cursor-pointer group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

              <div className="relative bg-white border-2 border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                <div className="mb-4 relative">
                  <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl flex items-center justify-center border-2 border-emerald-200">
                    <Layers className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Services
                </h3>

                <p className="text-gray-600 mb-3 leading-relaxed text-sm text-center">
                  Access enabled services for your account
                </p>

                <div className="flex items-center justify-center text-emerald-600 font-semibold text-sm">
                  <span>Open Services</span>
                </div>
              </div>
            </div>
          )}
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
