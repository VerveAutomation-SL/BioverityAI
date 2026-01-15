"use client";

import { useState } from "react";
import { MessageCircle, Check, Bell } from "lucide-react";

type FormData = {
  name: string;
  phoneNumber: string;
};

export default function AlertsPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit() {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);

    // Simulate API call - replace with actual database save later
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({ name: "", phoneNumber: "" });
    }, 3000);
  }

  const isFormValid = formData.name.trim() !== "" && formData.phoneNumber.trim() !== "";

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
          Configure how you want to receive real-time authentication notifications
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

          {/* Phone Number Input */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1 234 567 8900"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 text-slate-800 placeholder-slate-400"
            />
            <p className="mt-2 text-xs text-slate-500">Include country code (e.g., +1 for US, +44 for UK)</p>
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
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 transform
              ${
                isFormValid && !isSubmitting
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