import { useState, useEffect, useRef } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../utils/api";
import { Plus, Search, Edit2, Trash2, X, Upload, Package, ScanLine } from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";

const CATEGORIES = ["Electronics","Accessories","Clothing","Food & Beverages","Office Supplies","Tools","Medicine","Other"];
const WAREHOUSES = ["Warehouse A","Warehouse B","Store Front","Online","Hyderabad","Bangalore","Mumbai"];

function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "Electronics",
    price: product?.price || "",
    costPrice: product?.costPrice || "",
    quantity: product?.quantity || "",
    reorderLevel: product?.reorderLevel || "",
    sku: product?.sku || "",
    description: product?.description || "",
    warehouse: product?.warehouse || "Warehouse A",
    batchNumber: product?.batchNumber || "",
    expiryDate: product?.expiryDate ? product.expiryDate.split("T")[0] : "",
    supplier: product?.supplier || "",
    imageUrl: product?.imageUrl || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("imageUrl", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleBarcodeScan = (code) => {
    set("sku", code);
    setShowScanner(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.quantity) { setError("Name, price, and quantity are required."); return; }
    setLoading(true); setError("");
    try {
      if (isEdit) { await updateProduct(product._id, form); }
      else { await addProduct(form); }
      onSave();
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal modal--lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div className="modal-title" style={{ marginBottom: 0 }}>{isEdit ? "Edit Product" : "Add New Product"}</div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
          </div>

          {error && <div className="error-box">⚠️ {error}</div>}

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Product Image</label>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: 10, background: "var(--bg-base)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {form.imageUrl ? <img src={form.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Package size={24} color="var(--text-muted)" />}
              </div>
              <div>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
                  <Upload size={13} /> Upload Image
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>PNG, JPG up to 2MB</div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" placeholder="e.g. Wireless Headphones" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">SKU / Barcode</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input className="form-input" placeholder="WH-001 or scan barcode" value={form.sku} onChange={(e) => set("sku", e.target.value)} style={{ flex: 1 }} />
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowScanner(true)} title="Scan barcode">
                  <ScanLine size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse / Location</label>
              <select className="form-select" value={form.warehouse} onChange={(e) => set("warehouse", e.target.value)}>
                {WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Selling Price ($) *</label>
              <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Price ($)</label>
              <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="form-input" type="number" min="0" placeholder="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input className="form-input" type="number" min="0" placeholder="10" value={form.reorderLevel} onChange={(e) => set("reorderLevel", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <input className="form-input" placeholder="Supplier name" value={form.supplier} onChange={(e) => set("supplier", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Batch / Lot Number</label>
              <input className="form-input" placeholder="e.g. BATCH-A123" value={form.batchNumber} onChange={(e) => set("batchNumber", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input className="form-input" type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="Short product description..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="modal-actions">
            <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}

function DeleteModal({ product, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
          <div className="modal-title" style={{ marginBottom: 8 }}>Delete Product?</div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13.5 }}>
            Delete <strong>{product?.name}</strong>? This cannot be undone.
          </p>
        </div>
        <div className="modal-actions" style={{ justifyContent: "center" }}>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger" disabled={loading} onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}>
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function getStatus(p) {
  if (p.quantity === 0) return { label: "Out of Stock", cls: "badge--red" };
  if (p.quantity <= (p.reorderLevel || 5)) return { label: "Low Stock", cls: "badge--orange" };
  if (p.expiryDate && new Date(p.expiryDate) < new Date(Date.now() + 7 * 86400000)) return { label: "Expiring Soon", cls: "badge--orange" };
  return { label: "In Stock", cls: "badge--green" };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterWarehouse, setFilterWarehouse] = useState("All");
  const [modalProduct, setModalProduct] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const fetch = () => {
    setLoading(true);
    getProducts().then((r) => setProducts(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  // When scanning from search bar — find product by SKU
  const handleSearchScan = (code) => {
    setSearch(code);
    setShowScanner(false);
  };

  const filtered = products.filter((p) => {
    const s = search.toLowerCase();
    const matchS = p.name?.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s) || p.batchNumber?.toLowerCase().includes(s);
    const matchC = filterCat === "All" || p.category === filterCat;
    const matchW = filterWarehouse === "All" || p.warehouse === filterWarehouse;
    return matchS && matchC && matchW;
  });

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  const warehouses = ["All", ...Array.from(new Set(products.map((p) => p.warehouse).filter(Boolean)))];
  const totalValue = products.reduce((a, p) => a + p.price * p.quantity, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-sub">{products.length} products · Value: ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn--ghost" onClick={() => setShowScanner(true)}>
            <ScanLine size={16} /> Scan to Search
          </button>
          <button className="btn btn--primary" onClick={() => setModalProduct(null)}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div className="page-search">
          <Search size={14} color="var(--text-muted)" />
          <input placeholder="Search name, SKU, batch..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: "auto" }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="form-select" style={{ width: "auto" }} value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)}>
          {warehouses.map((w) => <option key={w}>{w}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="loading-spin" /><span>Loading products...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-text">{search ? "No products match your search." : "No products yet. Click Add Product to start!"}</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU / Batch</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Qty</th>
                  <th>Margin</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = getStatus(p);
                  const margin = p.costPrice ? (((p.price - p.costPrice) / p.price) * 100).toFixed(0) : null;
                  const expiringSoon = p.expiryDate && new Date(p.expiryDate) < new Date(Date.now() + 7 * 86400000);
                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                            {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>📦</span>}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            {p.description && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.description.slice(0, 28)}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-muted)" }}>{p.sku || "—"}</div>
                        {p.batchNumber && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-purple)" }}>{p.batchNumber}</div>}
                      </td>
                      <td><span className="badge badge--gray">{p.category || "—"}</span></td>
                      <td><span className="warehouse-pill">🏭 {p.warehouse || "—"}</span></td>
                      <td style={{ fontWeight: 600 }}>${Number(p.price).toFixed(2)}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{p.costPrice ? `$${Number(p.costPrice).toFixed(2)}` : "—"}</td>
                      <td style={{ fontWeight: 700, color: p.quantity === 0 ? "var(--accent-red)" : p.quantity <= (p.reorderLevel || 5) ? "var(--accent-orange)" : "var(--text-primary)" }}>{p.quantity}</td>
                      <td>{margin ? <span style={{ color: Number(margin) > 20 ? "var(--accent-green)" : "var(--accent-orange)", fontWeight: 600, fontSize: 12 }}>{margin}%</span> : "—"}</td>
                      <td style={{ fontSize: 12, color: expiringSoon ? "var(--accent-orange)" : "var(--text-muted)" }}>
                        {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "—"}
                        {expiringSoon && " ⚠️"}
                      </td>
                      <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="btn btn--ghost btn--sm" onClick={() => setModalProduct(p)}><Edit2 size={12} /></button>
                          <button className="btn btn--sm" style={{ background: "var(--accent-red-dim)", color: "var(--accent-red)", border: "none" }} onClick={() => setDeleteTarget(p)}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalProduct !== undefined && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(undefined)} onSave={() => { setModalProduct(undefined); fetch(); }} />
      )}
      {deleteTarget && (
        <DeleteModal product={deleteTarget} onClose={() => setDeleteTarget(null)}
          onConfirm={async () => { await deleteProduct(deleteTarget._id); setDeleteTarget(null); fetch(); }} />
      )}
      {showScanner && (
        <BarcodeScanner onScan={handleSearchScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
