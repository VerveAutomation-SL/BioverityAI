import Image from "next/image";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function NexusSection() {
  return (
    <section className="relative w-full py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-100 to-transparent rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-blue-100 to-transparent rounded-full blur-3xl opacity-30" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-10 sm:px-16 lg:px-32">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-200 shadow-sm">
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-semibold text-blue-700 tracking-wide">
              EMPLOYEE MANAGEMENT PORTAL
            </span>
          </div>

          {/* Logo */}
          <div className="w-full max-w-xs sm:max-w-sm">
            <Image
              src="/assets/images/nexus-logo.png"
              alt="Nexus"
              width={500}
              height={300}
              className="w-auto h-auto max-w-full mx-auto"
              priority
            />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight max-w-2xl">
            Employee Attendance and{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Leave Management
            </span>
          </h2>

          {/* Description */}
          <p className="text-base text-slate-600 leading-snug max-w-xl">
            Manage employee check-ins, check-outs, leave requests, attendance
            tracking, and workforce operations through the Nexus employee portal.
          </p>

          {/* CTA */}
          <a
            href="https://nexus.bioverityai.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-bold rounded-md shadow-md hover:scale-105 transition-all duration-200"
          >
            Open Nexus Portal
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}