export const SG_TZ = "Asia/Singapore";

export const toSGDate = (d: Date) =>
  new Date(d.toLocaleString("en-US", { timeZone: SG_TZ }));

export const formatSGTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-SG", {
    timeZone: SG_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatSGDateTime = (d: Date) =>
  d.toLocaleString("en-SG", { timeZone: SG_TZ });

export const sgDayRange = (date: string) => ({
  start: `${date}T00:00:00+08:00`,
  end: `${date}T23:59:59+08:00`,
});
