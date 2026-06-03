/**
 * Obtiene la fecha actual en formato local 'YYYY-MM-DD',
 * evitando desfases de zonas horarias (UTC) al utilizar el huso horario local de la máquina/navegador.
 * 
 * @returns {string} Fecha en formato 'YYYY-MM-DD'
 */
export function getTodayLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
