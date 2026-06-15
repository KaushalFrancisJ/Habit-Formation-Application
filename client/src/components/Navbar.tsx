import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to="/" className="text-lg font-bold tracking-tight">HabitFlow</Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/habits" className="hover:underline">Habits</Link>
          <Link to="/profile" className="hover:underline">{user.name}</Link>
          <button onClick={handleLogout} className="bg-white text-indigo-600 px-3 py-1 rounded font-medium hover:bg-indigo-50">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};
