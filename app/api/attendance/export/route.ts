import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatSGTime, formatSGDateTime, toSGDate, sgDayRange } from "@/lib/time";

/* ================= SINGAPORE DATE RANGE HELPER ================= */
const sgRangeFromParams = (params: URLSearchParams) => {
  const type = params.get("type");

  if (type === "day") {
    const from = params.get("from");
    const to = params.get("to");
    if (!from || !to) throw new Error("Missing from/to dates");
    
    return {
      start: sgDayRange(from).start,
      end: sgDayRange(to).end,
      label: `${from} to ${to}`,
      type: "day",
    };
  }

  if (type === "week") {
    const week = params.get("week");
    if (!week) throw new Error("Missing week parameter");
    
    const [year, weekNum] = week.split("-W").map(Number);
    // Get first day of the week (Monday)
    const firstDay = new Date(year, 0, 1 + (weekNum - 1) * 7);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    firstDay.setDate(firstDay.getDate() + diff);
    
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6); // Sunday
    
    const start = firstDay.toISOString().slice(0, 10);
    const end = lastDay.toISOString().slice(0, 10);
    
    return {
      start: sgDayRange(start).start,
      end: sgDayRange(end).end,
      label: `Week ${weekNum}, ${year}`,
      type: "week",
    };
  }

  if (type === "month") {
    const month = params.get("month");
    if (!month) throw new Error("Missing month parameter");
    
    const [y, m] = month.split("-");
    const start = `${y}-${m}-01`;
    const lastDay = new Date(+y, +m, 0).getDate();
    const end = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const label = `${monthNames[+m - 1]} ${y}`;
    
    return {
      start: sgDayRange(start).start,
      end: sgDayRange(end).end,
      label,
      type: "month",
    };
  }

  if (type === "year") {
    const year = params.get("year");
    if (!year) throw new Error("Missing year parameter");
    
    return {
      start: sgDayRange(`${year}-01-01`).start,
      end: sgDayRange(`${year}-12-31`).end,
      label: year,
      type: "year",
    };
  }

  throw new Error("Invalid report type");
};

