"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LeaveApprovalPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [leaveDate, setLeaveDate] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", userData.user.id)
      .single();

    if (!profile?.org_id) return;

    const { data: leaveData } = await supabase
      .from("leave_applications")
      .select(`
        id,
        leave_date,
        remarks,
        status,
        employees!leave_applications_employee_id_fkey (
          full_name,
          employee_id,
          org_id
        )
      `)
      .eq("employees.org_id", profile.org_id)
      .order("leave_date", { ascending: false });

    setLeaves(leaveData || []);

    const { data: employeeData } = await supabase
      .from("employees")
      .select("id, full_name, employee_id")
      .eq("org_id", profile.org_id);

    setEmployees(employeeData || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    await supabase.from("leave_applications").update({ status }).eq("id", id);
    fetchLeaves();
  }

  async function assignLeave() {
    if (!selectedEmployee || !leaveDate) return;
    setAssigning(true);
    await supabase.from("leave_applications").insert({
      employee_id: selectedEmployee.id,
      leave_date: leaveDate,
      remarks: adminRemarks,
      status: "approved",
    });
    setLeaveDate("");
    setAdminRemarks("");
    setSelectedEmployee(null);
    setSearch("");
    setAssigning(false);
    fetchLeaves();
  }

  const filteredLeaves = leaves.filter((l) =>
    filterStatus === "all" ? true : l.status === filterStatus
  );

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "pending").length,
    approved: leaves.filter((l) => l.status === "approved").length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #f8fafc 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim { animation: fadeUp 0.35s ease both; }
        .anim-1 { animation-delay: 0.05s; }
        .anim-2 { animation-delay: 0.10s; }
        .anim-3 { animation-delay: 0.15s; }
        .anim-4 { animation-delay: 0.20s; }
        .card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .input-field {
          width: 100%;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: #1e293b;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
        }
        .btn-green {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-green:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,197,94,0.3); }
        .btn-green:disabled { opacity: 0.45; cursor: not-allowed; transform: none; filter: none; box-shadow: none; }
        .btn-approve {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white; border: none; border-radius: 8px;
          padding: 6px 14px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; gap: 4px;
        }
        .btn-approve:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .btn-reject {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white; border: none; border-radius: 8px;
          padding: 6px 14px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; gap: 4px;
        }
        .btn-reject:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .emp-row {
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.12s;
        }
        .emp-row:last-child { border-bottom: none; }
        .emp-row:hover { background: #f0fdf4; }
        .emp-row.selected { background: #dcfce7; }
        .leave-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: box-shadow 0.15s, transform 0.15s;
        }
        .leave-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09); transform: translateY(-1px); }
        .filter-btn {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: 1.5px solid #e2e8f0;
          background: white;
          color: #64748b;
          transition: all 0.15s;
          text-transform: capitalize;
        }
        .filter-btn:hover { border-color: #22c55e; color: #16a34a; }
        .filter-btn.active { background: #dcfce7; border-color: #22c55e; color: #16a34a; font-weight: 600; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="anim" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <img
            src="/assets/images/logo.png"
            alt="BioVerity AI"
            style={{ width: "64px", height: "64px", objectFit: "contain" }}
          />
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
              Bio<span style={{ color: "#16a34a" }}>Verity</span>{" "}
              <span style={{ color: "#2563eb" }}>AI</span>
            </h1>
            <p style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>
              Leave Management Portal
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", letterSpacing: "0.06em" }}>BIOVERITYAI.COM</span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
          {[
            { label: "Total",    value: stats.total,    color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
            { label: "Pending",  value: stats.pending,  color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
            { label: "Approved", value: stats.approved, color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
            { label: "Rejected", value: stats.rejected, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`anim anim-${i + 1}`}
              style={{
                background: s.bg,
                border: `1.5px solid ${s.border}`,
                borderRadius: "14px",
                padding: "16px 20px",
              }}
            >
              <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", margin: "0 0 4px" }}>
                {s.label}
              </p>
              <p style={{ fontSize: "32px", fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Assign Leave Panel ── */}
        <div className="card anim" style={{ padding: "24px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #bbf7d0" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Assign Leave</h3>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#16a34a", background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "2px 10px" }}>
              Admin
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Employee selector */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                Select Employee
              </label>
              <div style={{ position: "relative", marginBottom: "8px" }}>
                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "36px" }}
                />
              </div>
              <div style={{ maxHeight: "170px", overflowY: "auto", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px" }}>
                {employees
                  .filter((emp) => emp.full_name.toLowerCase().includes(search.toLowerCase()))
                  .map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`emp-row ${selectedEmployee?.id === emp.id ? "selected" : ""}`}
                    >
                      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                        {emp.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{emp.full_name}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>ID: {emp.employee_id}</p>
                      </div>
                      {selectedEmployee?.id === emp.id && (
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                {employees.filter((e) => e.full_name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                  <p style={{ textAlign: "center", padding: "16px", fontSize: "12px", color: "#94a3b8", margin: 0 }}>No employees found</p>
                )}
              </div>
            </div>

            {/* Date / remarks / button */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {selectedEmployee && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "10px", padding: "10px 14px" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#15803d" }}>{selectedEmployee.full_name}</span>
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Leave Date
                </label>
                <input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Remarks
                </label>
                <textarea
                  placeholder="Add remarks (optional)..."
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  rows={3}
                  className="input-field"
                  style={{ resize: "none" }}
                />
              </div>
              <button onClick={assignLeave} disabled={!selectedEmployee || !leaveDate || assigning} className="btn-green" style={{ width: "100%", justifyContent: "center" }}>
                {assigning ? (
                  <>
                    <svg className="spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 010 20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Assigning...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Assign Leave
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Leave Applications ── */}
        <div className="card anim" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Leave Applications</h3>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                <button key={f} onClick={() => setFilterStatus(f)} className={`filter-btn ${filterStatus === f ? "active" : ""}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <svg className="spin" width="28" height="28" fill="none" viewBox="0 0 24 24" style={{ display: "inline-block", marginBottom: "10px" }}>
                <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="3"/>
                <path d="M12 2a10 10 0 010 20" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Loading applications...</p>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>No leave requests found</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredLeaves.map((leave) => {
                const s = {
                  pending:  { bg: "#fffbeb", border: "#fde68a", color: "#d97706", dot: "#f59e0b" },
                  approved: { bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a", dot: "#22c55e" },
                  rejected: { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", dot: "#ef4444" },
                }[leave.status as string] || { bg: "#f1f5f9", border: "#e2e8f0", color: "#64748b", dot: "#94a3b8" };

                return (
                  <div key={leave.id} className="leave-card">
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, flexShrink: 0 }}>
                      {leave.employees?.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {leave.employees?.full_name}
                        </p>
                        <span style={{ fontSize: "11px", color: "#94a3b8", flexShrink: 0 }}>#{leave.employees?.employee_id}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            {new Date(leave.leave_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        {leave.remarks && (
                          <span style={{ fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
                            {leave.remarks}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: "20px", padding: "4px 12px", flexShrink: 0 }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot, display: "block" }} />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: s.color, textTransform: "capitalize" }}>{leave.status}</span>
                    </div>
                    {leave.status === "pending" && (
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        <button onClick={() => updateStatus(leave.id, "approved")} className="btn-approve">
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button onClick={() => updateStatus(leave.id, "rejected")} className="btn-reject">
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "11px", color: "#cbd5e1", marginTop: "20px", letterSpacing: "0.1em" }}>
          BIOVERITYAI.COM · BIOMETRICS IDENTIFICATION
        </p>
      </div>
    </div>
  );
}