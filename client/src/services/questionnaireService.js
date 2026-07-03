import apiRequest from './apiClient';

/** Cliente de la API del cuestionario vocacional (HU-02). */

export const getQuestions = (token) => apiRequest('/questions', { token });

export const getCurrentAttempt = (token) => apiRequest('/attempts/current', { token });

export const startAttempt = (token) => apiRequest('/attempts', { method: 'POST', token });

export const saveAnswer = (token, attemptId, questionId, value) =>
  apiRequest(`/attempts/${attemptId}/answers`, {
    method: 'PATCH',
    token,
    body: { questionId, value },
  });

export const submitAttempt = (token, attemptId) =>
  apiRequest(`/attempts/${attemptId}/submit`, { method: 'POST', token });

export const getProfile = (token) => apiRequest('/profile', { token });
