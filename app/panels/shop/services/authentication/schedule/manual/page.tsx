"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, Clock, Mail, User, Download, Save, Search, FileText, CheckCircle, AlertCircle } from "lucide-react";

// Types
interface Employee {
  id: string;
  full_name: string;
  employee_id: string;
  email?: string;
}

interface Schedule {
  start_time?: string;
  end_time?: string;
}

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

// Toast Component
function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in z-50 min-w-[300px]`}>
      <span className="text-xl font-bold">{icon}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200 text-xl font-bold">×</button>
    </div>
  );
}

export default function ManualSchedulePage() {
  const [org_id, setOrgId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profile?.org_id) {
        setOrgId(profile.org_id);
      }
    })();
  }, []);

  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportDate, setReportDate] = useState("");

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setReportDate(today);
  }, []);

  async function searchEmployees(q: string) {
    setQuery(q);

    if (!org_id || q.length < 1) {
      setEmployees([]);
      return;
    }

    const res = await fetch(`/api/employees/search?org_id=${org_id}&q=${q}`);
    const data = await res.json();
    setEmployees(data.employees || []);
  }

  async function fetchSchedule(employee_id: string, date: string) {
    if (!employee_id || !date) return;

    const res = await fetch(`/api/manual-schedule/status?employee_id=${employee_id}&date=${date}`);
    const data = await res.json();
    setSchedule(data.schedule);

    if (data.schedule) {
      if (data.schedule.start_time) setStartTime(data.schedule.start_time);
      if (data.schedule.end_time) setEndTime(data.schedule.end_time);
    }
  }

  useEffect(() => {
    if (selectedEmployee && date) {
      fetchSchedule(selectedEmployee.id, date);
    } else {
      setSchedule(null);
    }
  }, [selectedEmployee, date]);

  function resetForNextEmployee() {
    setSelectedEmployee(null);
    setQuery("");
    setEmail("");
    setStartTime("");
    setEndTime("");
    setSchedule(null);
    setEmployees([]);
  }

  async function markArrival() {
    if (!selectedEmployee) {
      showToast("Please select an employee", "error");
      return;
    }
    if (!startTime) {
      showToast("Please enter check-in time", "error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/manual-schedule/arrival", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        org_id,
        employee_id: selectedEmployee.id,
        email,
        schedule_date: date,
        start_time: startTime,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      showToast("Failed to mark arrival", "error");
      return;
    }

    showToast("Arrival marked successfully!", "success");
    resetForNextEmployee();
  }

  async function markDeparture() {
    if (!selectedEmployee) {
      showToast("Please select an employee", "error");
      return;
    }
    if (!endTime) {
      showToast("Please enter check-out time", "error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/manual-schedule/departure", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: selectedEmployee.id,
        schedule_date: date,
        end_time: endTime,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      showToast("Failed to mark departure", "error");
      return;
    }

    showToast("Departure marked successfully!", "success");
    fetchSchedule(selectedEmployee.id, date);
  }

  const isArrivalState = !schedule;
  const isDepartureState = schedule && !schedule.end_time;
  const isCompletedState = schedule && schedule.end_time;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manual Schedule</h1>
          <p className="text-gray-600">Create and manage employee schedules manually</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Employee Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Search Employee
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Type to search employee..."
                  value={query}
                  onChange={(e) => searchEmployees(e.target.value)}
                  disabled={!!(isDepartureState || isCompletedState) || undefined}
                />

                {employees.length > 0 && (
                  <div className="absolute z-50 w-full border border-gray-200 rounded-xl bg-white shadow-2xl mt-2 max-h-60 overflow-y-auto">
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-4 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setQuery(emp.full_name);
                          setEmployees([]);
                        }}
                      >
                        <div className="font-medium text-gray-900">{emp.full_name}</div>
                        <div className="text-sm text-gray-500">ID: {emp.employee_id}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Employee Badge */}
              {selectedEmployee && (
                <div className="mt-3 inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-sm font-medium">
                  <User className="w-4 h-4 mr-2" />
                  {selectedEmployee.full_name}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Employee Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="employee@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!(isDepartureState || isCompletedState) || undefined}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Schedule Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!!(isDepartureState || isCompletedState) || undefined}
              />
            </div>

            {/* Arrival State */}
            {isArrivalState && (
              <div className="space-y-4 pt-4 border-t-2 border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-2" />
                    Check-In Time
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <button
                  onClick={markArrival}
                  disabled={!!loading || undefined}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {loading ? "Processing..." : "Mark Arrival"}
                </button>
              </div>
            )}

            {/* Departure State */}
            {isDepartureState && (
              <div className="space-y-4 pt-4 border-t-2 border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-2" />
                    Check-In Time (Recorded)
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-600"
                    value={startTime}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-2" />
                    Check-Out Time
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>

                <button
                  onClick={markDeparture}
                  disabled={!!loading || undefined}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {loading ? "Processing..." : "Mark Departure"}
                </button>

                <button
                  onClick={resetForNextEmployee}
                  className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Mark Arrival for Another Employee
                </button>
              </div>
            )}

            {/* Completed State */}
            {isCompletedState && (
              <div className="pt-4 border-t-2 border-gray-100 space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-emerald-900 font-semibold text-lg mb-3">
                        Attendance Completed
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-600">Check-In</span>
                          <span className="text-sm font-bold text-gray-800">{startTime}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-600">Check-Out</span>
                          <span className="text-sm font-bold text-gray-800">{endTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetForNextEmployee}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Process Another Employee
                </button>
              </div>
            )}

            {/* Daily Attendance PDF Section */}
            <div className="pt-6 border-t-2 border-gray-200 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  Daily Attendance Report
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Download a complete PDF report for all employees on a specific date
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Select Report Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </div>

              <button
                onClick={() =>
                  window.open(
                    `/api/manual-schedule/pdf?org_id=${org_id}&date=${reportDate}`,
                    "_blank"
                  )
                }
                disabled={!reportDate || !org_id}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Download Daily Attendance PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}