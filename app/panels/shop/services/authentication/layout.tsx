"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  Users,
  UserPlus,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [openEmployees, setOpenEmployees] = useState(
    pathname.startsWith("/panels/shop/services/authentication/employees")
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-slate-200 fixed left-0 top-0 h-screen flex flex-col">
        {/* Logo & Header Section */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center">
              <img
                src="/assets/images/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Attendance System
              </h2>
              <p className="text-xs text-slate-500 font-medium">Manage & Track</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {/* Dashboard */}
          <button
            onClick={() => router.push("/panels/shop/services/authentication")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
              ${
                pathname === "/panels/shop/services/authentication"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 scale-105"
                  : "text-slate-700 hover:bg-slate-100 hover:scale-105"
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          {/* Alerts */}
          <button
            onClick={() =>
              router.push("/panels/shop/services/authentication/alerts")
            }
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
              ${
                pathname === "/panels/shop/services/authentication/alerts"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 scale-105"
                  : "text-slate-700 hover:bg-slate-100 hover:scale-105"
              }`}
          >
            <Bell className="w-5 h-5" />
            <span>Alerts</span>
          </button>

          {/* Employees Dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => setOpenEmployees(!openEmployees)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-200
                ${
                  pathname.startsWith("/panels/shop/services/authentication/employees")
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Employees</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  openEmployees ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Items */}
            <div
              className={`ml-4 pl-4 border-l-2 border-emerald-200 space-y-1 overflow-hidden transition-all duration-300 ${
                openEmployees ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {/* Employee Registration */}
              <button
                onClick={() =>
                  router.push(
                    "/panels/shop/services/authentication/employees/register"
                  )
                }
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                  ${
                    pathname ===
                    "/panels/shop/services/authentication/employees/register"
                      ? "bg-emerald-100 text-emerald-700 font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">Registration</span>
              </button>

              {/* Attendance */}
              <button
                onClick={() =>
                  router.push(
                    "/panels/shop/services/authentication/employees/attendance"
                  )
                }
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                  ${
                    pathname ===
                    "/panels/shop/services/authentication/employees/attendance"
                      ? "bg-emerald-100 text-emerald-700 font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span className="text-sm">Attendance</span>
              </button>

              {/* Reports */}
              <button
                onClick={() =>
                  router.push(
                    "/panels/shop/services/authentication/employees/reports"
                  )
                }
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                  ${
                    pathname ===
                    "/panels/shop/services/authentication/employees/reports"
                      ? "bg-emerald-100 text-emerald-700 font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Reports</span>
              </button>
            </div>
          </div>

          {/* Schedule */}
          <button
            onClick={() =>
              router.push("/panels/shop/services/authentication/schedule")
            }
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
              ${
                pathname === "/panels/shop/services/authentication/schedule"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 scale-105"
                  : "text-slate-700 hover:bg-slate-100 hover:scale-105"
              }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span>Schedule</span>
          </button>
        </nav>

        {/* Footer Info */}
        <div className="w-full p-4 border-t border-slate-200 bg-slate-50 mt-auto">
          <div className="text-xs text-slate-500 text-center">
            <p className="font-medium">Version 1.0.0</p>
            <p className="mt-1">© 2024 Attendance System</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto ml-72">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}