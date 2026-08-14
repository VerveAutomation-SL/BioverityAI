"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

interface Employee {
  id: string;
  employee_id: string | null;
  previous_employee_id?: string | null;
  status: "active" | "inactive";
  full_name: string;
}

interface EmployeeActionModalProps {
  employee: Employee;
  orgId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type ActionStep =
  | "choose"
  | "deactivate"
  | "delete";

export default function EmployeeActionModal({
  employee,
  orgId,
  onClose,
  onSuccess,
}: EmployeeActionModalProps) {
  const [step, setStep] =
    useState<ActionStep>("choose");

  const [loading, setLoading] =
    useState(false);

  const [confirmation, setConfirmation] =
    useState("");

  const handleDeactivate = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/employees/deactivate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            employee_id: employee.id,
            org_id: orgId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to deactivate employee"
        );
      }

      onSuccess();
      onClose();

    } catch (error: any) {
      alert(
        error.message ||
          "Failed to deactivate employee"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete =
    async () => {
      if (confirmation !== "DELETE") {
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `/api/employees/delete?employee_id=${employee.id}&org_id=${orgId}`,
          {
            method: "DELETE",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to delete employee"
          );
        }

        onSuccess();
        onClose();

      } catch (error: any) {
        alert(
          error.message ||
            "Failed to delete employee"
        );
      } finally {
        setLoading(false);
      }
    };

  /*
   * STEP 1
   * Choose action
   */
  if (step === "choose") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">

          <div className="flex items-center justify-between p-6 border-b border-slate-200">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Employee Actions
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Choose what you want to do.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

          </div>

          <div className="p-6">

            <div className="bg-slate-50 rounded-xl p-4 mb-5">

              <p className="font-semibold text-slate-800">
                {employee.full_name}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Employee ID:{" "}
                {employee.employee_id || "—"}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Status:{" "}
                <span className="font-semibold capitalize">
                  {employee.status}
                </span>
              </p>

            </div>

            <div className="space-y-3">

              {/* DEACTIVATE */}
              <button
                type="button"
                disabled={
                  employee.status ===
                  "inactive"
                }
                onClick={() =>
                  setStep("deactivate")
                }
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >

                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-amber-600" />
                </div>

                <div>
                  <p className="font-semibold text-amber-800">
                    Deactivate Employee
                  </p>

                  <p className="text-xs text-amber-700 mt-1">
                    Keep the employee history
                    and release their Employee ID.
                  </p>
                </div>

              </button>

              {/* PERMANENT DELETE */}
              <button
                type="button"
                onClick={() => {
                  setConfirmation("");
                  setStep("delete");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-left"
              >

                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>

                <div>
                  <p className="font-semibold text-red-800">
                    Permanently Delete
                  </p>

                  <p className="text-xs text-red-700 mt-1">
                    Completely remove the employee
                    from the database.
                  </p>
                </div>

              </button>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-5 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    );
  }

  /*
   * STEP 2
   * DEACTIVATE CONFIRMATION
   */
  if (step === "deactivate") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">

          <div className="p-6 border-b border-amber-200 bg-amber-50">

            <div className="flex items-center gap-3">

              <Ban className="w-6 h-6 text-amber-600" />

              <h2 className="text-xl font-bold text-amber-800">
                Deactivate Employee
              </h2>

            </div>

          </div>

          <div className="p-6">

            <p className="text-slate-700">
              Are you sure you want to deactivate{" "}
              <strong>
                {employee.full_name}
              </strong>
              ?
            </p>

            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">

              <p className="text-sm text-amber-800">
                The employee will become inactive.
                Their existing history will remain
                in the system, but their Employee ID
                will be released so it can be assigned
                to a new employee.
              </p>

            </div>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() =>
                  setStep("choose")
                }
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-semibold text-slate-600"
              >
                Back
              </button>

              <button
                onClick={handleDeactivate}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deactivating...
                  </span>
                ) : (
                  "Deactivate"
                )}
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  /*
   * STEP 3
   * PERMANENT DELETE
   */
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">

        <div className="p-6 border-b border-red-200 bg-red-50">

          <div className="flex items-start gap-3">

            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />

            <div>
              <h2 className="text-xl font-bold text-red-800">
                Permanently Delete Employee
              </h2>

              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone.
              </p>
            </div>

          </div>

        </div>

        <div className="p-6">

          <div className="p-4 bg-slate-50 rounded-xl">

            <p className="font-semibold text-slate-800">
              {employee.full_name}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Employee ID:{" "}
              {employee.employee_id || "—"}
            </p>

          </div>

          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">

            <p className="text-sm text-red-800">
              This will permanently remove the
              employee from the database. All
              employee-related data that is part of
              the deletion process will be removed.
              This cannot be undone.
            </p>

          </div>

          <label className="block mt-5 text-sm font-semibold text-slate-700">
            Type{" "}
            <span className="text-red-600">
              DELETE
            </span>{" "}
            to confirm.
          </label>

          <input
            value={confirmation}
            onChange={(e) =>
              setConfirmation(
                e.target.value
              )
            }
            placeholder="DELETE"
            className="w-full mt-2 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-500"
          />

          <div className="flex gap-3 mt-6">

            <button
              onClick={() =>
                setStep("choose")
              }
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-slate-300 font-semibold text-slate-600"
            >
              Back
            </button>

            <button
              onClick={
                handlePermanentDelete
              }
              disabled={
                loading ||
                confirmation !==
                  "DELETE"
              }
              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Permanently Delete"
              )}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}