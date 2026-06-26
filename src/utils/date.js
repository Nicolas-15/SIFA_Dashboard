export function getTodayLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export function formatDate(createdAt) {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return { date: `${day}.${month}.${year}`, time: `${hours}:${minutes} Hrs.` };
}

export function formatDateTime(val) {
  if (!val) return "—";
  const parts = formatDate(val);
  if (!parts) return "—";
  return `${parts.date} ${parts.time}`;
}
