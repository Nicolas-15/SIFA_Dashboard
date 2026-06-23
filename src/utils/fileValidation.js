const ALLOWED_EXTENSION = ".apk";

export function isValidApkFile(file) {
  if (!file) return false;
  return file.name.toLowerCase().endsWith(ALLOWED_EXTENSION);
}
