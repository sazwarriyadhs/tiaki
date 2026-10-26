"use client";

import { useEffect, useState } from "react";
import { getAuditorAccessToken } from "@/lib/auth";

type Audit = {
  id: string;
  audit_number?: string;
  title?: string;
  name?: string;
  organisation?: string;
  organisation_name?: string;
  status?: string;
  date?: string;
  created_at?: string;
  planned_start_date?: string;
};

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Pacific/Auckland",
  }).format(date);
}

function statusLabel(value?: string) {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAudits() {
    setLoading(true);
    setError(null);

    try {
      const token = getAuditorAccessToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/audits", {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Audit API returned HTTP ${response.status}`
        );
      }

      const payload = await response.json();

      const records =
        Array.isArray(payload)
          ? payload
          : Array.isArray(payload.audits)
            ? payload.audits
            : Array.isArray(payload.data)
              ? payload.data
              : [];

      setAudits(records);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load audits.";

      setError(message);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAudits();
  }, []);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">
              Audit Management
            </h1>

            <p className="mt-2 text-sm opacity-70">
              Plan, execute and monitor assurance engagements.
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm font-medium"
            onClick={() => {
              window.location.href = "/audits/new";
            }}
          >
            + New Audit
          </button>
        </div>

        {loading && (
          <section className="rounded-xl border p-8 text-center">
            <p className="text-sm opacity-70">
              Loading audits from the audit service...
            </p>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-xl border p-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Unable to load audits
              </h2>

              <p className="mt-2 text-sm opacity-70">
                The audit service could not be reached or returned
                an error.
              </p>

              <p className="mt-2 break-all font-mono text-xs opacity-60">
                {error}
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm"
              onClick={loadAudits}
            >
              Retry
            </button>
          </section>
        )}

        {!loading && !error && audits.length === 0 && (
          <section className="rounded-xl border p-12 text-center">
            <h2 className="text-lg font-semibold">
              No audits yet
            </h2>

            <p className="mt-2 text-sm opacity-70">
              Create your first audit engagement.
            </p>

            <button
              type="button"
              className="mt-6 rounded-lg border px-4 py-2 text-sm font-medium"
              onClick={() => {
                window.location.href = "/audits/new";
              }}
            >
              Create Audit
            </button>
          </section>
        )}

        {!loading && !error && audits.length > 0 && (
          <section className="overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-5 py-4 font-medium">
                      ID
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Audit
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Organisation
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {audits.map((audit) => {
                    const id =
                      audit.id ||
                      audit.audit_number ||
                      "—";

                    const title =
                      audit.title ||
                      audit.name ||
                      "Untitled audit";

                    const organisation =
                      audit.organisation ||
                      audit.organisation_name ||
                      "—";

                    const date =
                      audit.date ||
                      audit.planned_start_date ||
                      audit.created_at;

                    return (
                      <tr
                        key={audit.id || audit.audit_number}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-5 py-4 font-mono text-xs">
                          {id}
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {title}
                        </td>

                        <td className="px-5 py-4">
                          {organisation}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full border px-2.5 py-1 text-xs">
                            {statusLabel(audit.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {formatDate(date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
