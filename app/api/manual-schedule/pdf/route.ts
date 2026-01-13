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

    /* 1️⃣ Fetch schedules */
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

    /* 2️⃣ Fetch employees separately */
    const employeeIds = schedules.map(s => s.employee_id);

    const { data: employees, error: empErr } = await supabase
      .from("employees")
      .select("id, full_name, employee_id, department, role")
      .in("id", employeeIds);

    if (empErr || !employees) {
      throw empErr;
    }

    /* 3️⃣ Map employees by id */
    const empMap = new Map(
      employees.map(emp => [emp.id, emp])
    );

    /* 4️⃣ Create PDF */
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

    /* Header */
    draw("Daily Attendance Report", 15);
    draw(`Date: ${date}`, 12);
    draw("--------------------------------------------------");

    /* Rows */
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
