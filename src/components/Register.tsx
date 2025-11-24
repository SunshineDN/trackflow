import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister, login as apiLogin } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiRegister(name, email, password);
      if (res.token) {
        // backend now returns only token on register
        setAuth(res.token ?? null, null);
        // Try to obtain the client object by logging in (server returns client + token on /login)
        try {
          const loginRes = await apiLogin(email, password);
          if (loginRes.token && loginRes.client) {
            setAuth(loginRes.token, loginRes.client);
          } else {
            // fallback: set token only
            setAuth(res.token ?? null, loginRes.client ?? null);
          }
        } catch (loginErr) {
          console.warn('Login after register failed', loginErr);
          setAuth(res.token ?? null, null);
        }
        navigate('/');
      } else {
        setError(res.error || 'Erro ao cadastrar');
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
        <h2 className="text-2xl font-bold mb-4">Criar conta</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600">Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} type="text" required className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Senha (mínimo 8 caracteres)</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required minLength={8} className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <button disabled={loading} className="w-full py-2 bg-brand-500 text-white rounded-md">{loading ? 'Cadastrando...' : 'Cadastrar'}</button>
        </form>
        <p className="text-sm text-slate-500 mt-4">Já tem conta? <Link to="/login" className="text-brand-600">Entrar</Link></p>
      </div>
    </div>
  );
};

export default Register;
