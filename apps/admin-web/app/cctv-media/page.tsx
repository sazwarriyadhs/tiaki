"use client";

import {
  Camera,
  FileVideo,
  HardDrive,
  Radio,
  Video,
} from "lucide-react";

import OperationalModuleFrame from "@/components/commander/OperationalModuleFrame";

export default function CctvMediaPage() {
  return (
    <OperationalModuleFrame
      eyebrow="QUALITY & CONTROL"
      title="CCTV & Media"
      description="Manage CCTV sources, operational media evidence and recorded monitoring footage."
      actionLabel="Add Camera"
      searchPlaceholder="Search camera or media..."
      filterLabel="All Camera Status"
      metrics={[
        {
          label: "Cameras",
          value: "0",
          description: "Registered CCTV cameras",
          icon: <Camera size={20} />,
        },
        {
          label: "Online",
          value: "0",
          description: "Cameras currently online",
          icon: <Video size={20} />,
        },
        {
          label: "Recordings",
          value: "0",
          description: "Available media records",
          icon: <FileVideo size={20} />,
        },
        {
          label: "Storage",
          value: "0",
          description: "Media storage usage",
          icon: <HardDrive size={20} />,
        },
      ]}
      columns={[
        { key: "camera", label: "Camera" },
        { key: "location", label: "Location" },
        { key: "status", label: "Status" },
        { key: "recording", label: "Recording" },
        { key: "lastSeen", label: "Last Seen" },
      ]}
      emptyTitle="No CCTV sources"
      emptyDescription="CCTV cameras and operational media evidence will appear here once sources are connected."
    />
  );
}
