import { useState, useEffect } from "react";
import { getUsers, addUser, updateUser, deleteUser } from "../utils/api";
import { Plus, Edit2, Trash2, X, Users, Shield, UserCheck } from "lucide-react";

function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user?._id;
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", role: user?.role || "worker", password: "", isActive: user?.isActive !== false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    if (!isEdit && !form.password) { setError("Password is required for new users."); return; }
    setLoading(true); setError("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (isEdit) { await updateUser(user._id, payload); } else { await addUser(payload); }
      onSave();
    } catch (e) { setError(e.response?.data?.message || "Error saving user."); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>{isEdit ? "Edit User" : "Add New User"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
        </div>
        {error && <div className="error-box">⚠️ {error}</div>}
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="user@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="worker">Worker</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.isActive ? "active" : "inactive"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{isEdit ? "New Password (leave blank to keep)" : "Password *"}</label>
          <input className="form-input" type="password" placeholder={isEdit ? "Leave blank to keep current" : "Set initial password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
          <strong>Role permissions:</strong><br />
          <span style={{ color: "var(--accent-purple)" }}>Admin</span> — Full access: add/edit/delete products, manage users, view all reports<br />
          <span style={{ color: "var(--accent-blue)" }}>Worker</span> — Can update stock and record sales, cannot delete or manage users
        </div>
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}</button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetch = () => {
    setLoading(true);
    getUsers().then((r) => setUsers(r.data)).catch(() => setUsers([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const admins = users.filter((u) => u.role === "admin");
  const workers = users.filter((u) => u.role === "worker");

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Users</div><div className="page-sub">{users.length} accounts · {admins.length} admins · {workers.length} workers</div></div>
        <button className="btn btn--primary" onClick={() => setModal(null)}><Plus size={16} /> Add User</button>
      </div>

      {currentUser.role !== "admin" && (
        <div className="error-box" style={{ marginBottom: 20 }}>⚠️ Only administrators can manage users.</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon stat-icon--blue"><Users size={20} /></div><div><div className="stat-label">Total Users</div><div className="stat-value">{users.length}</div></div></div>
        <div className="stat-card"><div className="stat-icon stat-icon--purple"><Shield size={20} /></div><div><div className="stat-label">Administrators</div><div className="stat-value">{admins.length}</div></div></div>
        <div className="stat-card"><div className="stat-icon stat-icon--green"><UserCheck size={20} /></div><div><div className="stat-label">Active Workers</div><div className="stat-value">{workers.filter(u => u.isActive !== false).length}</div></div></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? <div className="loading-center"><div className="loading-spin" /></div>
        : users.length === 0 ? <div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-text">No users found. Create the first user!</div></div>
        : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: u.role === "admin" ? "var(--accent-purple-dim)" : "var(--accent-blue-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: u.role === "admin" ? "var(--accent-purple)" : "var(--accent-blue)" }}>
                          {(u.name || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <div><div style={{ fontWeight: 600 }}>{u.name}</div>{u._id === currentUser._id && <span style={{ fontSize: 10, color: "var(--accent-green)" }}>● You</span>}</div>
                      </div>
                    </td>
                    <td><span className={`badge ${u.role === "admin" ? "badge--purple" : "badge--blue"}`}>{u.role === "admin" ? "👑 Admin" : "👷 Worker"}</span></td>
                    <td><span className={`badge ${u.isActive !== false ? "badge--green" : "badge--gray"}`}>{u.isActive !== false ? "Active" : "Inactive"}</span></td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{u.email}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                    <td>
                      {u._id !== currentUser._id && (
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="btn btn--ghost btn--sm" onClick={() => setModal(u)}><Edit2 size={12} /></button>
                          <button className="btn btn--sm" style={{ background: "var(--accent-red-dim)", color: "var(--accent-red)", border: "none" }} onClick={() => setDeleteTarget(u)}><Trash2 size={12} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== undefined && <UserModal user={modal} onClose={() => setModal(undefined)} onSave={() => { setModal(undefined); fetch(); }} />}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <div className="modal-title">Delete {deleteTarget.name}?</div>
              <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginBottom: 16 }}>This will permanently remove the user account.</p>
              <div className="modal-actions" style={{ justifyContent: "center" }}>
                <button className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn btn--danger" onClick={async () => { await deleteUser(deleteTarget._id); setDeleteTarget(null); fetch(); }}>Delete User</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
