export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.bioverityai.com"
    : "http://localhost:3000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, options);

  return res;
}
