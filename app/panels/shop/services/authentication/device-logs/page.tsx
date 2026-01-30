"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Log = {
  id: string;
  message: string;
  event_type: string;
  created_at: string;
};

export default function DeviceLogsPage() {
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [date]);

  async function fetchLogs() {
    setLoading(true);

    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59`;

    const { data, error } = await supabase
      .from("device_logs")
      .select("*")
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: false });

    if (!error && data) setLogs(data);

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Device Logs</h1>

      {/* Date picker */}
      <div className="flex gap-4 items-center">
        <label className="font-medium">Select date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Event Type</th>
              <th className="p-3">Message</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">
                  No logs for selected date
                </td>
              </tr>
            )}

            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-3">
                  {new Date(log.created_at).toLocaleTimeString()}
                </td>
                <td className="p-3 font-semibold uppercase">
                  {log.event_type}
                </td>
                <td className="p-3">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
