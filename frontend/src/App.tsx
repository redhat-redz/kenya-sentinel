import { useCallback, useEffect, useState, type FormEvent } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import type { Report, Summary } from "./types";

const API = "http://127.0.0.1:8000";
const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const labels: Record<string, string> = {
  road_damage: "Road damage", water_leakage: "Water leakage",
  waste_accumulation: "Waste accumulation", other: "Other"
};

export default function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [r, s] = await Promise.all([
        fetch(`${API}/api/v1/reports`), fetch(`${API}/api/v1/analytics/summary`)
      ]);
      if (!r.ok || !s.ok) throw new Error("API request failed");
      setReports(await r.json());
      setSummary(await s.json());
      setError("");
    } catch {
      setError("Cannot reach the local API. Start the backend at http://127.0.0.1:8000.");
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch(`${API}/api/v1/reports`, { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Report submission failed.");
      form.reset();
      setMessage(`Report #${result.id} submitted and marked pending review.`);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand-mark">KS</div>
      <div><div className="brand">KENYA SENTINEL</div><div className="tagline">PUBLIC INFRASTRUCTURE INTELLIGENCE · PROTOTYPE</div></div>
      <span className="env">LOCAL DEVELOPMENT</span>
    </header>
    <section className="intro">
      <p className="eyebrow">KSEF 2027 · RESEARCH PROTOTYPE</p>
      <h1>Infrastructure intelligence, grounded in evidence.</h1>
      <p className="sub">A pilot interface for documenting, mapping and analysing public infrastructure reports in the Tambach / Elgeyo Marakwet study area.</p>
    </section>
    {error && <div className="alert error">{error}</div>}
    {message && <div className="alert success">{message}</div>}
    <section className="stats">
      <article className="stat"><span>Total submitted reports</span><strong>{summary?.total_reports ?? "—"}</strong></article>
      <article className="stat"><span>Pending review</span><strong>{summary?.by_status?.pending_review ?? 0}</strong></article>
      <article className="stat"><span>Verified reports</span><strong>{summary?.by_status?.verified ?? 0}</strong></article>
    </section>
    <section className="content-grid">
      <div className="panel">
        <div className="panel-head"><div><p className="eyebrow">SENTINEL GEO</p><h2>Report distribution</h2></div><span className="live-dot">LOCAL DATA</span></div>
        <MapContainer center={[0.65, 35.5]} zoom={10} scrollWheelZoom={false} className="map">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {reports.map(report => <Marker key={report.id} position={[report.latitude, report.longitude]} icon={markerIcon}>
            <Popup><strong>{report.title}</strong><br />{labels[report.category] || report.category}<br />Status: {report.status}</Popup>
          </Marker>)}
        </MapContainer>
        <p className="map-note">Map tiles require internet. Markers represent reports stored in this local prototype.</p>
      </div>
      <div className="panel">
        <div className="panel-head"><div><p className="eyebrow">SENTINEL CITIZEN</p><h2>Submit a report</h2></div></div>
        <form onSubmit={submitReport} className="report-form">
          <label>Report title<input name="title" minLength={4} maxLength={120} placeholder="e.g. Damaged road surface" required /></label>
          <label>Infrastructure category<select name="category" required>
            <option value="road_damage">Road damage</option><option value="water_leakage">Water leakage</option>
            <option value="waste_accumulation">Waste accumulation</option><option value="other">Other</option>
          </select></label>
          <label>Description<textarea name="description" minLength={10} maxLength={2000} rows={3} placeholder="Describe the public infrastructure issue..." required /></label>
          <div className="two-fields">
            <label>Latitude<input name="latitude" type="number" step="any" min="-90" max="90" defaultValue="0.65" required /></label>
            <label>Longitude<input name="longitude" type="number" step="any" min="-180" max="180" defaultValue="35.5" required /></label>
          </div>
          <label>Evidence image <span className="muted">(optional, max 5 MB)</span><input name="evidence" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <button disabled={busy}>{busy ? "Submitting..." : "Submit infrastructure report"}</button>
          <p className="form-foot">Reports enter <b>pending review</b>. Submission does not mean the claim has been verified.</p>
        </form>
      </div>
    </section>
    <section className="panel reports-panel">
      <div className="panel-head"><div><p className="eyebrow">SENTINEL COMMAND</p><h2>Recent reports</h2></div><button className="secondary" onClick={() => void loadData()}>Refresh</button></div>
      {reports.length === 0 ? <p className="empty">No reports yet. Submit a demonstration report to populate the system.</p> :
        <div className="table-wrap"><table><thead><tr><th>ID</th><th>Report</th><th>Category</th><th>Coordinates</th><th>Status</th></tr></thead>
          <tbody>{reports.map(r => <tr key={r.id}><td>#{r.id}</td><td>{r.title}</td><td>{labels[r.category] || r.category}</td><td>{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</td><td><span className="status">{r.status.replaceAll("_", " ")}</span></td></tr>)}</tbody>
        </table></div>}
    </section>
    <footer>KENYA SENTINEL · RESEARCH PROTOTYPE · NOT AN OFFICIAL GOVERNMENT SERVICE</footer>
  </main>;
}
