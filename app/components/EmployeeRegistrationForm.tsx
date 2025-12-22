"use client";

import { useState } from "react";
import { UserPlus, Upload, Fingerprint } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function EmployeeRegistrationForm({
  orgId,
}: {
  orgId: string;
}) {

  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeUUID, setEmployeeUUID] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  async function uploadEmployeePhoto(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `employee-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleRegisterEmployee() {
    if (!employeeId || !fullName || !department || !role) {
      alert("Please fill all required fields");
      return;
    }

    if (!photo) {
      alert("Employee photo is required");
      return;
    }

    const photoUrl = await uploadEmployeePhoto(photo);

    const res = await fetch("/api/employees/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        org_id: orgId,
        employee_id: employeeId,
        full_name: fullName,
        department,
        role,
        photo_url: photoUrl,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to register employee");
      return;
    }

    setEmployeeUUID(data.employee.id);

    alert("Employee registered successfully! Now proceed with biometric enrollment.");
  }

  async function handleEnroll(employeeUUID: string) {
    const res = await fetch("/api/biometric/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: employeeUUID }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Enrollment failed");
      return;
    }

    alert("Finger vein enrolled successfully!");
    setEnrolled(true);
    
    // Reset form after successful enrollment
    resetForm();
  }

  function resetForm() {
    setFullName("");
    setEmployeeId("");
    setEmployeeUUID(null);
    setEnrolled(false);
    setDepartment("");
    setRole("");
    setPhoto(null);
    setPhotoPreview(null);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          New Employee Registration
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Photo Upload Section */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Employee Photo *
          </label>
          <div className="relative">
            {photoPreview ? (
              <div className="relative group">
                <img
                  src={photoPreview}
                  alt="Employee"
                  className="w-full h-64 object-cover rounded-2xl border-2 border-slate-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <button
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  Click to upload photo
                </p>
                <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee ID & Full Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g., EMP-001"
                className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Department & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role *
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Register Button - Show first */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={resetForm}
          className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleRegisterEmployee}
          disabled={!!employeeUUID}
          className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 ${
            employeeUUID
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
          }`}
        >
          <UserPlus className="w-5 h-5" />
          Register Employee
        </button>
      </div>

      {/* Finger Vein Enrollment - Show after registration */}
      {employeeUUID && (
        <div className="mt-8 p-6 border-2 border-dashed border-emerald-300 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Biometric Enrollment
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Employee registered successfully! Now capture the employee's finger vein data using the connected biometric device for secure authentication.
              </p>

              <button
                type="button"
                disabled={enrolled}
                onClick={() => handleEnroll(employeeUUID)}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 ${
                  enrolled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                }`}
              >
                <Fingerprint className="w-5 h-5" />
                {enrolled ? "Enrolled Successfully" : "Start Enrollment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}