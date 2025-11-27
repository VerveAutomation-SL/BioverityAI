'use client'

import React, { useState } from 'react';
import { Fingerprint, ScanFace, ArrowRight, Check, Sparkles, ScanLine, HandMetal } from 'lucide-react';

type AuthType = 'fingerprint' | 'face' | 'palm' | 'finger';

export default function Hero() {
    const [activeAuth, setActiveAuth] = useState<AuthType>('fingerprint');

    const authMethods: Record<AuthType, {
        icon: React.ReactElement;
        label: string;
        color: string;
        borderColor: string;
    }> = {
        fingerprint: {
            icon: <Fingerprint className="w-60 h-60 text-blue-400" strokeWidth={1.5} />,
            label: "Fingerprint",
            color: "text-green-600",
            borderColor: "border-green-400"
        },
        face: {
            icon: <ScanFace className="w-60 h-60 text-blue-400" strokeWidth={1.5} />,
            label: "Face ID",
            color: "text-blue-600",
            borderColor: "border-blue-400"
        },
        palm: {
            icon: <HandMetal className="w-60 h-60 text-green-600" strokeWidth={1.5} />,
            label: "Palm Vein",
            color: "text-green-700",
            borderColor: "border-green-400"
        },
        finger: {
            icon: <ScanLine className="w-60 h-60 text-purple-400" strokeWidth={1.5} />,
            label: "Finger Vein",
            color: "text-purple-600",
            borderColor: "border-purple-400"
        }
    };

    return (
        <section className="relative w-full pt-31 pb-4 overflow-hidden bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-30" />
            <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '26px 26px',
                opacity: 0.22
            }} />

            <div className="relative max-w-7xl mx-auto px-10 sm:px-16 lg:px-32">
                <div className="grid lg:grid-cols-2 gap-2 items-center">

                    {/* Left Column */}
                    <div className="space-y-4">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-200 shadow-sm -mt-4">
                            <Sparkles className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-[11px] font-semibold text-green-700">PROFESSIONAL BIOMETRIC RECOGNITION AND SOLUTIONS SUPPLIER</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                            Secure Access
                            <br />
                            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                                Control System
                            </span>
                            <br />
                            in 10 Minutes
                        </h1>

                        {/* Subheadline */}
                        <p className="text-base text-slate-600 leading-snug max-w-sm">
                            AI-powered biometric recognition for offices, gyms, schools, and banks.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                                <span className="text-[12px] text-slate-700 font-medium">7+ biometric authentication types</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                                <span className="text-[12px] text-slate-700 font-medium">Cloud-based multi-location management</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                                <span className="text-[12px] text-slate-700 font-medium">Fast API integration - ready in minutes</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <button className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-bold rounded-md shadow-md hover:scale-105 transition-all">
                                Get Started
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200">
                            <div className="text-center">
                                <div className="text-xl font-black text-green-600 leading-none">10 min</div>
                                <div className="text-[10px] text-slate-600 font-medium">Setup Time</div>
                            </div>
                            <div className="text-center border-x border-slate-200">
                                <div className="text-xl font-black text-blue-600 leading-none">1.0</div>
                                <div className="text-[10px] text-slate-600 font-medium">Version</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-black text-green-700 leading-none">24/7</div>
                                <div className="text-[10px] text-slate-600 font-medium">Support</div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="relative">

                        <div className="relative bg-gradient-to-br from-slate-50 to-green-50 rounded-xl p-2 mt-10 border border-slate-200 shadow-md">

                            <div className="relative aspect-[4/3] bg-white rounded-lg mb-1 overflow-hidden border border-slate-200 flex items-center justify-center">
                                <div className="relative transition-all duration-500">
                                    {authMethods[activeAuth].icon}
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan-line" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-1.5">
                                {(Object.keys(authMethods) as AuthType[]).map((key) => {
                                    const method = authMethods[key];
                                    return (
                                        <button
                                            key={key}
                                            onMouseEnter={() => setActiveAuth(key)}
                                            className={`bg-white rounded-md p-2 text-center border transition-all ${
                                                activeAuth === key 
                                                    ? `${method.borderColor} shadow-md scale-105` 
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {key === 'fingerprint' && <Fingerprint className={`w-5 h-5 ${method.color} mx-auto mb-0.5`} />}
                                            {key === 'face' && <ScanFace className={`w-5 h-5 ${method.color} mx-auto mb-0.5`} />}
                                            {key === 'palm' && <HandMetal className={`w-5 h-5 ${method.color} mx-auto mb-0.5`} />}
                                            {key === 'finger' && <ScanLine className={`w-5 h-5 ${method.color} mx-auto mb-0.5`} />}
                                            <div className="text-[9px] font-bold text-slate-700">{method.label}</div>
                                        </button>
                                    );
                                })}
                            </div>

                        </div>

                    </div>

                </div>
            </div>

            <style jsx>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 1.6s ease-in-out infinite;
        }
      `}</style>
        </section>
    );
}