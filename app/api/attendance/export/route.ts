import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatSGTime, formatSGDateTime, toSGDate, sgDayRange } from "@/lib/time";

function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

async function fetchImage(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch { return null; }
}

function rect(
  page: ReturnType<PDFDocument["addPage"]>,
  x: number, y: number, w: number, h: number,
  colour: ReturnType<typeof rgb>
) {
  page.drawRectangle({ x, y, width: w, height: h, color: colour });
}

function drawPieChart(
  page: ReturnType<PDFDocument["addPage"]>,
  cx: number, cy: number, radius: number,
  slices: { value: number; colour: ReturnType<typeof rgb> }[]
) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return;
  const nonZero = slices.filter(sl => sl.value > 0);
  if (nonZero.length === 1) {
    page.drawCircle({ x: cx, y: cy, size: radius, color: nonZero[0].colour });
    page.drawCircle({ x: cx, y: cy, size: radius, borderColor: rgb(1, 1, 1), borderWidth: 2 });
    return;
  }
  const colourA = slices[0].colour;
  const colourB = slices[1].colour;
  const fracA   = slices[0].value / total;
  const fracB   = slices[1].value / total;
  const numCols = Math.ceil(radius * 2) + 1;
  for (let i = 0; i < numCols; i++) {
    const xOff  = -radius + (i / (numCols - 1)) * 2 * radius;
    const halfH = Math.sqrt(Math.max(0, radius * radius - xOff * xOff));
    if (halfH < 0.5) continue;
    const yBot = cy - halfH;
    const colH = (cy + halfH) - yBot;
    const colW = (2 * radius / numCols) + 1.5;
    const hA   = colH * fracA;
    const hB   = colH * fracB;
    const xPos = cx + xOff;
    if (hA > 0) page.drawRectangle({ x: xPos - colW / 2, y: yBot,      width: colW, height: hA + 0.5, color: colourA });
    if (hB > 0) page.drawRectangle({ x: xPos - colW / 2, y: yBot + hA, width: colW, height: hB + 0.5, color: colourB });
  }
  page.drawCircle({ x: cx, y: cy, size: radius, borderColor: rgb(1, 1, 1), borderWidth: 3 });
}

function drawBarChart(
  page: ReturnType<PDFDocument["addPage"]>,
  x: number, y: number, chartW: number, chartH: number,
  bars: { label: string; presentVal: number; absentVal: number; totalVal: number }[],
  maxVal: number,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontSize: number,
  green: ReturnType<typeof rgb>,
  danger: ReturnType<typeof rgb>
) {
  if (bars.length === 0 || maxVal === 0) return;
  const groupW = chartW / bars.length;
  const barW   = Math.min(groupW * 0.6, 50);
  const gap    = (groupW - barW) / 2;
  page.drawLine({ start: { x, y }, end: { x: x + chartW, y }, thickness: 1, color: hex("#cccccc") });
  bars.forEach((bar, i) => {
    const bX       = x + i * groupW + gap;
    const presentH = (bar.presentVal / maxVal) * chartH;
    const absentH  = (bar.absentVal  / maxVal) * chartH;
    if (presentH > 0) page.drawRectangle({ x: bX, y,               width: barW, height: presentH, color: green  });
    if (absentH  > 0) page.drawRectangle({ x: bX, y: y + presentH, width: barW, height: absentH,  color: danger });
    const totalStr = String(bar.totalVal);
    const tw = font.widthOfTextAtSize(totalStr, fontSize);
    page.drawText(totalStr, { x: bX + (barW - tw) / 2, y: y + presentH + absentH + 4, size: fontSize,     font, color: hex("#333333") });
    const lw = font.widthOfTextAtSize(bar.label, fontSize - 1);
    page.drawText(bar.label, { x: bX + (barW - lw) / 2, y: y - 13,                    size: fontSize - 1, font, color: hex("#555555") });
  });
}

