"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Check, Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type FormData = {
  name: string;
  phoneNumber: string;
};

// 🔹 Step 1 — Normalize phone number before saving
function normalizePhoneNumber(input: string): string {
  let num = input.replace(/\s+/g, ""); // remove spaces
  num = num.replace("+", "");          // remove +

  // If starts with 0 (local Sri Lanka style e.g. 075...)
  if (num.startsWith("0")) {
    num = "94" + num.substring(1);
  }

  return num;
}

// 🔹 Step 2 — Basic validation: 10–15 digits after normalization
function isValidPhone(num: string): boolean {
  return /^[0-9]{10,15}$/.test(normalizePhoneNumber(num));
}

export default function AlertsPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch org_id on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profile?.org_id) {
        setOrgId(profile.org_id);
      }
      setIsLoading(false);
    })();
  }, []);

  // Auto-load saved data when orgId is available
  useEffect(() => {
    if (!orgId) return;

    (async () => {
      const { data } = await supabase
        .from("alert_recipients")
        .select("name, phone_number")
        .eq("org_id", orgId)
        .single();

      if (data) {
        setFormData({
          name: data.name,
          phoneNumber: data.phone_number,
        });
      }
    })();
  }, [orgId]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // 🔹 Updated isFormValid using isValidPhone
  const isFormValid =
    formData.name.trim() !== "" &&
    isValidPhone(formData.phoneNumber);

  async function handleSubmit() {
    if (!isFormValid || isSubmitting || !orgId) return;

    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("alert_recipients")
      .upsert({
        org_id: orgId,
        name: formData.name.trim(),
        // 🔹 Normalize the number before saving
        phone_number: normalizePhoneNumber(formData.phoneNumber),
        created_by: user?.id ?? null,
      });

    setIsSubmitting(false);

    if (error) {
      console.error("Save failed:", error);
      return;
    }

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Alert Settings
              </h1>
            </div>
          </div>
          <p className="text-slate-600 text-lg ml-15">
            Configure who will receive the real-time alerts and notifications
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-emerald-900 mb-1">WhatsApp Notifications</h3>
              <p className="text-sm text-emerald-700">
                Add your contact details to receive instant WhatsApp alerts for employee check-ins and check-outs.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Successfully Saved!</h3>
                <p className="text-sm text-green-700">Your WhatsApp alert settings have been updated.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Contact Information</h2>
              <p className="text-sm text-slate-500">Enter details for WhatsApp notifications</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Phone Number Input — 🔹 Step 3: enforce numeric input */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9+ ]*"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+94 75 207 2772"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
              <p className="mt-2 text-xs text-slate-500">
                Accepted formats: <span className="font-medium">0752072772</span>, <span className="font-medium">+94752072772</span>, or <span className="font-medium">94752072772</span>
              </p>
            </div>

            {/* Feature List */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">You'll receive alerts for:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Employee check-in notifications</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Employee check-out notifications</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Real-time attendance updates</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting || !orgId}
              className={`w-full py-4 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 transform
                ${
                  isFormValid && !isSubmitting && orgId
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-xl hover:scale-105 cursor-pointer"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                "Save Alert Settings"
              )}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Important Information</h3>
          <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>• Make sure your WhatsApp number is active and can receive messages</p>
            <p>• You'll receive a verification message when you save your settings</p>
            <p>• Update your contact details anytime by submitting this form again</p>
          </div>
        </div>
      </div>
    </div>
  );
}