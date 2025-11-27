"use client";

import { useState } from "react";
import { Cloud, Server, Plug, Code, Database, Sparkles, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
        {
            icon: MessageCircle,
            title: "After Sales Support",
            desc: "24/7 dedicated support team for maintenance and troubleshooting.",
            color: "from-purple-500 to-pink-600",
            shadowColor: "group-hover:shadow-purple-500/30",
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

            <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                    {item.desc}
                                </p>

                                {/* Underline */}
                                <div className="mt-3 h-1 w-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full group-hover:w-12 transition-all duration-500" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compatible Systems Subsection */}
                <CompatibleSystemsCarousel />

            </div>
        </section>
    );
}

function CompatibleSystemsCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);

    const systems = [
        {
            emoji: "📋",
            title: "Attendance Management",
            desc: "Smart tracking and monitoring for organizations",
            tags: ["Fingerprint Scanner", "Smart Gates"],
            gradient: "from-emerald-500 to-teal-600",
            shadow: "emerald"
        },
        {
            emoji: "💪",
            title: "Gym Management",
            desc: "Membership management for fitness centers",
            tags: ["Apps", "Smart Gates"],
            gradient: "from-orange-500 to-amber-600",
            shadow: "orange"
        },
        {
            emoji: "🅿️",
            title: "Parking System",
            desc: "UHF RFID vehicle access control",
            tags: ["RFID"],
            gradient: "from-blue-500 to-cyan-600",
            shadow: "blue"
        },
        {
            emoji: "🏢",
            title: "Elevator Control",
            desc: "Floor access via biometrics",
            tags: ["Face", "Card"],
            gradient: "from-slate-700 to-slate-900",
            shadow: "slate"
        },
        {
            emoji: "🎓",
            title: "School Systems",
            desc: "Student tracking & parent apps",
            tags: ["Attendance"],
            gradient: "from-green-500 to-emerald-600",
            shadow: "green"
        },
        {
            emoji: "📊",
            title: "ERP Planning",
            desc: "Integrated company management",
            tags: ["Cloud"],
            gradient: "from-purple-500 to-violet-600",
            shadow: "purple"
        },
        {
            emoji: "🚪",
            title: "Smart Gates",
            desc: "Multi-biometric authentication",
            tags: ["Fingerprint", "Face"],
            gradient: "from-indigo-500 to-blue-600",
            shadow: "indigo"
        }
    ];

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % systems.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + systems.length) % systems.length);
    };

    const getCardStyle = (index: number) => {
        const diff = (index - activeIndex + systems.length) % systems.length;

        if (diff === 0) {
            return {
                transform: 'translateX(0) scale(1.05)',
                opacity: 1,
                zIndex: 30,
                filter: 'blur(0px)'
            };
        } else if (diff === 1 || diff === systems.length - 1) {
            const isNext = diff === 1;
            return {
                transform: `translateX(${isNext ? '55%' : '-55%'}) scale(0.70)`,
                opacity: 0.35,
                zIndex: 20,
                filter: 'blur(2px)'
            };
        } else if (diff === 2 || diff === systems.length - 2) {
            const isNext = diff === 2;
            return {
                transform: `translateX(${isNext ? '110%' : '-110%'}) scale(0.55)`,
                opacity: 0.15,
                zIndex: 10,
                filter: 'blur(3px)'
            };
        } else {
            return {
                transform: 'scale(0.45)',
                opacity: 0,
                zIndex: 0,
                filter: 'blur(3px)'
            };
        }
    };

    return (
        <div className="mt-12">
            <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                    Compatible Systems
                </h3>
                <p className="text-slate-600 text-xs max-w-xl mx-auto">
                    Seamlessly integrate with various business management systems
                </p>
            </div>

            {/* Carousel Container */}
            <div className="relative h-[360px] flex items-center justify-center perspective-1000 overflow-hidden">

                {/* Navigation Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-2 z-40 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:bg-blue-500 group"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-800 group-hover:text-white" strokeWidth={3} />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-2 z-40 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 hover:bg-blue-500 group"
                >
                    <ChevronRight className="w-5 h-5 text-slate-800 group-hover:text-white" strokeWidth={3} />
                </button>

                {/* Cards */}
                <div className="relative w-full max-w-xs h-full flex items-center justify-center">
                    {systems.map((system, index) => {
                        const style = getCardStyle(index);
                        const isActive = index === activeIndex;

                        return (
                            <div
                                key={index}
                                className="absolute w-full transition-all duration-700 ease-out cursor-pointer"
                                style={style}
                                onClick={() => setActiveIndex(index)}
                            >
                                <div className={`relative bg-gradient-to-br ${system.gradient} rounded-2xl p-6 shadow-xl`}>
                                    <div className={`absolute inset-0 bg-${system.shadow}-900/40 rounded-2xl translate-y-2 translate-x-2 -z-10 blur-md`} />
                                    <div className={`absolute inset-0 bg-${system.shadow}-800/30 rounded-2xl translate-y-4 translate-x-4 -z-20 blur-xl`} />

                                    {isActive && (
                                        <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse" />
                                    )}

                                    <div className="relative text-white text-center">
                                        <div className="text-6xl mb-4 drop-shadow-xl">
                                            {system.emoji}
                                        </div>
                                        <h4 className="text-2xl font-black mb-2 tracking-tight">{system.title}</h4>
                                        <p className="text-white/95 text-sm leading-snug mb-4 font-medium">
                                            {system.desc}
                                        </p>
                                        <div className="flex gap-2 justify-center flex-wrap">
                                            {system.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-white/25 rounded-lg text-xs font-bold backdrop-blur-md border border-white/30 shadow"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
                    {systems.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`transition-all duration-300 rounded-full ${
                                index === activeIndex
                                    ? 'w-8 h-2 bg-gradient-to-r from-blue-500 to-cyan-500'
                                    : 'w-2 h-2 bg-slate-400 hover:bg-slate-600'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* API Integration Banner */}
            <div className="mt-12 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 shadow-xl transform group-hover:scale-[1.02] transition-all duration-500">
                    <div className="flex items-center justify-between text-white flex-wrap gap-4">
                        <div>
                            <h4 className="text-2xl sm:text-3xl font-black mb-1 tracking-tight">
                                Fast API Integration ⚡
                            </h4>
                            <p className="text-white/95 text-sm sm:text-lg font-medium">
                                Complete integration test in just <span className="font-black text-xl sm:text-2xl">10 minutes</span>
                            </p>
                        </div>
                        <div className="text-6xl sm:text-7xl drop-shadow-2xl animate-pulse">⚡</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
