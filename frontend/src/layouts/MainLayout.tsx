import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Layers, ClipboardList, FileText, Package, User, Menu, X, Smartphone, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'wms', label: 'Gestão WMS', icon: Layers, path: '/wms' },
    { id: 'estoque', label: 'Estoque Global', icon: Package, path: '/estoque' },
    { id: 'equipamentos', label: 'Equipamentos', icon: Wrench, path: '/equipamentos' },
    { id: 'cadastros', label: 'Cadastros', icon: ClipboardList, path: '/cadastros' },
    { id: 'operacoes', label: 'Operações', icon: FileText, path: '/operacoes' },
  ];

  return (
    <div className="min-h-screen flex text-slate-200">
      {/* Sidebar - Desktop Layout */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-white/5 flex flex-col justify-between transition-transform transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden lg:flex'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Package className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="font-black text-xl text-white tracking-tight leading-none">MTObras</h1>
                <p className="text-cyan-400 text-xs font-bold tracking-wider uppercase mt-1">WMS Edition</p>
              </div>
            </div>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2 mt-8">
            {navItems.map((item) => (
              <NavLink 
                key={item.id}
                to={item.path}
                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                <span className="font-semibold">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-6 border-t border-white/5 flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold uppercase">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-bold text-white leading-none">{user?.name || 'Usuário'}</p>
            <p className="text-slate-500 text-[10px] mt-0.5 leading-none">{user?.role}</p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm('Deseja realmente sair?')) {
                logout();
              }
            }}
            className="ml-auto p-1.5 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20 transition"
            title="Sair do Sistema"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        {/* Mobile Header */}
        <header className="lg:hidden glass-panel border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Package className="text-white w-5 h-5" />
            </div>
            <h1 className="font-black text-lg text-white">MTObras</h1>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-slate-300 hover:text-white p-2 bg-white/5 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
