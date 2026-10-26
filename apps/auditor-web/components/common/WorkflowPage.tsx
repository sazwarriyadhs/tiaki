import Link from "next/link";

type Item = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  statusType: "critical" | "high" | "warning" | "success" | "info";
};

export function WorkflowPage({
  eyebrow,
  title,
  description,
  action,
  items
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  items: Item[];
}) {
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>

        <button className="button primary">+ {action}</button>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">{title} Workspace</div>
            <div className="panel-subtitle">
              Review and manage current workflow items
            </div>
          </div>
          <span className="badge badge-info">
            {items.length} ITEMS
          </span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ITEM</th>
                <th>DETAIL</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <strong style={{ color: "#edf4fb" }}>
                      {item.title}
                    </strong>
                  </td>
                  <td>{item.subtitle}</td>
                  <td>
                    <span className={`badge badge-${item.statusType}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <Link href="#" className="button">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
