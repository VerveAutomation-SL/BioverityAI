"use client";

import { useState } from "react";
import {
  Fingerprint,
  Loader2,
  CheckCircle,
  XCircle,
  DoorOpen,
  DoorClosed,
} from "lucide-react";

type UiState =
  | "idle"
  | "processing"
  | "matched"
  | "not_found";

type DoorState = "locked" | "unlocked";

export default function AccessPointPage() {
  const [uiState, setUiState] = useState<UiState>("idle");
  const [doorState, setDoorState] = useState<DoorState>("locked");

  const [employee, setEmployee] = useState<null | {
    id: string;
    name: string;
    department: string;
  }>(null);

  function handleVerify() {
    setUiState("processing");

    setTimeout(() => {
      const matched = true; 

      if (matched) {
        setEmployee({
          id: "EMP001",
          name: "John Silva",
          department: "Operations",
        });
        setUiState("matched");
      } else {
        setEmployee(null);
        setUiState("not_found");
      }
    }, 1500);
  }

  function handleDoorAction() {
    setDoorState((prev) =>
      prev === "locked" ? "unlocked" : "locked"
    );
  }

  function handleGoBack() {
    setEmployee(null);
    setUiState("idle");
  }

  return (
    <div className="max-w-xl mx-auto mt-16">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-sm text-center">

        {/* IDLE */}
        {uiState === "idle" && (
          <>
            <Fingerprint className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">
              Place Your Finger
            </h1>
            <p className="text-slate-600 mt-2">
              Place your finger on the finger-vein scanner, then click Verify
            </p>

            <button
              onClick={handleVerify}
              className="mt-6 w-full py-3 rounded-xl font-semibold text-white
              bg-blue-600 hover:bg-blue-700 transition"
            >
              Verify
            </button>
          </>
        )}

        {/* PROCESSING */}
        {uiState === "processing" && (
          <>
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-emerald-600 mb-4" />
            <h1 className="text-xl font-semibold text-slate-800">
              Verifying…
            </h1>
            <p className="text-slate-600 mt-2">
              Please wait
            </p>
          </>
        )}

        {/* MATCHED */}
        {uiState === "matched" && employee && (
          <>
            <CheckCircle className="w-14 h-14 mx-auto text-emerald-600 mb-4" />
            <h1 className="text-xl font-bold text-slate-800">
              Access Granted
            </h1>

            <div className="mt-4 text-sm text-slate-700 space-y-1">
              <p><strong>ID:</strong> {employee.id}</p>
              <p><strong>Name:</strong> {employee.name}</p>
              <p><strong>Department:</strong> {employee.department}</p>
            </div>

            <button
              onClick={handleDoorAction}
              className={`mt-6 w-full py-3 rounded-xl font-semibold text-white transition
                ${
                  doorState === "locked"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
            >
              {doorState === "locked" ? (
                <>
                  <DoorOpen className="inline w-5 h-5 mr-2" />
                  Open Door
                </>
              ) : (
                <>
                  <DoorClosed className="inline w-5 h-5 mr-2" />
                  Close Door
                </>
              )}
            </button>

            <button
              onClick={handleGoBack}
              className="mt-3 w-full py-2 rounded-xl border-2 border-slate-300
              text-slate-700 font-semibold hover:bg-slate-100 transition"
            >
              Go Back
            </button>
          </>
        )}

        {/* NOT FOUND */}
        {uiState === "not_found" && (
          <>
            <XCircle className="w-14 h-14 mx-auto text-red-600 mb-4" />
            <h1 className="text-xl font-bold text-slate-800">
              Access Denied
            </h1>
            <p className="text-slate-600 mt-2">
              No matching employee record found
            </p>

            <button
              onClick={handleGoBack}
              className="mt-6 w-full py-3 rounded-xl font-semibold
              bg-slate-600 hover:bg-slate-700 text-white transition"
            >
              Go Back
            </button>
          </>
        )}

      </div>
    </div>
  );
}
