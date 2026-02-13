"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import WebAttendanceModal from "./WebAttendanceModal";
import generateAttendancePDF from "@/lib/generatePDF";
import { supabase } from "@/lib/supabaseClient";
import { 
  Calendar, 
  Download, 
  Eye, 
  Users, 
  Clock, 
  MapPin,
  FileText
} from "lucide-react";

interface Log {
  id: string;
  check_in_time: string;
  check_out_time: string;
  check_in_address: string;
  check_out_address: string;
  check_in_photo_url: string;
  check_out_photo_url: string;
  employees: {
    id: string;
    employee_id: string;
    full_name: string;
    department: string;
    photo_url: string;
  };
}

export default function WebAttendancePage() {
  const [date, setDate] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [selected, setSelected] = useState<Log | null>(null);
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    fetchLogs();
  }, [date]);

  async function fetchLogs() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id, organization_logo, full_name")
      .eq("id", userData.user.id)
      .single();

    if (!profile?.org_id) {
      setLoading(false);
      return;
    }

    const res = await apiFetch(
      `/api/web-attendance/fetch?date=${date}&org_id=${profile.org_id}`
    );

    const data = await res.json();
    if (!res.ok) {
      console.error(data.error);
      setLoading(false);
      return;
    }

    setLogs(data.logs);
    setOrgLogo(profile.organization_logo);
    setOrgName(profile.full_name);
    setLoading(false);
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "—";
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateHoursWorked = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return "—";
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Attendance Records
            </h1>
          </div>
          <p className="text-slate-600 ml-14">
            View and manage employee attendance logs
          </p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Date Picker */}
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Date
              </label>
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10 group-hover:text-blue-500 transition-colors" />
                <input
                  type="date"
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-blue-400 bg-white text-slate-900 font-medium shadow-sm hover:shadow-md"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          {date && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{formatDate(date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>
                    <span className="font-semibold text-slate-900">
                      {logs.length}
                    </span>{" "}
                    {logs.length === 1 ? "record" : "records"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-600">Loading attendance records...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No records found
              </h3>
              <p className="text-slate-600">
                {date
                  ? "No attendance records for the selected date"
                  : "Please select a date to view attendance records"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {log.employees.photo_url ? (
                            <img
                              src={log.employees.photo_url}
                              alt={log.employees.full_name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {log.employees.full_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-slate-900">
                              {log.employees.full_name}
                            </div>
                            <div className="text-sm text-slate-500">
                              ID: {log.employees.employee_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {log.employees.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-slate-900">
                            {formatTime(log.check_in_time)}
                          </span>
                        </div>
                        {log.check_in_address && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">
                              {log.check_in_address}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {log.check_out_time ? (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-slate-900">
                                {formatTime(log.check_out_time)}
                              </span>
                            </div>
                            {log.check_out_address && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">
                                  {log.check_out_address}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {calculateHoursWorked(
                            log.check_in_time,
                            log.check_out_time
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelected(log)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() =>
                              generateAttendancePDF(log, orgLogo, orgName)
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <WebAttendanceModal
          log={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}