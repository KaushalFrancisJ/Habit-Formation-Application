import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('All fields are required'); return; }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.response?.data?.errors?.[0]?.message ?? 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-indigo-600 mb-1">HabitFlow</h1>
        <p className="text-gray-500 text-sm mb-6">Create your account</p>
        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className={inputCls} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars, 2 numbers, 1 special" />
            <p className="text-xs text-gray-400 mt-1">Min 8 characters · 2 numbers · 1 special character</p>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
