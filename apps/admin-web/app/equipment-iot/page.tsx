"use client";

import {
  Cpu,
  Gauge,
  Radio,
  Settings2,
  Thermometer,
  Wifi,
} from "lucide-react";

import OperationalModuleFrame from "@/components/commander/OperationalModuleFrame";

export default function EquipmentIoTPage() {
  return (
    <OperationalModuleFrame
      eyebrow="QUALITY & CONTROL"
      title="Equipment / IoT"
      description="Manage equipment, IoT devices, telemetry and operational sensor connectivity."
      actionLabel="Add Device"
      searchPlaceholder="Search device..."
      filterLabel="All Device Status"
      metrics={[
        {
          label: "Devices",
          value: "0",
          description: "Registered equipment and devices",
          icon: <Cpu size={20} />,
        },
        {
          label: "Online",
          value: "0",
          description: "Connected devices",
          icon: <Wifi size={20} />,
        },
        {
          label: "Sensors",
          value: "0",
          description: "Registered telemetry sensors",
          icon: <Thermometer size={20} />,
        },
        {
          label: "Signals",
          value: "0",
          description: "Active telemetry signals",
          icon: <Radio size={20} />,
        },
      ]}
      columns={[
        { key: "device", label: "Device" },
        { key: "type", label: "Type" },
        { key: "location", label: "Location" },
        { key: "status", label: "Status" },
        { key: "lastSeen", label: "Last Seen" },
      ]}
      emptyTitle="No equipment or IoT devices"
      emptyDescription="Registered equipment, sensors and telemetry devices will appear here."
    />
  );
}
