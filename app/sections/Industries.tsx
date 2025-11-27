"use client";

import { Building2, Hospital, Utensils, Hotel, Factory, Banknote, Stethoscope, Sparkles, CheckCircle2 } from "lucide-react";

export default function Industries() {
    return (
        <section 
        id="industries"
        className="w-full py-10 bg-emerald-500">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20">

                {/* Header */}
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-semibold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
                            TRUSTED ACROSS INDUSTRIES
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-snug tracking-tight">
                        Industries We{" "}
                        Serve

                    </h2>

                    <p className="text-emerald-50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
                        Flexible biometric solutions customized for every environment, delivering security and efficiency.
                    </p>
                </div>

                {/* Desktop Grid Layout */}
                <div className="hidden lg:grid grid-cols-9 grid-rows-9 gap-3 h-[620px] ml-10">
                    {/* Hotels */}
                    <div className="col-start-1 col-span-5 row-start-1 row-span-3 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-4 shadow-xl hover:shadow-purple-500/40 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/20 rounded-full blur-xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-lg">
                                <Hotel className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2 tracking-tight leading-none">Hotels</h3>
                            <p className="text-purple-50 text-sm font-semibold leading-snug">Seamless guest access & room management</p>
                        </div>
                    </div>

                    {/* Clinics */}
                    <div className="col-start-6 col-span-4 row-start-1 row-span-3 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-4 shadow-xl hover:shadow-cyan-500/40 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-lg">
                                <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2 leading-none">Clinics</h3>
                            <p className="text-cyan-50 text-sm font-semibold">HIPAA-compliant patient protection</p>
                        </div>
                    </div>

                    {/* Banks */}
                    <div className="col-start-6 col-span-2 row-start-4 row-span-3 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-green-600 p-3 shadow-xl hover:shadow-emerald-500/40 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 right-0 w-14 h-14 bg-white/10 rounded-full blur-lg" />
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-green-400/20 rounded-full blur-lg" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-all shadow-lg">
                                <Banknote className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-black text-white leading-none">Banks</h3>
                            <p className="text-emerald-50 text-xs font-semibold">Vault & access control</p>
                        </div>
                    </div>

                    {/* Restaurants */}
                    <div className="col-start-8 col-span-2 row-start-4 row-span-3 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-3 shadow-xl hover:shadow-orange-500/40 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                        <div className="relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-all shadow-lg">
                                <Utensils className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-black text-white leading-none">Restaurants</h3>
                            <p className="text-orange-50 text-xs font-semibold">Staff tracking & POS security</p>
                        </div>
                    </div>

                    {/* Hospitals */}
                    <div className="col-start-1 col-span-5 row-start-4 row-span-3 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-4 shadow-xl hover:shadow-red-500/40 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-lg">
                                <Hospital className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white leading-none mb-2">Hospitals</h3>
                            <p className="text-red-50 text-sm font-semibold mb-1">Critical patient safety</p>
                            <div className="flex items-start gap-2 text-white/90 text-xs font-semibold">
                                <CheckCircle2 className="w-3 h-3 mt-0.5" />
                                <span>Emergency access & medication security</span>
                            </div>
                        </div>
                    </div>

                    {/* Offices */}
                    <div className="col-start-6 col-span-4 row-start-7 row-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                        <div className="relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-all shadow-lg">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-black text-white leading-none">Offices</h3>
                            <p className="text-blue-50 text-xs font-semibold">Smart floor access</p>
                        </div>
                    </div>

                    {/* Factories */}
                    <div className="col-start-1 col-span-5 row-start-7 row-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 to-gray-700 p-3 shadow-xl hover:shadow-slate-500/40 transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                        <div className="relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-all shadow-lg">
                                <Factory className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-black text-white leading-none">Factories</h3>
                            <p className="text-slate-50 text-xs font-semibold">Shift tracking & zone control</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Grid Layout - 2 columns */}
                <div className="grid lg:hidden grid-cols-2 gap-4">

                    {/* Hotels */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer min-h-[200px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                                <Hotel className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight leading-none">Hotels</h3>
                            <p className="text-purple-50 text-sm font-semibold leading-snug">
                                Guest access & room management
                            </p>
                        </div>
                    </div>

                    {/* Clinics */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer min-h-[200px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight leading-none">Clinics</h3>
                            <p className="text-cyan-50 text-sm font-semibold leading-snug">
                                HIPAA-compliant patient protection
                            </p>
                        </div>
                    </div>

                    {/* Hospitals */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 p-6 shadow-2xl hover:shadow-red-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer min-h-[200px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute bottom-0 right-0 w-28 h-28 bg-rose-400/20 rounded-full blur-2xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                                <Hospital className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 leading-none tracking-tight">Hospitals</h3>
                            <p className="text-red-50 text-sm font-semibold leading-snug">
                                Patient safety & staff tracking
                            </p>
                        </div>
                    </div>

                    {/* Banks */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer min-h-[200px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-400/20 rounded-full blur-2xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                                <Banknote className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight leading-none">Banks</h3>
                            <p className="text-emerald-50 text-sm font-semibold leading-snug">
                                Vault security & access control
                            </p>
                        </div>
                    </div>

                    {/* Restaurants */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 p-6 shadow-2xl hover:shadow-orange-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer min-h-[200px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                                <Utensils className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 leading-none">Restaurants</h3>
                            <p className="text-orange-50 text-sm font-semibold leading-snug">
                                Staff tracking & POS security
                            </p>
                        </div>
                    </div>

                    {/* Offices */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer min-h-[200px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white leading-none mb-2">Offices</h3>
                            <p className="text-blue-50 text-sm font-semibold leading-snug">
                                Smart floor & meeting room access
                            </p>
                        </div>
                    </div>

                    {/* Factories */}
                    <div className="col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-600 to-gray-700 p-6 shadow-2xl hover:shadow-slate-500/50 transition-all duration-500 hover:scale-[1.02] cursor-pointer min-h-[180px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-400/20 rounded-full blur-3xl" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg">
                                <Factory className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white leading-none mb-2">Factories</h3>
                            <p className="text-slate-50 text-sm font-semibold leading-snug">
                                Automated shift tracking & zone control
                            </p>
                        </div>
                    </div>

                </div>

               {/* Bottom Text */}
                <div className="mt-8 lg:-mt-5 text-center">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group">
                        <p className="text-emerald-50 text-sm sm:text-base font-medium">
                            Don't see your industry?
                        </p>
                        <a href="#contact" className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl font-bold text-sm sm:text-base hover:bg-emerald-50 hover:scale-105 hover:shadow-2xl transition-all duration-300 group-hover:translate-x-1">
                            <span>Contact Us</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
}