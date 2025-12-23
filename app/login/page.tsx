"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiFetch } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Building2,
  User,
  Lock,
  Loader2,
  AlertCircle,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  const [orgId, setOrgId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [errors, setErrors] = useState({
    orgId: "",
    username: "",
    password: "",
    general: "",
    forgotEmail: "",
  });

  const router = useRouter();

  const validateForm = () => {
    const newErrors = { orgId: "", username: "", password: "", general: "", forgotEmail: "" };
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

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ orgId: "", username: "", password: "", general: "", forgotEmail: "" });

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: orgId.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const code = data.errorCode;
        const newErrors = { orgId: "", username: "", password: "", general: "", forgotEmail: "" };

        if (code === "ORG_NOT_FOUND") {
          newErrors.orgId = "Organization ID not found";
        } else if (code === "USER_NOT_FOUND") {
          newErrors.username = "Username not found";
        } else if (code === "INVALID_PASSWORD") {
          newErrors.password = "Incorrect password";
        } else {
          newErrors.general = "Login failed. Please try again.";
        }

        setErrors(newErrors);
        return;
      }

      await supabase.auth.setSession({
        access_token: data.token.access_token,
        refresh_token: data.token.refresh_token,
      });

      toast.success("Login successful");

      router.push(
        data.profile.role === "admin"
          ? "/panels/admin"
          : "/panels/shop"
      );
    } catch {
      setErrors((prev) => ({ ...prev, general: "An error occurred. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setErrors((prev) => ({ ...prev, forgotEmail: "Please enter your email address" }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setErrors((prev) => ({ ...prev, forgotEmail: "Please enter a valid email address" }));
      return;
    }

    setForgotLoading(true);
    setErrors((prev) => ({ ...prev, forgotEmail: "" }));

    const { error } = await supabase.auth.resetPasswordForEmail(
      forgotEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setForgotLoading(false);

    if (error) {
      setErrors((prev) => ({ ...prev, forgotEmail: error.message }));
      return;
    }

    setShowForgot(false);
    setForgotEmail("");
    setErrors({ orgId: "", username: "", password: "", general: "Password reset email sent successfully", forgotEmail: "" });
  };

  const clearError = (field: keyof typeof errors) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

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
            <h1 className="text-lg font-semibold text-gray-800">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-xs">
              Sign in to your account
            </p>
          </div>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="space-y-3">
            {/* Org ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization ID
              </label>
              <div className="relative">
                <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.orgId ? "text-red-400" : "text-gray-400"}`} />
                <input
                  type="text"
                  value={orgId}
                  onChange={(e) => {
                    setOrgId(e.target.value);
                    clearError("orgId");
                    clearError("general");
                  }}
                  placeholder="Enter your organization ID"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none ${
                    errors.orgId
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                />
              </div>
              {errors.orgId && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <p className="text-xs text-red-600">{errors.orgId}</p>
                </div>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.username ? "text-red-400" : "text-gray-400"}`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearError("username");
                    clearError("general");
                  }}
                  placeholder="Enter your username"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none ${
                    errors.username
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                />
              </div>
              {errors.username && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <p className="text-xs text-red-600">{errors.username}</p>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.password ? "text-red-400" : "text-gray-400"}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                    clearError("general");
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:ring-2 outline-none ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${errors.password ? "text-red-400" : "text-gray-400"}`}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <p className="text-xs text-red-600">{errors.password}</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold py-2 rounded-lg transition flex items-center justify-center"
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
          </div>

          {/* Forgot password */}
          <div className="text-center mt-1">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs text-green-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Forgot Password
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter your registered email address
            </p>

            <div className="mb-4">
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.forgotEmail ? "text-red-400" : "text-gray-400"}`} />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    clearError("forgotEmail");
                  }}
                  placeholder="user@example.com"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none ${
                    errors.forgotEmail
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                />
              </div>
              {errors.forgotEmail && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <p className="text-xs text-red-600">{errors.forgotEmail}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowForgot(false);
                  setForgotEmail("");
                  clearError("forgotEmail");
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 rounded-lg text-sm"
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}