const sgRangeFromParams = (params: URLSearchParams) => {
  const type = params.get("type");

  if (type === "day") {
    const from = params.get("from");
    const to   = params.get("to");
    if (!from || !to) throw new Error("Missing from/to dates");
    return { start: sgDayRange(from).start, end: sgDayRange(to).end, label: `${from} to ${to}`, type: "day" };
  }

  if (type === "week") {
    const week = params.get("week");
    if (!week) throw new Error("Missing week parameter");
    const [year, weekNum] = week.split("-W").map(Number);
    const firstDay = new Date(year, 0, 1 + (weekNum - 1) * 7);
    const dayOfWeek = firstDay.getDay();
    firstDay.setDate(firstDay.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6);
    const start = firstDay.toISOString().slice(0, 10);
    const end   = lastDay.toISOString().slice(0, 10);
    return { start: sgDayRange(start).start, end: sgDayRange(end).end, label: `Week ${weekNum}, ${year}`, type: "week" };
  }

  if (type === "month") {
    const month = params.get("month");
    if (!month) throw new Error("Missing month parameter");
    const [y, m] = month.split("-");
    const start   = `${y}-${m}-01`;
    const lastDay = new Date(+y, +m, 0).getDate();
    const end     = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return { start: sgDayRange(start).start, end: sgDayRange(end).end, label: `${monthNames[+m - 1]} ${y}`, type: "month" };
  }

  if (type === "year") {
    const year = params.get("year");
    if (!year) throw new Error("Missing year parameter");
    return { start: sgDayRange(`${year}-01-01`).start, end: sgDayRange(`${year}-12-31`).end, label: year, type: "year" };
  }

  throw new Error("Invalid report type");
};

