"use client";

import { Mail, Phone, MapPin, Facebook, Linkedin, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative w-full bg-slate-900 text-slate-300 pt-16 pb-10">
      <div className="absolute inset-0 bg-gradient-to-br from-green-800/20 to-blue-800/10 opacity-40" />

      <div className="relative max-w-7xl mx-auto px-10 sm:px-16 lg:px-32">

        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">BioVerity AI</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Advanced biometric identity solutions for access control,
              attendance, and enterprise security.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-green-400 transition">About</a></li>
              <li><a href="#solutions" className="hover:text-green-400 transition">Solutions</a></li>
              <li><a href="#industries" className="hover:text-green-400 transition">Industries</a></li>
              <li><a href="#integrations" className="hover:text-green-400 transition">Integrations</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-400" />
                Negombo, Sri Lanka
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400" />
                +65 9716 0535
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-400" />
                info@bioverityai.com
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Follow Us</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-green-400 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-green-400 transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-green-400 transition">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700 mt-10 pt-6 text-sm text-center text-slate-500">
          © {new Date().getFullYear()} BioVerity AI. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
