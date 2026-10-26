"use client";

import {
  Activity,
  Camera,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Maximize2,
  Radio,
  RefreshCw,
  Thermometer,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import CommanderShell from "@/components/commander/CommanderShell";

type EquipmentOverview = {
  equipmentTotal: number;
  equipmentActive: number;
  equipmentOffline: number;
  iotDevicesTotal: number;
  iotDevicesOnline: number;
  sensorsTotal: number;
  sensorsActive: number;
  openExcursions: number;
  criticalExcursions: number;
  calibrationsDue: number;
  temperatureUnit: string;
};

type ApiResponse = {
  data?: EquipmentOverview;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8093";

function getAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }

  const keys = [
    "tiaki_access_token",
    "access_token",
    "accessToken",
    "token",
    "auth_token",
    "jwt",
  ];

  for (const key of keys) {
    const localValue =
      window.localStorage.getItem(key);

    if (localValue) {
      return localValue;
    }
  }

  for (const key of keys) {
    const sessionValue =
      window.sessionStorage.getItem(key);

    if (sessionValue) {
      return sessionValue;
    }
  }

  return "";
}

async function loadOverview() {
  const token = getAccessToken();

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}/api/v1/equipment/overview`,
    {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Equipment overview failed: ${response.status}`,
    );
  }

  const payload =
    (await response.json()) as ApiResponse;

  return payload.data ?? null;
}

function StatusBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "live" | "demo" | "offline";
}) {
  const classes = {
    live: "border-emerald-200 bg-emerald-50 text-emerald-700",
    demo: "border-amber-200 bg-amber-50 text-amber-700",
    offline: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${classes[tone]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "live"
            ? "animate-pulse bg-emerald-500"
            : tone === "demo"
              ? "bg-amber-500"
              : "bg-red-500"
        }`}
      />

      {children}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-slate-500">
          {icon}
        </div>

        <span
          className={`h-2 w-2 rounded-full ${
            danger
              ? "bg-red-500"
              : "bg-emerald-500"
          }`}
        />
      </div>

      <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {description}
      </div>
    </div>
  );
}

function MonitorContent() {
  const [overview, setOverview] =
    useState<EquipmentOverview | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  async function refresh() {
    try {
      setRefreshing(true);
      setError("");

      const data = await loadOverview();

      setOverview(data);
    } catch (err) {
      console.error(
        "TIAKI live monitor request failed:",
        err,
      );

      setError(
        "Unable to connect to TIAKI operational telemetry.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void refresh();

    const interval =
      window.setInterval(() => {
        void refresh();
      }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const connectedDevices =
    overview?.iotDevicesOnline ?? 0;

  const activeSensors =
    overview?.sensorsActive ?? 0;

  const openExcursions =
    overview?.openExcursions ?? 0;

  const criticalExcursions =
    overview?.criticalExcursions ?? 0;

  const activeSignals =
    openExcursions + criticalExcursions;

  return (
    <div className="page">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Operational Monitoring
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Live Monitor
            </h1>

            <StatusBadge tone="demo">
              FIANZ Discovery Demo
            </StatusBadge>
          </div>

          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Real-time operational monitoring across
            slaughter facilities, camera feeds, devices
            and telemetry sources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <a
            href="/cctv-media"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Camera size={14} />
            Configure CCTV
          </a>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <section
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <div className="flex items-center gap-3">
            <WifiOff
              size={18}
              className="text-red-600"
            />

            <div>
              <div className="text-xs font-bold text-red-800">
                Telemetry connection issue
              </div>

              <div className="mt-1 text-xs text-red-700">
                {error}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* METRICS */}
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          icon={<Camera size={19} />}
          label="Live Feeds"
          value="1"
          description="Discovery demo source"
        />

        <MetricCard
          icon={<Cpu size={19} />}
          label="Connected Devices"
          value={
            loading
              ? "—"
              : String(connectedDevices)
          }
          description={
            overview
              ? `${overview.iotDevicesTotal} registered devices`
              : "Telemetry devices online"
          }
        />

        <MetricCard
          icon={<Thermometer size={19} />}
          label="Temperature Sensors"
          value={
            loading
              ? "—"
              : String(activeSensors)
          }
          description={
            overview
              ? `${overview.sensorsTotal} registered sensors`
              : "Active temperature sensors"
          }
        />

        <MetricCard
          icon={<Radio size={19} />}
          label="Active Signals"
          value={
            loading
              ? "—"
              : String(activeSignals)
          }
          description="Open telemetry excursions"
          danger={criticalExcursions > 0}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.7fr)]">
        {/* CCTV */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Camera
                  size={18}
                  className="text-white"
                />
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-white">
                  Camera 01
                </div>

                <div className="mt-1 text-[11px] text-slate-400">
                  Slaughter Operations · Discovery View
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge tone="demo">
                Demo Feed
              </StatusBadge>

              <a
                href="/cctv-media"
                title="Manage CCTV sources"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <ExternalLink size={15} />
              </a>
            </div>
          </div>

          <div className="relative aspect-video min-h-[300px] w-full bg-black">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/gaykytEde3U?autoplay=1&mute=1&controls=1&rel=0"
              title="TIAKI CCTV Discovery Demo Feed"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/65 px-3 py-2 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                DEMO CCTV
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/65 px-3 py-2 backdrop-blur">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                TIAKI · HALAL SLAUGHTER
                INTELLIGENCE
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/65 px-3 py-2 text-[10px] font-semibold text-slate-300 backdrop-blur">
              <Maximize2 size={11} />
              Discovery Demo
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
            <div className="border-r border-white/10 px-4 py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Source
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-200">
                YouTube Demo
              </div>
            </div>

            <div className="border-r border-white/10 px-4 py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Status
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Demo
              </div>
            </div>

            <div className="border-r border-white/10 px-4 py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Channel
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-200">
                CAM-01
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Environment
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-200">
                Discovery
              </div>
            </div>
          </div>
        </section>

        {/* OPERATIONS STATUS */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-slate-900">
                  Operations Status
                </div>

                <div className="mt-1 text-[11px] text-slate-500">
                  Current telemetry state
                </div>
              </div>

              {error ? (
                <WifiOff
                  size={18}
                  className="text-red-500"
                />
              ) : (
                <Wifi
                  size={18}
                  className="text-emerald-500"
                />
              )}
            </div>
          </div>

          <div className="space-y-1 p-3">
            <div className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  <Wifi
                    size={16}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-800">
                    IoT Connectivity
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {overview
                      ? `${connectedDevices} device${connectedDevices === 1 ? "" : "s"} online`
                      : "Checking..."}
                  </div>
                </div>
              </div>

              {connectedDevices > 0 ? (
                <CheckCircle2
                  size={17}
                  className="text-emerald-500"
                />
              ) : (
                <XCircle
                  size={17}
                  className="text-slate-300"
                />
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Thermometer
                    size={16}
                    className="text-slate-600"
                  />
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Temperature Monitoring
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {overview
                      ? `${activeSensors} active sensor${activeSensors === 1 ? "" : "s"}`
                      : "Checking..."}
                  </div>
                </div>
              </div>

              {activeSensors > 0 ? (
                <CheckCircle2
                  size={17}
                  className="text-emerald-500"
                />
              ) : (
                <XCircle
                  size={17}
                  className="text-slate-300"
                />
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Activity
                    size={16}
                    className={
                      criticalExcursions > 0
                        ? "text-red-600"
                        : "text-slate-600"
                    }
                  />
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Temperature Excursions
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {loading
                      ? "Checking..."
                      : `${openExcursions} open`}
                  </div>
                </div>
              </div>

              {criticalExcursions > 0 ? (
                <XCircle
                  size={17}
                  className="text-red-500"
                />
              ) : (
                <CheckCircle2
                  size={17}
                  className="text-emerald-500"
                />
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                  <Camera
                    size={16}
                    className="text-amber-600"
                  />
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-800">
                    CCTV Source
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Discovery demo feed
                  </div>
                </div>
              </div>

              <StatusBadge tone="demo">
                Demo
              </StatusBadge>
            </div>
          </div>

          <div className="mx-4 mb-4 mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Exception Summary
                </div>

                <div className="mt-1 text-xs font-semibold text-slate-700">
                  Temperature excursion monitoring
                </div>
              </div>

              {criticalExcursions > 0 ? (
                <XCircle
                  size={18}
                  className="text-red-500"
                />
              ) : (
                <CheckCircle2
                  size={18}
                  className="text-emerald-500"
                />
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white p-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Open
                </div>

                <div className="mt-1 text-lg font-black text-slate-900">
                  {loading
                    ? "—"
                    : openExcursions}
                </div>
              </div>

              <div className="rounded-lg bg-white p-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Critical
                </div>

                <div
                  className={`mt-1 text-lg font-black ${
                    criticalExcursions > 0
                      ? "text-red-600"
                      : "text-slate-900"
                  }`}
                >
                  {loading
                    ? "—"
                    : criticalExcursions}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SOURCE REGISTER */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-black text-slate-900">
              Monitoring Sources
            </div>

            <div className="mt-1 text-[11px] text-slate-500">
              Connected operational sources available to
              the command center.
            </div>
          </div>

          <a
            href="/cctv-media"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Camera size={14} />
            Manage CCTV
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-5 py-3">
                  Source
                </th>

                <th className="px-5 py-3">
                  Type
                </th>

                <th className="px-5 py-3">
                  Location
                </th>

                <th className="px-5 py-3">
                  Status
                </th>

                <th className="px-5 py-3">
                  Signal
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Camera
                        size={15}
                        className="text-slate-600"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        CAM-01
                      </div>

                      <div className="text-[10px] text-slate-400">
                        Discovery demo source
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-xs text-slate-600">
                  CCTV
                </td>

                <td className="px-5 py-4 text-xs text-slate-600">
                  Slaughter Operations
                </td>

                <td className="px-5 py-4">
                  <StatusBadge tone="demo">
                    Demo
                  </StatusBadge>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Demo stream
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-2 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          TIAKI · Halal Slaughter Intelligence
        </span>

        <span>
          Camera feed is a discovery/demo source.
          Operational CCTV should be connected through
          the CCTV & Media module.
        </span>
      </div>
    </div>
  );
}

export default function LiveMonitorPage() {
  return (
    <CommanderShell>
      <MonitorContent />
    </CommanderShell>
  );
}
