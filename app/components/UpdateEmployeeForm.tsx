"use client";

import { useState, useEffect } from "react";
import { UserCheck, Upload, User, Briefcase, Building2, Check, Fingerprint, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import ReactCountryFlag from "react-country-flag";
import Select from "react-select";
// @ts-ignore
import countryList from "country-list";

interface CountryOption {
  value: string;
  label: string;
}

const countryOptions: CountryOption[] = countryList.getData().map(
  (c: { code: string; name: string }) => ({
    value: c.code,
    label: c.name,
  })
);

function CountrySelect({
  value,
  onChange,
  isDisabled,
}: {
  value: string;
  onChange: (val: string) => void;
  isDisabled?: boolean;
}) {
  const selected: CountryOption | null =
    countryOptions.find((o: CountryOption) => o.label === value) || null;

  return (
    <Select<CountryOption>
      options={countryOptions}
      value={selected}
      onChange={(opt) => onChange(opt?.label || "")}
      placeholder="Select Country"
      isSearchable
      isDisabled={isDisabled}
      formatOptionLabel={(opt: CountryOption) => (
        <div className="flex items-center gap-2">
          <ReactCountryFlag
            countryCode={opt.value}
            svg
            style={{ width: "1.2em", height: "1.2em" }}
          />
          <span>{opt.label}</span>
        </div>
      )}
      styles={{
        control: (base, state) => ({
          ...base,
          borderRadius: "0.75rem",
          borderWidth: "2px",
          borderColor: state.isFocused ? "#10b981" : "#e5e7eb",
          boxShadow: "none",
          padding: "4px",
          "&:hover": { borderColor: "#10b981" },
          opacity: isDisabled ? 0.5 : 1,
        }),
        menu: (base) => ({
          ...base,
          borderRadius: "0.75rem",
          overflow: "hidden",
          zIndex: 50,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#d1fae5"
            : state.isFocused
            ? "#f0fdf4"
            : "white",
          color: state.isSelected ? "#065f46" : "#334155",
        }),
      }}
    />
  );
}

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
  onCancel,
}: UpdateEmployeeFormProps) {
  const [fullName, setFullName] = useState(employee.full_name);
  const [employeeId, setEmployeeId] = useState(employee.employee_id);
  const [department, setDepartment] = useState(employee.department);
  const [role, setRole] = useState(employee.role);
  const [country, setCountry] = useState(employee.country || "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(employee.photo_url);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const [departments, setDepartments] = useState<string[]>([
    "IT", "HR", "Sales", "Marketing", "Finance",
  ]);
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const enrolledCount = employee.biometric_enrollments?.filter(
    (enrollment: any) => enrollment.status === "enrolled"
  ).length || 0;

  const hasPendingEnrollment = employee.biometric_enrollments?.some(
    (enrollment: any) => enrollment.status === "pending"
  );

  const hasEnrollment = enrolledCount > 0;

  useEffect(() => {
    loadDepartments();
  }, [orgId]);

  async function loadDepartments() {
    try {
      const res = await fetch(`/api/departments?org_id=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.departments && data.departments.length > 0) {
          setDepartments(data.departments);
        }
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  }

  async function handleAddDepartment() {
    if (!newDeptName.trim()) { alert("Please enter a department name"); return; }
    if (departments.includes(newDeptName.trim())) { alert("This department already exists"); return; }

    try {
      const res = await fetch("/api/departments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: orgId, name: newDeptName.trim() }),
      });

      if (res.ok) {
        setDepartments([...departments, newDeptName.trim()]);
        setDepartment(newDeptName.trim());
        setNewDeptName("");
        setShowAddDept(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add department");
      }
    } catch (error) {
      alert("Failed to add department");
    }
  }

  const handlePhotoChange = (file: File | null | undefined) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
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
    const ext = file.name.split(".").pop();
    const fileName = `employees/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from("products").upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);
    return data.publicUrl;
  }

  const handleSubmit = async () => {
    if (!fullName.trim()) { toast.error("Full name is required"); return; }
    if (!employeeId.trim()) { toast.error("Employee ID is required"); return; }
    if (!department) { toast.error("Department is required"); return; }
    if (!role.trim()) { toast.error("Role is required"); return; }
    if (!country) { toast.error("Country is required"); return; }

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
          photo_url: finalPhotoUrl,
          country,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");

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
    let pollInterval: NodeJS.Timeout | null = null;
    let lastStage = "";

    try {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch("https://localhost:5050/enroll/status");
          const data = await res.json();

          if (data.stage !== lastStage) {
            lastStage = data.stage;
            switch (data.stage) {
              case "PLACE_FINGER_1":
              case "PLACE_FINGER_2":
              case "PLACE_FINGER_3":
                toast("Place finger on device", { icon: "👆" });
                break;
              case "REMOVE_FINGER":
                toast("Please remove your finger", { icon: "✋" });
                break;
              case "CAPTURED_1":
              case "CAPTURED_2":
              case "CAPTURED_3":
                toast.success("Finger captured!");
                break;
              case "DONE":
                if (pollInterval) clearInterval(pollInterval);
                break;
              case "ERROR":
                if (pollInterval) clearInterval(pollInterval);
                toast.error("Enrollment error");
                break;
            }
          }
        } catch {
          // Ignore polling errors silently
        }
      }, 500);

      const deviceRes = await fetch("https://localhost:5050/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employee.id }),
        signal: AbortSignal.timeout(30000),
      });

      if (!deviceRes.ok) {
        const err = await deviceRes.json().catch(() => ({}));
        throw new Error(err.error || "Device enrollment failed");
      }

      const deviceData = await deviceRes.json();
      if (!deviceData.template_id) throw new Error("No template returned from device");

      const saveRes = await fetch("/api/biometric/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employee.id,
          org_id: orgId,
          template_id: deviceData.template_id,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "Failed to save biometric data");

      toast.success("Finger vein enrolled successfully!");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Enrollment failed");
    } finally {
      if (pollInterval) clearInterval(pollInterval);
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
                  <label className={`bg-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors ${isFormDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
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
              <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 transition-colors ${isFormDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-100"}`}>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm font-semibold text-gray-600 mb-1">Click to upload photo</p>
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

          {/* ✅ COUNTRY — below Employee ID & Full Name */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Country *
            </label>
            <CountrySelect
              value={country}
              onChange={setCountry}
              isDisabled={isFormDisabled}
            />
          </div>

          {/* DEPARTMENT & ROLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Department
              </label>
              <div className="space-y-3">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-emerald-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isFormDisabled}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                {!showAddDept ? (
                  <button
                    type="button"
                    onClick={() => setShowAddDept(true)}
                    disabled={isFormDisabled}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Department
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="Department name"
                      className="flex-1 border-2 border-slate-200 rounded-xl p-2 text-sm focus:border-emerald-500 focus:outline-none"
                      onKeyPress={(e) => { if (e.key === "Enter") handleAddDepartment(); }}
                      disabled={isFormDisabled}
                    />
                    <button
                      type="button"
                      onClick={handleAddDepartment}
                      disabled={isFormDisabled}
                      className="px-3 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddDept(false); setNewDeptName(""); }}
                      disabled={isFormDisabled}
                      className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
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

          {/* BIOMETRIC ENROLLMENT */}
          <div className="p-6 border-2 border-dashed border-emerald-300 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Fingerprint className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Biometric Enrollment</h3>
                <p className="text-sm text-slate-600 mb-4">
                  {hasEnrollment
                    ? `Employee has ${enrolledCount} active biometric enrollment(s). You can re-enroll to update the fingerprint data.`
                    : hasPendingEnrollment
                    ? "Enrollment is pending. Complete the enrollment process or start a new one."
                    : "Capture the employee's finger vein data using the connected biometric device for secure authentication."}
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
                    <p className="text-sm font-semibold text-yellow-700">⏳ Pending enrollment in progress</p>
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
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              ) : (
                <><Check className="w-5 h-5" />Save Changes</>
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