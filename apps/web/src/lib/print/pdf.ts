export async function exportElementToPdf(element: HTMLElement, filename: string) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  pdf.html(element, {
    callback: (doc) => doc.save(filename),
    x: 0,
    y: 0,
    html2canvas: { scale: 2, useCORS: true }
  });
}
