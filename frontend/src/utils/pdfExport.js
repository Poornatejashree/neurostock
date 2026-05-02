// pdfExport.js — PDF generation using jsPDF (no extra backend needed)
// Install: npm install jspdf jspdf-autotable

export async function exportProductsPDF(products) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Header
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 0, 297, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("NeuroStock — Products Report", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${now}`, 230, 18);

  // Summary boxes
  const totalValue = products.reduce((a, p) => a + p.price * p.quantity, 0);
  const lowStock = products.filter((p) => p.quantity <= (p.reorderLevel || 5)).length;
  const outOfStock = products.filter((p) => p.quantity === 0).length;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const summaryY = 38;
  [
    { label: "Total Products", value: products.length },
    { label: "Total Value", value: `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "Low Stock", value: lowStock },
    { label: "Out of Stock", value: outOfStock },
  ].forEach((s, i) => {
    const x = 14 + i * 68;
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(x, summaryY, 65, 16, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.text(String(s.value), x + 32, summaryY + 7, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(s.label, x + 32, summaryY + 13, { align: "center" });
    doc.setFontSize(9);
  });

  // Table
  autoTable(doc, {
    startY: summaryY + 24,
    head: [["#", "Name", "SKU", "Category", "Warehouse", "Price", "Cost", "Qty", "Reorder", "Value", "Status"]],
    body: products.map((p, i) => {
      const status = p.quantity === 0 ? "Out of Stock" : p.quantity <= (p.reorderLevel || 5) ? "Low Stock" : "In Stock";
      return [
        i + 1,
        p.name,
        p.sku || "—",
        p.category || "—",
        p.warehouse || "—",
        `$${Number(p.price).toFixed(2)}`,
        p.costPrice ? `$${Number(p.costPrice).toFixed(2)}` : "—",
        p.quantity,
        p.reorderLevel || 5,
        `$${(p.price * p.quantity).toFixed(2)}`,
        status,
      ];
    }),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [22, 27, 34], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 10) {
        const val = data.cell.raw;
        if (val === "Out of Stock") doc.setTextColor(248, 81, 73);
        else if (val === "Low Stock") doc.setTextColor(240, 136, 62);
        else doc.setTextColor(63, 185, 80);
        doc.setFontSize(8);
        doc.text(val, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" });
        doc.setTextColor(0, 0, 0);
      }
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} — NeuroStock Smart Inventory System`, 14, doc.internal.pageSize.height - 8);
  }

  doc.save(`neurostock-products-${Date.now()}.pdf`);
}

export async function exportSalesPDF(sales) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  doc.setFillColor(13, 17, 23);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("NeuroStock — Sales Report", 14, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${now}`, 150, 16);

  const totalRevenue = sales.reduce((a, s) => a + (s.totalPrice || 0), 0);
  const totalUnits = sales.reduce((a, s) => a + (s.quantitySold || 0), 0);

  doc.setTextColor(0);
  doc.setFontSize(9);
  const sy = 35;
  [
    { label: "Total Transactions", value: sales.length },
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
    { label: "Units Sold", value: totalUnits },
    { label: "Avg Order", value: `$${sales.length ? (totalRevenue / sales.length).toFixed(2) : "0.00"}` },
  ].forEach((s, i) => {
    const x = 14 + i * 46;
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(x, sy, 42, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(String(s.value), x + 21, sy + 6, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(s.label, x + 21, sy + 11, { align: "center" });
  });

  autoTable(doc, {
    startY: sy + 20,
    head: [["#", "Product", "Qty Sold", "Unit Price", "Total", "Sold By", "Date"]],
    body: sales.map((s, i) => [
      i + 1,
      s.product?.name || "—",
      s.quantitySold,
      s.product?.price ? `$${Number(s.product.price).toFixed(2)}` : "—",
      `$${Number(s.totalPrice || 0).toFixed(2)}`,
      s.soldBy?.name || "Admin",
      s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—",
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [22, 27, 34], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`neurostock-sales-${Date.now()}.pdf`);
}
