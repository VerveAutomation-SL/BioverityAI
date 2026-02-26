"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Check, Bell, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type FormData = {
  name: string;
  phoneNumber: string;
};

type Recipient = {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
};

function normalizePhoneNumber(input: string): string {
  let num = input.replace(/\s+/g, "");
  num = num.replace("+", "");
  if (num.startsWith("0")) {
    num = "94" + num.substring(1);
  }
  return num;
}

function isValidPhone(num: string): boolean {
  return /^[0-9]{10,15}$/.test(normalizePhoneNumber(num));
}

export default function AlertsPage() {
  const [formData, setFormData] = useState<FormData>({ name: "", phoneNumber: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch org_id on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profile?.org_id) setOrgId(profile.org_id);
      setIsLoading(false);
    })();
  }, []);

  // Auto-load saved data + recipients when orgId is available
  useEffect(() => {
    if (!orgId) return;

    (async () => {
      const { data } = await supabase
        .from("alert_recipients")
        .select("name, phone_number")
        .eq("org_id", orgId)
        .single();

      if (data) {
        setFormData({ name: data.name, phoneNumber: data.phone_number });
      }
    })();

    fetchRecipients();
  }, [orgId]);

  async function fetchRecipients() {
    if (!orgId) return;
    setIsLoadingRecipients(true);
    const { data } = await supabase
      .from("alert_recipients")
      .select("id, name, phone_number, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    setRecipients(data ?? []);
    setIsLoadingRecipients(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from("alert_recipients").delete().eq("id", id);
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const isFormValid = formData.name.trim() !== "" && isValidPhone(formData.phoneNumber);

  async function handleSubmit() {
    if (!isFormValid || isSubmitting || !orgId) return;
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("alert_recipients").insert({
      org_id: orgId,
      name: formData.name.trim(),
      phone_number: normalizePhoneNumber(formData.phoneNumber),
      created_by: user?.id ?? null,
    });

    setIsSubmitting(false);

    if (error) { console.error("Save failed:", error); return; }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setFormData({ name: "", phoneNumber: "" });
    fetchRecipients();
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
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl mb-8">
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

            {/* Phone Number Input */}
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
                Accepted formats: <span className="font-medium">0752072772</span>,{" "}
                <span className="font-medium">+94752072772</span>, or{" "}
                <span className="font-medium">94752072772</span>
              </p>
            </div>

            {/* Feature List */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">You'll receive alerts for:</h4>
              <div className="space-y-2">
                {["Employee check-in notifications", "Employee check-out notifications", "Real-time attendance updates"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting || !orgId}
              className={`w-full py-4 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 transform
                ${isFormValid && !isSubmitting && orgId
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

        {/* ── Recipients Table ── */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Registered Recipients</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {recipients.length} contact{recipients.length !== 1 ? "s" : ""} will receive alerts
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-slate-500" />
            </div>
          </div>

          {isLoadingRecipients ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recipients.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No recipients added yet. Use the form above to add one.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">#</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Name</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">WhatsApp Number</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Added</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-4 text-slate-800 font-medium">{r.name}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-mono text-xs font-medium">
                          <MessageCircle className="w-3 h-3" />
                          +{r.phone_number}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {new Date(r.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-40"
                          title="Remove recipient"
                        >
                          {deletingId === r.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
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