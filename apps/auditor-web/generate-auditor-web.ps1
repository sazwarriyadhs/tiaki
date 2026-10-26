$ErrorActionPreference = "Stop"

$Root      = "D:\TIAKI\apps\auditor-web"
$AdminRoot = "D:\TIAKI\apps\admin-web"
$PublicDir = Join-Path $Root "public"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " TIAKI AUDITOR WEB - FULL GENERATOR" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

function Ensure-Dir {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Write-TextFile {
    param(
        [string]$Path,
        [string]$Content
    )

    $dir = Split-Path -Parent $Path

    if ($dir) {
        Ensure-Dir $dir
    }

    [System.IO.File]::WriteAllText(
        $Path,
        $Content,
        [System.Text.UTF8Encoding]::new($false)
    )

    Write-Host "  OK  $Path" -ForegroundColor DarkGreen
}

# ------------------------------------------------------------
# DIRECTORIES
# ------------------------------------------------------------

$Dirs = @(
    "$Root\app",
    "$Root\app\dashboard",
    "$Root\app\audits",
    "$Root\app\audits\[id]",
    "$Root\app\evidence",
    "$Root\app\evidence\[id]",
    "$Root\app\findings",
    "$Root\app\findings\[id]",
    "$Root\app\corrective-actions",
    "$Root\app\corrective-actions\[id]",
    "$Root\app\verification",
    "$Root\app\traceability",
    "$Root\app\audit-trail",
    "$Root\components",
    "$Root\components\layout",
    "$Root\components\dashboard",
    "$Root\components\audit",
    "$Root\components\evidence",
    "$Root\components\findings",
    "$Root\components\corrective-actions",
    "$Root\components\traceability",
    "$PublicDir"
)

foreach ($dir in $Dirs) {
    Ensure-Dir $dir
}

# ------------------------------------------------------------
# LOGO
# ------------------------------------------------------------

$SourceLogo = Join-Path $AdminRoot "public\logo.png"
$TargetLogo = Join-Path $PublicDir "logo.png"

if (Test-Path -LiteralPath $SourceLogo) {
    Copy-Item -LiteralPath $SourceLogo -Destination $TargetLogo -Force
    Write-Host "  OK  Logo copied from admin-web/public/logo.png" -ForegroundColor Green
}
else {
    Write-Warning "Logo tidak ditemukan: $SourceLogo"
}

# ------------------------------------------------------------
# PACKAGE
# ------------------------------------------------------------

Write-TextFile "$Root\package.json" @"
{
  "name": "tiaki-auditor-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "next": "^15.5.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0"
  }
}
"@

Write-TextFile "$Root\tsconfig.json" @"
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": ["node_modules"]
}
"@

Write-TextFile "$Root\next-env.d.ts" @"
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
"@

Write-TextFile "$Root\next.config.ts" @"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true
};

export default nextConfig;
"@

# ------------------------------------------------------------
# GLOBAL CSS
# ------------------------------------------------------------

Write-TextFile "$Root\app\globals.css" @'
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body {
  background: #f6f8f8;
  color: #0f172a;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
}

/* ============================================================
   APP SHELL
   ============================================================ */

.auditor-app {
  min-height: 100vh;
  background: #f6f8f8;
}

.auditor-shell {
  min-height: 100vh;
  display: flex;
}

.auditor-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  width: 244px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4eaec;
  background: #ffffff;
}

.auditor-brand {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 20px;
  border-bottom: 1px solid #edf1f2;
}

.auditor-brand img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.auditor-brand-text {
  min-width: 0;
}

.auditor-brand-title {
  color: #07553a;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: .035em;
}

