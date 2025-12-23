"use client";

import { useState } from "react";
import { UserCheck, Upload, User, Briefcase, Building2, Check, Fingerprint } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

interface UpdateEmployeeFormProps {
  employee: any;
  orgId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateEmployeeForm({
  employee,
  orgId,
  onSuccess,
  onCancel
}: UpdateEmployeeFormProps) {

  const [fullName, setFullName] = useState(employee.full_name);
  const [employeeId, setEmployeeId] = useState(employee.employee_id);
  const [department, setDepartment] = useState(employee.department);
  const [role, setRole] = useState(employee.role);
  const [photoPreview, setPhotoPreview] = useState<string | null>(employee.photo_url);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const enrolledCount = employee.biometric_enrollments?.filter(
    (enrollment: any) => enrollment.status === "enrolled"
  ).length || 0;

  const hasPendingEnrollment = employee.biometric_enrollments?.some(
    (enrollment: any) => enrollment.status === "pending"
  );

  const hasEnrollment = enrolledCount > 0;

  const handlePhotoChange = (file: File | null | undefined) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG, or WebP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.onerror = () => toast.error("Failed to read file");
    reader.readAsDataURL(file);
  };

  async function uploadEmployeePhoto(file: File) {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `employees/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err: any) {
      throw new Error(err.message || "Failed to upload photo");
    }
  }

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!employeeId.trim()) {
      toast.error("Employee ID is required");
      return;
    }
    if (!department) {
      toast.error("Department is required");
      return;
    }
    if (!role.trim()) {
      toast.error("Role is required");
      return;
    }

    setLoading(true);

    try {
      let finalPhotoUrl = employee.photo_url;

      if (photoFile) {
        try {
          finalPhotoUrl = await uploadEmployeePhoto(photoFile);
        } catch (uploadErr: any) {
          toast.error(uploadErr.message || "Photo upload failed");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/employees/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employee.id,
          org_id: orgId,
          full_name: fullName.trim(),
          department,
          role: role.trim(),
          photo_url: finalPhotoUrl
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Update failed");
      }

      toast.success("Employee updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);

    try {
      const res = await fetch("/api/biometric/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          employee_id: employee.id,
          org_id: orgId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Enrollment failed");
      }

      toast.success("Finger vein enrolled successfully!");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const isFormDisabled = loading || enrolling;

  return (
    <div className="relative bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-xl border border-emerald-100 max-h-[80vh] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-8 pb-4">
        <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Update Employee</h2>
          <p className="text-sm text-gray-600">Modify employee details and biometric data</p>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="overflow-y-auto px-8 pb-8 flex-1">
        <div className="space-y-6">
          {/* PHOTO UPLOAD */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              Employee Photo
            </label>

            {photoPreview ? (
              <div className="relative group">
                <img
                  src={photoPreview}
                  alt={fullName}
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                  <label className={`bg-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors ${isFormDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    Change Photo
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      disabled={isFormDisabled}
                      onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 transition-colors ${isFormDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Click to upload photo
                </p>
                <p className="text-xs text-gray-500">JPG, PNG, WebP up to 5MB</p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  disabled={isFormDisabled}
                  onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          {/* EMPLOYEE ID & FULL NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-emerald-600" />
                Employee ID
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-emerald-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g., EMP-001"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-emerald-600" />
                Full Name
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-emerald-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                disabled={isFormDisabled}
              />
            </div>
          </div>

          {/* DEPARTMENT & ROLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Department
              </label>
              <select
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-emerald-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isFormDisabled}
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
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Role
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-emerald-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Software Engineer"
                disabled={isFormDisabled}
              />
            </div>
          </div>

          {/* BIOMETRIC ENROLLMENT SECTION */}
          <div className="p-6 border-2 border-dashed border-emerald-300 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Fingerprint className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Biometric Enrollment
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {hasEnrollment 
                    ? `Employee has ${enrolledCount} active biometric enrollment(s). You can re-enroll to update the fingerprint data.`
                    : hasPendingEnrollment
                    ? "Enrollment is pending. Complete the enrollment process or start a new one."
                    : "Capture the employee's finger vein data using the connected biometric device for secure authentication."
                  }
                </p>

                {hasEnrollment && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-emerald-200">
                    <p className="text-sm font-semibold text-emerald-700">
                      ✓ Current Status: {enrolledCount} enrollment(s) active
                    </p>
                  </div>
                )}

                {hasPendingEnrollment && !hasEnrollment && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-700">
                      ⏳ Pending enrollment in progress
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={enrolling || loading}
                  onClick={handleEnroll}
                  className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Fingerprint className="w-5 h-5" />
                  {enrolling ? "Enrolling..." : hasEnrollment ? "Re-enroll Biometric" : "Start Enrollment"}
                </button>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isFormDisabled}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isFormDisabled}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}