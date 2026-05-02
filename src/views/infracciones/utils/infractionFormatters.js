// Formatea RUT chileno: 12345678 → 12.345.678-9
export function formatRUT(val) {
  let cleanVal = val.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleanVal.length === 0) return '';
  if (cleanVal.length <= 1) return cleanVal;
  const body = cleanVal.slice(0, -1).replace(/K/g, '');
  const dv = cleanVal.slice(-1);
  if (!body && dv) return dv;
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

// Formatea patente chilena: BBDC12 → BBDC-12 / AB1234 → AB-1234
export function formatPlate(val) {
  const cleaned = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const noHyphen = cleaned.replace(/-/g, '');
  if (noHyphen.length === 6) {
    if (/^[A-Z]{4}\d{2}$/.test(noHyphen)) return noHyphen.slice(0, 4) + '-' + noHyphen.slice(4);
    if (/^[A-Z]{2}\d{4}$/.test(noHyphen)) return noHyphen.slice(0, 2) + '-' + noHyphen.slice(2);
  }
  return cleaned;
}

// Convierte "DD/MM/YYYY HH:MM" → "YYYY-MM-DDTHH:MM" (para datetime-local input)
export function parseToDatetimeLocal(val) {
  if (!val) return '';
  const [datePart, timePart] = val.split(' ');
  if (!datePart || !timePart) return '';
  const [dd, mm, yyyy] = datePart.split('/');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm}-${dd}T${timePart}`;
}

// Convierte "YYYY-MM-DDTHH:MM" → "DD/MM/YYYY HH:MM"
export function parseFromDatetimeLocal(val) {
  if (!val) return '';
  const [datePart, timePart] = val.split('T');
  if (!datePart || !timePart) return '';
  const [yyyy, mm, dd] = datePart.split('-');
  return `${dd}/${mm}/${yyyy} ${timePart}`;
}
