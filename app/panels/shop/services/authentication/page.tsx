"use client";

import { Users, UserCheck, UserX, CalendarClock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function AuthenticationDashboard() {
  const stats = [
    {
      title: "Total Employees",
      value: "128",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      title: "Present Today",
      value: "102",
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      title: "On Leave",
      value: "18",
      icon: CalendarClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      title: "Absent",
      value: "8",
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  ];

  const attendanceData = [
    { name: "Present", value: 102, color: "#16a34a" },
    { name: "On Leave", value: 18, color: "#d97706" },
    { name: "Absent", value: 8, color: "#dc2626" },
  ];

  const trendData = [
    { day: "Mon", present: 98, absent: 10 },
    { day: "Tue", present: 105, absent: 7 },
    { day: "Wed", present: 102, absent: 8 },
    { day: "Thu", present: 108, absent: 5 },
    { day: "Fri", present: 102, absent: 8 },
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
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {item.value}
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

            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={224}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {attendanceData.map((entry, index) => (
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

            {/* Line Chart */}
            <ResponsiveContainer width="100%" height={224}>
              <LineChart data={trendData}>
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