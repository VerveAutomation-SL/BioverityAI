"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ShopNavbar from "@/app/components/ShopNavbar";
import { UserPlus, Lock, User, Building2, Eye, EyeOff, Mail } from "lucide-react";

export default function UserRegistrationPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [orgId, setOrgId] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showServices, setShowServices] = useState(false);

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  }

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
      setOrgId("");
      setLoading(false);
    })();
  }, []);

  async function handleRegister() {
    if (!email || !username || !organizationName || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (!orgId) {
      alert("Organization ID is required.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const res = await fetch("/api/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: organizationName,
        logo_url: organizationLogo,
        username,
        org_id: orgId,
        role: "shop",
        services: selectedServices,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error || "Registration failed");
      return;
    }

    setFormError("");
    alert("User created successfully!");

    // Reset form
    setOrgId("");
    setEmail("");
    setUsername("");
    setOrganizationName("");
    setPassword("");
    setConfirmPassword("");
    setSelectedServices([]);
    setShowServices(false);
  }

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-gray-600 font-medium">
            Loading user registration...
          </span>
        </div>
      </div>
    );
  }

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);

    const ext = file.name.split(".").pop();
    const fileName = `logos/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      alert(error.message);
      setUploadingLogo(false);
      return;
    }

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    setOrganizationLogo(data.publicUrl);
    setUploadingLogo(false);
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-blue-700 bg-clip-text text-transparent mb-2">
              User Registration
            </h1>
            <p className="text-gray-600">Register a new user under your organization</p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-emerald-100 p-8">
            <form className="space-y-4">
              {/* Organization ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Organization ID
                </label>
                <input
                  type="text"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-200 outline-none font-mono text-sm"
                />
              </div>

              {/* Organization Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              {/* Organization Logo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Logo
                </label>

                <div className="flex items-center gap-4">
                  {organizationLogo ? (
                    <img
                      src={organizationLogo}
                      alt="Organization Logo"
                      className="w-20 h-20 rounded-xl object-cover border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl border border-dashed flex items-center justify-center text-gray-400 text-sm">
                      No Logo
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleLogoUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              {/* SERVICES DROPDOWN */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Enabled Services
                </label>

                <button
                  type="button"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 text-left flex justify-between items-center"
                  onClick={() => setShowServices((v) => !v)}
                >
                  <span className="text-sm text-gray-700">
                    {selectedServices.length > 0
                      ? selectedServices.join(", ")
                      : "Select services"}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>

                {showServices && (
                  <div className="absolute z-20 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg p-3 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes("authentication")}
                        onChange={() => toggleService("authentication")}
                        className="w-4 h-4 accent-emerald-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Authentication
                        </p>
                        <p className="text-xs text-gray-600">
                          Access authentication dashboard
                        </p>
                      </div>
                    </label>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setShowServices(false)}
                        className="text-sm font-semibold text-emerald-600 hover:underline"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRegister}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl"
                >
                  Register User
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
