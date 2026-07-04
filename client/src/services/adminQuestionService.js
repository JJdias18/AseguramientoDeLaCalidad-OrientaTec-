import apiRequest from './apiClient';

/** Cliente del banco de reactivos del admin (HU-07). */

export const getQuestions = (token) => apiRequest('/admin/questions', { token });

export const createQuestion = (token, { text, riasecType }) =>
  apiRequest('/admin/questions', { method: 'POST', body: { text, riasecType }, token });

export const updateQuestion = (token, id, { text, riasecType }) =>
  apiRequest(`/admin/questions/${id}`, { method: 'PUT', body: { text, riasecType }, token });

/** Desactiva un reactivo (soft delete): nunca se borra físicamente. */
export const deactivateQuestion = (token, id) =>
  apiRequest(`/admin/questions/${id}`, { method: 'DELETE', token });
