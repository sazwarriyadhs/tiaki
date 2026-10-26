import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.TIAKI_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8093";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/auditor/audits`,
      {
        method: "GET",
        cache: "no-store",
        headers,
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Audit service returned an error.",
          status: response.status,
          detail: text,
        },
        {
          status: response.status,
        }
      );
    }

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: "Audit service returned invalid JSON.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to reach TIAKI audit API.",
        detail:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 502,
      }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (authorization) {
      headers.Authorization = authorization;
    }

    const body = await request.text();

    const response = await fetch(
      `${BACKEND_URL}/api/v1/auditor/audits`,
      {
        method: "POST",
        cache: "no-store",
        headers,
        body,
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Audit service returned an error.",
          status: response.status,
          detail: text,
        },
        {
          status: response.status,
        }
      );
    }

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: "Audit service returned invalid JSON.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to reach TIAKI audit API.",
        detail:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 502,
      }
    );
  }
}
