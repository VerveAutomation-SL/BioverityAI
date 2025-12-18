"use client";

import { CheckCircle2, XCircle, ClipboardCheck, Users, Calendar, TrendingUp, Clock } from "lucide-react";

export default function AttendancePage() {
  // Dummy data (replace with real data later)
  const employees = [
    {
      id: "EMP-001",
      name: "John Doe",
      role: "Software Engineer",
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      status: "present",
      checkInTime: "09:15 AM",
    },
  ];

  const presentCount = employees.filter(e => e.status === "present").length;
  const absentCount = employees.filter(e => e.status === "absent").length;
  const totalCount = employees.length;
  const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : 0;

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Attendance Marking
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-15">
          <Calendar className="w-5 h-5 text-slate-500" />
          <p className="text-slate-600 text-lg">
            {today}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Total Employees</p>
          <p className="text-3xl font-bold text-slate-800">{totalCount}</p>
        </div>

        {/* Present */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Present</p>
          <p className="text-3xl font-bold text-emerald-700">{presentCount}</p>
        </div>

        {/* Absent */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Absent</p>
          <p className="text-3xl font-bold text-red-700">{absentCount}</p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Attendance Rate</p>
          <p className="text-3xl font-bold text-purple-700">{attendanceRate}%</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                Employee Attendance
              </h2>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-600 mb-2">No employees registered yet</p>
            <p className="text-sm text-slate-500">Add employees to start tracking attendance</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-sm text-slate-600 border-b border-slate-200">
                  <th className="p-4 font-semibold">
                    Employee
                  </th>
                  <th className="p-4 font-semibold text-center">
                    Attendance
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    {/* Employee Info */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shadow-md"
                          />
                          {emp.status === "present" && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-lg">
                            {emp.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {emp.role}
                          </p>
                          {emp.status === "present" && emp.checkInTime && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <p className="text-xs text-emerald-600 font-semibold">
                                Check-in: {emp.checkInTime}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Attendance Status */}
                    <td className="p-5 text-center">
                      {emp.status === "present" ? (
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full font-semibold shadow-sm border border-emerald-200">
                          <CheckCircle2 className="w-5 h-5" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-full font-semibold shadow-sm border border-red-200">
                          <XCircle className="w-5 h-5" />
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {employees.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600 text-center">
            Showing {employees.length} employee{employees.length !== 1 ? 's' : ''} • 
            <span className="text-emerald-600 font-semibold ml-1">{presentCount} Present</span> • 
            <span className="text-red-600 font-semibold ml-1">{absentCount} Absent</span>
          </div>
        )}
      </div>
    </div>
  );
}