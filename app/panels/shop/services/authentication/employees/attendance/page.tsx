"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ClipboardCheck, Users, Calendar, TrendingUp, Clock, Loader2, Settings } from "lucide-react";

type AttendanceRow = {
  employee_id: string;
  name: string;
  role: string;
  photo: string;
  status: "present" | "absent" | "not_arrived";
  check_in: string | null;
  check_out: string | null;
};

type Schedule = {
  morning_start: string;
  morning_end: string;
  evening_start: string;
  evening_end: string;
};

export default function AttendancePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [employees, setEmployees] = useState<AttendanceRow[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Schedule state
  const [schedule, setSchedule] = useState<Schedule>({
    morning_start: "09:00",
    morning_end: "12:00",
    evening_start: "13:00",
    evening_end: "17:00",
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Fetch user profile and org_id
  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return router.replace("/login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("org_id, role, full_name")
        .eq("id", user.id)
        .single();

      if (!prof || prof.role !== "user") {
        return router.replace("/login");
      }

      setProfile(prof);
      setLoading(false);
    })();
  }, []);

  // Fetch schedule when profile loads
  useEffect(() => {
    if (!profile?.org_id) return;

    async function loadSchedule() {
      setScheduleLoading(true);
      try {
        const { data, error } = await supabase
          .from("work_schedules")
          .select("morning_start, morning_end, evening_start, evening_end")
          .eq("org_id", profile.org_id)
          .maybeSingle();

        if (data) {
          setSchedule({
            morning_start: data.morning_start || "09:00",
            morning_end: data.morning_end || "12:00",
            evening_start: data.evening_start || "13:00",
            evening_end: data.evening_end || "17:00",
          });
        }

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching schedule:", error);
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
      } finally {
        setScheduleLoading(false);
      }
    }

    loadSchedule();
  }, [profile?.org_id]);

  // Fetch attendance data when profile or date change
  useEffect(() => {
    if (!profile?.org_id) return;

    async function loadAttendance() {
      setEmployeesLoading(true);

      try {
        // Get the current session token
        const { data: { session } } = await supabase.auth.getSession();

        const res = await fetch(
          `/api/attendance/by-date?date=${date}`,
          {
            headers: {
              'Authorization': `Bearer ${session?.access_token}`
            }
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Attendance API error:", errorData);
          throw new Error(errorData.error || "Failed to fetch attendance");
        }

        const data = await res.json();
        setEmployees(data.data || []);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setEmployeesLoading(false);
      }
    }

    loadAttendance();
  }, [profile?.org_id, date]);

  // Save schedule
  const saveSchedule = async () => {
    if (!profile?.org_id) return;

    setScheduleSaving(true);
    try {
      const { error } = await supabase
        .from("work_schedules")
        .upsert({
          org_id: profile.org_id,
          morning_start: schedule.morning_start,
          morning_end: schedule.morning_end,
          evening_start: schedule.evening_start,
          evening_end: schedule.evening_end,
        }, {
          onConflict: "org_id"
        });

      if (error) throw error;

      alert("Schedule saved successfully!");
    } catch (err) {
      console.error("Error saving schedule:", err);
      alert("Failed to save schedule");
    } finally {
      setScheduleSaving(false);
    }
  };

  const presentCount = employees.filter(e => e.status === "present").length;
  const absentCount = employees.filter(e => e.status === "absent").length;
  const notArrivedCount = employees.filter(e => e.status === "not_arrived").length;
  const totalCount = employees.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

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
        <div className="flex items-center gap-3 ml-15">
          <Calendar className="w-5 h-5 text-slate-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Working Hours Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">
              Organization Working Hours
            </h3>
          </div>
        </div>

        <div className="p-6">
          {scheduleLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Morning Start */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Morning Start
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="time"
                      value={schedule.morning_start}
                      onChange={(e) =>
                        setSchedule({ ...schedule, morning_start: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Morning End */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Morning End
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="time"
                      value={schedule.morning_end}
                      onChange={(e) =>
                        setSchedule({ ...schedule, morning_end: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Evening Start */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Evening Start
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="time"
                      value={schedule.evening_start}
                      onChange={(e) =>
                        setSchedule({ ...schedule, evening_start: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Evening End */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Evening End
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="time"
                      value={schedule.evening_end}
                      onChange={(e) =>
                        setSchedule({ ...schedule, evening_end: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={saveSchedule}
                disabled={scheduleSaving}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {scheduleSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings className="w-5 h-5" />
                    Save Schedule
                  </>
                )}
              </button>
            </>
          )}
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

        {employeesLoading ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
            </div>
            <p className="text-lg font-semibold text-slate-600">Loading attendance...</p>
          </div>
        ) : employees.length === 0 ? (
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
                    key={emp.employee_id}
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
                          {emp.status === "present" && emp.check_in && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <p className="text-xs text-emerald-600 font-semibold">
                                Check-in: {new Date(emp.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Attendance Status */}
                    <td className="p-5 text-center">
                      {emp.status === "present" && (
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full font-semibold shadow-sm border border-emerald-200">
                          <CheckCircle2 className="w-5 h-5" />
                          Present
                        </span>
                      )}
                      {emp.status === "absent" && (
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-full font-semibold shadow-sm border border-red-200">
                          <XCircle className="w-5 h-5" />
                          Absent
                        </span>
                      )}
                      {emp.status === "not_arrived" && (
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 rounded-full font-semibold shadow-sm border border-yellow-200">
                          <Clock className="w-5 h-5" />
                          Not Arrived
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
        {!employeesLoading && employees.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600 text-center">
            Showing {employees.length} employee{employees.length !== 1 ? 's' : ''} •
            <span className="text-emerald-600 font-semibold ml-1">{presentCount} Present</span> •
            <span className="text-red-600 font-semibold ml-1">{absentCount} Absent</span>
            {notArrivedCount > 0 && (
              <span className="text-yellow-600 font-semibold ml-1"> • {notArrivedCount} Not Arrived</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}