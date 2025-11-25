"use client";

import { Cloud, Server, Cpu, Plug, Code, Database, Sparkles } from "lucide-react";

export default function Integrations() {
    const items = [
        {
            icon: Code,
            title: "REST API",
            desc: "Simple API endpoints for authentication, logs, users, and devices.",
            color: "from-blue-500 to-indigo-600",
            shadowColor: "group-hover:shadow-blue-500/30",
        },
        {
            icon: Cpu,
            title: "SDK Support",
            desc: "Windows, Linux, Android SDKs for direct device communication.",
            color: "from-purple-500 to-pink-600",
            shadowColor: "group-hover:shadow-purple-500/30",
        },
        {
            icon: Cloud,
            title: "Cloud Sync",
            desc: "Automatic multi-branch syncing with real-time dashboards.",
            color: "from-cyan-500 to-blue-600",
            shadowColor: "group-hover:shadow-cyan-500/30",
        },
        {
            icon: Server,
            title: "Local Server",
            desc: "On-premise deployment for high-security environments.",
            color: "from-emerald-500 to-green-600",
            shadowColor: "group-hover:shadow-emerald-500/30",
        },
        {
            icon: Database,
            title: "Database Integration",
            desc: "Connect with SQL, MySQL, or cloud databases for central management.",
            color: "from-orange-500 to-amber-600",
            shadowColor: "group-hover:shadow-orange-500/30",
        },
        {
            icon: Plug,
            title: "Third-Party Systems",
            desc: "Integration with HRM, ERP, gym software, and access control systems.",
            color: "from-rose-500 to-red-600",
            shadowColor: "group-hover:shadow-rose-500/30",
        },
    ];

    return (
        <section
            id="integrations"
            className="relative w-full py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 overflow-hidden">

            <div className="absolute inset-0 opacity-25">
                <div className="absolute top-16 left-10 w-56 h-56 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-16 right-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-20">

                {/* Header */}
                <div className="text-center mb-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-semibold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
                            SEAMLESS CONNECTIVITY
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                        Integrations
                    </h2>

                    <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
                        Powerful API, SDK, and cloud ecosystem built for modern applications.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ml-10">
                    {items.map((item, index) => (
                        <div key={index} className="group relative">

                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />

                            <div className="relative transform transition-all duration-500 group-hover:-translate-y-1.5">

                                {/* Icon */}
                                <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${item.color} mb-4 shadow-lg ${item.shadowColor} transition-all duration-500 group-hover:scale-105`}>
                                    <item.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight leading-none group-hover:text-blue-600 transition-colors duration-300">
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="text-slate-600 text-sm leading-relaxed font-medium mr-20">
                                    {item.desc}
                                </p>

                                {/* Underline */}
                                <div className="mt-3 h-1 w-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full group-hover:w-12 transition-all duration-500" />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
