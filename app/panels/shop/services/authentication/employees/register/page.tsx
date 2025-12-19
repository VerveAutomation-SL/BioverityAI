import EmployeeRegistrationForm from "@/app/components/EmployeeRegistrationForm";
import { UserPlus, Users, CheckCircle2, Eye, Edit, Trash2 } from "lucide-react";

export default function EmployeeRegistrationPage() {
  return (
    <div className="space-y-8 pt-20">
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
      <EmployeeRegistrationForm />

      {/* Registered Employees Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Registered Employees
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-sm text-slate-600 border-b border-slate-200">
                <th className="p-4 font-semibold">Photo</th>
                <th className="p-4 font-semibold">Employee ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                    alt="John Doe"
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                  />
                </td>
                <td className="p-4">
                  <span className="font-semibold text-slate-800">EMP-001</span>
                </td>
                <td className="p-4">
                  <span className="font-medium text-slate-800">John Doe</span>
                </td>
                <td className="p-4 text-slate-600">IT</td>
                <td className="p-4 text-slate-600">Software Engineer</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Active
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600 text-center">
          Showing 1 employee • <span className="text-emerald-600 font-semibold">1 Active</span>
        </div>
      </div>
    </div>
  );
}