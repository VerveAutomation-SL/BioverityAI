"use client";

import { useState } from "react";
import { UserPlus, Upload, Fingerprint } from "lucide-react";

export default function EmployeeRegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
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

          {/* Finger Vein Enrollment */}
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
                  Capture the employee's finger vein data using the connected biometric device for secure authentication.
                </p>

                <button
                  type="button"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Fingerprint className="w-5 h-5" />
                  Start Enrollment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <UserPlus className="w-5 h-5" />
          Register Employee
        </button>
      </div>
    </div>
  );
}