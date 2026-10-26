export default function NewAuditPage() {
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Audit Management</div>
          <h1>New Audit</h1>
          <p className="page-description">
            Create a new halal audit engagement.
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Audit Profile</div>
        </div>

        <div className="panel-body">
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Audit Name</label>
              <input className="form-input" placeholder="Halal Assurance Programme Review" />
            </div>

            <div className="form-field">
              <label className="form-label">Organization</label>
              <input className="form-input" placeholder="Organization name" />
            </div>

            <div className="form-field">
              <label className="form-label">Audit Type</label>
              <select className="form-select">
                <option>Halal Programme Review</option>
                <option>Evidence Review</option>
                <option>Traceability Assessment</option>
                <option>Follow-up Audit</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Lead Auditor</label>
              <input className="form-input" placeholder="Lead Auditor" />
            </div>

            <div className="form-field">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" />
            </div>

            <div className="form-field">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" />
            </div>

            <div className="form-field full">
              <label className="form-label">Scope</label>
              <textarea
                className="form-textarea"
                placeholder="Define audit scope..."
              />
            </div>
          </div>

          <div className="button-row" style={{ marginTop: 18 }}>
            <button className="button">Save Draft</button>
            <button className="button primary">Create Audit</button>
          </div>
        </div>
      </section>
    </div>
  );
}
