import { API_BASE_URL } from "./auditor-api";

export type AuthUser = {
  id: string;
  email: string;
  display_name: string;
  organisation_id: string;
  roles: string[];
};

export type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user?: AuthUser;
};

export async function auditorLogin(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        login: email,
        password,
      }),
      cache: "no-store",
    }
  );

  const body = await response.text();

  let data: any = null;

  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      body ||
      `Login failed (${response.status})`
    );
  }

  const accessToken =
    data?.access_token ||
    data?.data?.access_token ||
    data?.token;

  if (!accessToken) {
    throw new Error("Login succeeded but no access token was returned");
  }

  const meResponse = await fetch(
    `${API_BASE_URL}/api/v1/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const meBody = await meResponse.text();

  let meData: any = null;

  try {
    meData = meBody ? JSON.parse(meBody) : null;
  } catch {
    meData = null;
  }

  if (!meResponse.ok) {
    throw new Error(
      meData?.error ||
      meBody ||
      `Unable to load authenticated user (${meResponse.status})`
    );
  }

  const roles = meData?.roles || [];

  if (!roles.includes("auditor")) {
    throw new Error("This account does not have the Auditor role");
  }

  const user: AuthUser = {
    id: meData.user_id,
    email,
    display_name: "TIAKI Auditor",
    organisation_id: meData.organisation_id,
    roles,
  };

  return {
    ...data,
    access_token: accessToken,
    user,
  };
}

export function saveAuditorSession(result: LoginResponse) {
  localStorage.setItem(
    "tiaki_access_token",
    result.access_token
  );

  if (result.refresh_token) {
    localStorage.setItem(
      "tiaki_refresh_token",
      result.refresh_token
    );
  }

  if (result.user) {
    localStorage.setItem(
      "tiaki_user",
      JSON.stringify(result.user)
    );
  }
}

export function getAuditorAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("tiaki_access_token") ||
    sessionStorage.getItem("tiaki_access_token")
  );
}

export function clearAuditorSession() {
  localStorage.removeItem("tiaki_access_token");
  localStorage.removeItem("tiaki_refresh_token");
  localStorage.removeItem("tiaki_user");

  sessionStorage.removeItem("tiaki_access_token");
  sessionStorage.removeItem("tiaki_refresh_token");
}
