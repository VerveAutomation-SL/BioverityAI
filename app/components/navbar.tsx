"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-300"
                : "bg-slate-100/95 backdrop-blur-md border-b border-slate-300"
                }`}
        >
            <div className="max-w-7xl mx-auto px-10 sm:px-16 lg:px-32">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <a href="#" className="transition-transform hover:scale-105 duration-300">
                        <img
                            src="/assets/images/logo.png"
                            alt="BioVerity AI Logo"
                            className="h-15 w-auto"
                        />
                    </a>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-1">
                        <a
                            className="px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                            href="#about"
                        >
                            About
                        </a>

                        {/* Solutions Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium">
                                Solutions
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="p-2">
                                    <a
                                        href="#access-control"
                                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                    >
                                        Access Control Systems
                                    </a>

                                    <a
                                        href="#attendance"
                                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                    >
                                        Employee Attendance System
                                    </a>

                                    <a
                                        href="#mobile-attendance"
                                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                    >
                                        Mobile Face Attendance App
                                    </a>

                                    <a
                                        href="#elevator"
                                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                    >
                                        Elevator Access Control
                                    </a>

                                    <a
                                        href="#parking"
                                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                    >
                                        Parking & UHF RFID System
                                    </a>

                                    <a
                                        href="#gym"
                                        className="block px-4 py-3 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                    >
                                        Smart Gates Solutions
                                    </a>
                                </div>
                            </div>
                        </div>

                        <a
                            className="px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                            href="#industries"
                        >
                            Industries
                        </a>

                        <a
                            className="px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                            href="#integrations"
                        >
                            Integration
                        </a>

                        <a
                            className="px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium"
                            href="#integrations"
                        >
                            Shop
                        </a>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden lg:flex items-center gap-3">
                        <button className="px-5 py-2.5 text-slate-700 hover:text-green-600 font-semibold transition-colors duration-200">
                            Login  / Register
                        </button>
                        <a
                            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-300"
                            href="#contact"
                        >
                            Contact Us
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-slate-200 shadow-lg">
                    <div className="px-4 py-6 space-y-3">
                        <a
                            href="#about"
                            className="block px-4 py-3 text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
                        >
                            About
                        </a>

                        {/* Mobile Solutions */}
                        <div className="space-y-2">
                            <div className="px-4 py-2 text-sm font-semibold text-slate-500">Solutions</div>

                            <a
                                href="#access-control"
                                className="block px-4 py-2 text-sm text-slate-600 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors ml-4"
                            >
                                Access Control Systems
                            </a>

                            <a
                                href="#attendance"
                                className="block px-4 py-2 text-sm text-slate-600 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors ml-4"
                            >
                                Employee Attendance System
                            </a>

                            <a
                                href="#mobile-attendance"
                                className="block px-4 py-2 text-sm text-slate-600 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors ml-4"
                            >
                                Mobile Face Attendance App
                            </a>

                            <a
                                href="#elevator"
                                className="block px-4 py-2 text-sm text-slate-600 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors ml-4"
                            >
                                Elevator Access Control
                            </a>

                            <a
                                href="#parking"
                                className="block px-4 py-2 text-sm text-slate-600 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors ml-4"
                            >
                                Parking & UHF RFID System
                            </a>

                            <a
                                href="#gym"
                                className="block px-4 py-2 text-sm text-slate-600 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors ml-4"
                            >
                                Smart Gates Solutions
                            </a>
                        </div>

                        <a
                            href="#integrations"
                            className="block px-4 py-3 text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
                        >
                            Integration
                        </a>

                        <a
                            href="#integrations"
                            className="block px-4 py-3 text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors font-medium"
                        >
                            Shop
                        </a>


                        <div className="flex gap-3 mt-4">
                            <button className="flex-1 px-6 py-3 text-slate-700 border-2 border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                                Login / Register
                            </button>
                            <a 
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-green-500/30"
                            href="#contact"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}