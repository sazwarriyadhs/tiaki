export default function SettingsPage() {
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">System</div>
          <h1>Settings</h1>
          <p className="page-description">
            Auditor workspace configuration.
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Audit Configuration</div>
        </div>

        <div className="panel-body">
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Default Audit Status</label>
              <select className="form-select">
                <option>Draft</option>
                <option>Planning</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Default Finding Class</label>
              <select className="form-select">
                <option>Nonconformity</option>
                <option>Observation</option>
                <option>Opportunity</option>
              </select>
            </div>

            <div className="form-field full">
              <label className="form-label">
                Evidence retention note
              </label>
              <textarea
                className="form-textarea"
                placeholder="Configure evidence retention policy..."
              />
            </div>
          </div>

          <div className="button-row" style={{ marginTop: 18 }}>
            <button className="button primary">Save Settings</button>
          </div>
        </div>
      </section>
    </div>
  );
}
