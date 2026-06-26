import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Servicio helper para exportar la visualización del mapa y la plantilla a un PDF en HD
export async function exportHeatmapReport({
  activeElement,
  reportElement,
  setMapImage,
  showToast
}) {
  if (!activeElement || !reportElement) {
    throw new Error("No se encontraron las referencias de los elementos para la exportación.");
  }

  // Ocultar de manera temporal y robusta todos los controles y botones de Leaflet
  const elementsToHide = activeElement.querySelectorAll(
    ".leaflet-control-container, [data-html2canvas-ignore], button"
  );
  
  const hiddenElements = [];
  elementsToHide.forEach((el) => {
    hiddenElements.push({
      element: el,
      originalDisplay: el.style.display,
    });
    el.style.setProperty("display", "none", "important");
  });
  
  try {
    // 1. Capturar el mapa de calor visible en pantalla (escala 4x para resolución HD)
    const mapCanvas = await html2canvas(activeElement, {
      useCORS: true,
      allowTaint: false,
      logging: false,
      scale: 4,
      imageTimeout: 0,
    });

    // Restaurar los elementos ocultados inmediatamente después de capturar la foto del mapa
    hiddenElements.forEach(({ element, originalDisplay }) => {
      element.style.display = originalDisplay;
    });

    const imgData = mapCanvas.toDataURL("image/png");
    setMapImage(imgData);

    // Esperar brevemente a que React monte la plantilla con la nueva imagen del mapa
    await new Promise((resolve) => setTimeout(resolve, 400));

    // 2. Capturar la plantilla de reporte estructurada (escala 3x para un PDF ultra nítido)
    const reportCanvas = await html2canvas(reportElement, {
      useCORS: true,
      allowTaint: false,
      logging: false,
      scale: 3,
    });

    // 3. Crear el documento PDF en formato A4
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (reportCanvas.height * pdfWidth) / reportCanvas.width;

    pdf.addImage(
      reportCanvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`reporte-mapa-calor-${timestamp}.pdf`);

    if (showToast) {
      showToast("Reporte del mapa de calor generado exitosamente");
    }
  } catch (error) {
    // Si algo falla, aseguramos restaurar los elementos de todas formas
    hiddenElements.forEach(({ element, originalDisplay }) => {
      element.style.display = originalDisplay;
    });
    throw error;
  }
}
