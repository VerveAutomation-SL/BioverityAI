"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully");
    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Reset Password</h1>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded mb-4"
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </main>
  );
}
