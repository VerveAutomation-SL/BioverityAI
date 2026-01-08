"use client";

import { useState } from "react";
import {
  DoorClosed,
  DoorOpen,
  Activity,
  Clock,
} from "lucide-react";

type DoorState = "locked" | "unlocked";
type DeviceStatus = "online" | "offline";

export default function DoorStatusPage() {
  const [doorState, setDoorState] = useState<DoorState>("locked");
  const [deviceStatus] = useState<DeviceStatus>("online");

  const lastAction = {
    time: "10:16 AM",
    by: "EMP001 – John Silva",
    action: "Door Opened now",
  };

  async function toggleDoor() {
    const nextState = doorState === "locked" ? "unlocked" : "locked";

    const endpoint =
      nextState === "unlocked"
        ? "/door/open"
        : "/door/close";

    try {
      const res = await fetch(
        "https://localhost:5050" + endpoint,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Door command failed");

      setDoorState(nextState);
    } catch (err) {
      alert("Failed to control door");
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Door Status
        </h1>
        <p className="text-slate-600 mt-1">
          Live status and manual control of the door
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Door State */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Door State</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {doorState === "locked" ? "Locked" : "Unlocked"}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center
              ${doorState === "locked"
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
                }`}
            >
              {doorState === "locked" ? (
                <DoorClosed className="w-6 h-6" />
              ) : (
                <DoorOpen className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>

        {/* Device Status */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Wireless Status</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {deviceStatus === "online" ? "Online" : "Offline"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Last Activity */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Last Activity</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {lastAction.action}
              </p>
              <p className="text-xs text-slate-500">
                {lastAction.time}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Control */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Manual Control
        </h2>

        <button
          onClick={toggleDoor}
          className={`px-6 py-3 rounded-xl font-semibold text-white transition
          ${doorState === "locked"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-red-600 hover:bg-red-700"
            }`}
        >
          {doorState === "locked" ? "Open Door" : "Close Door"}
        </button>

        <p className="text-xs text-slate-500 mt-3">
          Use only for testing or emergency situations.
        </p>
      </div>

    </div>
  );
}
