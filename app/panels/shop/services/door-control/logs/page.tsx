"use client";

import { ShieldCheck, ShieldX, ClipboardList, Loader2 } from "lucide-react";
import { useState } from "react";

const logs = [
  {
    id: "1",
    time: "10:16 AM",
    date: "2024-01-15",
    employee: "EMP001 – John Silva",
    employeeId: "EMP001",
    result: "Authorized",
    action: "Door Opened",
  },
  {
    id: "2",
    time: "10:18 AM",
    date: "2024-01-15",
    employee: "Unknown",
    employeeId: null,
    result: "Denied",
    action: "No Action",
  },
  {
    id: "3",
    time: "10:25 AM",
    date: "2024-01-15",
    employee: "EMP002 – Nimal Perera",
    employeeId: "EMP002",
    result: "Authorized",
    action: "Door Opened",
  },
];

export default function AccessLogsPage() {
  const [loading] = useState(false);

  const authorizedCount = logs.filter(log => log.result === "Authorized").length;
  const deniedCount = logs.filter(log => log.result === "Denied").length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Access Logs
            </h1>
          </div>
        </div>
        <p className="text-slate-600 text-lg ml-15">
          Complete history of all door access attempts and authentication results
        </p>
      </div>

      {/* Access Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Recent Access Attempts
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-600">Loading access logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-600 mb-2">No access logs yet</p>
            <p className="text-sm text-slate-500">Access attempts will appear here once the system is active</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-sm text-slate-600 border-b border-slate-200">
                  <th className="p-4 font-semibold">Date & Time</th>
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Result</th>
                  <th className="p-4 font-semibold">Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{log.time}</span>
                        <span className="text-sm text-slate-500">
                          {new Date(log.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {log.employeeId ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-700">
                              {log.employeeId.replace('EMP', '')}
                            </span>
                          </div>
                          <span className="font-medium text-slate-800">{log.employee}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-500">?</span>
                          </div>
                          <span className="font-medium text-slate-500 italic">{log.employee}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {log.result === "Authorized" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                          <ShieldCheck className="w-4 h-4" />
                          Authorized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          <ShieldX className="w-4 h-4" />
                          Denied
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${
                        log.action === "Door Opened" 
                          ? "text-slate-800" 
                          : "text-slate-500"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {!loading && logs.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600 text-center">
            Showing {logs.length} access log{logs.length !== 1 ? 's' : ''} • 
            <span className="text-emerald-600 font-semibold ml-1">{authorizedCount} Authorized</span>
            <span className="mx-1">•</span>
            <span className="text-red-600 font-semibold">{deniedCount} Denied</span>
          </div>
        )}
      </div>
    </div>
  );
}