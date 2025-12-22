"use client";

import { useState } from "react";
import { Download, Calendar, BarChart3, FileText, TrendingUp, Users, Clock } from "lucide-react";

type ReportType = "day" | "week" | "month" | "year";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("day");
  const [selectedDate, setSelectedDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Dummy stats data
  const stats = {
    totalReports: 156,
    thisMonth: 42,
    avgAttendance: 94,
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Attendance Reports
            </h1>
          </div>
        </div>
        <p className="text-slate-600 text-lg ml-15">
          Generate and download comprehensive attendance reports for analysis
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Reports */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Total Reports</p>
          <p className="text-3xl font-bold text-slate-800">{stats.totalReports}</p>
        </div>

        {/* This Month */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">This Month</p>
          <p className="text-3xl font-bold text-emerald-700">{stats.thisMonth}</p>
        </div>

        {/* Avg Attendance */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Avg Attendance</p>
          <p className="text-3xl font-bold text-purple-700">{stats.avgAttendance}%</p>
        </div>
      </div>

      {/* Report Generator */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Generate Report
            </h2>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Period Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-4">
              Report Period
            </label>

            <div className="grid grid-cols-4 gap-4">
              {["day", "week", "month", "year"].map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type as ReportType)}
                  className={`relative p-6 rounded-2xl border-2 font-semibold capitalize transition-all duration-300 transform hover:scale-105
                    ${reportType === type
                      ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg scale-105"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                    }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all
                      ${reportType === type
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
                        : "bg-slate-100"
                      }`}
                    >
                      {type === "day" && <Calendar className={`w-7 h-7 ${reportType === type ? "text-white" : "text-slate-600"}`} />}
                      {type === "week" && <Clock className={`w-7 h-7 ${reportType === type ? "text-white" : "text-slate-600"}`} />}
                      {type === "month" && <BarChart3 className={`w-7 h-7 ${reportType === type ? "text-white" : "text-slate-600"}`} />}
                      {type === "year" && <TrendingUp className={`w-7 h-7 ${reportType === type ? "text-white" : "text-slate-600"}`} />}
                    </div>
                    <span className={`text-lg ${reportType === type ? "text-emerald-700" : "text-slate-700"}`}>
                      Per {type}
                    </span>
                  </div>
                  {reportType === type && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          {/* PER DAY */}
          {reportType === "day" && (
            <div className="flex gap-4 w-full">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  From date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  To date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* PER WEEK */}
          {reportType === "week" && (
            <input
              type="week"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none"
            />
          )}

          {/* PER MONTH */}
          {reportType === "month" && (
            <input
              type="month"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none"
            />
          )}

          {/* PER YEAR */}
          {reportType === "year" && (
            <input
              type="number"
              min="2000"
              max={new Date().getFullYear()}
              placeholder="YYYY"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="flex-1 border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none"
            />
          )}


          {/* Report Preview Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Report Contents</h3>
                <p className="text-sm text-blue-700">
                  The report will include employee attendance records, check-in/check-out times, total hours, and absence details for the selected period.
                </p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-slate-600">
              <span className="font-semibold">Format:</span> Excel (.xlsx)
            </div>
            <button
              type="button"
              disabled={
                (reportType === "day" && (!fromDate || !toDate)) ||
                (reportType === "week" && !selectedDate) ||
                (reportType === "month" && !selectedDate) ||
                (reportType === "year" && !selectedYear)
              }
              className={`px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 transform
                ${selectedDate
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:scale-105"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}