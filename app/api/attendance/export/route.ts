import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Singapore timezone formatters
const formatSGTime = (date: Date) =>
  date.toLocaleTimeString("en-SG", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatSGDateTime = (date: Date) =>
  date.toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
  });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    /* ================= AUTH ================= */
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ================= ORG INFO ================= */
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id, organization_logo")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json({ error: "Org not found" }, { status: 400 });
    }

    const orgName = profile.org_id;
    const logoUrl = profile.organization_logo;

    /* ================= WORK SCHEDULE ================= */
    const { data: scheduleData } = await supabase
      .from("work_schedules")
      .select("morning_start, morning_end, evening_start, evening_end")
      .eq("org_id", orgName)
      .maybeSingle();

    const schedule = scheduleData || {
      morning_start: "09:00",
      morning_end: "12:00",
      evening_start: "13:00",
      evening_end: "17:00",
    };

    /* ================= DATE LOGIC ================= */
    const startOfDay = `${date}T00:00:00Z`;
    const endOfDay = `${date}T23:59:59Z`;
    const isToday = date === new Date().toISOString().slice(0, 10);

    /* ================= EMPLOYEES ================= */
    const { data: employees } = await supabase
      .from("employees")
      .select("id, employee_id, full_name, role")
      .eq("org_id", orgName);

    /* ================= LOGS ================= */
    const { data: logs } = await supabase
      .from("attendance_logs")
      .select("employee_id, event_time")
      .eq("org_id", orgName)
      .gte("event_time", startOfDay)
      .lte("event_time", endOfDay)
      .order("event_time", { ascending: true });

    const logMap = new Map<string, Date[]>();
    logs?.forEach(l => {
      if (!logMap.has(l.employee_id)) logMap.set(l.employee_id, []);
      logMap.get(l.employee_id)!.push(new Date(l.event_time));
    });

    /* ================= LATE/EARLY CHECKER (SINGAPORE TIME) ================= */
    const checkLateOrEarly = (checkInTime: Date) => {
      // Convert UTC time to Singapore time for comparison
      const checkInSG = new Date(
        checkInTime.toLocaleString("en-US", { timeZone: "Asia/Singapore" })
      );

      const checkInHours = checkInSG.getHours();
      const checkInMinutes = checkInSG.getMinutes();
      
      const [morningStartH, morningStartM] = schedule.morning_start.split(':').map(Number);
      const [morningEndH, morningEndM] = schedule.morning_end.split(':').map(Number);
      const [eveningStartH, eveningStartM] = schedule.evening_start.split(':').map(Number);

      const morningStartMinutes = morningStartH * 60 + morningStartM;
      const morningEndMinutes = morningEndH * 60 + morningEndM;
      const eveningStartMinutes = eveningStartH * 60 + eveningStartM;
      const checkInTotalMinutes = checkInHours * 60 + checkInMinutes;

      let isLate = false;
      let isEarly = false;

      // Check if in morning shift
      if (checkInTotalMinutes >= morningStartMinutes - 60 && checkInTotalMinutes <= morningEndMinutes + 60) {
        isLate = checkInTotalMinutes > morningStartMinutes + 15;
        isEarly = checkInTotalMinutes < morningStartMinutes - 15;
      }
      // Check if in evening shift
      else if (checkInTotalMinutes >= eveningStartMinutes - 60) {
        isLate = checkInTotalMinutes > eveningStartMinutes + 15;
        isEarly = checkInTotalMinutes < eveningStartMinutes - 15;
      }

      return { isLate, isEarly };
    };

    /* ================= PDF ================= */
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    let page = pdf.addPage([595, 842]); // A4
    let y = 800;

    const draw = (text: string, size = 11, isBold = false) => {
      if (y < 60) {
        page = pdf.addPage([595, 842]);
        y = 800;
      }
      page.drawText(text, { 
        x: 50, 
        y, 
        size, 
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0)
      });
      y -= 18;
    };

    /* ================= LOGO ================= */
    if (logoUrl && logoUrl.startsWith("http")) {
      try {
        const imgBytes = await fetch(logoUrl).then(r => r.arrayBuffer());
        const logo = logoUrl.toLowerCase().endsWith(".png")
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
      } catch (err) {
        console.error("Logo embedding failed:", err);
        // logo optional - continue without it
      }
    }

    /* ================= HEADER (SINGAPORE TIME) ================= */
    draw(orgName, 18, true);
    draw("Attendance Report", 14, true);
    draw(`Date: ${date}`, 12);
    draw(`Generated: ${formatSGDateTime(new Date())}`, 10);
    draw("--------------------------------------------------");
    draw("");

    /* ================= SUMMARY ================= */
    const presentCount = employees?.filter(emp => {
      const empLogs = logMap.get(emp.id) || [];
      return empLogs.length > 0;
    }).length || 0;

    const absentCount = (employees?.length || 0) - presentCount;
    const attendanceRate = employees?.length ? Math.round((presentCount / employees.length) * 100) : 0;

    draw(`Summary`, 12, true);
    draw(`Total Employees: ${employees?.length || 0}`);
    draw(`Present: ${presentCount}`);
    draw(`Absent: ${absentCount}`);
    draw(`Attendance Rate: ${attendanceRate}%`);
    draw("");
    draw("--------------------------------------------------");
    draw("");

    /* ================= ROWS (SINGAPORE TIME) ================= */
    employees?.forEach((emp, index) => {
      const empLogs = logMap.get(emp.id) || [];

      let status = "Absent";
      let checkIn = "-";
      let checkOut = "-";
      let statusNote = "";

      if (empLogs.length > 0) {
        status = "Present";
        const checkInTime = empLogs[0];
        checkIn = formatSGTime(checkInTime);
        checkOut = formatSGTime(empLogs[empLogs.length - 1]);
        
        const { isLate, isEarly } = checkLateOrEarly(checkInTime);
        if (isLate) statusNote = " (LATE)";
        if (isEarly) statusNote = " (EARLY)";
      } else if (isToday) {
        status = "Not Arrived";
      }

      draw(`${index + 1}. ${emp.full_name}`, 12, true);
      draw(`   Employee ID: ${emp.employee_id}`);
      draw(`   Role       : ${emp.role || "-"}`);
      draw(`   Status     : ${status}${statusNote}`);
      draw(`   Check-In   : ${checkIn}`);
      draw(`   Check-Out  : ${checkOut}`);
      draw("");
    });

    /* ================= FOOTER ================= */
    if (y > 100) {
      y = 80;
    } else {
      page = pdf.addPage([595, 842]);
      y = 80;
    }
    
    draw("--------------------------------------------------");
    draw(`Report generated by BioVerity AI Attendance System`, 9);
    draw(`Working Hours: ${schedule.morning_start} - ${schedule.morning_end}, ${schedule.evening_start} - ${schedule.evening_end}`, 8);

    /* ================= RETURN ================= */
    const pdfBytes = await pdf.save();

    return new NextResponse(pdfBytes as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="attendance-${date}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });

  } catch (err) {
    console.error("Attendance PDF error:", err);
    return NextResponse.json(
      { error: "Failed to generate attendance PDF" },
      { status: 500 }
    );
  }
}