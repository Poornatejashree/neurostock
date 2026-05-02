import { useState, useEffect } from "react";
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from "../utils/api";
import { Plus, Edit2, Trash2, X, Truck, Star } from "lucide-react";

function SupplierModal({ supplier, onClose, onSave }) {
  const isEdit = !!supplier?._id;
  const [form, setForm] = useState({ name: supplier?.name || "", email: supplier?.email || "", phone: supplier?.phone || "", address: supplier?.address || "", category: supplier?.category || "", leadTimeDays: supplier?.leadTimeDays || "", rating: supplier?.rating || 5, notes: supplier?.notes || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name) { setError("Supplier name is required."); return; }
    setLoading(true); setError("");
    try {
      if (isEdit) { await updateSupplier(supplier._id, form); } else { await addSupplier(form); }
      onSave();
    } catch (e) { setError(e.response?.data?.message || "Error saving supplier."); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>{isEdit ? "Edit Supplier" : "Add Supplier"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
        </div>
        {error && <div className="error-box">⚠️ {error}</div>}
        <div className="form-row">
          <div className="form-group"><label className="form-label">Supplier Name *</label><input className="form-input" placeholder="TechSupply Co." value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Category</label><input className="form-input" placeholder="Electronics, Food, etc." value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="contact@supplier.com" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        </div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-input" placeholder="City, State, Country" value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Lead Time (Days)</label><input className="form-input" type="number" min="1" placeholder="7" value={form.leadTimeDays} onChange={(e) => set("leadTimeDays", e.target.value)} /></div>
          <div className="form-group">
            <label className="form-label">Rating (1-5)</label>
            <input className="form-input" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} />
          </div>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" placeholder="Any notes about this supplier..." value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : isEdit ? "Save Changes" : "Add Supplier"}</button>
        </div>
      </div>
    </div>
  );
}

function Stars({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={12} fill={i <= rating ? "#f0883e" : "none"} color={i <= rating ? "#f0883e" : "var(--text-muted)"} />
      ))}
    </div>
  );
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetch = () => {
    setLoading(true);
    getSuppliers().then((r) => setSuppliers(r.data)).catch(() => setSuppliers([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Suppliers</div><div className="page-sub">{suppliers.length} suppliers registered</div></div>
        <button className="btn btn--primary" onClick={() => setModal(null)}><Plus size={16} /> Add Supplier</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon stat-icon--blue"><Truck size={20} /></div><div><div className="stat-label">Total Suppliers</div><div className="stat-value">{suppliers.length}</div></div></div>
        <div className="stat-card"><div className="stat-icon stat-icon--green"><Star size={20} /></div><div><div className="stat-label">Avg Rating</div><div className="stat-value">{suppliers.length ? (suppliers.reduce((a, s) => a + (s.rating || 0), 0) / suppliers.length).toFixed(1) : "—"}</div></div></div>
        <div className="stat-card"><div className="stat-icon stat-icon--orange"><Truck size={20} /></div><div><div className="stat-label">Avg Lead Time</div><div className="stat-value">{suppliers.length ? Math.round(suppliers.reduce((a, s) => a + (s.leadTimeDays || 0), 0) / suppliers.length) + "d" : "—"}</div></div></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="loading-spin" /></div>
        ) : suppliers.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🚚</div><div className="empty-state-text">No suppliers yet. Add your first supplier!</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>Category</th><th>Contact</th><th>Lead Time</th><th>Rating</th><th>Notes</th><th>Actions</th></tr></thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s._id}>
                    <td><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.address || "—"}</div></td>
                    <td><span className="badge badge--gray">{s.category || "—"}</span></td>
                    <td><div style={{ fontSize: 12.5 }}>{s.email || "—"}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.phone || "—"}</div></td>
                    <td><span className="badge badge--blue">{s.leadTimeDays ? `${s.leadTimeDays} days` : "—"}</span></td>
                    <td><Stars rating={s.rating || 0} /></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 180 }}>{s.notes?.slice(0, 60) || "—"}</td>
                    <td><div style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => setModal(s)}><Edit2 size={12} /></button>
                      <button className="btn btn--sm" style={{ background: "var(--accent-red-dim)", color: "var(--accent-red)", border: "none" }} onClick={() => setDeleteTarget(s)}><Trash2 size={12} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== undefined && <SupplierModal supplier={modal} onClose={() => setModal(undefined)} onSave={() => { setModal(undefined); fetch(); }} />}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <div className="modal-title">Delete {deleteTarget.name}?</div>
              <div className="modal-actions" style={{ justifyContent: "center", marginTop: 16 }}>
                <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn--danger" onClick={async () => { await deleteSupplier(deleteTarget._id); setDeleteTarget(null); fetch(); }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
