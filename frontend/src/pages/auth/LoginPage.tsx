import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@construtora.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">🏗️ MTObras</h2>
          <p className="text-slate-400 mt-2">Faça login na sua conta corporativa</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-medium">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500 transition" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-medium">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500 transition" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Acessando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 mt-6">
          <p>Ainda não possui conta? {' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm">
              Cadastrar Construtora
            </Link>
          </p>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p>Para teste rápido: use as contas geradas pelo Seed</p>
            <p className="mt-1">admin@construtora.com | 123456</p>
            <p>mestre@construtora.com | 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
