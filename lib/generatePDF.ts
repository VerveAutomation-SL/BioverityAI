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

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
}

export default async function generateAttendancePDF(
    log: any,
    orgLogo: string | null,
    orgName: string
) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 820]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 40;

    // HEADER
    page.drawRectangle({
        x: 0,
        y: height - 90,
        width: width,
        height: 90,
        color: rgb(0.1, 0.6, 0.4),
    });

    page.drawText("WEB ATTENDANCE REPORT", {
        x: 180,
        y: height - 50,
        size: 18,
        font: boldFont,
        color: rgb(1, 1, 1),
    });

    // ORGANIZATION LOGO OR INITIALS
    if (orgLogo) {
        try {
            const logoBytes = await fetchImageBytes(orgLogo);
            const logoImage = await pdfDoc.embedJpg(logoBytes);
            page.drawImage(logoImage, {
                x: 40,
                y: height - 80,
                width: 50,
                height: 50,
            });
        } catch { }
    } else {
        page.drawRectangle({
            x: 40,
            y: height - 80,
            width: 50,
            height: 50,
            color: rgb(0.2, 0.7, 0.5),
        });

        const initials = orgName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

        page.drawText(initials, {
            x: 55,
            y: height - 55,
            size: 18,
            font: boldFont,
            color: rgb(1, 1, 1),
        });
    }

    y -= 110;

    const employee = log.employees?.[0];

    // EMPLOYEE SECTION
    page.drawText(`Organization: ${orgName}`, { x: 50, y, size: 12, font });
    y -= 20;

    page.drawText(`Employee Name: ${employee?.full_name || "-"}`, {
        x: 50,
        y,
        size: 12,
        font,
    });
    y -= 20;

    page.drawText(`Employee ID: ${employee?.employee_id || "-"}`, {
        x: 50,
        y,
        size: 12,
        font,
    });
    y -= 20;

    page.drawText(`Department: ${employee?.department || "-"}`, {
        x: 50,
        y,
        size: 12,
        font,
    });

    // EMPLOYEE PHOTO
    if (employee?.photo_url) {
        try {
            const empBytes = await fetchImageBytes(employee.photo_url);
            const empImage = await pdfDoc.embedJpg(empBytes);
            page.drawImage(empImage, {
                x: 400,
                y: y - 40,
                width: 80,
                height: 80,
            });
        } catch { }
    }

    y -= 80;

    // ATTENDANCE DETAILS
    page.drawText("Attendance Details", {
        x: 50,
        y,
        size: 14,
        font: boldFont,
    });

    y -= 25;

    page.drawText(`Check In Time: ${formatTime(log.check_in_time)}`, {
        x: 50,
        y,
        size: 12,
        font,
    });
    y -= 20;

    page.drawText(`Check Out Time: ${formatTime(log.check_out_time)}`, {
        x: 50,
        y,
        size: 12,
        font,
    });
    y -= 20;

    page.drawText(
        `Worked Duration: ${calculateDuration(
            log.check_in_time,
            log.check_out_time
        )}`,
        { x: 50, y, size: 12, font }
    );

    y -= 30;

    // LOCATION DETAILS
    page.drawText("Location Details", {
        x: 50,
        y,
        size: 14,
        font: boldFont,
    });

    y -= 25;

    page.drawText(`Check In Address: ${log.check_in_address || "-"}`, {
        x: 50,
        y,
        size: 10,
        font,
    });
    y -= 15;

    page.drawText(`Check Out Address: ${log.check_out_address || "-"}`, {
        x: 50,
        y,
        size: 10,
        font,
    });

    y -= 40;

    // CHECK IN PHOTO
    if (log.check_in_photo_url) {
        try {
            const inBytes = await fetchImageBytes(log.check_in_photo_url);
            const inImg = await pdfDoc.embedJpg(inBytes);
            page.drawText("Check In Photo", { x: 50, y, size: 12, font });
            y -= 10;
            page.drawImage(inImg, {
                x: 50,
                y: y - 150,
                width: 200,
                height: 150,
            });
            y -= 170;
        } catch { }
    }

    // CHECK OUT PHOTO
    if (log.check_out_photo_url) {
        try {
            const outBytes = await fetchImageBytes(log.check_out_photo_url);
            const outImg = await pdfDoc.embedJpg(outBytes);
            page.drawText("Check Out Photo", { x: 50, y, size: 12, font });
            y -= 10;
            page.drawImage(outImg, {
                x: 50,
                y: y - 150,
                width: 200,
                height: 150,
            });
        } catch { }
    }

    const pdfBytes = await pdfDoc.save();

    // Convert safely to ArrayBuffer
    const buffer = pdfBytes.buffer as ArrayBuffer;

    const blob = new Blob([buffer], {
        type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${employee?.employee_id || "report"}.pdf`;
    a.click();

    URL.revokeObjectURL(url);
}
