"use client";

import { ShieldCheck, Zap, CheckCircle2, Cloud, Award, Users, Sparkles } from "lucide-react";

export default function WhyChooseUs() {
  const points = [
    { 
      icon: ShieldCheck, 
      text: "99.8% biometric accuracy with AI-powered recognition",
      color: "from-blue-500 to-indigo-600",
      shadowColor: "group-hover:shadow-blue-500/40",
      glowColor: "bg-blue-500/10",
    },
    { 
      icon: Zap, 
      text: "Ultra-fast verification – typically under 0.3 seconds",
      color: "from-yellow-500 to-orange-600",
      shadowColor: "group-hover:shadow-yellow-500/40",
      glowColor: "bg-yellow-500/10",
    },
    { 
      icon: Cloud, 
      text: "Cloud + on-premise hybrid deployment options",
      color: "from-cyan-500 to-blue-600",
      shadowColor: "group-hover:shadow-cyan-500/40",
      glowColor: "bg-cyan-500/10",
    },
    { 
      icon: Users, 
      text: "Supports multi-branch and large-scale enterprise setups",
      color: "from-emerald-500 to-green-600",
      shadowColor: "group-hover:shadow-emerald-500/40",
      glowColor: "bg-emerald-500/10",
    },
    { 
      icon: CheckCircle2, 
      text: "AES-256 encrypted data protection and secure access",
      color: "from-rose-500 to-red-600",
      shadowColor: "group-hover:shadow-rose-500/40",
      glowColor: "bg-rose-500/10",
    },
  ];

  return (
    <section className="relative w-full py-8 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">

      {/* Background elements (compact) */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-6 left-14 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-6 right-14 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,_#1e293b_1px,_transparent_1px)] bg-[size:14px_14px]" />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-20">

        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-semibold text-slate-700">
              THE BIOVERITY ADVANTAGE
            </span>
          </div>

         <h2 className="text-4xl sm:text-5xl font-black text-slate-900 text-center mb-2 leading-tight">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
              BioVerity AI
            </span>
            ?
          </h2>

          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-medium">
            Trusted, reliable, and built for real-world enterprise environments. Security meets simplicity.
          </p>
        </div>

        {/* Points */}
        <ul className="space-y-2 max-w-3xl mx-auto">
          {points.map((item, index) => (
            <li key={index} className="group relative">

              {/* Hover glow */}
              <div className={`absolute -inset-1 rounded-2xl ${item.glowColor} opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500`} />

              {/* Content */}
              <div className="relative flex items-start gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm group-hover:shadow-lg group-hover:border-slate-300 transition-all duration-300 group-hover:-translate-y-0.5">

                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${item.color} shadow-md ${item.shadowColor} transition-all duration-300 group-hover:scale-105`}>
                  <item.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-slate-800 text-sm font-semibold leading-relaxed group-hover:text-slate-900 transition-colors">
                    {item.text}
                  </p>

                  {/* Accent line */}
                  <div className="mt-1.5 h-1 w-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full group-hover:w-12 transition-all duration-500" />
                </div>

                {/* Checkmark */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Connecting line */}
              {index < points.length - 1 && (
                <div className="absolute left-6 top-full h-3 w-0.5 bg-gradient-to-b from-slate-200 to-transparent" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
