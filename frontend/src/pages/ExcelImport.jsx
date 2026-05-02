import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { addProduct } from "../utils/api";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";

const REQUIRED_COLS = ["name", "price", "quantity"];
const ALL_COLS = ["name", "sku", "category", "price", "costPrice", "quantity", "reorderLevel", "warehouse", "batchNumber", "description", "supplier"];

const SAMPLE_DATA = [
  { name: "Wireless Headphones", sku: "WH-001", category: "Electronics", price: 2999, costPrice: 1800, quantity: 50, reorderLevel: 10, warehouse: "Warehouse A", batchNumber: "BATCH-A1", description: "Noise cancelling", supplier: "TechSupply Co." },
  { name: "Smart Watch", sku: "SW-002", category: "Electronics", price: 4999, costPrice: 3000, quantity: 30, reorderLevel: 5, warehouse: "Warehouse B", batchNumber: "BATCH-B1", description: "Fitness tracker", supplier: "GadgetZone" },
  { name: "Laptop Backpack", sku: "LB-003", category: "Accessories", price: 1299, costPrice: 700, quantity: 100, reorderLevel: 20, warehouse: "Warehouse A", batchNumber: "BATCH-A2", description: "Waterproof", supplier: "BagCo" },
];

function downloadSampleExcel() {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_DATA);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, "neurostock_sample.xlsx");
}

