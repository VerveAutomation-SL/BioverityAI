"use client";

import { useState } from "react";
import WebAttendancePage from "./WebAttendancePage";
import LeaveApprovalPage from "./LeaveApprovalPage";

export default function Page() {
  const [activeTab, setActiveTab] = useState<"attendance" | "leave">("attendance");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "attendance"
              ? "bg-blue-600 text-white"
              : "bg-white border border-slate-300"
          }`}
        >
          Attendance Records
        </button>

        <button
          onClick={() => setActiveTab("leave")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "leave"
              ? "bg-blue-600 text-white"
              : "bg-white border border-slate-300"
          }`}
        >
          Leave Applications
        </button>
      </div>

      {activeTab === "attendance" && <WebAttendancePage />}
      {activeTab === "leave" && <LeaveApprovalPage />}
    </div>
  );
}
