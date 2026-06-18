export function uploadApkWithProgress(file, onProgress) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Sesión no iniciada');
  }

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
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
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
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });

  return { xhr, promise };
}
