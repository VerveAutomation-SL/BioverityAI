"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <a href="#">
          <Image
            src="/assets/images/logo.png"
            alt="BioVerity AI Logo"
            width={140}
            height={40}
            priority
          />
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <a className="hover:text-gray-600" href="#">About</a>
          <a className="hover:text-gray-600" href="#">Solutions</a>
          <a className="hover:text-gray-600" href="#">Integration</a>
          <a className="hover:text-gray-600" href="#">Contact</a>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Get a Demo
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col gap-4 px-4 pb-4">
          <a href="#">About</a>
          <a href="#">Solutions</a>
          <a href="#">Integration</a>
          <a href="#">Contact</a>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Get a Demo
          </button>
        </div>
      )}
    </nav>
  );
}
