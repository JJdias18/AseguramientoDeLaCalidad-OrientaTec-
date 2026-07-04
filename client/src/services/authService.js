import apiRequest from './apiClient';

export const register = ({ fullName, email, password }) =>
  apiRequest('/auth/register', { method: 'POST', body: { fullName, email, password } });

export const login = ({ email, password }) =>
  apiRequest('/auth/login', { method: 'POST', body: { email, password } });

export const me = (token) => apiRequest('/auth/me', { token });
