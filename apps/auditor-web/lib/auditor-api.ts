export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8093";

export async function auditorOverview(token: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auditor/overview`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Auditor API ${response.status}: ${body || response.statusText}`
    );
  }

  return response.json();
}
