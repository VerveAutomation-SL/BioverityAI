'use client'

import React from 'react';
import { Fingerprint, Shield, Zap, ArrowRight, Check, Sparkles } from 'lucide-react';

export default function Hero() {
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
                                <div className="text-xl font-black text-blue-600 leading-none">99.9%</div>
                                <div className="text-[10px] text-slate-600 font-medium">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-black text-green-700 leading-none">24/7</div>
                                <div className="text-[10px] text-slate-600 font-medium">Support</div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="relative">

                        <div className="relative bg-gradient-to-br from-slate-50 to-green-50 rounded-xl p-2 border border-slate-200 shadow-md">

                            <div className="relative aspect-[4/3] bg-white rounded-lg mb-1 overflow-hidden border border-slate-200 flex items-center justify-center">
                                <div className="relative">
                                    <Fingerprint className="w-60 h-60 text-blue-400" />
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan-line" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                                <div className="bg-white rounded-md p-2 text-center border border-slate-200 hover:border-green-300 transition-all">
                                    <Fingerprint className="w-5 h-5 text-green-600 mx-auto mb-0.5" />
                                    <div className="text-[9px] font-bold text-slate-700">Fingerprint</div>
                                </div>
                                <div className="bg-white rounded-md p-2 text-center border border-slate-200 hover:border-blue-300 transition-all">
                                    <Shield className="w-5 h-5 text-blue-600 mx-auto mb-0.5" />
                                    <div className="text-[9px] font-bold text-slate-700">Face ID</div>
                                </div>
                                <div className="bg-white rounded-md p-2 text-center border border-slate-200 hover:border-green-300 transition-all">
                                    <Zap className="w-5 h-5 text-green-700 mx-auto mb-0.5" />
                                    <div className="text-[9px] font-bold text-slate-700">Palm Vein</div>
                                </div>
                            </div>

                        </div>

                        <div className="absolute -top-3 -right-3 bg-white rounded-lg px-3 py-1.5 shadow border border-green-200 z-10">
                            <div className="text-lg font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent leading-none">99.9%</div>
                            <div className="text-[8px] font-bold text-slate-600 leading-none">Accuracy</div>
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