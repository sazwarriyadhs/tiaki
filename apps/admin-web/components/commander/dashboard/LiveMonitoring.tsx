"use client";

import {
  Activity,
  Camera,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Radio,
  Thermometer,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

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

function getAccessToken() {
  if (typeof window === "undefined") return "";

  const keys = [
    "access_token",
    "tiaki_access_token",
    "token",
    "accessToken",
  ];

  for (const key of keys) {
    const value =
      window.localStorage.getItem(key) ??
      window.sessionStorage.getItem(key);

    if (value) return value;
  }

  return "";
}

async function fetchEquipmentOverview(): Promise<EquipmentOverview | null> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8093";

  const token = getAccessToken();

  const response = await fetch(
    `${apiUrl}/api/v1/equipment/overview`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Equipment overview failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse;

  return payload.data ?? null;
}

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "live" | "demo" | "offline" | "neutral";
}) {
  const styles = {
    live: "border-emerald-200 bg-emerald-50 text-emerald-700",
    demo: "border-amber-200 bg-amber-50 text-amber-700",
    offline: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${styles[tone]}`}
    >
      {tone === "live" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      )}

      {tone === "demo" && (
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      )}

      {tone === "offline" && (
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      )}

      {children}
    </span>
  );
}

export function LiveMonitoring() {
  const [overview, setOverview] =
    useState<EquipmentOverview | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchEquipmentOverview();

        if (mounted) {
          setOverview(data);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            "Unable to load live equipment telemetry.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    const interval = window.setInterval(load, 30000);

    return () => {
      mounted = false;
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

  return (
    <section className="card commander-panel live-panel overflow-hidden">
      {/* HEADER */}
      <div className="panel-header">
        <div>
          <div className="flex items-center gap-2">
            <div className="panel-title">
              Live Monitoring
            </div>

            <StatusBadge tone="demo">
              Demo Environment
            </StatusBadge>
          </div>

          <div className="panel-subtitle">
            Operational camera feeds & telemetry
          </div>
        </div>

        <div className="panel-action-status">
          {connectedDevices > 0 ? (
            <>
              <Wifi
                size={14}
                aria-hidden="true"
              />
              {connectedDevices} device
              {connectedDevices !== 1 ? "s" : ""} online
            </>
          ) : (
            <>
              <WifiOff
                size={14}
                aria-hidden="true"
              />
              No live IoT devices
            </>
          )}
        </div>
      </div>

      {/* CCTV */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <Camera
                size={16}
                className="text-white"
              />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-white">
                Camera 01
              </div>

              <div className="mt-0.5 text-[11px] text-slate-400">
                Slaughter Operations · Demo Source
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge tone="demo">
              DEMO FEED
            </StatusBadge>

            <a
              href="/cctv-media"
              title="Configure CCTV"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube.com/embed/gaykytEde3U?autoplay=1&mute=1&controls=1&rel=0"
            title="TIAKI CCTV Demo Feed"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />

          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/60 px-3 py-2 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              Demo CCTV
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/60 px-3 py-2 backdrop-blur">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              TIAKI · FIANZ Discovery Demo
            </div>
          </div>
        </div>
      </div>

      {/* TELEMETRY SNAPSHOT */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              IoT Devices
            </span>

            <Radio
              size={15}
              className="text-slate-400"
            />
          </div>

          <div className="mt-2 text-xl font-black text-slate-900">
            {loading ? "—" : connectedDevices}
          </div>

          <div className="mt-1 text-[11px] text-slate-500">
            online
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Temp Sensors
            </span>

            <Thermometer
              size={15}
              className="text-slate-400"
            />
          </div>

          <div className="mt-2 text-xl font-black text-slate-900">
            {loading ? "—" : activeSensors}
          </div>

          <div className="mt-1 text-[11px] text-slate-500">
            active
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Open Excursions
            </span>

            <Activity
              size={15}
              className="text-slate-400"
            />
          </div>

          <div className="mt-2 text-xl font-black text-slate-900">
            {loading ? "—" : openExcursions}
          </div>

          <div className="mt-1 text-[11px] text-slate-500">
            temperature events
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Critical
            </span>

            {criticalExcursions > 0 ? (
              <XCircle
                size={15}
                className="text-red-500"
              />
            ) : (
              <CheckCircle2
                size={15}
                className="text-emerald-500"
              />
            )}
          </div>

          <div className="mt-2 text-xl font-black text-slate-900">
            {loading ? "—" : criticalExcursions}
          </div>

          <div className="mt-1 text-[11px] text-slate-500">
            critical excursions
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            {error ? (
              <WifiOff
                size={15}
                className="text-red-500"
              />
            ) : (
              <Activity
                size={15}
                className="text-slate-600"
              />
            )}
          </div>

          <div>
            <div className="text-xs font-bold text-slate-800">
              {error
                ? "Telemetry unavailable"
                : "Operational telemetry connected"}
            </div>

            <div className="mt-0.5 text-[11px] text-slate-500">
              {error ??
                "Camera streaming is currently presented as a discovery demo feed. IoT metrics are sourced from TIAKI equipment telemetry."}
            </div>
          </div>
        </div>

        <a
          href="/cctv-media"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
        >
          <Camera size={14} />
          Configure CCTV
        </a>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
        <span>
          Camera source: YouTube demo stream
        </span>

        <span className="flex items-center gap-1">
          <Maximize2 size={10} />
          Demo only
        </span>
      </div>
    </section>
  );
}
