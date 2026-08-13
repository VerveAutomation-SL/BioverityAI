import * as ct from "countries-and-timezones";

export const DEFAULT_TIMEZONE = "Asia/Singapore";

export function getTimezoneFromCountry(
  country: string | null | undefined
): string {
  if (!country) return DEFAULT_TIMEZONE;

  const countryData = Object.values(ct.getAllCountries()).find(
    (item) => item.name === country
  );

  return countryData?.timezones?.[0] ?? DEFAULT_TIMEZONE;
}

export function getLocalDate(
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE
): string {
  return date.toLocaleDateString("en-CA", {
    timeZone,
  });
}

export function formatLocalTimeFromISO(
  iso: string,
  timeZone: string = DEFAULT_TIMEZONE
): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLocalDateTime(
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE
): string {
  return date.toLocaleString("en-US", {
    timeZone,
  });
}

/**
 * Converts a local date/time in the supplied timezone into a UTC Date.
 */
function zonedDateTimeToUTC(
  dateTime: string,
  timeZone: string
): Date {
  const [datePart, timePart] = dateTime.split("T");

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  let utcMillis = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  );

  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(utcMillis));

    const values: Record<string, number> = {};

    for (const part of parts) {
      if (
        part.type === "year" ||
        part.type === "month" ||
        part.type === "day" ||
        part.type === "hour" ||
        part.type === "minute" ||
        part.type === "second"
      ) {
        values[part.type] = Number(part.value);
      }
    }

    const displayedUTC = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second
    );

    const desiredUTC = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    );

    utcMillis += desiredUTC - displayedUTC;
  }

  return new Date(utcMillis);
}

export function dayRange(
  date: string,
  timeZone: string = DEFAULT_TIMEZONE
) {
  const start = zonedDateTimeToUTC(
    `${date}T00:00:00`,
    timeZone
  );

  const [year, month, day] = date.split("-").map(Number);

  const nextDay = new Date(
    Date.UTC(year, month - 1, day + 1)
  );

  const nextDayString = nextDay.toISOString().slice(0, 10);

  const nextDayStart = zonedDateTimeToUTC(
    `${nextDayString}T00:00:00`,
    timeZone
  );

  const end = new Date(nextDayStart.getTime() - 1);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}