"use client";
import { useEffect, useState } from "react";
import type { ApiState } from "./types";
import { CalendarDays } from "lucide-react";

export function Hero({
  apiState,
}: {
  apiState: ApiState;
}) {
    const [dateTime, setDateTime] = useState<{
      date: string;
      time: string;
      timeZoneName: string;
    } | null>(null);

    useEffect(() => {
      const update = () => {
        const now = new Date();

        const date = new Intl.DateTimeFormat(
          "en-NZ",
          {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Pacific/Auckland",
          },
        ).format(now);

        const time = new Intl.DateTimeFormat(
          "en-NZ",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Pacific/Auckland",
          },
        ).format(now);

        const timeZoneName =
          new Intl.DateTimeFormat("en-NZ", {
            timeZone: "Pacific/Auckland",
            timeZoneName: "short",
          })
            .formatToParts(now)
            .find((part) => part.type === "timeZoneName")
            ?.value ?? "NZ";

        setDateTime({
          date,
          time,
          timeZoneName,
        });
      };

      update();

      const timer = window.setInterval(
        update,
        30_000,
      );

      return () =>
        window.clearInterval(timer);
    }, []);

    const connected = apiState === "connected";
    const loading = apiState === "loading";

    const greeting =
      dateTime === null
        ? "Good Morning"
        : (() => {
            const hour = Number(
              new Intl.DateTimeFormat("en-NZ", {
                hour: "numeric",
                hour12: false,
                timeZone: "Pacific/Auckland",
              }).format(new Date()),
            );

            if (hour < 12) return "Good Morning";
            if (hour < 18) return "Good Afternoon";
            return "Good Evening";
          })();

    return (
      <section className="commander-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            NEW ZEALAND · HALAL OPERATIONS
          </div>

          <h1>Good Morning, Commander</h1>

          <p>
            Halal slaughter operations command
            center. Monitor operational activity,
            compliance and traceability from one
            place.
          </p>

          <div className="hero-date">
            <CalendarDays
              size={15}
              aria-hidden="true"
            />

            <span>
              {dateTime?.date ?? "Loading date"}
              {" · "}
              {dateTime?.time ?? "--:--"}
              {" "}{dateTime?.timeZoneName ?? "NZ"}
            </span>
          </div>
        </div>

        <div className="hero-system">
          <div className="hero-system-label">
            SYSTEM STATUS
          </div>

          <div className="hero-system-status">
            <span className="system-dot" />

            {connected
              ? "Operational"
              : loading
                ? "Connecting"
                : "Attention Required"}
          </div>

          <div className="hero-system-grid">
            <div>
              <span>API</span>

              <strong>
                {connected
                  ? "Connected"
                  : loading
                    ? "Connecting"
                    : "Unavailable"}
              </strong>
            </div>

            <div>
              <span>DATABASE</span>
              <strong>PostgreSQL 17</strong>
            </div>

            <div>
              <span>REGION</span>
              <strong>
                NZ · Pacific/Auckland
              </strong>
            </div>
          </div>
        </div>
      </section>
    );
  }
