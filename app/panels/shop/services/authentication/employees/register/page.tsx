"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import EmployeeRegistrationForm from "@/app/components/EmployeeRegistrationForm";
import UpdateEmployeeForm from "@/app/components/UpdateEmployeeForm";
import EmployeeActionModal from "@/app/components/EmployeeActionModal";
import { UserPlus, Users, CheckCircle2, Eye, Edit, Trash2, Loader2, XCircle } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
// @ts-ignore
import countryList from "country-list";

const nameToCode: Record<string, string> = Object.fromEntries(
  countryList.getData().map((c: { code: string; name: string }) => [c.name, c.code])
);

interface Employee {
  id: string;
  employee_id: string | null;
  previous_employee_id?: string | null;
  status: "active" | "inactive";
  full_name: string;
  department: string;
  role: string;
  country?: string | null;
  photo_url?: string;
  created_at: string;
  biometric_enrollments?: Array<{
    biometric_type: string;
    status: string;
  }>;
}

export default function EmployeeRegistrationPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showInactiveEmployees, setShowInactiveEmployees] = useState(false);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return router.replace("/login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("org_id, role, full_name")
        .eq("id", user.id)
        .single();

      if (!prof || prof.role !== "user") return router.replace("/login");

      setProfile(prof);
      setLoading(false);
      fetchEmployees(prof.org_id);
    })();
  }, []);

  const fetchEmployees = async (orgId: string) => {
    try {
      setEmployeesLoading(true);
      const response = await fetch(`/api/employees/fetch?org_id=${orgId}`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleRegistrationSuccess = (): void => {
    if (profile?.org_id) fetchEmployees(profile.org_id);
  };

  const handleUpdateSuccess = (): void => {
    if (profile?.org_id) fetchEmployees(profile.org_id);
    setShowEditModal(false);
  };

  const handleReactivate = async (employee: Employee) => {
    if (!profile?.org_id) {
      alert("Organization ID not found.");
      return;
    }

    const employeeId = employee.previous_employee_id;

    if (!employeeId) {
      alert("This employee does not have a previous Employee ID and cannot be reactivated.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reactivate ${employee.full_name}?\n\nEmployee ID: ${employeeId}\n\nThe employee will become active again.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setReactivatingId(employee.id);

      const response = await fetch("/api/employees/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employee.id,
          org_id: profile.org_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reactivate employee");
      }

      await fetchEmployees(profile.org_id);
    } catch (err: any) {
      alert(err.message || "Failed to reactivate employee");
    } finally {
      setReactivatingId(null);
    }
  };

  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const activeEmployees = employees.filter(e => e.status === "active");
  const inactiveEmployees = employees.filter(e => e.status === "inactive");

  const activeCount = activeEmployees.length;
  const inactiveCount = inactiveEmployees.length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Employee Registration
            </h1>
          </div>
        </div>
        <p className="text-slate-600 text-lg ml-15">
          Register new employees with biometric authentication for seamless attendance tracking
        </p>
      </div>

      {/* Registration Form */}
      <EmployeeRegistrationForm orgId={profile.org_id} onSuccess={handleRegistrationSuccess} />

      {/* Registered Employees */}
      <div className="space-y-6">

        {/* ================= ACTIVE EMPLOYEES ================= */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">

          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Active Employees
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {activeCount} active employee{activeCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {employeesLoading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-600">Loading employees...</p>
            </div>
          ) : activeEmployees.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-600 mb-2">No active employees</p>
              <p className="text-sm text-slate-500">Register an employee using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left text-sm text-slate-600 border-b border-slate-200">
                    <th className="p-4 font-semibold">Photo</th>
                    <th className="p-4 font-semibold">Employee ID</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Department</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Country</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEmployees.map((emp) => {
                    const countryCode = emp.country ? nameToCode[emp.country] : null;

                    return (
                      <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <img
                            src={emp.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.full_name)}&background=random`}
                            alt={emp.full_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                          />
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800">{emp.employee_id || "—"}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-slate-800">{emp.full_name}</span>
                        </td>
                        <td className="p-4 text-slate-600">{emp.department}</td>
                        <td className="p-4 text-slate-600">{emp.role}</td>

                        <td className="p-4">
                          {emp.country && countryCode ? (
                            <div className="flex items-center gap-2">
                              <ReactCountryFlag
                                countryCode={countryCode}
                                svg
                                style={{ width: "1.2em", height: "1.2em" }}
                              />
                              <span className="text-sm text-slate-700">{emp.country}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Active
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(emp)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(emp)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit Employee"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setShowActionModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Employee Actions"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!employeesLoading && activeEmployees.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600 text-center">
              Showing {activeEmployees.length} active employee{activeEmployees.length !== 1 ? "s" : ""}
            </div>
          )}

        </div>


        {/* ================= INACTIVE EMPLOYEES ================= */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">

          {/* Dropdown Header */}
          <button
            type="button"
            onClick={() => setShowInactiveEmployees(prev => !prev)}
            className="w-full p-6 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-150 hover:to-slate-100 transition-colors"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>

                <div className="text-left">

                  <h2 className="text-2xl font-bold text-slate-800">
                    Inactive Employees
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {inactiveCount} inactive employee{inactiveCount !== 1 ? "s" : ""}
                  </p>

                </div>

              </div>

              <span
                className={`text-2xl text-slate-500 transition-transform duration-200 ${
                  showInactiveEmployees ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>

            </div>

          </button>


          {/* Dropdown Content */}
          {showInactiveEmployees && (
            <div>

              {inactiveEmployees.length === 0 ? (

                <div className="p-12 text-center">

                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-slate-400" />
                  </div>

                  <p className="text-lg font-semibold text-slate-600">
                    No inactive employees
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Employees you deactivate will appear here.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>
                      <tr className="bg-slate-50 text-left text-sm text-slate-600 border-t border-b border-slate-200">
                        <th className="p-4 font-semibold">Photo</th>
                        <th className="p-4 font-semibold">Previous Employee ID</th>
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Department</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold">Country</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>

                    <tbody>

                      {inactiveEmployees.map((emp) => {

                        const countryCode = emp.country ? nameToCode[emp.country] : null;

                        return (
                          <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">

                            <td className="p-4">
                              <img
                                src={emp.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.full_name)}&background=random`}
                                alt={emp.full_name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                              />
                            </td>

                            <td className="p-4">
                              <span className="font-semibold text-slate-600">
                                {emp.previous_employee_id || "—"}
                              </span>
                            </td>

                            <td className="p-4">
                              <span className="font-medium text-slate-800">{emp.full_name}</span>
                            </td>

                            <td className="p-4 text-slate-600">{emp.department}</td>

                            <td className="p-4 text-slate-600">{emp.role}</td>

                            <td className="p-4">
                              {emp.country && countryCode ? (
                                <div className="flex items-center gap-2">
                                  <ReactCountryFlag
                                    countryCode={countryCode}
                                    svg
                                    style={{ width: "1.2em", height: "1.2em" }}
                                  />
                                  <span className="text-sm text-slate-700">{emp.country}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">—</span>
                              )}
                            </td>

                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-semibold">
                                <XCircle className="w-4 h-4" />
                                Inactive
                              </span>
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {/* VIEW */}
                                <button
                                  onClick={() => handleView(emp)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* EDIT */}
                                <button
                                  onClick={() => handleEdit(emp)}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Edit Employee"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* REACTIVATE */}
                                <button
                                  onClick={() => handleReactivate(emp)}
                                  disabled={reactivatingId === emp.id}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Reactivate Employee"
                                >
                                  {reactivatingId === emp.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </button>

                                {/* ACTIONS (opens EmployeeActionModal) */}
                                <button
                                  onClick={() => {
                                    setSelectedEmployee(emp);
                                    setShowActionModal(true);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Employee Actions"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>

              )}

            </div>
          )}

          {/* Collapsed footer */}
          {!showInactiveEmployees && (
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
              Click to view inactive employees
            </div>
          )}

        </div>

      </div>

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800">Employee Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Photo */}
              <div className="flex justify-center">
                <img
                  src={selectedEmployee.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee.full_name)}&background=random&size=200`}
                  alt={selectedEmployee.full_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 shadow-lg"
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Employee ID</label>
                  <p className="text-lg text-slate-800 mt-1">{selectedEmployee.employee_id || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Full Name</label>
                  <p className="text-lg text-slate-800 mt-1">{selectedEmployee.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Department</label>
                  <p className="text-lg text-slate-800 mt-1">{selectedEmployee.department}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Role</label>
                  <p className="text-lg text-slate-800 mt-1">{selectedEmployee.role}</p>
                </div>

                {/* ✅ Country in modal */}
                <div>
                  <label className="text-sm font-semibold text-slate-600">Country</label>
                  <div className="mt-1">
                    {selectedEmployee.country && nameToCode[selectedEmployee.country] ? (
                      <div className="flex items-center gap-2">
                        <ReactCountryFlag
                          countryCode={nameToCode[selectedEmployee.country]}
                          svg
                          style={{ width: "1.4em", height: "1.4em" }}
                        />
                        <span className="text-lg text-slate-800">{selectedEmployee.country}</span>
                      </div>
                    ) : (
                      <p className="text-lg text-slate-400">—</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600">Registration Date</label>
                  <p className="text-lg text-slate-800 mt-1">
                    {new Date(selectedEmployee.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Biometric Enrollments */}
              {selectedEmployee.biometric_enrollments && selectedEmployee.biometric_enrollments.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Biometric Enrollments</label>
                  <div className="space-y-2">
                    {selectedEmployee.biometric_enrollments.map((enrollment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-700 font-medium capitalize">{enrollment.biometric_type}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          enrollment.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {enrollment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl">
            <UpdateEmployeeForm
              employee={selectedEmployee}
              orgId={profile.org_id}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}

      {/* Employee Action Modal */}
      {showActionModal && selectedEmployee && (
        <EmployeeActionModal
          employee={selectedEmployee}
          orgId={profile.org_id}
          onClose={() => {
            setShowActionModal(false);
            setSelectedEmployee(null);
          }}
          onSuccess={() => {
            fetchEmployees(profile.org_id);
          }}
        />
      )}
    </div>
  );
}