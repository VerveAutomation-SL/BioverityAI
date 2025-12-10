"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiFetch } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Building2, User, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [orgId, setOrgId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ orgId: "", username: "", password: "" });
  const router = useRouter();

  const validateForm = () => {
    const newErrors = { orgId: "", username: "", password: "" };
    let isValid = true;

    if (!orgId.trim()) {
      newErrors.orgId = "Organization ID is required";
      isValid = false;
    }

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: orgId.trim(),
          username: username.trim(),
          password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      await supabase.auth.setSession({
        access_token: data.token.access_token,
        refresh_token: data.token.refresh_token,
      });

      toast.success("Login successful");

      router.push(data.profile.role === "shop" ? "/panels/shop" : "/panels/dashboard");

    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: string) =>
    setErrors(prev => ({ ...prev, [field]: "" }));

  return (
    <main className="min-h-screen flex items-start justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 pt-10 md:pt-16 px-4 mt-10">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">

          {/* Header */}
          <div className="flex flex-col items-center mb-5">
            <img
              src="/assets/images/logo.png"
              alt="BioVerity AI"
              className="h-16 w-auto mb-2"
            />
            <h1 className="text-lg font-semibold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 text-xs">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3">

            {/* Org ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization ID</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={orgId}
                  onChange={(e) => {
                    setOrgId(e.target.value);
                    clearError("orgId");
                  }}
                  placeholder="Enter your organization ID"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none 
                    ${errors.orgId ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
              {errors.orgId && (
                <p className="flex items-center mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" /> {errors.orgId}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearError("username");
                  }}
                  placeholder="Enter your username"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none 
                    ${errors.username ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
              {errors.username && (
                <p className="flex items-center mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" /> {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none 
                    ${errors.password ? "border-red-500" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center mt-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Not Registered Section */}
            <p className="text-center text-xs text-gray-600 mt-2">
              Not registered yet?
              <a href="mailto:info@bioverityai.com" className="text-green-600 font-medium ml-1">
                Contact us at info@bioverityai.com
              </a>
            </p>

          </form>

          <p className="mt-4 text-center text-[11px] text-gray-500">
            Powered by BioVerity AI • Biometrics Identification
          </p>
        </div>

        <p className="mt-3 text-center text-[11px] text-gray-500">
          Need help? Contact your administrator
        </p>

      </div>
    </main>
  );
}
