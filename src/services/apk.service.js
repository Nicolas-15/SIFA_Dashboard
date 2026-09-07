/**
 * Sube un archivo APK con barra de progreso.
 *
 * Con cookies httpOnly, la autenticación viaja automáticamente en la cookie
 * (credentials: 'include'). No se lee ningún token de localStorage.
 *
 * @param {File} file Archivo APK a subir
 * @param {Function} onProgress Callback de progreso (0-100)
 * @returns {{ xhr: XMLHttpRequest, promise: Promise }} Control de la subida
 */
export function uploadApkWithProgress(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();

  const promise = new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 401) {
        // La cookie de acceso expiró: notificar para redirigir al login
        window.dispatchEvent(new Event('auth:unauthorized'));
        reject(new Error('Sesión expirada'));
        return;
      }
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.error || 'Error al subir el APK'));
        }
      } catch {
        reject(new Error('Respuesta inválida del servidor'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Error de conexión')));
    xhr.addEventListener('abort', () => {
      const err = new Error('Subida cancelada');
      err.name = 'AbortError';
      reject(err);
    });

    xhr.open('POST', '/core/api/v1/apk/upload');
    // Enviar cookies httpOnly en la petición
    xhr.withCredentials = true;
    xhr.send(formData);
  });

  return { xhr, promise };
}