import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin, setAuthCookie } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res.token && res.client) {
        setAuth(res.token, res.client);
        // set cookie: 30 days if remember, else 1 day
        try { setAuthCookie(res.token, remember ? 30 : 1); } catch (e) { /* ignore */ }
        navigate('/');
      } else {
        setError(res.error || 'Erro ao autenticar');
      }
    } catch (err: any) {
      setError(err?.error || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 border border-slate-100 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Entrar</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Senha</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <input id="remember" type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <label htmlFor="remember" className="text-sm text-slate-600">Lembre-se de mim</label>
          </div>
          <button disabled={loading} className="w-full py-2 bg-brand-500 text-white rounded-md">{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p className="text-sm text-slate-500 mt-4">Não tem conta? <Link to="/register" className="text-brand-600">Cadastre-se</Link></p>
      </div>
    </div>
  );
};

export default Login;
