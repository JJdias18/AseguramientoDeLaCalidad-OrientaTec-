import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import * as authService from '../services/authService';

const TOKEN_KEY = 'brujula_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .me(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
    // Solo al montar: login/register/logout ya actualizan token y user juntos,
    // no hace falta repetir la validación contra /auth/me.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = async (data) => {
    const result = await authService.register(data);
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    return result;
  };

  const login = async (data) => {
    const result = await authService.login(data);
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, register, login, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
