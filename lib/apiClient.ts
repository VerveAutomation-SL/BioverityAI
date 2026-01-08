export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  return fetch(path, {
    ...options,
    credentials: "include",
  });
}
