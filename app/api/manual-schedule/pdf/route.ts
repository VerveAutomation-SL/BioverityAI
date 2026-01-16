import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const org_id = searchParams.get("org_id");
    const date = searchParams.get("date");

    if (!org_id || !date) {
      return NextResponse.json(
        { error: "Missing org_id or date" },
        { status: 400 }
      );
    }

    /* =====================================================
       1️⃣ Fetch organization name + logo (SAFE)
    ===================================================== */
    const { data: orgRows, error: orgErr } = await supabase
      .from("profiles")
      .select("full_name, organization_logo")
      .eq("org_id", org_id)
      .limit(1);

    if (orgErr || !orgRows || orgRows.length === 0) {
      throw orgErr;
    }

    const org = orgRows[0];

    /* =====================================================
       2️⃣ Fetch schedules for the date
    ===================================================== */
    const { data: schedules, error: schedErr } = await supabase
      .from("manual_schedules")
      .select("employee_id, email, start_time, end_time")
      .eq("org_id", org_id)
      .eq("schedule_date", date)
      .order("start_time");

    if (schedErr || !schedules || schedules.length === 0) {
      return NextResponse.json(
        { error: "No attendance records found" },
        { status: 404 }
      );
    }

    /* =====================================================
       3️⃣ Fetch employees separately (CORRECT JOIN FIX)
    ===================================================== */
    const employeeIds = schedules.map(s => s.employee_id);

    const { data: employees, error: empErr } = await supabase
      .from("employees")
      .select("id, full_name, employee_id, department, role")
      .in("id", employeeIds);

    if (empErr || !employees) {
      throw empErr;
    }

    const empMap = new Map(
      employees.map(emp => [emp.id, emp])
    );

    /* =====================================================
       4️⃣ Create PDF
    ===================================================== */
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let page = pdf.addPage([595, 842]); // A4
    let y = 800;

    const draw = (text: string, size = 11) => {
      if (y < 60) {
        page = pdf.addPage([595, 842]);
        y = 800;
      }
      page.drawText(text, { x: 50, y, size, font });
      y -= 18;
    };

    /* =====================================================
       5️⃣ Draw Logo (optional)
    ===================================================== */
    if (org.organization_logo && org.organization_logo.startsWith("http")) {
      try {
        const imgBytes = await fetch(org.organization_logo).then(r =>
          r.arrayBuffer()
        );

        const logo = org.organization_logo.endsWith(".png")
          ? await pdf.embedPng(imgBytes)
          : await pdf.embedJpg(imgBytes);

        const dims = logo.scale(0.25);

        page.drawImage(logo, {
          x: 50,
          y: 780,
          width: dims.width,
          height: dims.height,
        });

        y = 760;
      } catch {
        // Logo failure should NEVER break PDF
      }
    }

    /* =====================================================
       6️⃣ Header
    ===================================================== */
    draw(org.full_name, 16);
    draw("Daily Attendance Report", 14);
    draw(`Date: ${date}`, 12);
    draw("--------------------------------------------------");

    /* =====================================================
       7️⃣ Attendance Rows
    ===================================================== */
    for (const row of schedules) {
      const emp = empMap.get(row.employee_id);
      if (!emp) continue;

      draw(`Name       : ${emp.full_name}`);
      draw(`Employee ID: ${emp.employee_id}`);
      draw(`Department : ${emp.department ?? "-"}`);
      draw(`Role       : ${emp.role ?? "-"}`);
      draw(`Email      : ${row.email}`);
      draw(`Check-In   : ${row.start_time ?? "-"}`);
      draw(`Check-Out  : ${row.end_time ?? "-"}`);
      draw("--------------------------------------------------");
    }

    /* =====================================================
       8️⃣ Return PDF
    ===================================================== */
    const pdfBytes = await pdf.save();

    return new NextResponse(pdfBytes as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=attendance-${date}.pdf`,
      },
    });

  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Internal server error while generating PDF" },
      { status: 500 }
    );
  }
}
