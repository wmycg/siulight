export async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();
  const body =
    rawBody && contentType.includes("json") ? JSON.parse(rawBody) : rawBody;

  if (!response.ok) {
    const message =
      typeof body === "string"
        ? body
        : body?.message || body?.detail || `HTTP ${response.status}`;
    throw new Error(message || `HTTP ${response.status}`);
  }

  return body;
}