.auditor-brand-subtitle {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.auditor-nav {
  flex: 1;
  padding: 18px 12px;
  overflow-y: auto;
}

.auditor-nav-section {
  margin: 15px 10px 7px;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.auditor-nav-section:first-child {
  margin-top: 0;
}

.auditor-nav-link {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 3px;
  padding: 0 11px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.auditor-nav-link:hover {
  background: #f5faf7;
  color: #07553a;
}

.auditor-nav-link.active {
  border-color: #d9eee4;
  background: #eef8f3;
  color: #07553a;
}

.auditor-nav-link svg {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  stroke: currentColor;
}

.auditor-sidebar-footer {
  padding: 14px;
  border-top: 1px solid #edf1f2;
}

.auditor-role-card {
  padding: 11px;
  border: 1px solid #e5ebee;
  border-radius: 9px;
  background: #f8fafb;
}

.auditor-role-label {
  color: #94a3b8;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.auditor-role-name {
  margin-top: 4px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

/* ============================================================
   MAIN
   ============================================================ */

.auditor-main {
  width: calc(100% - 244px);
  min-height: 100vh;
  margin-left: 244px;
}

.auditor-topbar {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 30px;
  border-bottom: 1px solid #e4eaec;
  background: #ffffff;
}

.auditor-topbar-title {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.auditor-topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auditor-icon-button {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e1e8ec;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
}

.auditor-icon-button:hover {
  color: #07553a;
  background: #f8fafb;
}

.auditor-user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-left: 8px;
}

.auditor-avatar {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e8f4ee;
  color: #07553a;
  font-size: 11px;
  font-weight: 800;
}

.auditor-user-name {
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.auditor-user-role {
  margin-top: 1px;
  color: #94a3b8;
  font-size: 10px;
}

.auditor-content {
  padding: 28px 30px 40px;
}

/* ============================================================
   PAGE HEADER
   ============================================================ */

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 24px;
}

.page-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.page-eyebrow svg {
  width: 15px;
  height: 15px;
}

.page-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -.025em;
}

.page-header p {
  max-width: 720px;
  margin: 7px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.65;
}

.commander-button {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid #d7e0e5;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.commander-button:hover {
  border-color: #b8c8c2;
  color: #07553a;
  background: #f8fafc;
}

.commander-button-primary {
  border-color: #059669;
  background: #059669;
  color: #fff;
}

.commander-button-primary:hover {
  border-color: #047857;
  background: #047857;
  color: #fff;
}

/* ============================================================
   KPI
   ============================================================ */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.commander-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid #e3eaed;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15,23,42,.03);
}

.kpi-card {
  min-height: 132px;
}

.kpi-header {
  display: flex;
  align-items: flex-start;
  gap: 13px;
}

.kpi-icon {
  width: 42px;
  height: 42px;
  min-width: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #eef8f3;
  color: #07553a;
}

.kpi-icon.warning {
  background: #fff8e8;
  color: #a16207;
}

.kpi-icon.danger {
  background: #fff1f2;
  color: #be123c;
}

.kpi-icon.info {
  background: #eff6ff;
  color: #2563eb;
}

.kpi-icon svg {
  width: 20px;
  height: 20px;
}

.kpi-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .045em;
  text-transform: uppercase;
}

.kpi-value {
  margin-top: 4px;
  color: #0f172a;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.1;
}

.kpi-description {
  margin-top: 14px;
  color: #94a3b8;
  font-size: 11px;
}

/* ============================================================
   GRID / PANELS
   ============================================================ */

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(300px, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
}

.panel-label {
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.panel-title {
  margin-top: 5px;
  color: #0f172a;
  font-size: 17px;
  font-weight: 700;
}

.panel-description {
  margin-top: 5px;
  color: #94a3b8;
  font-size: 12px;
}

.view-link {
  color: #07553a;
  font-size: 11px;
  font-weight: 700;
}

.audit-list {
  display: flex;
  flex-direction: column;
}

.audit-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 13px 0;
  border-bottom: 1px solid #edf1f3;
}

.audit-row:last-child {
  border-bottom: 0;
}

.audit-name {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.audit-meta {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 11px;
}

.status {
  min-height: 25px;
  display: inline-flex;
  align-items: center;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.status-active {
  background: #eaf7f0;
  color: #047857;
}

.status-review {
  background: #eff6ff;
  color: #2563eb;
}

.status-warning {
  background: #fff7e6;
  color: #a16207;
}

.status-critical {
  background: #fff1f2;
  color: #be123c;
}

.status-closed {
  background: #f1f5f9;
  color: #64748b;
}

.severity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.severity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.severity-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.severity-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.dot-critical {
  background: #be123c;
}

.dot-major {
  background: #d97706;
}

.dot-minor {
  background: #2563eb;
}

.severity-count {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-row {
  display: flex;
  gap: 11px;
  padding: 12px 0;
  border-bottom: 1px solid #edf1f3;
}

.activity-row:last-child {
  border-bottom: 0;
}

.activity-icon {
  width: 30px;
  height: 30px;
  min-width: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #eef8f3;
  color: #07553a;
}

.activity-icon svg {
  width: 15px;
  height: 15px;
}

.activity-text {
  color: #475569;
  font-size: 12px;
  line-height: 1.45;
}

.activity-time {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 10px;
}

/* ============================================================
   MODULE PAGE
   ============================================================ */

.module-page .data-card {
  width: 100%;
  overflow: hidden;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.search-box {
  min-width: 220px;
  flex: 1 1 280px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  border: 1px solid #dbe3e8;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
}

.search-box:focus-within {
  border-color: #8bc5ad;
  box-shadow: 0 0 0 3px rgba(5,150,105,.08);
}

.search-box svg {
  width: 17px;
  height: 17px;
}

.search-box input {
  width: 100%;
  min-width: 0;
  height: 38px;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #0f172a;
  font-size: 13px;
}

.data-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e7edf0;
  border-radius: 10px;
}

.data-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.data-table th {
  height: 42px;
  padding: 0 14px;
  border-bottom: 1px solid #e7edf0;
  background: #f8fafb;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .07em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.data-table td {
  height: 52px;
  padding: 8px 14px;
  border-bottom: 1px solid #edf1f3;
  color: #334155;
  font-size: 13px;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: 0;
}

.data-table tbody tr:hover {
  background: #fbfdfc;
}

.data-table td strong {
  color: #0f172a;
  font-weight: 700;
}

.empty-state {
  min-height: 245px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-state svg {
  width: 30px;
  height: 30px;
  margin-bottom: 12px;
}

.empty-state h3 {
  margin: 0;
  color: #334155;
  font-size: 15px;
}

.empty-state p {
  max-width: 520px;
  margin: 7px auto 0;
  font-size: 12px;
  line-height: 1.6;
}

/* ============================================================
   WORKFLOW
   ============================================================ */

.workflow {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.workflow-step {
  position: relative;
  padding: 14px;
  border: 1px solid #e4eaed;
  border-radius: 9px;
  background: #f8fafb;
}

.workflow-number {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e8f4ee;
  color: #07553a;
  font-size: 10px;
  font-weight: 800;
}

.workflow-title {
  margin-top: 10px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.workflow-text {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 10px;
  line-height: 1.5;
}

/* ============================================================
   MOBILE
   ============================================================ */

@media (max-width: 1099px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .workflow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .auditor-sidebar {
    width: 72px;
  }

  .auditor-brand {
    justify-content: center;
    padding: 0;
  }

  .auditor-brand-text,
  .auditor-nav-section,
  .auditor-nav-link span,
  .auditor-role-card {
    display: none;
  }

  .auditor-nav-link {
    justify-content: center;
    padding: 0;
  }

  .auditor-main {
    width: calc(100% - 72px);
    margin-left: 72px;
  }

  .auditor-content {
    padding: 24px 20px 36px;
  }

  .auditor-topbar {
    padding: 0 20px;
  }
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
  }

  .page-header-actions {
    width: 100%;
  }

  .page-header-actions .commander-button {
    width: 100%;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .workflow {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    align-items: stretch;
  }

  .search-box,
  .filter-bar .commander-button {
    width: 100%;
    min-width: 0;
    flex: 1 1 100%;
  }

  .auditor-user-name,
  .auditor-user-role {
    display: none;
  }
}
'@

# ------------------------------------------------------------
# LAYOUT
# ------------------------------------------------------------

Write-TextFile "$Root\app\layout.tsx" @'
import "./globals.css";
import { AuditorShell } from "@/components/layout/AuditorShell";

export const metadata = {
  title: "TIAKI Auditor",
  description: "TIAKI Audit and Assurance Workspace"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuditorShell>{children}</AuditorShell>
      </body>
    </html>
  );
}
'@

Write-TextFile "$Root\app\page.tsx" @'
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
}
'@

# ------------------------------------------------------------
# SHELL
# ------------------------------------------------------------

Write-TextFile "$Root\components\layout\AuditorShell.tsx" @'
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardCheck,
  FileCheck2,
  FileSearch,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  SearchCheck,
  ShieldCheck,
  Target,
  Bell
} from "lucide-react";

const nav = [
  {
    section: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/audits", label: "Audits", icon: ClipboardCheck },
      { href: "/evidence", label: "Evidence", icon: FileSearch },
      { href: "/findings", label: "Findings", icon: Target }
    ]
  },
  {
    section: "Assurance",
    items: [
      {
        href: "/corrective-actions",
        label: "Corrective Actions",
        icon: ListChecks
      },
      {
        href: "/verification",
        label: "Verification",
        icon: FileCheck2
      },
      {
        href: "/traceability",
        label: "Traceability",
        icon: GitBranch
      }
    ]
  },
  {
    section: "Governance",
    items: [
      { href: "/audit-trail", label: "Audit Trail", icon: Activity }
    ]
  }
];

export function AuditorShell({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="auditor-app">
      <div className="auditor-shell">
        <aside className="auditor-sidebar">
          <div className="auditor-brand">
            <Image
              src="/logo.png"
              alt="TIAKI"
              width={38}
              height={38}
              priority
            />
            <div className="auditor-brand-text">
              <div className="auditor-brand-title">TIAKI</div>
              <div className="auditor-brand-subtitle">Auditor</div>
            </div>
          </div>

          <nav className="auditor-nav">
            {nav.map((group) => (
              <div key={group.section}>
                <div className="auditor-nav-section">
                  {group.section}
                </div>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`auditor-nav-link ${
                        active ? "active" : ""
                      }`}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="auditor-sidebar-footer">
            <div className="auditor-role-card">
              <div className="auditor-role-label">Workspace</div>
              <div className="auditor-role-name">
                Halal Assurance
              </div>
            </div>
          </div>
        </aside>

        <main className="auditor-main">
          <header className="auditor-topbar">
            <div className="auditor-topbar-title">
              Audit &amp; Assurance Workspace
            </div>

            <div className="auditor-topbar-right">
              <button
                className="auditor-icon-button"
                type="button"
                aria-label="Notifications"
              >
                <Bell size={17} />
              </button>

              <div className="auditor-user">
                <div className="auditor-avatar">AU</div>
                <div>
                  <div className="auditor-user-name">
                    Auditor
                  </div>
                  <div className="auditor-user-role">
                    Assurance Team
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="auditor-content">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
'@

# ------------------------------------------------------------
# PAGE HEADER
# ------------------------------------------------------------

Write-TextFile "$Root\components\layout\PageHeader.tsx" @'
import { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <div className="page-eyebrow">
          <Icon />
          {eyebrow}
        </div>

        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {action ? (
        <div className="page-header-actions">{action}</div>
      ) : null}
    </div>
  );
}
'@

# ------------------------------------------------------------
# DASHBOARD
# ------------------------------------------------------------

Write-TextFile "$Root\app\dashboard\page.tsx" @'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileSearch,
  Plus,
  Target
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

const audits = [
  {
    name: "PT Sauri Unggul Sejahtera",
    scope: "Halal programme review",
    status: "Active",
    statusClass: "status-active",
    date: "30 Sep 2026"
  },
  {
    name: "Raja Telur",
    scope: "Production & traceability",
    status: "Evidence Review",
    statusClass: "status-review",
    date: "29 Sep 2026"
  },
  {
    name: "Abah Kenari",
    scope: "Operational assurance",
    status: "Pending Verification",
    statusClass: "status-warning",
    date: "28 Sep 2026"
  },
  {
    name: "Fresh Market Unggas",
    scope: "Corrective action review",
    status: "Active",
    statusClass: "status-active",
    date: "27 Sep 2026"
  }
];

const activities = [
  "Evidence package uploaded for PT Sauri Unggul Sejahtera",
  "Finding FND-2026-014 moved to corrective action",
  "Verification request submitted for Raja Telur",
  "Traceability investigation updated"
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Assurance Command"
        title="Auditor Dashboard"
        description="Halal programme review, evidence assurance, findings, corrective actions and verification."
        icon={ShieldCheck}
        action={
          <button className="commander-button commander-button-primary">
            <Plus size={17} />
            New Audit
          </button>
        }
      />

      <div className="kpi-grid">
        <Kpi
          icon={<ClipboardCheck />}
          label="Active Audits"
          value="12"
          description="Currently in assurance workflow"
        />
        <Kpi
          icon={<FileSearch />}
          label="Evidence Review"
          value="38"
          description="Evidence items awaiting review"
          tone="info"
        />
        <Kpi
          icon={<Target />}
          label="Open Findings"
          value="17"
          description="Across active audit engagements"
          tone="danger"
        />
        <Kpi
          icon={<FileCheck2 />}
          label="Pending Verify"
          value="9"
          description="Corrective actions ready for verification"
          tone="warning"
        />
      </div>

      <div className="dashboard-grid">
        <section className="commander-card">
          <div className="panel-header">
            <div>
              <div className="panel-label">Current portfolio</div>
              <div className="panel-title">Active Audits</div>
              <div className="panel-description">
                Latest audit engagements requiring attention.
              </div>
            </div>

            <a className="view-link" href="/audits">
              View all
            </a>
          </div>

          <div className="audit-list">
            {audits.map((audit) => (
              <div className="audit-row" key={audit.name}>
                <div>
                  <div className="audit-name">{audit.name}</div>
                  <div className="audit-meta">
                    {audit.scope} · {audit.date}
                  </div>
                </div>

                <span className={`status ${audit.statusClass}`}>
                  {audit.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="commander-card">
          <div className="panel-header">
            <div>
              <div className="panel-label">Findings</div>
              <div className="panel-title">Severity Overview</div>
            </div>
          </div>

          <div className="severity-list">
            <Severity name="Critical" count="2" dot="dot-critical" />
            <Severity name="Major" count="7" dot="dot-major" />
            <Severity name="Minor" count="8" dot="dot-minor" />
          </div>

          <div style={{ height: 18 }} />

          <div className="panel-label">Verification queue</div>
          <div style={{ marginTop: 8 }}>
            <strong style={{ fontSize: 24, color: "#0f172a" }}>
              9
            </strong>
            <span
              style={{
                marginLeft: 8,
                color: "#64748b",
                fontSize: 11
              }}
            >
              corrective actions
            </span>
          </div>
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="commander-card">
          <div className="panel-header">
            <div>
              <div className="panel-label">Workflow</div>
              <div className="panel-title">
                Assurance Pipeline
              </div>
            </div>
          </div>

          <div className="workflow">
            <Workflow n="01" title="Planning" text="Scope & criteria" />
            <Workflow n="02" title="Evidence" text="Review & validation" />
            <Workflow n="03" title="Findings" text="Classification" />
            <Workflow n="04" title="Corrective" text="Action & owner" />
            <Workflow n="05" title="Verification" text="Acceptance" />
          </div>
        </section>

        <section className="commander-card">
          <div className="panel-header">
            <div>
              <div className="panel-label">Activity</div>
              <div className="panel-title">Recent Activity</div>
            </div>
          </div>

          <div className="activity-list">
            {activities.map((activity, index) => (
              <div className="activity-row" key={activity}>
                <div className="activity-icon">
                  {index === 0 ? (
                    <FileSearch />
                  ) : index === 1 ? (
                    <Target />
                  ) : index === 2 ? (
                    <CheckCircle2 />
                  ) : (
                    <Activity />
                  )}
                </div>

                <div>
                  <div className="activity-text">{activity}</div>
                  <div className="activity-time">
                    {index + 1} hour{index === 0 ? "" : "s"} ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  description,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  tone?: "warning" | "danger" | "info";
}) {
  return (
    <div className="commander-card kpi-card">
      <div className="kpi-header">
        <div className={`kpi-icon ${tone ?? ""}`}>{icon}</div>

        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
        </div>
      </div>

      <div className="kpi-description">{description}</div>
    </div>
  );
}

function Severity({
  name,
  count,
  dot
}: {
  name: string;
  count: string;
  dot: string;
}) {
  return (
    <div className="severity-item">
      <div className="severity-name">
        <span className={`severity-dot ${dot}`} />
        {name}
      </div>

      <div className="severity-count">{count}</div>
    </div>
  );
}

function Workflow({
  n,
  title,
  text
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <div className="workflow-step">
      <div className="workflow-number">{n}</div>
      <div className="workflow-title">{title}</div>
      <div className="workflow-text">{text}</div>
    </div>
  );
}
'@

# ------------------------------------------------------------
# GENERIC MODULE PAGE
# ------------------------------------------------------------

Write-TextFile "$Root\components\audit\ModuleTable.tsx" @'
"use client";

import { Search, Plus } from "lucide-react";

type Row = {
  id: string;
  name: string;
  organisation: string;
  status: string;
  date: string;
};

const rows: Row[] = [
  {
    id: "AUD-2026-021",
    name: "Halal Programme Review",
    organisation: "PT Sauri Unggul Sejahtera",
    status: "Active",
    date: "30 Sep 2026"
  },
  {
    id: "AUD-2026-020",
    name: "Production Traceability",
    organisation: "Raja Telur",
    status: "Evidence Review",
    date: "29 Sep 2026"
  },
  {
    id: "AUD-2026-019",
    name: "Operational Assurance",
    organisation: "Abah Kenari",
    status: "Pending Verification",
    date: "28 Sep 2026"
  },
  {
    id: "AUD-2026-018",
    name: "Corrective Action Review",
    organisation: "Fresh Market Unggas",
    status: "Active",
    date: "27 Sep 2026"
  }
];

function statusClass(status: string) {
  if (status === "Active") return "status-active";
  if (status === "Evidence Review") return "status-review";
  if (status === "Pending Verification") return "status-warning";
  return "status-closed";
}

export function ModuleTable() {
  return (
    <div className="commander-card data-card">
      <div className="filter-bar">
        <div className="search-box">
          <Search />
          <input placeholder="Search records..." />
        </div>

        <button className="commander-button">
          Status
        </button>

        <button className="commander-button commander-button-primary">
          <Plus size={16} />
          New
        </button>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Audit</th>
              <th>Organisation</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.id}</strong>
                </td>
                <td>{row.name}</td>
                <td>{row.organisation}</td>
                <td>
                  <span className={`status ${statusClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@

# ------------------------------------------------------------
# AUDITS
# ------------------------------------------------------------

Write-TextFile "$Root\app\audits\page.tsx" @'
import { ClipboardCheck, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ModuleTable } from "@/components/audit/ModuleTable";

export default function AuditsPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Audit Management"
        title="Audits"
        description="Plan, execute and monitor assurance engagements."
        icon={ClipboardCheck}
        action={
          <button className="commander-button commander-button-primary">
            <Plus size={17} />
            New Audit
          </button>
        }
      />

      <ModuleTable />
    </div>
  );
}
'@

# ------------------------------------------------------------
# OTHER MODULES
# ------------------------------------------------------------

Write-TextFile "$Root\app\evidence\page.tsx" @'
import { FileSearch } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EvidencePage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Assurance"
        title="Evidence Review"
        description="Review documents, photos, certificates, records and interview evidence."
        icon={FileSearch}
      />

      <div className="commander-card">
        <div className="empty-state">
          <FileSearch />
          <h3>Evidence workspace ready</h3>
          <p>
            Evidence packages will appear here for auditor review,
            validation and traceability.
          </p>
        </div>
      </div>
    </div>
  );
}
'@

Write-TextFile "$Root\app\findings\page.tsx" @'
import { Target } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function FindingsPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Assurance"
        title="Findings"
        description="Classify and manage audit findings by severity, requirement and evidence."
        icon={Target}
      />

      <div className="commander-card">
        <div className="empty-state">
          <Target />
          <h3>Findings workspace ready</h3>
          <p>
            Critical, major and minor findings will be tracked
            through their complete lifecycle.
          </p>
        </div>
      </div>
    </div>
  );
}
'@

Write-TextFile "$Root\app\corrective-actions\page.tsx" @'
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CorrectiveActionsPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Assurance"
        title="Corrective Actions"
        description="Track root cause, action owner, due date and implementation evidence."
        icon={ListChecks}
      />

      <div className="commander-card">
        <div className="empty-state">
          <ListChecks />
          <h3>Corrective action workspace ready</h3>
          <p>
            Corrective actions will move from finding assignment
            through implementation and verification.
          </p>
        </div>
      </div>
    </div>
  );
}
'@

Write-TextFile "$Root\app\verification\page.tsx" @'
import { FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function VerificationPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Assurance"
        title="Verification"
        description="Review corrective-action evidence and record acceptance or rejection."
        icon={FileCheck2}
      />

      <div className="commander-card">
        <div className="empty-state">
          <FileCheck2 />
          <h3>Verification queue ready</h3>
          <p>
            Submitted corrective-action evidence will be available
            for auditor verification.
          </p>
        </div>
      </div>
    </div>
  );
}
'@

Write-TextFile "$Root\app\traceability\page.tsx" @'
import { GitBranch } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function TraceabilityPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Investigation"
        title="Traceability"
        description="Investigate relationships between suppliers, materials, processes, products and evidence."
        icon={GitBranch}
      />

      <div className="commander-card">
        <div className="empty-state">
          <GitBranch />
          <h3>Traceability workspace ready</h3>
          <p>
            Traceability investigations will connect operational
            records and assurance evidence.
          </p>
        </div>
      </div>
    </div>
  );
}
'@

Write-TextFile "$Root\app\audit-trail\page.tsx" @'
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AuditTrailPage() {
  return (
    <div className="module-page">
      <PageHeader
        eyebrow="Governance"
        title="Audit Trail"
        description="Immutable activity history for assurance and traceability workflows."
        icon={Activity}
      />

      <div className="commander-card">
        <div className="empty-state">
          <Activity />
          <h3>Audit trail workspace ready</h3>
          <p>
            System events, review actions, verification decisions
            and traceability changes will be recorded here.
          </p>
        </div>
      </div>
    </div>
  );
}
'@

# ------------------------------------------------------------
# DETAIL ROUTES
# ------------------------------------------------------------

$DetailPages = @{
    "$Root\app\audits\[id]\page.tsx" = @'
import { ClipboardCheck } from "lucide-react";

export default function AuditDetailPage() {
  return (
    <div className="module-page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            <ClipboardCheck />
            Audit Detail
          </div>
          <h1>AUD-2026-021</h1>
          <p>Halal programme assurance engagement.</p>
        </div>
      </div>

      <div className="commander-card">
        Audit detail workspace.
      </div>
    </div>
  );
}
'@

    "$Root\app\evidence\[id]\page.tsx" = @'
export default function EvidenceDetailPage() {
  return (
    <div className="module-page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Evidence Detail</div>
          <h1>Evidence Package</h1>
          <p>Evidence review and validation workspace.</p>
        </div>
      </div>

      <div className="commander-card">
        Evidence detail workspace.
      </div>
    </div>
  );
}
'@

    "$Root\app\findings\[id]\page.tsx" = @'
export default function FindingDetailPage() {
  return (
    <div className="module-page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Finding Detail</div>
          <h1>FND-2026-014</h1>
          <p>Finding classification and corrective action workspace.</p>
        </div>
      </div>

      <div className="commander-card">
        Finding detail workspace.
      </div>
    </div>
  );
}
'@

    "$Root\app\corrective-actions\[id]\page.tsx" = @'
export default function CorrectiveActionDetailPage() {
  return (
    <div className="module-page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Corrective Action Detail</div>
          <h1>CAR-2026-009</h1>
          <p>Root cause, action implementation and evidence.</p>
        </div>
      </div>

      <div className="commander-card">
        Corrective action detail workspace.
      </div>
    </div>
  );
}
'@
}

foreach ($entry in $DetailPages.GetEnumerator()) {
    Write-TextFile $entry.Key $entry.Value
}

# ------------------------------------------------------------
# README
# ------------------------------------------------------------

Write-TextFile "$Root\README.md"
