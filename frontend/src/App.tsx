import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import WmsManagement from './pages/WmsManagement';
import CadastrosPage from './pages/CadastrosPage';
import OperacoesPage from './pages/OperacoesPage';
import EstoqueMateriaisPage from './pages/EstoqueMateriaisPage';
import EquipamentosPage from './pages/EquipamentosPage';
import MestreObrasApp from './pages/MestreObrasApp';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from './lib/axios';
import { toast } from 'react-hot-toast';

const queryClient = new QueryClient();

const MestreObrasWrapper = () => {
  const { data: obras = [] } = useQuery({ queryKey: ['obras'], queryFn: async () => (await api.get('/obras')).data });
  const { data: materiais = [] } = useQuery({ queryKey: ['materiais'], queryFn: async () => (await api.get('/materiais')).data });

  const onSolicitar = async (obraId: string, materialId: string, quantity: number) => {
    try {
      await api.post('/solicitacoes', {
        obraId,
        requesterId: '5',
        items: [{ materialId, quantity }]
      });
      toast.success('Pedido enviado com sucesso!');
      return true;
    } catch {
      toast.error('Erro ao enviar pedido.');
      return false;
    }
  };

  return (
    <MestreObrasApp 
      obras={obras} 
      materiais={materiais}
      onExit={() => window.history.back()}
      onSolicitar={onSolicitar} 
    />
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Main Layout routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="wms" element={<WmsManagement />} />
              <Route path="estoque" element={<EstoqueMateriaisPage />} />
              <Route path="equipamentos" element={<EquipamentosPage />} />
              <Route path="cadastros" element={<CadastrosPage />} />
              <Route path="operacoes" element={<OperacoesPage />} />
            </Route>

            {/* Standalone Mobile Route */}
            <Route path="/mestre-obras" element={<ProtectedRoute><MestreObrasWrapper /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
