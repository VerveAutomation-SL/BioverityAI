"use client";

import { useEffect, useState } from "react";
import {
  DoorClosed,
  DoorOpen,
  Activity,
  ShieldCheck,
} from "lucide-react";

type DoorStatus = "locked" | "unlocked";
type DoorHealth = "online" | "offline";

export default function DoorControlDashboard() {
  const [loading, setLoading] = useState(true);

  const [doorStatus, setDoorStatus] = useState<DoorStatus>("locked");
  const [doorHealth, setDoorHealth] = useState<DoorHealth>("online");

  const [lastEvent, setLastEvent] = useState({
    time: "10:16 AM",
    employee: "EMP001 – John Silva",
    result: "Authorized",
    action: "Door Opened",
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="text-slate-500 text-sm">
          Loading door status…
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Door Control Dashboard
        </h1>
        <p className="text-slate-600 mt-1">
          Real-time overview of door access system
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Door State */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Door State
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {doorStatus === "locked" ? "Locked" : "Unlocked"}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center
                ${doorStatus === "locked"
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
                }`}
            >
              {doorStatus === "locked" ? (
                <DoorClosed className="w-6 h-6" />
              ) : (
                <DoorOpen className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>

        {/* Door Health */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Device Status
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {doorHealth === "online" ? "Online" : "Offline"}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center
                ${doorHealth === "online"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-400"
                }`}
            >
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Access Mode */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Access Mode
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                Finger Vein
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Last Access Event */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Last Access Event
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Time</p>
            <p className="font-semibold text-slate-800">
              {lastEvent.time}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Employee</p>
            <p className="font-semibold text-slate-800">
              {lastEvent.employee}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Result</p>
            <p className="font-semibold text-emerald-700">
              {lastEvent.result}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Action</p>
            <p className="font-semibold text-slate-800">
              {lastEvent.action}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="flex justify-end">
        <a
          href="/panels/shop/services/door-control/access-point"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
          bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold
          shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-green-700 transition"
        >
          Go to Access Point
        </a>
      </div>

    </div>
  );
}
