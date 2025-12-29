"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ShopNavbar from "@/app/components/ShopNavbar";
import { Layers, Key, FileText, AlignLeft } from "lucide-react";

export default function NewServicePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

      if (!prof || prof.role !== "admin") return router.replace("/login");

      setProfile(prof);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (!key.trim() || !name.trim()) {
      setError("Service key and name are required");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: key.trim(),
        name: name.trim(),
        description: description.trim(),
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to create service");
      return;
    }

    alert("Service created successfully!");
    router.push("/panels/admin/services");
  };

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-gray-600 font-medium">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <ShopNavbar
        fullName={profile.full_name}
        role={profile.role}
        organizationLogo={profile.organization_logo}
      />

      <div className="flex items-center justify-center py-8 px-6 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent mb-2">
              Create New Service
            </h1>
            <p className="text-gray-600">
              Add a new service to your platform for users to access
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-purple-100 p-8">
            <form className="space-y-4">
              {/* Service Key */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-600" />
                  Service Key
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) =>
                    setKey(e.target.value.replace(/\s/g, "").toLowerCase())
                  }
                  placeholder="fingerprint_verification"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-200 outline-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Immutable. Used internally in code. No spaces allowed.
                </p>
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Service Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Fingerprint Verification"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-purple-600" />
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter a brief description of this service..."
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Creating..." : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}