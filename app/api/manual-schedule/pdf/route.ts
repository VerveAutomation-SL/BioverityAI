import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const org_id = searchParams.get("org_id");
    const date   = searchParams.get("date");

    if (!org_id || !date) {
      return NextResponse.json({ error: "Missing org_id or date" }, { status: 400 });
    }

    const { data: orgRows, error: orgErr } = await supabase
      .from("profiles").select("full_name, organization_logo")
      .eq("org_id", org_id).limit(1);

    if (orgErr || !orgRows || orgRows.length === 0) throw orgErr;
    const org = orgRows[0];

    const { data: schedules, error: schedErr } = await supabase
      .from("manual_schedules")
      .select("employee_id, email, start_time, end_time")
      .eq("org_id", org_id).eq("schedule_date", date)
      .order("start_time");

    if (schedErr) throw schedErr;

    const safeSchedules = schedules ?? [];
    const employeeIds = safeSchedules.map(s => s.employee_id);

    let employees: { id: string; full_name: string; employee_id: string; department: string | null; role: string | null }[] = [];
    let empMap = new Map<string, typeof employees[0]>();

    if (employeeIds.length > 0) {
      const { data: rawEmployees, error: empErr } = await supabase
        .from("employees").select("id, full_name, employee_id, department, role")
        .in("id", employeeIds);
      if (empErr || !rawEmployees) throw empErr;
      employees = rawEmployees.sort((a, b) =>
        a.employee_id.localeCompare(b.employee_id, undefined, { numeric: true, sensitivity: "base" })
      );
      empMap = new Map(employees.map(emp => [emp.id, emp]));
    }

    const totalScheduled = safeSchedules.length;
    const checkedIn      = safeSchedules.filter(s => !!s.start_time).length;
    const checkedOut     = safeSchedules.filter(s => !!s.end_time).length;
    const notCheckedIn   = totalScheduled - checkedIn;

    const deptMap = new Map<string, { checkedIn: number; missing: number; total: number }>();
    safeSchedules.forEach(s => {
      const emp  = empMap.get(s.employee_id);
      const dept = (emp?.department ?? "Other").slice(0, 10);
      if (!deptMap.has(dept)) deptMap.set(dept, { checkedIn: 0, missing: 0, total: 0 });
      const entry = deptMap.get(dept)!;
      entry.total++;
      if (s.start_time) entry.checkedIn++;
      else entry.missing++;
    });

    const deptBars = Array.from(deptMap.entries()).map(([dept, v]) => ({
      label:      dept.length > 9 ? dept.slice(0, 8) + "…" : dept,
      presentVal: v.checkedIn,
      absentVal:  v.missing,
      totalVal:   v.total,
    }));
    const deptMaxVal = Math.max(...deptBars.map(b => b.totalVal), 1);

    const pdf   = await PDFDocument.create();
    const pageW = 842, pageH = 595, M = 40;

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
      pg.drawText(title,    { x: (pageW - titleW) / 2, y: pageH - 48, size: 20, font: fontBold, color: C.headerTxt });
      const subW = fontReg.widthOfTextAtSize(subtitle, 10);
      pg.drawText(subtitle, { x: (pageW - subW)   / 2, y: pageH - 68, size: 10, font: fontReg,  color: C.headerTxt });

      const badgeR = 30, badgeCX = pageW - M - badgeR, badgeCY = pageH - 52;
      await drawOrgLogo(pg, badgeCX, badgeCY, badgeR, org.organization_logo ?? null, org.full_name);

      const nameFontSize = 9, nameMaxW = 160;
      const nameLines: string[] = [];
      let currentLine = "";
      for (const word of org.full_name.split(" ")) {
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
        `Generated by BioVerity AI  ·  bioverityai.com  ·  ${new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })}   |   Page ${pageNum} of ${total}`,
        { x: M, y: 6, size: 8, font: fontReg, color: C.headerTxt }
      );
    };

    /* ══════ PAGE 1 — SUMMARY DASHBOARD ══════ */
    const page1 = pdf.addPage([pageW, pageH]);
    await drawPageHeader(page1, "BioVerity AI Daily Schedule Report", `Date: ${date}`);

    const kpiY = pageH - 150;
    const cards = [
      { label: "Total Scheduled", value: totalScheduled, colour: C.primary },
      { label: "Checked In",      value: checkedIn,      colour: C.green   },
      { label: "Not Checked In",  value: notCheckedIn,   colour: C.danger  },
      { label: "Checked Out",     value: checkedOut,     colour: C.cyan    },
      { label: "Still In",        value: checkedIn - checkedOut, colour: C.orange },
    ];

    const cardW = (pageW - M * 2 - 16) / cards.length;
    cards.forEach((card, i) => {
      const cx = M + i * (cardW + 4);
      rect(page1, cx, kpiY - 55, cardW, 55, card.colour);
      const vStr = String(Math.max(card.value, 0));
      const vw   = fontBold.widthOfTextAtSize(vStr, 22);
      page1.drawText(vStr,       { x: cx + (cardW - vw)  / 2, y: kpiY - 25, size: 22, font: fontBold, color: C.white });
      const lw = fontReg.widthOfTextAtSize(card.label, 8);
      page1.drawText(card.label, { x: cx + (cardW - lw)  / 2, y: kpiY - 45, size: 8,  font: fontReg,  color: C.white });
    });

    rect(page1, M, kpiY - 63, pageW - M * 2, 1, C.divider);

    const sharedLegY = 55;
    const zone1X = M, zone1W = (pageW - M * 2 - 20) / 2;
    const zone2X = zone1X + zone1W + 20, zone2W = zone1W;
    const pieTitleY = kpiY - 78;

    const legItems = [
      { label: `Checked In (${checkedIn})`,    colour: C.green  },
      { label: `Not Checked In (${notCheckedIn})`, colour: C.danger },
    ];
    const legBoxSize = 12, legTextGap = 6, legItemGap = 25;
    const legTotalW  = legItems.reduce((s, l) => s + legBoxSize + legTextGap + fontReg.widthOfTextAtSize(l.label, 10), 0) + legItemGap * (legItems.length - 1);
    let legCurX      = zone1X + (zone1W - legTotalW) / 2;
    legItems.forEach(l => {
      rect(page1, legCurX, sharedLegY, legBoxSize, legBoxSize, l.colour);
      page1.drawText(l.label, { x: legCurX + legBoxSize + legTextGap, y: sharedLegY + 2, size: 10, font: fontReg, color: C.dark });
      legCurX += legBoxSize + legTextGap + fontReg.widthOfTextAtSize(l.label, 10) + legItemGap;
    });

    /* Pie */
    const pieTitleStr = "Checked In vs Not Checked In";
    page1.drawText(pieTitleStr, {
      x: zone1X + (zone1W - fontBold.widthOfTextAtSize(pieTitleStr, 11)) / 2,
      y: pieTitleY, size: 11, font: fontBold, color: C.dark,
    });
    drawPieChart(page1, zone1X + zone1W / 2, 215, 90, [
      { value: checkedIn,    colour: C.green  },
      { value: notCheckedIn, colour: C.danger },
    ]);

    /* Bar */
    const barTitleStr = "Schedule Completion by Department";
    page1.drawText(barTitleStr, {
      x: zone2X + (zone2W - fontBold.widthOfTextAtSize(barTitleStr, 11)) / 2,
      y: pieTitleY, size: 11, font: fontBold, color: C.dark,
    });
    drawBarChart(
      page1, zone2X, sharedLegY + 28, zone2W,
      pieTitleY - 15 - (sharedLegY + 28),
      deptBars, deptMaxVal, fontReg, 9, C.green, C.danger
    );

    drawPageFooter(page1, 1, 2);

    const page2 = pdf.addPage([pageW, pageH]);
    await drawPageHeader(page2, "BioVerity AI Daily Schedule Details", `Date: ${date}`);

    const tY = pageH - 115;
    const cols = [
      { label: "#",           w: 28  },
      { label: "Employee ID", w: 80  },
      { label: "Full Name",   w: 150 },
      { label: "Department",  w: 110 },
      { label: "Role",        w: 100 },
      { label: "Email",       w: 154 },
      { label: "Check-In",    w: 80  },
      { label: "Check-Out",   w: 80  },
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
      await drawPageHeader(currentPage, "BioVerity AI Daily Schedule Details", `Date: ${date}`);
      rowY = pageH - 115;
      drawTableHeader(currentPage, rowY);
      pageTableInfos.push({ pg: currentPage, tableTopY: rowY - 20 });
      rowY -= 20;
    };

    const sortedSchedules = [...safeSchedules].sort((a, b) => {
      const empA = empMap.get(a.employee_id);
      const empB = empMap.get(b.employee_id);
      return (empA?.employee_id ?? "").localeCompare(empB?.employee_id ?? "", undefined, { numeric: true, sensitivity: "base" });
    });

    if (sortedSchedules.length === 0) {
      const msg = `No schedule records found for ${date}`;
      const mw  = fontReg.widthOfTextAtSize(msg, 12);
      currentPage.drawText(msg, { x: tableX + (totalColW - mw) / 2, y: rowY - 40, size: 12, font: fontReg, color: C.headerTxt });
    }

    for (let idx = 0; idx < sortedSchedules.length; idx++) {
      const row = sortedSchedules[idx];
      const emp = empMap.get(row.employee_id);
      if (!emp) continue;

      if (rowY - rowH < 30) await addNewTablePage();

      rect(currentPage, tableX, rowY - rowH, totalColW, rowH, idx % 2 === 0 ? C.rowAlt : C.white);

      const hasCheckIn  = !!row.start_time;
      const hasCheckOut = !!row.end_time;

      const cells = [
        String(idx + 1),
        emp.employee_id,
        emp.full_name,
        emp.department ?? "–",
        emp.role        ?? "–",
        row.email,
        row.start_time  ?? "–",
        row.end_time    ?? "–",
      ];

      let cx = tableX;
      cells.forEach((cell, ci) => {
        const col    = cols[ci];
        const colour =
          ci === 6 ? (hasCheckIn  ? C.green  : C.danger) :
          ci === 7 ? (hasCheckOut ? C.green  : hasCheckIn ? C.orange : C.danger) :
          C.dark;
        const fnt = (ci === 6 || ci === 7) ? fontBold : fontReg;
        let display = cell;
        if (ci === 5) {
          while (display.length > 3 && fontReg.widthOfTextAtSize(display, 9) > col.w - 6) {
            display = display.slice(0, -1);
          }
          if (display !== cell) display = display.slice(0, - 1) + "…";
        }
        const cw = fnt.widthOfTextAtSize(display, 9);
        currentPage.drawText(display, { x: cx + (col.w - cw) / 2, y: rowY - rowH + 6, size: 9, font: fnt, color: colour });
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
      info.pg.drawLine({ start: { x: tableX,             y: tableBottomY }, end: { x: tableX,             y: tableTopY2 }, thickness: 1.5, color: C.green });
      info.pg.drawLine({ start: { x: tableX + totalColW, y: tableBottomY }, end: { x: tableX + totalColW, y: tableTopY2 }, thickness: 1.5, color: C.green });
      info.pg.drawLine({ start: { x: tableX,             y: tableBottomY }, end: { x: tableX + totalColW, y: tableBottomY }, thickness: 1.5, color: C.green });
    });

    const allPages = pdf.getPages();
    allPages.forEach((pg, i) => drawPageFooter(pg, i + 1, allPages.length));

    const pdfBytes = await pdf.save();
    return new NextResponse(pdfBytes as BodyInit, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="schedule-${date}.pdf"`,
        "Cache-Control":       "no-cache",
      },
    });

  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Internal server error while generating PDF" }, { status: 500 });
  }
}