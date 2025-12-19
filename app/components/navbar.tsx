"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/panels/shop") || pathname.startsWith("/panels/admin")) {
    return null;
  }

  if (pathname === "/login") {
    return (
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-300"
            : "bg-slate-100/95 backdrop-blur-md border-b border-slate-300"
        }`}
      >
        <div className="max-w-7xl mx-auto px-10 sm:px-16 lg:px-32">
          <div className="flex items-center justify-between h-20">

            {/* Logo → Home */}
            <Image
              src="/assets/images/logo.png"
              alt="BioVerity AI Logo"
              width={55}
              height={55}
              className="cursor-pointer"
              onClick={() => router.push("/")}
            />

            {/* Go Back Button */}
            <button
              onClick={() => router.push("/")}
              className="group relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 
              text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-green-700 
              hover:to-emerald-800 transition-all duration-300 flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 
              group-hover:opacity-20 transition-opacity duration-300"></div>

              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>

              <span className="relative z-10">Go Back</span>

              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform 
              duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
            </button>

          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-300"
          : "bg-slate-100/95 backdrop-blur-md border-b border-slate-300"
      }`}
    >
      <div className="max-w-7xl mx-auto px-10 sm:px-16 lg:px-32">
        <div className="flex items-center justify-between h-20">

          <a href="/" className="transition-transform hover:scale-105 duration-300">
            <Image
              src="/assets/images/logo.png"
              alt="BioVerity AI Logo"
              width={60}
              height={60}
            />
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">

            <a className="px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg 
              transition-all font-medium" href="/#about">
              About
            </a>

            {/* Solutions Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-4 py-2 text-slate-700 
                hover:text-green-600 hover:bg-green-50 rounded-lg transition-all font-medium">
                Solutions
                <ChevronDown className="w-4 h-4" />
              </button>

              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border 
                border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                transition-all duration-200">
                <div className="p-2">

                  <a href="/#access-control" className="block px-4 py-3 text-sm text-slate-700 
                    hover:bg-green-50 hover:text-green-600 rounded-lg">
                    Access Control Systems
                  </a>

                  <a href="/#attendance" className="block px-4 py-3 text-sm text-slate-700 
                    hover:bg-green-50 hover:text-green-600 rounded-lg">
                    Employee Attendance System
                  </a>

                  <a href="/#mobile-attendance" className="block px-4 py-3 text-sm text-slate-700 
                    hover:bg-green-50 hover:text-green-600 rounded-lg">
                    Mobile Face Attendance App
                  </a>

                  <a href="/#elevator" className="block px-4 py-3 text-sm text-slate-700 
                    hover:bg-green-50 hover:text-green-600 rounded-lg">
                    Elevator Access Control
                  </a>

                  <a href="/#parking" className="block px-4 py-3 text-sm text-slate-700 
                    hover:bg-green-50 hover:text-green-600 rounded-lg">
                    Parking & UHF RFID System
                  </a>

                  <a href="/#gym" className="block px-4 py-3 text-sm text-slate-700 
                    hover:bg-green-50 hover:text-green-600 rounded-lg">
                    Smart Gates Solutions
                  </a>
                </div>
              </div>
            </div>

            <a className="px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg 
              transition-all font-medium" href="/#industries">
              Industries
            </a>

            <a className="px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg 
              transition-all font-medium" href="/#integrations">
              Integration
            </a>

            <a className="px-4 py-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg 
              transition-all font-medium" href="/Shop">
              Shop
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="/login" className="px-6 py-3 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 
              transition-colors">
              Login / Register
            </a>

            <a href="#contact" className="px-6 py-2.5 bg-linear-to-r from-green-600 to-blue-600 text-white 
              rounded-lg font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 
              hover:scale-105 transition-all duration-300">
              Contact Us
            </a>
          </div>

          {/* Mobile Button */}
          <button
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
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

            <a href="/#about" className="block px-4 py-3 text-slate-700 hover:bg-green-50 
              hover:text-green-600 rounded-lg font-medium">
              About
            </a>

            {/* Mobile Solutions */}
            <div className="space-y-2">
              <div className="px-4 py-2 text-sm font-semibold text-slate-500">Solutions</div>

              <a href="/#access-control" className="block px-4 py-2 text-sm text-slate-600 
                hover:bg-green-50 hover:text-green-600 rounded-lg ml-4">
                Access Control Systems
              </a>

              <a href="/#attendance" className="block px-4 py-2 text-sm text-slate-600 
                hover:bg-green-50 hover:text-green-600 rounded-lg ml-4">
                Employee Attendance System
              </a>

              <a href="/#mobile-attendance" className="block px-4 py-2 text-sm text-slate-600 
                hover:bg-green-50 hover:text-green-600 rounded-lg ml-4">
                Mobile Face Attendance App
              </a>

              <a href="/#elevator" className="block px-4 py-2 text-sm text-slate-600 
                hover:bg-green-50 hover:text-green-600 rounded-lg ml-4">
                Elevator Access Control
              </a>

              <a href="/#parking" className="block px-4 py-2 text-sm text-slate-600 
                hover:bg-green-50 hover:text-green-600 rounded-lg ml-4">
                Parking & UHF RFID System
              </a>

              <a href="/#gym" className="block px-4 py-2 text-sm text-slate-600 
                hover:bg-green-50 hover:text-green-600 rounded-lg ml-4">
                Smart Gates Solutions
              </a>
            </div>

            <a href="/#integrations" className="block px-4 py-3 text-slate-700 hover:bg-green-50 
              hover:text-green-600 rounded-lg font-medium">
              Integration
            </a>

            <a href="/shop" className="block px-4 py-3 text-slate-700 hover:bg-green-50 
              hover:text-green-600 rounded-lg font-medium">
              Shop
            </a>

            <div className="flex gap-3 mt-4">
              <a href="/login" className="flex-1 px-6 py-3 text-slate-700 rounded-lg font-semibold 
                hover:bg-slate-50 text-center">
                Login / Register
              </a>

              <a href="#contact" className="flex-1 px-6 py-3 bg-linear-to-r from-green-600 to-blue-600 
                text-white rounded-lg font-semibold shadow-lg shadow-green-500/30">
                Contact Us
              </a>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}