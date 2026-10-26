import Link from "next/link";

export default function TraceabilityInvestigationsPage() {
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Traceability</div>
          <h1>Investigations</h1>
          <p className="page-description">
            Open and historical traceability investigations.
          </p>
        </div>

        <Link href="/traceability" className="button primary">
          New Investigation
        </Link>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SUBJECT</th>
                <th>DIRECTION</th>
                <th>STATUS</th>
                <th>UPDATED</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TRACE-2026-0007</td>
                <td>LOT-0926-A</td>
                <td>Both</td>
                <td><span className="badge badge-warning">OPEN</span></td>
                <td>01 Oct 2026 12:47</td>
              </tr>
              <tr>
                <td>TRACE-2026-0006</td>
                <td>MAT-0038</td>
                <td>Backward</td>
                <td><span className="badge badge-success">CLOSED</span></td>
                <td>30 Sep 2026 16:20</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