const countDaysBetween = (startISO: string, endISO: string) => {
  const s = new Date(startISO.slice(0, 10));
  const e = new Date(endISO.slice(0, 10));
  let count = 0;
  while (s <= e) { count++; s.setDate(s.getDate() + 1); }
  return count;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("org_id, organization_logo").eq("id", user.id).single();
    if (!profile?.org_id) return NextResponse.json({ error: "Org not found" }, { status: 400 });

    const orgName = profile.org_id;
    const logoUrl = profile.organization_logo ?? null;

    const { data: scheduleData } = await supabase
      .from("work_schedules")
      .select("morning_start, morning_end, evening_start, evening_end")
      .eq("org_id", orgName).maybeSingle();

    const schedule = scheduleData ?? {
      morning_start: "09:00", morning_end: "12:00",
      evening_start: "13:00", evening_end: "17:00",
    };

    const { start, end, label, type } = sgRangeFromParams(searchParams);
    const { data: rawEmployees } = await supabase
      .from("employees").select("id, employee_id, full_name, role").eq("org_id", orgName);

    const employees = (rawEmployees ?? []).sort((a, b) =>
      a.employee_id.localeCompare(b.employee_id, undefined, { numeric: true, sensitivity: "base" })
    );

    const { data: logs } = await supabase
      .from("attendance_logs").select("employee_id, event_time")
      .eq("org_id", orgName).gte("event_time", start).lte("event_time", end)
      .order("event_time", { ascending: true });

    const logMap = new Map<string, Date[]>();
    logs?.forEach(l => {
      if (!logMap.has(l.employee_id)) logMap.set(l.employee_id, []);
      logMap.get(l.employee_id)!.push(new Date(l.event_time));
    });

    const checkLateOrEarly = (checkInTime: Date) => {
      const sgCheckIn = toSGDate(checkInTime);
      const totalMins = sgCheckIn.getHours() * 60 + sgCheckIn.getMinutes();
      const [msH, msM] = schedule.morning_start.split(":").map(Number);
      const [meH, meM] = schedule.morning_end.split(":").map(Number);
      const [esH, esM] = schedule.evening_start.split(":").map(Number);
      const msMin = msH * 60 + msM;
      const meMin = meH * 60 + meM;
      const esMin = esH * 60 + esM;
      let isLate = false, isEarly = false;
      if (totalMins >= msMin - 60 && totalMins <= meMin + 60) {
        isLate  = totalMins > msMin + 15;
        isEarly = totalMins < msMin - 15;
      } else if (totalMins >= esMin - 60) {
        isLate  = totalMins > esMin + 15;
        isEarly = totalMins < esMin - 15;
      }
      return { isLate, isEarly };
    };

    let presentCount: number, absentCount: number, attendanceRate: number, totalDays: number;

    if (type === "day") {
      presentCount  = employees?.filter(e => (logMap.get(e.id) ?? []).length > 0).length ?? 0;
      absentCount   = (employees?.length ?? 0) - presentCount;
      attendanceRate = employees?.length ? Math.round((presentCount / employees.length) * 100) : 0;
      totalDays = 1;
    } else {
      const uniqueAttendances = new Set<string>();
      logs?.forEach(l => uniqueAttendances.add(`${l.employee_id}-${l.event_time.slice(0, 10)}`));
      totalDays = countDaysBetween(start, end);
      const expected = (employees?.length ?? 0) * totalDays;
      presentCount   = uniqueAttendances.size;
      absentCount    = expected - presentCount;
      attendanceRate = expected > 0 ? Math.round((presentCount / expected) * 100) : 0;
    }

    let lateCount = 0, earlyCount = 0;
    if (type === "day") {
      employees?.forEach(emp => {
        const empLogs = logMap.get(emp.id) ?? [];
        if (empLogs.length > 0) {
          const { isLate, isEarly } = checkLateOrEarly(empLogs[0]);
          if (isLate)  lateCount++;
          if (isEarly) earlyCount++;
        }
      });
    }

    const pdf    = await PDFDocument.create();
    const pageW  = 842, pageH = 595, M = 40;

    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontReg  = await pdf.embedFont(StandardFonts.Helvetica);

    const C = {
      primary:   hex("#0d6efd"), danger:    hex("#dc3545"),
      white:     rgb(1, 1, 1),  dark:      hex("#212529"),
      headerBg:  hex("#f1f3f5"), headerTxt: hex("#495057"),
      green:     hex("#198754"), purple:    hex("#6f42c1"),
      cyan:      hex("#0dcaf0"), orange:    hex("#e67e22"),
      rowAlt:    hex("#f0f4ff"), divider:   hex("#dee2e6"),
    };

    const drawOrgLogo = async (
      pg: ReturnType<PDFDocument["addPage"]>,
      cx: number, cy: number, R: number,
      url: string | null, name: string
    ) => {
      let embedded = false;
      if (url) {
        const imgBytes = await fetchImage(url);
        if (imgBytes) {
          try {
            const isJpeg = imgBytes[0] === 0xff && imgBytes[1] === 0xd8;
            const img    = isJpeg ? await pdf.embedJpg(imgBytes) : await pdf.embedPng(imgBytes);
            const dim    = img.scaleToFit(R * 2, R * 2);
            pg.drawImage(img, { x: cx - dim.width / 2, y: cy - dim.height / 2, width: dim.width, height: dim.height });
            embedded = true;
          } catch (e) { console.warn("Logo embed failed:", e); }
        }
      }
      if (!embedded) {
        const initials = name.split(" ").map((w: string) => w[0] || "").join("").slice(0, 2).toUpperCase();
        const fs = R * 0.65;
        const iw = fontBold.widthOfTextAtSize(initials, fs);
        pg.drawText(initials, { x: cx - iw / 2, y: cy - fs * 0.35, size: fs, font: fontBold, color: C.dark });
      }
    };

    /* ── Page header ── */
    const drawPageHeader = async (pg: ReturnType<PDFDocument["addPage"]>, title: string, subtitle: string) => {
      rect(pg, 0, pageH - 100, pageW, 100, C.headerBg);
      rect(pg, 0, pageH - 103, pageW, 3,   C.primary);

      const bvBytes = await fetchImage("https://bioverityai.com/assets/images/logo.png");
      if (bvBytes) {
        try {
          const bvImg = await pdf.embedPng(bvBytes);
          const bvDim = bvImg.scale(0.12);
          pg.drawImage(bvImg, { x: M, y: pageH - 90, width: bvDim.width, height: bvDim.height });
        } catch { /* skip */ }
      }

      const titleW = fontBold.widthOfTextAtSize(title, 20);
      pg.drawText(title,    { x: (pageW - titleW)    / 2, y: pageH - 48, size: 20, font: fontBold, color: C.headerTxt });
      const subW   = fontReg.widthOfTextAtSize(subtitle, 10);
      pg.drawText(subtitle, { x: (pageW - subW)      / 2, y: pageH - 68, size: 10, font: fontReg,  color: C.headerTxt });

      const badgeR  = 30, badgeCX = pageW - M - badgeR, badgeCY = pageH - 52;
      await drawOrgLogo(pg, badgeCX, badgeCY, badgeR, logoUrl, orgName);

      const nameFontSize = 9, nameMaxW = 160;
      const nameLines: string[] = [];
      let   currentLine = "";
      for (const word of orgName.split(" ")) {
        const test = currentLine ? `${currentLine} ${word}` : word;
        if (fontBold.widthOfTextAtSize(test, nameFontSize) <= nameMaxW) { currentLine = test; }
        else { if (currentLine) nameLines.push(currentLine); currentLine = word; }
      }
      if (currentLine) nameLines.push(currentLine);

      const nameBaseY = badgeCY - badgeR - 6;
      nameLines.forEach((line, li) => {
        const lw = fontBold.widthOfTextAtSize(line, nameFontSize);
        pg.drawText(line, { x: badgeCX - lw / 2, y: nameBaseY - li * (nameFontSize + 3), size: nameFontSize, font: fontBold, color: C.dark });
      });
    };

    const drawPageFooter = (pg: ReturnType<PDFDocument["addPage"]>, pageNum: number, total: number) => {
      rect(pg, 0, 0, pageW, 22, C.headerBg);
      pg.drawText(
        `Generated by BioVerity AI  ·  bioverityai.com  ·  ${formatSGDateTime(new Date())}  ·  Working Hours: ${schedule.morning_start}–${schedule.morning_end}, ${schedule.evening_start}–${schedule.evening_end}   |   Page ${pageNum} of ${total}`,
        { x: M, y: 6, size: 8, font: fontReg, color: C.headerTxt }
      );
    };

    /* ══════ PAGE 1 — SUMMARY DASHBOARD ══════ */
    const page1 = pdf.addPage([pageW, pageH]);
    await drawPageHeader(page1, "BioVerity AI Attendance Report", `Period: ${label}`);

    const kpiY = pageH - 150;
    const cards = type === "day"
      ? [
          { label: "Total Employees", value: employees?.length ?? 0, colour: C.primary },
          { label: "Present",         value: presentCount,           colour: C.green   },
          { label: "Absent",          value: absentCount,            colour: C.danger  },
          { label: "Late",            value: lateCount,              colour: C.orange  },
          { label: "Early",           value: earlyCount,             colour: C.purple  },
        ]
      : [
          { label: "Total Employees",  value: employees?.length ?? 0,    colour: C.primary },
          { label: "Total Attendances",value: presentCount,              colour: C.green   },
          { label: "Absences",         value: absentCount,               colour: C.danger  },
          { label: "Days in Period",   value: totalDays,                 colour: C.cyan    },
          { label: "Attendance Rate",  value: `${attendanceRate}%` as unknown as number, colour: C.purple  },
        ];

    const cardW = (pageW - M * 2 - 16) / cards.length;
    cards.forEach((card, i) => {
      const cx = M + i * (cardW + 4);
      rect(page1, cx, kpiY - 55, cardW, 55, card.colour);
      const vStr = String(card.value);
      const vw = fontBold.widthOfTextAtSize(vStr, 22);
      page1.drawText(vStr,      { x: cx + (cardW - vw)  / 2, y: kpiY - 25, size: 22, font: fontBold, color: C.white });
      const lw = fontReg.widthOfTextAtSize(card.label, 8);
      page1.drawText(card.label,{ x: cx + (cardW - lw)  / 2, y: kpiY - 45, size: 8,  font: fontReg,  color: C.white });
    });

    rect(page1, M, kpiY - 63, pageW - M * 2, 1, C.divider);

    const sharedLegY = 55;
    const zone1X = M, zone1W = (pageW - M * 2 - 20) / 2;
    const zone2X = zone1X + zone1W + 20, zone2W = zone1W;
    const pieTitleY = kpiY - 78;

    const legItems = type === "day"
      ? [{ label: `Present (${presentCount})`, colour: C.green }, { label: `Absent (${absentCount})`, colour: C.danger }]
      : [{ label: `Attended (${presentCount})`, colour: C.green }, { label: `Absent (${absentCount})`, colour: C.danger }];

    const legBoxSize = 12, legTextGap = 6, legItemGap = 25;
    const legTotalW  = legItems.reduce((s, l) => s + legBoxSize + legTextGap + fontReg.widthOfTextAtSize(l.label, 10), 0) + legItemGap * (legItems.length - 1);
    let legCurX      = zone1X + (zone1W - legTotalW) / 2;
    legItems.forEach(l => {
      rect(page1, legCurX, sharedLegY, legBoxSize, legBoxSize, l.colour);
      page1.drawText(l.label, { x: legCurX + legBoxSize + legTextGap, y: sharedLegY + 2, size: 10, font: fontReg, color: C.dark });
      legCurX += legBoxSize + legTextGap + fontReg.widthOfTextAtSize(l.label, 10) + legItemGap;
    });

    /* Pie chart */
    const pieTitleStr = type === "day" ? "Present vs Absent" : "Attendances vs Absences";
    page1.drawText(pieTitleStr, {
      x: zone1X + (zone1W - fontBold.widthOfTextAtSize(pieTitleStr, 11)) / 2,
      y: pieTitleY, size: 11, font: fontBold, color: C.dark,
    });
    drawPieChart(page1, zone1X + zone1W / 2, 215, 90, [
      { value: presentCount, colour: C.green  },
      { value: absentCount,  colour: C.danger },
    ]);

    /* Bar chart */
    const barTitleStr = type === "day"
      ? "Punctuality Breakdown by Role"
      : "Attendance Days by Employee (Top 8)";

    page1.drawText(barTitleStr, {
      x: zone2X + (zone2W - fontBold.widthOfTextAtSize(barTitleStr, 11)) / 2,
      y: pieTitleY, size: 11, font: fontBold, color: C.dark,
    });

    let deptBars: { label: string; presentVal: number; absentVal: number; totalVal: number }[] = [];

    if (type === "day") {
      const roleMap = new Map<string, { present: number; flagged: number; total: number }>();
      employees?.forEach(emp => {
        const role = (emp.role || "Other").slice(0, 10);
        if (!roleMap.has(role)) roleMap.set(role, { present: 0, flagged: 0, total: 0 });
        const entry  = roleMap.get(role)!;
        const empLogs = logMap.get(emp.id) ?? [];
        entry.total++;
        if (empLogs.length > 0) {
          const { isLate, isEarly } = checkLateOrEarly(empLogs[0]);
          if (isLate || isEarly) entry.flagged++;
          else entry.present++;
        }
      });
      deptBars = Array.from(roleMap.entries()).slice(0, 8).map(([role, v]) => ({
        label:      role.length > 9 ? role.slice(0, 8) + "…" : role,
        presentVal: v.present,
        absentVal:  v.flagged,
        totalVal:   v.total,
      }));
    } else {
      deptBars = (employees ?? [])
        .map(emp => {
          const empDays = new Set<string>();
          (logMap.get(emp.id) ?? []).forEach(d => empDays.add(d.toISOString().slice(0, 10)));
          const presentDays = empDays.size;
          const absentDays  = Math.max(totalDays - presentDays, 0);
          return {
            label:      emp.full_name.split(" ")[0].slice(0, 9),
            presentVal: presentDays,
            absentVal:  absentDays,
            totalVal:   totalDays,
          };
        })
        .sort((a, b) => b.presentVal - a.presentVal)
        .slice(0, 8);
    }

    const deptMaxVal = Math.max(...deptBars.map(b => b.totalVal), 1);
    drawBarChart(
      page1, zone2X, sharedLegY + 28, zone2W,
      pieTitleY - 15 - (sharedLegY + 28),
      deptBars, deptMaxVal, fontReg, 9, C.green, C.danger
    );

    drawPageFooter(page1, 1, 2);

    /* ══════ PAGE 2 — EMPLOYEE DETAIL TABLE ══════ */
    const page2 = pdf.addPage([pageW, pageH]);
    await drawPageHeader(page2, "BioVerity AI Employee Attendance Details", `Period: ${label}`);

    const tY = pageH - 115;

    const cols = type === "day"
      ? [
          { label: "#",           w: 28  },
          { label: "Employee ID", w: 80  },
          { label: "Full Name",   w: 150 },
          { label: "Role",        w: 110 },
          { label: "Status",      w: 70  },
          { label: "Check-In",    w: 152 },
          { label: "Check-Out",   w: 152 },
        ]
      : [
          { label: "#",           w: 28  },
          { label: "Employee ID", w: 80  },
          { label: "Full Name",   w: 150 },
          { label: "Role",        w: 110 },
          { label: "Present",     w: 80  },
          { label: "Absent",      w: 80  },
          { label: "Rate",        w: 80  },
          { label: "Days",        w: 134 },
        ];

    const totalColW = cols.reduce((s, c) => s + c.w, 0);
    const tableX    = (pageW - totalColW) / 2;

    const drawTableHeader = (pg: ReturnType<PDFDocument["addPage"]>, headerY: number) => {
      rect(pg, tableX, headerY - 20, totalColW, 22, C.primary);
      let cx = tableX;
      cols.forEach(col => {
        const lw = fontBold.widthOfTextAtSize(col.label, 9);
        pg.drawText(col.label, { x: cx + (col.w - lw) / 2, y: headerY - 14, size: 9, font: fontBold, color: C.white });
        cx += col.w;
      });
    };

    drawTableHeader(page2, tY);

    const rowH = 20;
    let rowY = tY - 20;
    let currentPage = page2;

    type PageTableInfo = { pg: ReturnType<PDFDocument["addPage"]>; tableTopY: number };
    const pageTableInfos: PageTableInfo[] = [{ pg: page2, tableTopY: tY - 20 }];

    const addNewTablePage = async () => {
      currentPage = pdf.addPage([pageW, pageH]);
      await drawPageHeader(currentPage, "BioVerity AI Employee Attendance Details", `Period: ${label}`);
      rowY = pageH - 115;
      drawTableHeader(currentPage, rowY);
      pageTableInfos.push({ pg: currentPage, tableTopY: rowY - 20 });
      rowY -= 20;
    };

    for (let idx = 0; idx < (employees?.length ?? 0); idx++) {
      const emp     = employees![idx];
      const empLogs = logMap.get(emp.id) ?? [];

      if (rowY - rowH < 30) await addNewTablePage();

      rect(currentPage, tableX, rowY - rowH, totalColW, rowH, idx % 2 === 0 ? C.rowAlt : C.white);

      let cells: string[];
      if (type === "day") {
        let status = "Absent", checkIn = "–", checkOut = "–";
        if (empLogs.length > 0) {
          const { isLate, isEarly } = checkLateOrEarly(empLogs[0]);
          status   = isLate ? "Late" : isEarly ? "Early" : "Present";
          checkIn  = formatSGTime(empLogs[0].toISOString());
          checkOut = formatSGTime(empLogs[empLogs.length - 1].toISOString());
        }
        cells = [String(idx + 1), emp.employee_id, emp.full_name, emp.role || "–", status, checkIn, checkOut];
      } else {
        const empDays = new Set<string>();
        empLogs.forEach(d => empDays.add(d.toISOString().slice(0, 10)));
        const presentDays    = empDays.size;
        const absentDays     = Math.max(totalDays - presentDays, 0);
        const empRate        = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        const barWidth       = 80;
        cells = [String(idx + 1), emp.employee_id, emp.full_name, emp.role || "–", `${presentDays}d`, `${absentDays}d`, `${empRate}%`, `${presentDays} / ${totalDays} days`];
      }

      let cx = tableX;
      cells.forEach((cell, ci) => {
        const col = cols[ci];
        const isStatus = ci === 4 && type === "day";
        const colour = isStatus
          ? (cell === "Present" ? C.green : cell === "Absent" ? C.danger : cell === "Late" ? C.orange : C.purple)
          : ci === 4 && type !== "day" ? C.green
          : ci === 5 && type !== "day" ? C.danger
          : C.dark;
        const fnt = isStatus ? fontBold : (ci === 4 || ci === 5) && type !== "day" ? fontBold : fontReg;
        const cw  = fnt.widthOfTextAtSize(cell, 9);
        currentPage.drawText(cell, { x: cx + (col.w - cw) / 2, y: rowY - rowH + 6, size: 9, font: fnt, color: colour });
        cx += col.w;
      });

      currentPage.drawLine({
        start: { x: tableX, y: rowY - rowH },
        end:   { x: tableX + totalColW, y: rowY - rowH },
        thickness: 0.3, color: C.divider,
      });

      rowY -= rowH;
    }

    pageTableInfos.forEach((info, pi) => {
      const isLast       = pi === pageTableInfos.length - 1;
      const tableBottomY = isLast ? rowY : 30;
      const tableTopY2   = info.tableTopY + 22;
      info.pg.drawLine({ start: { x: tableX,             y: tableBottomY }, end: { x: tableX,             y: tableTopY2   }, thickness: 1.5, color: C.green });
      info.pg.drawLine({ start: { x: tableX + totalColW, y: tableBottomY }, end: { x: tableX + totalColW, y: tableTopY2   }, thickness: 1.5, color: C.green });
      info.pg.drawLine({ start: { x: tableX,             y: tableBottomY }, end: { x: tableX + totalColW, y: tableBottomY }, thickness: 1.5, color: C.green });
    });

    const allPages = pdf.getPages();
    allPages.forEach((pg, i) => drawPageFooter(pg, i + 1, allPages.length));

    const pdfBytes = await pdf.save();
    return new NextResponse(pdfBytes as BodyInit, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="attendance-${label.replace(/\s+/g, "-")}.pdf"`,
        "Cache-Control":       "no-cache",
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