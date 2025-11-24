"use client";

import { Building2, Cloud, Zap, Shield, Users, TrendingUp, CheckCircle2, Sparkles } from "lucide-react";

export default function About() {
    const stats = [
        {
            icon: Building2,
            value: "10+",
            label: "Industries Served",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            icon: Cloud,
            value: "Multi-Branch",
            label: "Cloud Management",
            color: "text-cyan-600",
            bgColor: "bg-cyan-50",
            borderColor: "border-cyan-200"
        },
        {
            icon: Zap,
            value: "AI Driven",
            label: "Fast & Accurate Recognition",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        }
    ];

    const features = [
        {
            icon: Shield,
            title: "Enterprise Security",
            description: "Military-grade encryption and multi-factor authentication",
            color: "text-blue-600",
            bgGradient: "from-blue-50 to-cyan-50"
        },
        {
            icon: Users,
            title: "Scalable Solutions",
            description: "From single locations to global enterprise deployments",
            color: "text-cyan-600",
            bgGradient: "from-cyan-50 to-teal-50"
        },
        {
            icon: TrendingUp,
            title: "Real-Time Analytics",
            description: "Comprehensive dashboards with instant insights and reporting",
            color: "text-green-600",
            bgGradient: "from-teal-50 to-green-50"
        }
    ];

    return (
        <section 
        id="about"
        className="relative w-full py-14 bg-gradient-to-bl from-blue-50 via-white to-greeen-50 overflow-hidden">
            <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-transparent to-green-100 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-100 to-transparent rounded-full blur-3xl opacity-30" />
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                backgroundSize: '30px 30px'
            }} />

            <div className="relative max-w-7xl mx-auto px-10 sm:px-16 lg:px-32">

                {/* Badge */}
                <div className="flex justify-center mb-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-full border border-blue-200 shadow-sm">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-700">TRUSTED BY LEADING ORGANIZATIONS</span>
                    </div>
                </div>

                {/* Heading */}
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 text-center mb-4 leading-tight">
                    About{" "}
                    <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
                        BioVerity AI
                    </span>
                </h2>

                {/* Subtext */}
                <p className="text-lg text-slate-600 max-w-3xl mx-auto text-center leading-relaxed mb-10">
                    BioVerity AI delivers advanced biometric solutions that automate secure access,
                    attendance tracking, and identity verification across businesses, schools, gyms,
                    banks, and enterprise facilities. Built with multi-biometric technology and
                    cloud-based management, our systems support fast deployment and real-time control.
                </p>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`group relative bg-white ${stat.borderColor} border-2 rounded-2xl p-5 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300`}
                        >
                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-14 h-14 ${stat.bgColor} rounded-2xl mb-3 group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>

                            {/* Value */}
                            <div className={`text-3xl font-black ${stat.color} mb-1`}>
                                {stat.value}
                            </div>

                            {/* Label */}
                            <div className="text-sm text-slate-600 font-semibold">
                                {stat.label}
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 to-green-400/0 group-hover:from-blue-400/10 group-hover:to-green-400/10 transition-all duration-300" />
                        </div>
                    ))}
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`group relative bg-gradient-to-br ${feature.bgGradient} border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-2 transition-all duration-300`}
                        >
                            {/* Icon */}
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-md mb-4 group-hover:shadow-lg group-hover:scale-110 transition-all">
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                {feature.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Check Icon */}
                            <div className="absolute top-5 right-5">
                                <CheckCircle2 className={`w-5 h-5 ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
