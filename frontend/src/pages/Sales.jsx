import { useState, useEffect } from "react";
import { getSales, createSale, getProducts } from "../utils/api";
import { Plus, ShoppingCart, TrendingUp, X } from "lucide-react";

function SaleModal({ products, onClose, onSave }) {
  const [form, setForm] = useState({ productId:"", quantitySold:1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selected = products.find((p) => p._id === form.productId);
  const total = selected ? selected.price * form.quantitySold : 0;

  const handleSubmit = async () => {
    if (!form.productId || !form.quantitySold) { setError("Please select a product and quantity."); return; }
    if (selected && form.quantitySold > selected.quantity) { setError(`Only ${selected.quantity} units available.`); return; }
    setLoading(true); setError("");
    try {
      await createSale({ productId:form.productId, quantitySold:Number(form.quantitySold) });
      onSave();
    } catch (e) { setError(e.response?.data?.message || "Failed to record sale."); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div className="modal-title" style={{ marginBottom:0 }}>Record New Sale</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer" }}><X size={18}/></button>
        </div>
        {error && <div className="error-box">⚠️ {error}</div>}
        <div className="form-group">
          <label className="form-label">Select Product *</label>
          <select className="form-select" value={form.productId} onChange={(e) => setForm({...form, productId:e.target.value})}>
            <option value="">-- Choose a product --</option>
            {products.filter((p) => p.quantity > 0).map((p) => (
              <option key={p._id} value={p._id}>{p.name} — {p.quantity} in stock @ ${p.price} ({p.warehouse||"—"})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Quantity to Sell *</label>
          <input className="form-input" type="number" min="1" max={selected?.quantity||999} value={form.quantitySold} onChange={(e) => setForm({...form, quantitySold:e.target.value})} />
        </div>
        {selected && (
          <div style={{ background:"var(--bg-base)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:14, marginBottom:14 }}>
            <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:10, fontWeight:600 }}>SALE PREVIEW</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              <div><div style={{ fontSize:11, color:"var(--text-muted)" }}>Unit Price</div><div style={{ fontWeight:700, color:"var(--accent-blue)" }}>${Number(selected.price).toFixed(2)}</div></div>
              <div><div style={{ fontSize:11, color:"var(--text-muted)" }}>Quantity</div><div style={{ fontWeight:700 }}>{form.quantitySold}</div></div>
              <div><div style={{ fontSize:11, color:"var(--text-muted)" }}>Total</div><div style={{ fontWeight:800, color:"var(--accent-green)", fontSize:16 }}>${total.toFixed(2)}</div></div>
            </div>
            <div style={{ marginTop:10, fontSize:12, color:"var(--text-muted)" }}>
              Stock after sale: <strong>{selected.quantity - Number(form.quantitySold)}</strong> units
              {(selected.quantity - Number(form.quantitySold)) <= (selected.reorderLevel||5) && <span style={{ color:"var(--accent-orange)", marginLeft:8 }}>⚠️ Will trigger low stock alert</span>}
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>{loading?"Recording...":"Record Sale"}</button>
        </div>
      </div>
    </div>
  );
}

function fmt(n) { return Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getSales(), getProducts()])
      .then(([s,p]) => { setSales(s.data); setProducts(p.data); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { fetchAll(); }, []);

  const totalRevenue = sales.reduce((a,s) => a+(s.totalPrice||0), 0);
  const totalUnits = sales.reduce((a,s) => a+(s.quantitySold||0), 0);
  const avgOrder = sales.length ? totalRevenue/sales.length : 0;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Sales</div><div className="page-sub">{sales.length} transactions recorded</div></div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}><Plus size={16}/> Record Sale</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        <div className="stat-card"><div className="stat-icon stat-icon--green"><TrendingUp size={20}/></div><div><div className="stat-label">Total Revenue</div><div className="stat-value">${fmt(totalRevenue)}</div></div></div>
        <div className="stat-card"><div className="stat-icon stat-icon--blue"><ShoppingCart size={20}/></div><div><div className="stat-label">Total Units Sold</div><div className="stat-value">{totalUnits.toLocaleString()}</div></div></div>
        <div className="stat-card"><div className="stat-icon stat-icon--purple"><ShoppingCart size={20}/></div><div><div className="stat-label">Avg. Order Value</div><div className="stat-value">${fmt(avgOrder)}</div></div></div>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div style={{ padding:"16px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div className="card-title">All Sales</div>
        </div>
        {loading ? (
          <div className="loading-center"><div className="loading-spin"/><span>Loading sales...</span></div>
        ) : sales.length === 0 ? (
          <div className="empty-state" style={{ padding:60 }}><div className="empty-state-icon">🛒</div><div className="empty-state-text">No sales yet. Record your first sale!</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Unit Price</th><th>Total</th><th>Sold By</th><th>Date</th></tr></thead>
              <tbody>
                {sales.map((s,i) => (
                  <tr key={s._id||i}>
                    <td style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--accent-blue)" }}>#{String(i+1).padStart(4,"0")}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:26, height:26, borderRadius:6, background:"var(--bg-elevated)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>📦</div>
                        <span style={{ fontWeight:600 }}>{s.product?.name||"—"}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight:700 }}>{s.quantitySold}</td>
                    <td>{s.product?.price?`$${Number(s.product.price).toFixed(2)}`:"—"}</td>
                    <td style={{ fontWeight:700, color:"var(--accent-green)" }}>${fmt(s.totalPrice)}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#58a6ff,#bc8cff)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff" }}>
                          {(s.soldBy?.name||"A").slice(0,1).toUpperCase()}
                        </div>
                        <span style={{ fontSize:12.5 }}>{s.soldBy?.name||s.soldBy?.email||"Admin"}</span>
                      </div>
                    </td>
                    <td style={{ color:"var(--text-muted)", fontSize:12 }}>
                      {s.createdAt?new Date(s.createdAt).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <SaleModal products={products} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchAll(); }} />}
    </div>
  );
}
