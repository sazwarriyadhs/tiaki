"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import CommanderShell from "@/components/commander/CommanderShell";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Factory,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8093";

type BatchStatus = "open" | "closed" | "completed" | "cancelled" | string;

type HalalSummary = {
  checks: number;
  pass: number;
  fail: number;
  pending: number;
};

type MeatOutput = {
  id?: string;
  batch_no?: string;
  quantity?: number;
  unit?: string;
  status?: string;
  halal_status?: string;
};

type ProductionBatch = {
  id: string;
  batch_no: string;
  species_code: string;
  supplier_name: string;
  animal_count: number;
  slaughtered_count: number;
  remaining_count: number;
  status: BatchStatus;
  received_at: string;
  created_at: string;
  halal: HalalSummary;
  carcasses: number;
  meat_outputs: MeatOutput[];
};

type BatchSummary = {
  total_batches: number;
  active_batches: number;
  animals_received: number;
  animals_slaughtered: number;
  halal_verified_batches: number;
};

type BatchesResponse = {
  data: {
    summary: BatchSummary;
    items: ProductionBatch[];
  };
  meta?: {
    status?: string;
  };
};

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const candidates = [
    "tiaki_access_token",
    "access_token",
    "accessToken",
    "token",
  ];

  for (const key of candidates) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  return null;
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normaliseStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "open":
    case "active":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "completed":
    case "closed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function halalLabel(batch: ProductionBatch) {
  const { checks, pass, fail, pending } = batch.halal;

  if (checks === 0) return "NO CHECKS";
  if (fail > 0) return "FAILED";
  if (pending > 0) return "PENDING";
  if (pass === checks) return "VERIFIED";

  return "REVIEW";
}

