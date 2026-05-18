"use client";

import { useState, useEffect, useRef } from "react";
import { UserPlus, Upload, Plus, X, ChevronDown, Pencil, Trash2, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ReactCountryFlag from "react-country-flag";
import Select from "react-select";
// @ts-ignore
import countryList from "country-list";

interface EmployeeRegistrationFormProps {
  orgId: string;
  onSuccess?: () => void;
}

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
}: {
  value: string;
  onChange: (val: string) => void;
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
          borderColor: state.isFocused ? "#10b981" : "#e2e8f0",
          boxShadow: "none",
          padding: "4px",
          "&:hover": { borderColor: "#10b981" },
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

// ─── Custom Department Dropdown ───────────────────────────────────────────────
function DepartmentDropdown({
  departments,
  department,
  setDepartment,
  editingDepartment,
  setEditingDepartment,
  editedDepartmentName,
  setEditedDepartmentName,
  onUpdate,
  onDelete,
  showAddDept,
  setShowAddDept,
  newDeptName,
  setNewDeptName,
  onAdd,
}: {
  departments: string[];
  department: string;
  setDepartment: (v: string) => void;
  editingDepartment: string | null;
  setEditingDepartment: (v: string | null) => void;
  editedDepartmentName: string;
  setEditedDepartmentName: (v: string) => void;
  onUpdate: (oldName: string) => void;
  onDelete: (name: string) => void;
  showAddDept: boolean;
  setShowAddDept: (v: boolean) => void;
  newDeptName: string;
  setNewDeptName: (v: string) => void;
  onAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* ── Trigger button ── */}
      <div
        className={`
          flex items-center justify-between w-full
          border-2 rounded-xl px-4 py-3 bg-white cursor-pointer select-none
          transition-all duration-200
          ${open
            ? "border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
            : "border-slate-200 hover:border-slate-300"
          }
        `}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={department ? "text-slate-800 font-medium text-sm" : "text-slate-400 text-sm"}>
          {department || "Select Department"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            open ? "rotate-180 text-emerald-500" : "text-slate-400"
          }`}
        />
      </div>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">

          {/* Department rows */}
          <div className="max-h-48 overflow-y-auto">
            {departments.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">No departments yet</p>
            )}

            {departments.map((dept, i) => (
              <div
                key={dept}
                className={`
                  group flex items-center gap-2 px-3 py-2.5 transition-colors
                  ${i !== 0 ? "border-t border-slate-100" : ""}
                  ${department === dept ? "bg-emerald-50" : "hover:bg-slate-50"}
                `}
              >
                {editingDepartment === dept ? (
                  /* Edit mode */
                  <div className="flex items-center gap-2 w-full">
                    <input
                      autoFocus
                      value={editedDepartmentName}
                      onChange={(e) => setEditedDepartmentName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onUpdate(dept);
                        if (e.key === "Escape") {
                          setEditingDepartment(null);
                          setEditedDepartmentName("");
                        }
                      }}
                      className="flex-1 text-sm border border-emerald-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdate(dept)}
                      className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingDepartment(null); setEditedDepartmentName(""); }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Normal mode */
                  <>
                    {/* Dot indicator for selected */}
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${department === dept ? "bg-emerald-500" : "bg-transparent"}`} />

                    {/* Name — clicking selects */}
                    <button
                      type="button"
                      className="flex-1 text-left text-sm font-medium text-slate-700"
                      onClick={() => { setDepartment(dept); setOpen(false); }}
                    >
                      {dept}
                    </button>

                    {/* Action icons — appear on row hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDepartment(dept);
                          setEditedDepartmentName(dept);
                        }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(dept); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── Add department footer ── */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2.5">
            {!showAddDept ? (
              <button
                type="button"
                onClick={() => setShowAddDept(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors py-1 rounded-lg hover:bg-emerald-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Department
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Department name…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onAdd();
                    if (e.key === "Escape") { setShowAddDept(false); setNewDeptName(""); }
                  }}
                  className="flex-1 text-sm border-2 border-slate-200 rounded-xl px-3 py-1.5 focus:border-emerald-400 focus:outline-none transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={onAdd}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddDept(false); setNewDeptName(""); }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function EmployeeRegistrationForm({
  orgId,
  onSuccess,
}: EmployeeRegistrationFormProps) {
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<string[]>([
    "IT", "HR", "Sales", "Marketing", "Finance",
  ]);
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [editingDepartment, setEditingDepartment] = useState<string | null>(null);
  const [editedDepartmentName, setEditedDepartmentName] = useState("");

  useEffect(() => { loadDepartments(); }, [orgId]);

  async function loadDepartments() {
    try {
      const res = await fetch(`/api/departments?org_id=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.departments?.length > 0) setDepartments(data.departments);
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
    } catch { alert("Failed to add department"); }
  }

  async function handleUpdateDepartment(oldName: string) {
    try {
      const res = await fetch("/api/departments/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: orgId, old_name: oldName, new_name: editedDepartmentName }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to update department"); return; }
      setDepartments(departments.map((d) => (d === oldName ? editedDepartmentName : d)));
      if (department === oldName) setDepartment(editedDepartmentName);
      setEditingDepartment(null);
      setEditedDepartmentName("");
      alert("Department updated successfully");
    } catch { alert("Failed to update department"); }
  }

  async function handleDeleteDepartment(deptName: string) {
    if (!confirm(`Delete "${deptName}" department?`)) return;
    try {
      const res = await fetch("/api/departments/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: orgId, name: deptName }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to delete"); return; }
      setDepartments(departments.filter((d) => d !== deptName));
      if (department === deptName) setDepartment("");
      alert("Department deleted");
    } catch { alert("Failed to delete department"); }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  async function uploadEmployeePhoto(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `employee-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("products").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("products").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleRegisterEmployee() {
    if (!employeeId || !fullName || !department || !role || !country) {
      alert("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      let photoUrl = null;
      if (photo) photoUrl = await uploadEmployeePhoto(photo);
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
          country,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to register employee"); setLoading(false); return; }
      alert("Employee registered successfully!");
      resetForm();
      if (onSuccess) onSuccess();
    } catch { alert("Failed to register employee"); }
    setLoading(false);
  }

  function resetForm() {
    setFullName(""); setEmployeeId(""); setDepartment(""); setRole("");
    setCountry(""); setPhoto(null); setPhotoPreview(null);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">New Employee Registration</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Photo Upload */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Employee Photo <span className="text-slate-400 text-xs">(Optional)</span>
          </label>
          <div className="relative">
            {photoPreview ? (
              <div className="relative group">
                <img src={photoPreview} alt="Employee" className="w-full h-64 object-cover rounded-2xl border-2 border-slate-200" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <button
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-600 mb-1">Click to upload photo</p>
                <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Employee ID *</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g., EMP-001"
                className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Country *</label>
            <CountrySelect value={country} onChange={setCountry} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department *</label>
              <DepartmentDropdown
                departments={departments}
                department={department}
                setDepartment={setDepartment}
                editingDepartment={editingDepartment}
                setEditingDepartment={setEditingDepartment}
                editedDepartmentName={editedDepartmentName}
                setEditedDepartmentName={setEditedDepartmentName}
                onUpdate={handleUpdateDepartment}
                onDelete={handleDeleteDepartment}
                showAddDept={showAddDept}
                setShowAddDept={setShowAddDept}
                newDeptName={newDeptName}
                setNewDeptName={setNewDeptName}
                onAdd={handleAddDepartment}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Role *</label>
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

      {/* Buttons */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={resetForm}
          disabled={loading}
          className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleRegisterEmployee}
          disabled={loading}
          className="px-8 py-3 rounded-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-5 h-5" />
          {loading ? "Registering..." : "Register Employee"}
        </button>
      </div>
    </div>
  );
}