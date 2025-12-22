"use client";

import { useState } from "react";
import { MessageCircle, Send, Check, Bell, Sparkles } from "lucide-react";

type AlertChannel = "whatsapp" | "telegram" | null;

export default function AlertsPage() {
  const [selectedChannel, setSelectedChannel] = useState<AlertChannel>(null);

  function selectChannel(channel: AlertChannel) {
    setSelectedChannel(channel);
  }

  return (
    <div className="min-h-screen">
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-8 max-w-3xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Stay Connected</h3>
            <p className="text-sm text-blue-700">
              Get instant notifications when employees check in or out, helping you monitor attendance in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Channel Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* WhatsApp Card */}
        <div
          onClick={() => selectChannel("whatsapp")}
          className={`relative cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 transform hover:-translate-y-1
            ${
              selectedChannel === "whatsapp"
                ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-2xl shadow-emerald-200 scale-105"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl"
            }`}
        >
          {/* Selection Badge */}
          {selectedChannel === "whatsapp" && (
            <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Icon & Content */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 shadow-lg
                ${
                  selectedChannel === "whatsapp"
                    ? "bg-gradient-to-br from-emerald-500 to-green-600 scale-110"
                    : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600"
                }`}
            >
              <MessageCircle className={`w-10 h-10 ${selectedChannel === "whatsapp" ? "text-white" : ""}`} />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              WhatsApp
            </h3>
            <p className="text-slate-600 mb-4">
              Receive instant alerts directly to your WhatsApp messenger
            </p>

            {/* Features List */}
            <div className="space-y-2 text-sm text-left w-full">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Real-time notifications</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Rich media support</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Quick response options</span>
              </div>
            </div>
          </div>

          {/* Active Status */}
          {selectedChannel === "whatsapp" && (
            <div className="mt-6 pt-6 border-t border-emerald-200">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Active Channel
              </div>
            </div>
          )}
        </div>

        {/* Telegram Card */}
        <div
          onClick={() => selectChannel("telegram")}
          className={`relative cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 transform hover:-translate-y-1
            ${
              selectedChannel === "telegram"
                ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-2xl shadow-emerald-200 scale-105"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl"
            }`}
        >
          {/* Selection Badge */}
          {selectedChannel === "telegram" && (
            <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Icon & Content */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 shadow-lg
                ${
                  selectedChannel === "telegram"
                    ? "bg-gradient-to-br from-blue-500 to-sky-600 scale-110"
                    : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600"
                }`}
            >
              <Send className={`w-10 h-10 ${selectedChannel === "telegram" ? "text-white" : ""}`} />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Telegram
            </h3>
            <p className="text-slate-600 mb-4">
              Get alerts through secure Telegram bot notifications
            </p>

            {/* Features List */}
            <div className="space-y-2 text-sm text-left w-full">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Instant delivery</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Group notifications</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Secure messaging</span>
              </div>
            </div>
          </div>

          {/* Active Status */}
          {selectedChannel === "telegram" && (
            <div className="mt-6 pt-6 border-t border-emerald-200">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Active Channel
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      {selectedChannel && (
        <div className="mt-8 max-w-3xl">
          <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Save Alert Preferences
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 max-w-3xl bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-800 mb-3">Need Help?</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Having trouble setting up alerts? Contact our support team.
        </p>
      </div>
    </div>
  );
}