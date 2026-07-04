import apiRequest from './apiClient';

/** Cliente del catálogo de carreras (HU-04). El filtrado ocurre siempre en el servidor. */

export const getCareers = (token, { search, area } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (area) params.set('area', area);
  const queryString = params.toString();
  return apiRequest(`/careers${queryString ? `?${queryString}` : ''}`, { token });
};

export const getCareer = (token, id) => apiRequest(`/careers/${id}`, { token });

/** Comparación de dos carreras distintas, lado a lado (HU-05). */
export const compareCareers = (token, { a, b } = {}) => {
  const params = new URLSearchParams();
  if (a) params.set('a', a);
  if (b) params.set('b', b);
  return apiRequest(`/careers/compare?${params.toString()}`, { token });
};
