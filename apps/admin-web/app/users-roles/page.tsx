"use client";

import {
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";

import OperationalModuleFrame from "@/components/commander/OperationalModuleFrame";

export default function UsersRolesPage() {
  return (
    <OperationalModuleFrame
      eyebrow="ADMINISTRATION"
      title="Users & Roles"
      description="Manage platform users, roles, access control and administrative identities."
      actionLabel="Invite User"
      searchPlaceholder="Search users..."
      filterLabel="All User Status"
      metrics={[
        {
          label: "Total Users",
          value: "0",
          description: "Registered platform users",
          icon: <Users size={20} />,
        },
        {
          label: "Active Users",
          value: "0",
          description: "Users with active access",
          icon: <UserCheck size={20} />,
        },
        {
          label: "Roles",
          value: "0",
          description: "Configured platform roles",
          icon: <ShieldCheck size={20} />,
        },
        {
          label: "Administrators",
          value: "0",
          description: "Users with administrative access",
          icon: <UserCog size={20} />,
        },
      ]}
      columns={[
        { key: "user", label: "User" },
        { key: "role", label: "Role" },
        { key: "organisation", label: "Organisation" },
        { key: "status", label: "Status" },
        { key: "lastLogin", label: "Last Login" },
      ]}
      emptyTitle="No users registered"
      emptyDescription="Platform users and role assignments will appear here."
    />
  );
}
