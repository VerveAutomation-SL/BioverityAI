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
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-5">
        <h2 className="text-xl font-bold text-emerald-700 mb-6">
          Authentication
        </h2>

        <nav className="space-y-1 text-sm">

          {/* Dashboard */}
          <button
            onClick={() =>
              router.push("/panels/shop/services/authentication")
            }
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold
              ${
                pathname === "/panels/shop/services/authentication"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>

          {/* Alerts */}
          <button
            onClick={() =>
              router.push("/panels/shop/services/authentication/alerts")
            }
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold
              ${
                pathname ===
                "/panels/shop/services/authentication/alerts"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <Bell className="w-5 h-5" />
            Alerts
          </button>

          {/* Employees (Dropdown) */}
          <div>
            <button
              onClick={() => setOpenEmployees(!openEmployees)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Employees
              </div>
              <span
                className={`transition-transform ${
                  openEmployees ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {openEmployees && (
              <div className="ml-8 mt-1 space-y-1">

                {/* Employee Registration */}
                <button
                  onClick={() =>
                    router.push(
                      "/panels/shop/services/authentication/employees/register"
                    )
                  }
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg
                    ${
                      pathname ===
                      "/panels/shop/services/authentication/employees/register"
                        ? "bg-emerald-100 text-emerald-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Employee Registration
                </button>

                {/* Attendance */}
                <button
                  onClick={() =>
                    router.push(
                      "/panels/shop/services/authentication/employees/attendance"
                    )
                  }
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg
                    ${
                      pathname ===
                      "/panels/shop/services/authentication/employees/attendance"
                        ? "bg-emerald-100 text-emerald-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Attendance Marking
                </button>

                {/* Reports */}
                <button
                  onClick={() =>
                    router.push(
                      "/panels/shop/services/authentication/employees/reports"
                    )
                  }
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg
                    ${
                      pathname ===
                      "/panels/shop/services/authentication/reports"
                        ? "bg-emerald-100 text-emerald-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Reports
                </button>

              </div>
            )}
          </div>

          {/* Schedule */}
          <button
            onClick={() =>
              router.push("/panels/shop/services/authentication/schedule")
            }
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold mt-2
              ${
                pathname ===
                "/panels/shop/services/authentication/schedule"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <CalendarDays className="w-5 h-5" />
            Schedule
          </button>

        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
