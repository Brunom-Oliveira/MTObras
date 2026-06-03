import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tenantName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Conta corporativa criada com sucesso! Faça login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">🏗️ MTObras</h2>
          <p className="text-slate-400 mt-2">Crie a conta da sua Construtora</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-medium uppercase tracking-wider">Nome da Construtora</label>
            <input 
              type="text" 
              name="tenantName"
              value={formData.tenantName}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500 transition" 
              placeholder="Ex: Construtora Alpha S.A."
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-medium uppercase tracking-wider">Seu Nome (Administrador)</label>
            <input 
              type="text" 
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500 transition" 
              placeholder="Ex: João Silva"
              required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-medium uppercase tracking-wider">E-mail Corporativo</label>
            <input 
              type="email" 
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500 transition" 
              placeholder="Ex: joao@alpha.com"
              required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-slate-300 text-xs font-medium uppercase tracking-wider">Senha</label>
            <input 
              type="password" 
              name="adminPassword"
              value={formData.adminPassword}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-cyan-500 transition" 
              placeholder="Mínimo 6 caracteres"
              required 
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition mt-2 disabled:opacity-50"
          >
            {loading ? 'Criando Conta...' : 'Cadastrar Construtora'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-400 pt-4 border-t border-white/5">
          Já possui conta? {' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
