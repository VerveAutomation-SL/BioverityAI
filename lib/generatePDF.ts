import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function fetchImageBytes(url: string) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function formatTime(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
}

function calculateDuration(start: string | null, end: string | null) {
  if (!start || !end) return "-";
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const diff = e - s;
  if (diff <= 0) return "-";
  const hours   = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function drawRect(
  page: ReturnType<PDFDocument["addPage"]>,
  x: number, y: number, w: number, h: number,
  colour: ReturnType<typeof rgb>
) {
  page.drawRectangle({ x, y, width: w, height: h, color: colour });
}

export default async function generateAttendancePDF(
  log: any,
  orgLogo: string | null,
  orgName: string
) {
  const pdfDoc = await PDFDocument.create();
  const pageW = 595, pageH = 842, M = 40;
  const page  = pdfDoc.addPage([pageW, pageH]);

  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const C = {
    primary:   hex("#0d6efd"), danger:    hex("#dc3545"),
    white:     rgb(1, 1, 1),  dark:      hex("#212529"),
    headerBg:  hex("#f1f3f5"), headerTxt: hex("#495057"),
    green:     hex("#198754"), purple:    hex("#6f42c1"),
    cyan:      hex("#0dcaf0"), orange:    hex("#e67e22"),
    rowAlt:    hex("#f0f4ff"), divider:   hex("#dee2e6"),
    cardBg:    hex("#f8f9fa"),
  };

  drawRect(page, 0, pageH - 90, pageW, 90, C.headerBg);
  drawRect(page, 0, pageH - 93, pageW, 3,  C.primary);

  try {
    const bvBytes = await fetchImageBytes("https://bioverityai.com/assets/images/logo.png");
    const bvImg   = await pdfDoc.embedPng(bvBytes);
    const bvDim   = bvImg.scale(0.10);
    page.drawImage(bvImg, { x: M, y: pageH - 82, width: bvDim.width, height: bvDim.height });
  } catch {  }

  const title     = "WEB ATTENDANCE REPORT";
  const titleW    = fontBold.widthOfTextAtSize(title, 16);
  page.drawText(title, { x: (pageW - titleW) / 2, y: pageH - 42, size: 16, font: fontBold, color: C.headerTxt });

  const badgeR  = 26, badgeCX = pageW - M - badgeR, badgeCY = pageH - 47;

  if (orgLogo) {
    try {
      const logoBytes = await fetchImageBytes(orgLogo);
      let logoImage;
      try { logoImage = await pdfDoc.embedPng(logoBytes); }
      catch { logoImage = await pdfDoc.embedJpg(logoBytes); }
      const dim = logoImage.scaleToFit(badgeR * 2, badgeR * 2);
      page.drawImage(logoImage, { x: badgeCX - dim.width / 2, y: badgeCY - dim.height / 2, width: dim.width, height: dim.height });
    } catch { }
  } else {
    const initials = orgName.split(" ").map((w: string) => w[0] || "").join("").slice(0, 2).toUpperCase();
    const fs = badgeR * 0.65;
    const iw = fontBold.widthOfTextAtSize(initials, fs);
    page.drawText(initials, { x: badgeCX - iw / 2, y: badgeCY - fs * 0.35, size: fs, font: fontBold, color: C.dark });
  }

  const nameFontSize = 8, nameMaxW = 120;
  const nameLines: string[] = [];
  let   currentLine = "";
  for (const word of orgName.split(" ")) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (fontBold.widthOfTextAtSize(test, nameFontSize) <= nameMaxW) { currentLine = test; }
    else { if (currentLine) nameLines.push(currentLine); currentLine = word; }
  }
  if (currentLine) nameLines.push(currentLine);
  nameLines.forEach((line, li) => {
    const lw = fontBold.widthOfTextAtSize(line, nameFontSize);
    page.drawText(line, { x: badgeCX - lw / 2, y: badgeCY - badgeR - 8 - li * (nameFontSize + 2), size: nameFontSize, font: fontBold, color: C.dark });
  });

  const kpiTop  = pageH - 130;
  const kpiH    = 52;
  const kpiGap  = 4;
  const kpiCount = 4;
  const kpiW    = (pageW - M * 2 - kpiGap * (kpiCount - 1)) / kpiCount;

  const duration  = calculateDuration(log.check_in_time, log.check_out_time);
  const hasIn     = !!log.check_in_time;
  const hasOut    = !!log.check_out_time;
  const statusStr = !hasIn ? "Absent" : !hasOut ? "Checked In" : "Completed";
  const statusCol = !hasIn ? C.danger : !hasOut ? C.orange : C.green;

  const kpiCards = [
    { label: "Check-In Time",  value: hasIn  ? new Date(log.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })  : "–", colour: C.green   },
    { label: "Check-Out Time", value: hasOut ? new Date(log.check_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "–", colour: C.primary },
    { label: "Duration",       value: duration,   colour: C.cyan    },
    { label: "Status",         value: statusStr,  colour: statusCol },
  ];

  kpiCards.forEach((card, i) => {
    const cx = M + i * (kpiW + kpiGap);
    drawRect(page, cx, kpiTop - kpiH, kpiW, kpiH, card.colour);
    const vw = fontBold.widthOfTextAtSize(card.value, 13);
    page.drawText(card.value, { x: cx + (kpiW - vw) / 2, y: kpiTop - 24, size: 13, font: fontBold, color: C.white });
    const lw = fontReg.widthOfTextAtSize(card.label, 7.5);
    page.drawText(card.label, { x: cx + (kpiW - lw) / 2, y: kpiTop - 40, size: 7.5, font: fontReg,  color: C.white });
  });

  drawRect(page, M, kpiTop - kpiH - 8, pageW - M * 2, 1, C.divider);

  const employee = log.employees;
  let y = kpiTop - kpiH - 28;

  page.drawText("Employee Details", { x: M, y, size: 11, font: fontBold, color: C.dark });
  y -= 14;
  drawRect(page, M, y, pageW - M * 2, 1, C.divider);
  y -= 16;

  if (employee?.photo_url) {
    try {
      const empBytes = await fetchImageBytes(employee.photo_url);
      const empImage = await pdfDoc.embedJpg(empBytes);
      page.drawImage(empImage, { x: pageW - M - 80, y: y - 70, width: 80, height: 80 });
    } catch { }
  }

  const infoRows = [
    { label: "Organization",  value: orgName },
    { label: "Employee Name", value: employee?.full_name   || "-" },
    { label: "Employee ID",   value: employee?.employee_id || "-" },
    { label: "Department",    value: employee?.department  || "-" },
  ];

  infoRows.forEach(row => {
    const labelW = fontBold.widthOfTextAtSize(`${row.label}: `, 10);
    page.drawText(`${row.label}: `, { x: M,          y, size: 10, font: fontBold, color: C.headerTxt });
    page.drawText(row.value,        { x: M + labelW, y, size: 10, font: fontReg,  color: C.dark });
    y -= 18;
  });

  y -= 10;

  page.drawText("Attendance Details", { x: M, y, size: 11, font: fontBold, color: C.dark });
  y -= 14;
  drawRect(page, M, y, pageW - M * 2, 1, C.divider);
  y -= 16;

  const attRows = [
    { label: "Check-In Time",   value: formatTime(log.check_in_time)  },
    { label: "Check-Out Time",  value: formatTime(log.check_out_time) },
    { label: "Worked Duration", value: duration                        },
  ];

  attRows.forEach(row => {
    const labelW = fontBold.widthOfTextAtSize(`${row.label}: `, 10);
    page.drawText(`${row.label}: `, { x: M,          y, size: 10, font: fontBold, color: C.headerTxt });
    page.drawText(row.value,        { x: M + labelW, y, size: 10, font: fontReg,  color: C.dark });
    y -= 18;
  });

  y -= 10;

  page.drawText("Location Details", { x: M, y, size: 11, font: fontBold, color: C.dark });
  y -= 14;
  drawRect(page, M, y, pageW - M * 2, 1, C.divider);
  y -= 16;

  const locRows = [
    { label: "Check-In Address",  value: log.check_in_address  || "-" },
    { label: "Check-Out Address", value: log.check_out_address || "-" },
  ];

  locRows.forEach(row => {
    const labelW = fontBold.widthOfTextAtSize(`${row.label}: `, 9);
    page.drawText(`${row.label}: `, { x: M,          y, size: 9, font: fontBold, color: C.headerTxt });
    let addr = row.value;
    while (addr.length > 4 && fontReg.widthOfTextAtSize(addr, 9) > pageW - M * 2 - labelW - 10) {
      addr = addr.slice(0, -1);
    }
    if (addr !== row.value) addr = addr.slice(0, -1) + "…";
    page.drawText(addr, { x: M + labelW, y, size: 9, font: fontReg, color: C.dark });
    y -= 18;
  });

  y -= 16;

  const photoW = 220, photoH = 160, photoGap = 20;

  if (log.check_in_photo_url) {
    try {
      const inBytes = await fetchImageBytes(log.check_in_photo_url);
      const inImg   = await pdfDoc.embedJpg(inBytes);

      page.drawText("Check-In Photo", { x: M, y, size: 10, font: fontBold, color: C.dark });
      y -= 12;
      drawRect(page, M - 4, y - photoH - 4, photoW + 8, photoH + 8, C.rowAlt);
      page.drawImage(inImg, { x: M, y: y - photoH, width: photoW, height: photoH });
      y -= photoH + photoGap;
    } catch { }
  }

  if (log.check_out_photo_url) {
    try {
      const outBytes = await fetchImageBytes(log.check_out_photo_url);
      const outImg   = await pdfDoc.embedJpg(outBytes);

      page.drawText("Check-Out Photo", { x: M, y, size: 10, font: fontBold, color: C.dark });
      y -= 12;
      drawRect(page, M - 4, y - photoH - 4, photoW + 8, photoH + 8, C.rowAlt);
      page.drawImage(outImg, { x: M, y: y - photoH, width: photoW, height: photoH });
    } catch { }
  }

  drawRect(page, 0, 0, pageW, 22, C.headerBg);
  page.drawText(
    `Generated by BioVerity AI  ·  bioverityai.com  ·  ${new Date().toLocaleString()}`,
    { x: M, y: 6, size: 7.5, font: fontReg, color: C.headerTxt }
  );

  const pdfBytes = await pdfDoc.save();
  const buffer   = pdfBytes.buffer as ArrayBuffer;
  const blob     = new Blob([buffer], { type: "application/pdf" });
  const url      = URL.createObjectURL(blob);

  const a    = document.createElement("a");
  a.href     = url;
  a.download = `attendance-${employee?.employee_id || "report"}.pdf`;
  a.click();

  URL.revokeObjectURL(url);
}