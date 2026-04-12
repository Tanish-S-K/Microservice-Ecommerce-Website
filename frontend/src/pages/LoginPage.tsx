import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: signIn } = useAuthStore();
  const { showToast } = useToastStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await login(form);
      signIn(
        {
          id: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        },
        response.data.token
      );
      showToast('Welcome back!');
      navigate('/');
    } catch (err: any) {
      if (err?.message === 'Backend is not yet connected. Received HTML instead of JSON.') {
        setError('Backend not connected! Deploy your Java services first.');
      } else {
        setError(err?.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">ShopNest</h1>
          <p className="text-gray-500 mt-2">Sign in to continue shopping</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium w-full disabled:opacity-70">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
