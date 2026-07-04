const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const apiRequest = async (path, { method = 'GET', body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Ocurrió un error inesperado.'
    );
  }

  return data;
};

/**
 * Para respuestas binarias (p. ej. el PDF de HU-06): no se puede parsear como JSON.
 * Devuelve el `Blob` listo para descargar, o lanza `ApiError` con el mismo formato
 * de error uniforme si la respuesta no fue exitosa.
 */
export const apiRequestBlob = async (path, { token } = {}) => {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { headers });

  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(
      response.status,
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Ocurrió un error inesperado.'
    );
  }

  return response.blob();
};

export default apiRequest;
