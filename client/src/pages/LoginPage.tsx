import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('All fields are required'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-indigo-600 mb-1">HabitFlow</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>
        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className={inputCls} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};