/* ================= COUNT DAYS IN RANGE HELPER ================= */
const countDaysBetween = (startISO: string, endISO: string) => {
  const start = new Date(startISO.slice(0, 10));
  const end = new Date(endISO.slice(0, 10));
  let count = 0;

  while (start <= end) {
    count++;
    start.setDate(start.getDate() + 1);
  }
  return count;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

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

    /* ================= DATE RANGE FROM PARAMS (SINGAPORE TIME) ================= */
    const { start, end, label, type } = sgRangeFromParams(searchParams);
    
    // Get current Singapore date for "isToday" check
    const nowSG = new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" });
    const todaySG = new Date(nowSG).toISOString().slice(0, 10);

    /* ================= EMPLOYEES ================= */
    const { data: employees } = await supabase
      .from("employees")
      .select("id, employee_id, full_name, role")
      .eq("org_id", orgName);

    /* ================= LOGS (SINGAPORE DAY BOUNDARIES) ================= */
    const { data: logs } = await supabase
      .from("attendance_logs")
      .select("employee_id, event_time")
      .eq("org_id", orgName)
      .gte("event_time", start)
      .lte("event_time", end)
      .order("event_time", { ascending: true });

    const logMap = new Map<string, Date[]>();
    logs?.forEach(l => {
      if (!logMap.has(l.employee_id)) logMap.set(l.employee_id, []);
      logMap.get(l.employee_id)!.push(new Date(l.event_time));
    });

    /* ================= LATE/EARLY CHECKER (SINGAPORE TIME) ================= */
    const checkLateOrEarly = (checkInTime: Date) => {
      const sgCheckIn = toSGDate(checkInTime);
      const hours = sgCheckIn.getHours();
      const minutes = sgCheckIn.getMinutes();
      
      const [morningStartH, morningStartM] = schedule.morning_start.split(':').map(Number);
      const [morningEndH, morningEndM] = schedule.morning_end.split(':').map(Number);
      const [eveningStartH, eveningStartM] = schedule.evening_start.split(':').map(Number);

      const morningStartMinutes = morningStartH * 60 + morningStartM;
      const morningEndMinutes = morningEndH * 60 + morningEndM;
      const eveningStartMinutes = eveningStartH * 60 + eveningStartM;
      const checkInTotalMinutes = hours * 60 + minutes;

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

    /* ================= SUMMARY CALCULATION (FIXED FOR MULTI-DAY) ================= */
    let presentCount: number;
    let absentCount: number;
    let attendanceRate: number;
    let totalDays: number;

    if (type === "day") {
      // For single day: count employees who checked in
      presentCount = employees?.filter(emp => {
        const empLogs = logMap.get(emp.id) || [];
        return empLogs.length > 0;
      }).length || 0;
      
      absentCount = (employees?.length || 0) - presentCount;
      attendanceRate = employees?.length ? Math.round((presentCount / employees.length) * 100) : 0;
      totalDays = 1;
    } else {
      // For multi-day: count unique employee-day combinations
      const uniqueAttendances = new Set<string>();
      logs?.forEach(l => {
        const day = l.event_time.slice(0, 10);
        uniqueAttendances.add(`${l.employee_id}-${day}`);
      });
      
      const totalEmployees = employees?.length || 0;
      totalDays = countDaysBetween(start, end);
      const expectedAttendances = totalEmployees * totalDays;
      
      presentCount = uniqueAttendances.size;
      absentCount = expectedAttendances - presentCount;
      attendanceRate = expectedAttendances > 0 ? Math.round((presentCount / expectedAttendances) * 100) : 0;
    }

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
    draw(`Period: ${label}`, 12);
    draw(`Generated: ${formatSGDateTime(new Date())}`, 10);
    draw("--------------------------------------------------");
    draw("");

    /* ================= SUMMARY ================= */
    draw(`Summary`, 12, true);
    draw(`Total Employees: ${employees?.length || 0}`);
    
    if (type === "day") {
      draw(`Present: ${presentCount}`);
      draw(`Absent: ${absentCount}`);
      draw(`Attendance Rate: ${attendanceRate}%`);
    } else {
      draw(`Total Attendances: ${presentCount}`);
      draw(`Expected Attendances: ${presentCount + absentCount}`);
      draw(`Attendance Rate: ${attendanceRate}%`);
    }
    
    draw("");
    draw("--------------------------------------------------");
    draw("");

    /* ================= ROWS (SINGAPORE TIME) ================= */
    employees?.forEach((emp, index) => {
      const empLogs = logMap.get(emp.id) || [];

      if (type === "day") {
        // Single day format - show check-in/check-out details
        let status = "Absent";
        let checkIn = "-";
        let checkOut = "-";
        let statusNote = "";

        if (empLogs.length > 0) {
          status = "Present";
          const checkInTime = empLogs[0];
          checkIn = formatSGTime(checkInTime.toISOString());
          checkOut = formatSGTime(empLogs[empLogs.length - 1].toISOString());
          
          const { isLate, isEarly } = checkLateOrEarly(checkInTime);
          if (isLate) statusNote = " (LATE)";
          if (isEarly) statusNote = " (EARLY)";
        }

        draw(`${index + 1}. ${emp.full_name}`, 12, true);
        draw(`   Employee ID: ${emp.employee_id}`);
        draw(`   Role       : ${emp.role || "-"}`);
        draw(`   Status     : ${status}${statusNote}`);
        draw(`   Check-In   : ${checkIn}`);
        draw(`   Check-Out  : ${checkOut}`);
        draw("");
      } else {
        // Multi-day format - show attendance summary
        const empDaysPresent = new Set<string>();
        empLogs.forEach(log => {
          empDaysPresent.add(log.toISOString().slice(0, 10));
        });
        
        const presentDays = empDaysPresent.size;
        const absentDays = Math.max(totalDays - presentDays, 0);
        const attendanceRate = totalDays > 0 
          ? Math.round((presentDays / totalDays) * 100) 
          : 0;

        draw(`${index + 1}. ${emp.full_name}`, 12, true);
        draw(`   Employee ID: ${emp.employee_id}`);
        draw(`   Role       : ${emp.role || "-"}`);
        draw(`   Present    : ${presentDays} days`);
        draw(`   Absent     : ${absentDays} days`);
        draw(`   Rate       : ${attendanceRate}%`);
        draw("");
      }
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
        "Content-Disposition": `attachment; filename="attendance-${label.replace(/\s+/g, '-')}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });

  } catch (err) {
    console.error("Attendance PDF error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate attendance PDF" },
      { status: 500 }
    );
  }
}