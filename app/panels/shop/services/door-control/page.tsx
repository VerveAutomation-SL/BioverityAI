"use client";

import { useState, useEffect } from "react";
import {
  Fingerprint,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function AccessPointPage() {
  const [status, setStatus] = useState<"waiting" | "detecting" | "granted">("waiting");

  useEffect(() => {
    // Simulate automatic finger detection after 2 seconds
    const detectTimer = setTimeout(() => {
      if (status === "waiting") {
        setStatus("detecting");
      }
    }, 2000);

    return () => clearTimeout(detectTimer);
  }, [status]);

  useEffect(() => {
    // After detection, grant access after 1 second
    if (status === "detecting") {
      const grantTimer = setTimeout(() => {
        setStatus("granted");
      }, 1000);

      return () => clearTimeout(grantTimer);
    }
  }, [status]);

  function handleGoBack() {
    setStatus("waiting");
  }

  return (
    <div className="max-w-xl mx-auto mt-16">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        
        {status === "waiting" && (
          <>
            <Fingerprint className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">
              Place Your Finger
            </h1>
            <p className="text-slate-600 mt-2">
              Place your finger on the finger-vein scanner
            </p>
          </>
        )}

        {status === "detecting" && (
          <>
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-emerald-600 mb-4" />
            <h1 className="text-xl font-semibold text-slate-800">
              Detecting...
            </h1>
            <p className="text-slate-600 mt-2">
              Please wait
            </p>
          </>
        )}

        {status === "granted" && (
          <>
            <CheckCircle className="w-14 h-14 mx-auto text-emerald-600 mb-4" />
            <h1 className="text-xl font-bold text-slate-800">
              Access Granted
            </h1>

            <button
              onClick={handleGoBack}
              className="mt-6 w-full py-3 rounded-xl border-2 border-slate-300
              text-slate-700 font-semibold hover:bg-slate-100 transition"
            >
              Go Back
            </button>
          </>
        )}

      </div>
    </div>
  );
}