export default function ExcelImport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrors(["Please upload an Excel (.xlsx, .xls) or CSV file."]);
      return;
    }
    setFile(f);
    setResults(null);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (json.length === 0) { setErrors(["File is empty."]); return; }

      // Normalize headers to lowercase
      const normalized = json.map((row) => {
        const newRow = {};
        Object.keys(row).forEach((key) => {
          newRow[key.toLowerCase().replace(/\s+/g, "")] = row[key];
        });
        return newRow;
      });

      const cols = Object.keys(normalized[0]);
      setHeaders(cols);

      // Validate required columns
      const missing = REQUIRED_COLS.filter((r) => !cols.includes(r));
      if (missing.length) {
        setErrors([`Missing required columns: ${missing.join(", ")}. Make sure your Excel has: name, price, quantity`]);
        return;
      }

      // Validate rows
      const rowErrors = [];
      normalized.forEach((row, i) => {
        if (!row.name) rowErrors.push(`Row ${i + 2}: name is empty`);
        if (isNaN(Number(row.price)) || Number(row.price) < 0) rowErrors.push(`Row ${i + 2}: invalid price "${row.price}"`);
        if (isNaN(Number(row.quantity)) || Number(row.quantity) < 0) rowErrors.push(`Row ${i + 2}: invalid quantity "${row.quantity}"`);
      });

      if (rowErrors.length) { setErrors(rowErrors); }
      setPreview(normalized.slice(0, 5));
    };
    reader.readAsArrayBuffer(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleImport = async () => {
    if (!file || errors.length) return;
    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const normalized = json.map((row) => {
        const newRow = {};
        Object.keys(row).forEach((key) => { newRow[key.toLowerCase().replace(/\s+/g, "")] = row[key]; });
        return newRow;
      });

      let success = 0, failed = 0, failedRows = [];

      for (let i = 0; i < normalized.length; i++) {
        const row = normalized[i];
        try {
          await addProduct({
            name: String(row.name),
            sku: String(row.sku || ""),
            category: String(row.category || "General"),
            price: Number(row.price),
            costPrice: Number(row.costprice || row.costPrice || 0),
            quantity: Number(row.quantity),
            reorderLevel: Number(row.reorderlevel || row.reorderLevel || 5),
            warehouse: String(row.warehouse || "Warehouse A"),
            batchNumber: String(row.batchnumber || row.batchNumber || ""),
            description: String(row.description || ""),
            supplier: String(row.supplier || ""),
          });
          success++;
        } catch (err) {
          failed++;
          failedRows.push({ row: i + 2, name: row.name, error: err.response?.data?.message || "Unknown error" });
        }
      }

      setResults({ total: normalized.length, success, failed, failedRows });
      setImporting(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const reset = () => {
    setFile(null); setPreview([]); setHeaders([]);
    setErrors([]); setResults(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Excel Import 📊</div>
          <div className="page-sub">Bulk import products from Excel or CSV files</div>
        </div>
        <button className="btn btn--ghost" onClick={downloadSampleExcel}>
          <Download size={15} /> Download Sample Excel
        </button>
      </div>

      {/* Instructions */}
      <div className="card" style={{ marginBottom: 20, background: "var(--accent-blue-dim)", border: "1px solid var(--accent-blue)" }}>
        <div style={{ fontWeight: 700, color: "var(--accent-blue)", marginBottom: 10 }}>📋 How to Import</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
          <div>
            <div style={{ marginBottom: 6, fontWeight: 600, color: "var(--text-primary)" }}>Required columns:</div>
            {REQUIRED_COLS.map((c) => <div key={c}>✅ {c}</div>)}
          </div>
          <div>
            <div style={{ marginBottom: 6, fontWeight: 600, color: "var(--text-primary)" }}>Optional columns:</div>
            {ALL_COLS.filter((c) => !REQUIRED_COLS.includes(c)).map((c) => <div key={c}>○ {c}</div>)}
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      {!results && (
        <div
          className={`file-drop ${dragOver ? "file-drop--active" : ""}`}
          style={{ marginBottom: 20 }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])} />
          <div className="file-drop-icon">{file ? "📄" : "📂"}</div>
          {file ? (
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 15 }}>{file.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 15 }}>Drop your Excel file here</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>or click to browse — supports .xlsx, .xls, .csv</div>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="card" style={{ marginBottom: 20, border: "1px solid var(--accent-red)", background: "var(--accent-red-dim)" }}>
          <div style={{ fontWeight: 700, color: "var(--accent-red)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <XCircle size={16} /> Validation Errors
          </div>
          {errors.map((e, i) => <div key={i} style={{ fontSize: 13, color: "var(--accent-red)", marginBottom: 4 }}>• {e}</div>)}
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && !results && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">Preview (first 5 rows)</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>{preview.length} rows shown</span> — file has more
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {headers.filter((h) => ALL_COLS.includes(h)).map((h) => (
                    <th key={h} style={{ color: REQUIRED_COLS.includes(h) ? "var(--accent-blue)" : "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {headers.filter((h) => ALL_COLS.includes(h)).map((h) => (
                      <td key={h} style={{ fontSize: 12 }}>{String(row[h] || "—").slice(0, 30)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
            <button className="btn btn--ghost" onClick={reset}>Cancel</button>
            <button className="btn btn--primary" onClick={handleImport} disabled={importing || errors.length > 0}>
              <Upload size={15} />
              {importing ? "Importing..." : "Import All Products"}
            </button>
          </div>

          {importing && (
            <div style={{ marginTop: 14, padding: 14, background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: 10 }}>
              <div className="loading-spin" />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Importing products to MongoDB... please wait</span>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="card">
          <div style={{ textAlign: "center", padding: "20px 0 28px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{results.failed === 0 ? "🎉" : "⚠️"}</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Import Complete!</div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Processed {results.total} rows</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ padding: 16, background: "var(--accent-green-dim)", border: "1px solid var(--accent-green)", borderRadius: "var(--radius)", textAlign: "center" }}>
              <CheckCircle size={24} color="var(--accent-green)" style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent-green)" }}>{results.success}</div>
              <div style={{ fontSize: 13, color: "var(--accent-green)" }}>Successfully imported</div>
            </div>
            <div style={{ padding: 16, background: results.failed ? "var(--accent-red-dim)" : "var(--bg-elevated)", border: `1px solid ${results.failed ? "var(--accent-red)" : "var(--border)"}`, borderRadius: "var(--radius)", textAlign: "center" }}>
              <XCircle size={24} color={results.failed ? "var(--accent-red)" : "var(--text-muted)"} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: results.failed ? "var(--accent-red)" : "var(--text-muted)" }}>{results.failed}</div>
              <div style={{ fontSize: 13, color: results.failed ? "var(--accent-red)" : "var(--text-muted)" }}>Failed</div>
            </div>
          </div>

          {results.failedRows.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: "var(--accent-red)" }}>Failed Rows:</div>
              {results.failedRows.map((r, i) => (
                <div key={i} style={{ padding: "8px 12px", background: "var(--accent-red-dim)", borderRadius: "var(--radius-sm)", fontSize: 12.5, color: "var(--accent-red)", marginBottom: 6 }}>
                  Row {r.row}: <strong>{r.name}</strong> — {r.error}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn--ghost" onClick={reset}>Import Another File</button>
            <a href="/products" className="btn btn--primary" style={{ textDecoration: "none" }}>View Products →</a>
          </div>
        </div>
      )}
    </div>
  );
}