function halalClass(batch: ProductionBatch) {
  const { checks, pass, fail, pending } = batch.halal;

  if (checks === 0) {
    return "border-slate-200 bg-slate-50 text-slate-600";
  }

  if (fail > 0) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (pending > 0) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (pass === checks) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function BatchesPage() {
  const [items, setItems] = useState<ProductionBatch[]>([]);
  const [summary, setSummary] = useState<BatchSummary>({
    total_batches: 0,
    active_batches: 0,
    animals_received: 0,
    animals_slaughtered: 0,
    halal_verified_batches: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [selectedBatch, setSelectedBatch] =
    useState<ProductionBatch | null>(null);

  const loadBatches = useCallback(async (isRefresh = false) => {
    try {
      setError(null);

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Authentication token tidak ditemukan. Silakan login ulang ke Commander."
        );
      }

      const response = await fetch(`${API_URL}/api/v1/batches`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        throw new Error(
          "Session Commander sudah tidak valid. Silakan login ulang."
        );
      }

      if (!response.ok) {
        const body = await response.text();

        let message = `Batches API error (${response.status})`;

        try {
          const parsed = JSON.parse(body);
          message =
            parsed?.error?.message ||
            parsed?.message ||
            message;
        } catch {
          if (body) message = body;
        }

        throw new Error(message);
      }

      const payload =
        (await response.json()) as BatchesResponse;

      const nextItems = Array.isArray(payload?.data?.items)
        ? payload.data.items
        : [];

      setItems(nextItems);

      if (payload?.data?.summary) {
        setSummary(payload.data.summary);
      } else {
        setSummary({
          total_batches: nextItems.length,
          active_batches: nextItems.filter(
            (batch) =>
              batch.status.toLowerCase() === "open" ||
              batch.status.toLowerCase() === "active"
          ).length,
          animals_received: nextItems.reduce(
            (sum, batch) => sum + (batch.animal_count || 0),
            0
          ),
          animals_slaughtered: nextItems.reduce(
            (sum, batch) => sum + (batch.slaughtered_count || 0),
            0
          ),
          halal_verified_batches: nextItems.filter(
            (batch) =>
              batch.halal.checks > 0 &&
              batch.halal.fail === 0 &&
              batch.halal.pending === 0 &&
              batch.halal.pass === batch.halal.checks
          ).length,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load production batches."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((batch) => {
      const matchesSearch =
        !query ||
        batch.batch_no.toLowerCase().includes(query) ||
        batch.supplier_name.toLowerCase().includes(query) ||
        batch.species_code.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        batch.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesDate =
        !dateFilter ||
        new Date(batch.received_at).toISOString().slice(0, 10) ===
          dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [items, search, statusFilter, dateFilter]);

  return (
    <CommanderShell>
      <main className="page operational-module-page">
        <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <Factory className="h-4 w-4" />
              TIAKI Commander
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Production Batches
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Halal production traceability and operational verification
              from live production records.
            </p>
          </div>

          <button
            type="button"
            disabled
            title="Create Batch workflow belum tersedia di backend"
            className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
          >
            <PackageCheck className="h-4 w-4" />
            Create New Batch
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">Unable to load production batches</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => void loadBatches(true)}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total Batches"
            value={loading ? "—" : summary.total_batches}
            icon={Database}
            description="Production batches in tenant"
          />

          <StatCard
            label="Active Batches"
            value={loading ? "—" : summary.active_batches}
            icon={Activity}
            description="Currently open / active"
          />

          <StatCard
            label="Animals Received"
            value={loading ? "—" : summary.animals_received}
            icon={Factory}
            description="Animals registered in batches"
          />

          <StatCard
            label="Slaughtered"
            value={loading ? "—" : summary.animals_slaughtered}
            icon={PackageCheck}
            description="Recorded slaughter events"
          />

          <StatCard
            label="Halal Verified"
            value={loading ? "—" : summary.halal_verified_batches}
            icon={ShieldCheck}
            description="Batches with verified controls"
          />
        </div>

        {/* REGISTER */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Production Batch Register
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Live records from TIAKI production traceability.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search batch / supplier..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void loadBatches(true)}
                  disabled={refreshing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left">
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Batch
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Supplier
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Animals
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Slaughter
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Halal
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 8 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-5">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!loading &&
                  filteredItems.map((batch) => (
                    <tr
                      key={batch.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {batch.batch_no}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {batch.species_code}
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(batch.received_at)}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {batch.supplier_name || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {batch.animal_count}
                        </p>
                        <p className="text-xs text-slate-500">
                          animals
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {batch.slaughtered_count} / {batch.animal_count}
                        </p>
                        <p className="text-xs text-slate-500">
                          {batch.remaining_count} remaining
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${halalClass(
                            batch
                          )}`}
                        >
                          {batch.halal.fail > 0 ? (
                            <XCircle className="h-3.5 w-3.5" />
                          ) : batch.halal.checks > 0 &&
                            batch.halal.pass === batch.halal.checks &&
                            batch.halal.pending === 0 ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          )}

                          {halalLabel(batch)}
                        </span>

                        <p className="mt-1 text-xs text-slate-500">
                          {batch.halal.pass}/{batch.halal.checks} checks
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass(
                            batch.status
                          )}`}
                        >
                          {normaliseStatus(batch.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedBatch(batch)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                {!loading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <Database className="mx-auto h-10 w-10 text-slate-300" />

                      <p className="mt-3 font-semibold text-slate-800">
                        No production batches found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loading && (
            <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              Showing {filteredItems.length} of {items.length} production
              batch{items.length === 1 ? "" : "es"}.
            </div>
          )}
        </section>
      </div>

      {/* DETAIL MODAL */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-950">
                    {selectedBatch.batch_no}
                  </h2>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass(
                      selectedBatch.status
                    )}`}
                  >
                    {normaliseStatus(selectedBatch.status)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Production batch traceability
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close batch details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Supplier
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedBatch.supplier_name || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Species
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedBatch.species_code}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Received
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedBatch.animal_count} animals
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Received At
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDateTime(selectedBatch.received_at)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Slaughtered
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {selectedBatch.slaughtered_count}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Remaining
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {selectedBatch.remaining_count}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Carcasses
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {selectedBatch.carcasses}
                  </p>
                </div>
              </div>

              {/* HALAL */}
              <div className="mt-5 rounded-2xl border border-slate-200">
                <div className="border-b border-slate-200 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-slate-700" />
                    <h3 className="font-bold text-slate-950">
                      Halal Control Verification
                    </h3>
                  </div>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Checks</p>
                    <p className="mt-1 text-xl font-bold text-slate-950">
                      {selectedBatch.halal.checks}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-700">Pass</p>
                    <p className="mt-1 text-xl font-bold text-emerald-800">
                      {selectedBatch.halal.pass}
                    </p>
                  </div>

                  <div className="rounded-xl bg-red-50 p-4">
                    <p className="text-xs text-red-700">Fail</p>
                    <p className="mt-1 text-xl font-bold text-red-800">
                      {selectedBatch.halal.fail}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-xs text-amber-700">Pending</p>
                    <p className="mt-1 text-xl font-bold text-amber-800">
                      {selectedBatch.halal.pending}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 p-4">
                  <div
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${halalClass(
                      selectedBatch
                    )}`}
                  >
                    {selectedBatch.halal.fail > 0 ? (
                      <XCircle className="h-4 w-4" />
                    ) : selectedBatch.halal.checks > 0 &&
                      selectedBatch.halal.pass ===
                        selectedBatch.halal.checks &&
                      selectedBatch.halal.pending === 0 ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock3 className="h-4 w-4" />
                    )}

                    {halalLabel(selectedBatch)}
                  </div>
                </div>
              </div>

              {/* MEAT OUTPUT */}
              <div className="mt-5 rounded-2xl border border-slate-200">
                <div className="border-b border-slate-200 p-4">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-5 w-5 text-slate-700" />
                    <h3 className="font-bold text-slate-950">
                      Meat Output Lineage
                    </h3>
                  </div>
                </div>

                <div className="p-4">
                  {selectedBatch.meat_outputs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <PackageCheck className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        No linked meat output recorded
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        This batch does not currently have a linked meat
                        output in the production lineage.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedBatch.meat_outputs.map((output, index) => (
                        <div
                          key={output.id || `${output.batch_no}-${index}`}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {output.batch_no || "Meat output"}
                              </p>

                              {output.quantity !== undefined && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {output.quantity}{" "}
                                  {output.unit || "unit"}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {output.status && (
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                  {normaliseStatus(output.status)}
                                </span>
                              )}

                              {output.halal_status && (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                  {normaliseStatus(output.halal_status)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                <p>
                  Batch ID:{" "}
                  <span className="font-mono text-slate-700">
                    {selectedBatch.id}
                  </span>
                </p>

                <p className="mt-1">
                  Created: {formatDateTime(selectedBatch.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </CommanderShell>
  );
}
