export { formatDate, formatDateTime } from "@/utils/date";

const DB_LABELS = {
  core_db: "BD Principal",
  authdb: "BD Usuarios",
};

export function mapDbName(db) {
  return DB_LABELS[db] || db;
}

export function formatSize(bytes) {
  if (bytes == null) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

const SOURCE_LABELS = {
  automatic: "Automatic",
  uploaded: "Upload",
};

export function formatSource(source) {
  return SOURCE_LABELS[source] || source || "—";
}
