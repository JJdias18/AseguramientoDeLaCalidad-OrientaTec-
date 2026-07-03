import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import AppHeader from './components/AppHeader';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppHeader />
        <main>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
            </Route>
            <Route element={<GuestRoute />}>
              <Route path="/iniciar-sesion" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
