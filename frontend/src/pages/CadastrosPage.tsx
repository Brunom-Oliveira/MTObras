import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Home, Package, Users } from 'lucide-react';
import { api } from '../lib/axios';

export default function CadastrosPage() {
  const queryClient = useQueryClient();

  // Queries
  const { data: obrasList = [] } = useQuery({
    queryKey: ['obras'],
    queryFn: async () => {
      const res = await api.get('/obras');
      return res.data;
    }
  });

  const { data: materiaisList = [] } = useQuery({
    queryKey: ['materiais'],
    queryFn: async () => {
      const res = await api.get('/materiais');
      return res.data;
    }
  });

  // Forms setup
  const { register: registerObra, handleSubmit: handleObraSubmit, reset: resetObra } = useForm();
  const { register: registerMaterial, handleSubmit: handleMaterialSubmit, reset: resetMaterial } = useForm({
    defaultValues: {
      desc: '',
      code: '',
      cost: '',
      supplier: '',
      category: 'Cimento e Argamassa',
      unit: 'UN'
    }
  });
  
  const { register: registerUser, handleSubmit: handleUserSubmit, reset: resetUser } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'WAREHOUSE_KEEPER'
    }
  });

  // Mutations
  const createObraMutation = useMutation({
    mutationFn: (newObra: any) => api.post('/obras', newObra),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] });
      toast.success('Obra cadastrada com sucesso!');
      resetObra();
    },
    onError: () => toast.error('Erro ao cadastrar obra')
  });

  const createMaterialMutation = useMutation({
    mutationFn: (newMaterial: any) => api.post('/materiais', newMaterial),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais'] });
      toast.success('Material cadastrado com sucesso!');
      resetMaterial();
    },
    onError: () => toast.error('Erro ao cadastrar material')
  });

  const onObraSubmit = (data: any) => {
    createObraMutation.mutate({
      code: data.code,
      name: data.name,
      clientName: data.client,
      address: data.address,
      budget: parseFloat(data.budget),
      startDate: new Date().toISOString(),
      expectedEndDate: new Date().toISOString()
    });
  };

  const onMaterialSubmit = (data: any) => {
    createMaterialMutation.mutate({
      code: data.code,
      description: data.desc,
      category: data.category,
      unit: data.unit,
      averageCost: parseFloat(data.cost)
    });
  };

  const onUserSubmit = (data: any) => {
    // We don't have a specific user creation endpoint yet besides auth/register for tenants. 
    // Usually an admin would hit a specific POST /users endpoint to create their team.
    // Assuming backend will be extended or just show a toast for now.
    toast.error('Criação de usuários da equipe será implementada no backend na próxima etapa!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Obra Cadastro */}
        <div className="p-6 glass-panel rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Home className="text-cyan-400 w-4 h-4" />
            Cadastrar Nova Obra
          </h3>
          <form onSubmit={handleObraSubmit(onObraSubmit)} className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="text-slate-400">Nome do Canteiro:</label>
                <input {...registerObra('name', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Residencial Vert" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Código:</label>
                <input {...registerObra('code', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="OB-003" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Cliente Incorporador:</label>
              <input {...registerObra('client', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Cliente S.A." />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Endereço Completo:</label>
              <input {...registerObra('address', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Av. Principal, 10" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Orçamento Previsto (R$):</label>
              <input type="number" step="any" {...registerObra('budget', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white font-bold" placeholder="1500000" />
            </div>
            <button type="submit" disabled={createObraMutation.isPending} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg transition">
              {createObraMutation.isPending ? 'Salvando...' : 'Salvar Canteiro de Obras'}
            </button>
          </form>

          {/* List Obras */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white">Obras Existentes:</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {obrasList.map((o: any) => (
                <div key={o.id} className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{o.name}</span>
                    <span className="text-[10px] text-slate-500 block">{o.code} • {o.clientName}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px]">Ativa</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Material Cadastro */}
        <div className="p-6 glass-panel rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="text-cyan-400 w-4 h-4" />
            Cadastrar Insumo no Catálogo
          </h3>
          <form onSubmit={handleMaterialSubmit(onMaterialSubmit)} className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="text-slate-400">Descrição do Insumo:</label>
                <input {...registerMaterial('desc', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Areia Lavada Média" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Unidade:</label>
                <select {...registerMaterial('unit')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                  <option value="UN">UN</option>
                  <option value="M">M</option>
                  <option value="M2">M2</option>
                  <option value="M3">M3</option>
                  <option value="KG">KG</option>
                  <option value="L">L</option>
                  <option value="SACO">SACO</option>
                  <option value="CX">CX</option>
                  <option value="ROLO">ROLO</option>
                  <option value="BARRA">BARRA</option>
                  <option value="LATA">LATA</option>
                  <option value="PAR">PAR</option>
                  <option value="TON">TON</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Código Único:</label>
                <input {...registerMaterial('code', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="MAT-ARE-04" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Categoria:</label>
                <select {...registerMaterial('category')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                  <option value="Cimento e Argamassa">Cimento e Argamassa</option>
                  <option value="Aço e Ferro">Aço e Ferro</option>
                  <option value="Agregados">Agregados</option>
                  <option value="Acabamento">Acabamento</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Custo Médio Inicial (R$):</label>
                <input type="number" step="any" {...registerMaterial('cost', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="95.00" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Fornecedor Padrão:</label>
                <input {...registerMaterial('supplier')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Votorantim" />
              </div>
            </div>
            <button type="submit" disabled={createMaterialMutation.isPending} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition">
              {createMaterialMutation.isPending ? 'Salvando...' : 'Salvar no Catálogo Geral'}
            </button>
          </form>

          {/* List Materiais */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white">Catálogo de Materiais:</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {materiaisList.map((m: any) => (
                <div key={m.id} className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{m.description}</span>
                    <span className="text-[10px] text-slate-500 block">{m.code} • {m.category}</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">R$ {m.averageCost?.toFixed(2) || '0.00'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User / Equipe Cadastro */}
        <div className="p-6 glass-panel rounded-2xl space-y-4 lg:col-span-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="text-cyan-400 w-4 h-4" />
            Cadastrar Membro da Equipe
          </h3>
          <form onSubmit={handleUserSubmit(onUserSubmit)} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Nome Completo:</label>
                <input {...registerUser('name', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Ex: Maria Souza" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">E-mail de Acesso:</label>
                <input type="email" {...registerUser('email', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="maria@construtora.com" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Nível de Acesso (Perfil):</label>
                <select {...registerUser('role')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                  <option value="WAREHOUSE_KEEPER">Almoxarife (Estoque)</option>
                  <option value="FOREMAN">Mestre de Obras (Consumo)</option>
                  <option value="PURCHASER">Comprador</option>
                  <option value="ENGINEER">Engenheiro</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Senha Inicial:</label>
                <input type="password" {...registerUser('password', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            
            <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition ml-auto block mt-2">
              Adicionar Usuário à Construtora
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
