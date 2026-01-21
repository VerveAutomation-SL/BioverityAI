"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, CalendarClock, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supabase } from "@/lib/supabaseClient";

export default function AuthenticationDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    fetchEmployeeCount();
    loadDashboard();
  }, []);

  const fetchEmployeeCount = async () => {
    try {
      setLoading(true);
      setError("");

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      let orgId = null;

      orgId = localStorage.getItem("org_id");

      if (!orgId && user.user_metadata?.org_id) {
        orgId = user.user_metadata.org_id;
      }

      if (!orgId) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        if (profile?.org_id) {
          orgId = profile.org_id;
          localStorage.setItem("org_id", orgId);
        }
      }

      if (!orgId) {
        setError("Organization ID not found. Please check your profile settings.");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/employees/fetch?org_id=${orgId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error("Error fetching employees:", errorData);
        setError(`Failed to load employees: ${errorData.error || response.statusText}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTotalEmployees(data.employees?.length || 0);

    } catch (err) {
      console.error("Error fetching employee count:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No session token");
        return;
      }

      const res = await fetch("/api/dashboard/attendance", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Dashboard API error:", err);
        return;
      }

      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };


  const stats = [
    {
      title: "Total Employees",
      value: dashboard?.totalEmployees ?? (loading ? "..." : totalEmployees.toString()),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      title: "Present Today",
      value: dashboard?.presentToday ?? "...",
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      title: "On Leave",
      value: "0",
      icon: CalendarClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      title: "Absent",
      value: dashboard?.absentToday ?? "...",
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Authentication Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of employee attendance and access status
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={fetchEmployeeCount}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => (
            <div
              key={item.title}
              className={`bg-white border-2 ${item.border} rounded-2xl p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {item.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-800 mt-1 flex items-center gap-2">
                    {item.value}
                    {item.title === "Total Employees" && loading && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    )}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}
                >
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Attendance Status */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Attendance Status
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Distribution of employee attendance
            </p>

            <ResponsiveContainer width="100%" height={224}>
              <PieChart>
                <Pie
                  data={dashboard?.pie || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {(dashboard?.pie || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Attendance Trend */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Daily Attendance Trend
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Attendance movement across days
            </p>

            <ResponsiveContainer width="100%" height={224}>
              <LineChart data={dashboard?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#16a34a"
                  strokeWidth={2}
                  name="Present"
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="#dc2626"
                  strokeWidth={2}
                  name="Absent"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}