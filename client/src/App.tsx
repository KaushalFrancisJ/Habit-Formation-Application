import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { HabitsPage } from './pages/HabitsPage.tsx';
import { HabitDetailPage } from './pages/HabitDetailPage.tsx';
import { HabitEditPage } from './pages/HabitEditPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
            <Route path="/habits/:id" element={<ProtectedRoute><HabitDetailPage /></ProtectedRoute>} />
            <Route path="/habits/:id/edit" element={<ProtectedRoute><HabitEditPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
