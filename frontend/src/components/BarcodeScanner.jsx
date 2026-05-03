import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [scanned, setScanned] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "barcode-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA,
        ],
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setScanned(decodedText);
        scanner.clear();
        onScan(decodedText);
      },
      (err) => {
        // scanning errors are normal, ignore them
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>📷 Scan Barcode / QR</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
          Point your camera at a product barcode or QR code
        </p>

        {/* Scanner renders here */}
        <div id="barcode-reader" style={{ width: "100%" }} />

        {scanned && (
          <div className="success-box" style={{ marginTop: 14 }}>
            ✅ Scanned: <strong>{scanned}</strong>
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
