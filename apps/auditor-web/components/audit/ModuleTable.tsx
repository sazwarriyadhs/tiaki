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
