"use client";

import { Clock, CheckCircle2, XCircle } from "lucide-react";

export default function SchedulePage() {
  const schedules = [
    {
      id: "EMP-001",
      name: "John Doe",
      role: "Software Engineer",
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      checkIn: "09:05 AM",
      checkOut: "06:02 PM",
      status: "completed", // pending | active | completed
    },
  ];

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Schedule
        </h1>
        <p className="text-gray-600">
          Employee check-in and check-out schedule overview
        </p>
      </div>

      {/* Schedule Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Today’s Schedule
          </h2>
        </div>

        {schedules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No employees scheduled yet
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600 border-b">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Check In</th>
                <th className="p-4 font-semibold">Check Out</th>
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {schedules.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {/* Employee */}
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Check In */}
                  <td className="p-4 font-medium text-gray-700">
                    {item.checkIn || "--"}
                  </td>

                  {/* Check Out */}
                  <td className="p-4 font-medium text-gray-700">
                    {item.checkOut || "--"}
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    {item.status === "completed" && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Checked Out
                      </span>
                    )}

                    {item.status === "active" && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        <Clock className="w-4 h-4" />
                        Working
                      </span>
                    )}

                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold">
                        <XCircle className="w-4 h-4" />
                        Not Checked In
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
