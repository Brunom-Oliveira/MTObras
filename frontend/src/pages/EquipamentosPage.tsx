import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Wrench, ShieldAlert, ArrowRightLeft } from 'lucide-react';
import { api } from '../lib/axios';

export default function EquipamentosPage() {
  const queryClient = useQueryClient();

  const { data: equipamentos = [], isLoading } = useQuery({
    queryKey: ['equipamentos'],
    queryFn: async () => {
      const res = await api.get('/equipamentos');
      return res.data;
    }
  });

  const { data: obras = [] } = useQuery({
    queryKey: ['obras'],
    queryFn: async () => {
      const res = await api.get('/obras');
      return res.data;
    }
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', type: '', code: '' }
  });

  const createEqMutation = useMutation({
    mutationFn: (newEq: any) => api.post('/equipamentos', newEq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast.success('Equipamento cadastrado com sucesso!');
      reset();
    },
    onError: () => toast.error('Erro ao cadastrar equipamento')
  });

  const allocateMutation = useMutation({
    mutationFn: ({ id, obraId }: { id: string, obraId: string }) => api.post(`/equipamentos/${id}/alocar`, { obraId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast.success('Alocação atualizada com sucesso!');
    },
    onError: () => toast.error('Erro ao atualizar alocação')
  });

  const onSubmit = (data: any) => {
    createEqMutation.mutate(data);
  };

  const handleAllocate = (eqId: string, obraId: string) => {
    allocateMutation.mutate({ id: eqId, obraId });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 glass-panel rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Gestão de Equipamentos</h1>
          <p className="text-slate-400 text-sm mt-1">Catálogo e alocação de frota e maquinário.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário Cadastro */}
        <div className="lg:col-span-1 p-6 glass-panel rounded-2xl space-y-4 self-start">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench className="text-cyan-400 w-4 h-4" />
            Cadastrar Novo Equipamento
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Nome do Equipamento:</label>
              <input {...register('name', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Ex: Betoneira 400L" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Código/Frota:</label>
                <input {...register('code', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="EQ-001" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Categoria:</label>
                <select {...register('type')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                  <option value="Pesado">Pesado</option>
                  <option value="Leve">Leve</option>
                  <option value="Ferramenta">Ferramenta</option>
                  <option value="Veículo">Veículo</option>
                </select>
              </div>
            </div>
            
            <button type="submit" disabled={createEqMutation.isPending} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-lg transition mt-2">
              {createEqMutation.isPending ? 'Salvando...' : 'Salvar Equipamento'}
            </button>
          </form>
        </div>

        {/* Lista e Alocação */}
        <div className="lg:col-span-2 p-6 glass-panel rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Equipamentos Registrados</h3>
          {isLoading ? (
            <p className="text-xs text-slate-400">Carregando equipamentos...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Equipamento</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Tipo</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Alocação Atual</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {equipamentos.map((eq: any) => (
                    <tr key={eq.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">{eq.name}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">{eq.code}</span>
                      </td>
                      <td className="py-3 px-4">{eq.type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eq.status === 'DISPONIVEL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          eq.status === 'EM_USO' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {eq.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-400">
                        {eq.obraName}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select 
                          className="bg-slate-900 border border-white/10 p-1.5 rounded text-white text-[10px] outline-none w-32"
                          value={eq.obraId || ''}
                          onChange={(e) => handleAllocate(eq.id, e.target.value)}
                        >
                          <option value="">Devolver (Almoxarifado)</option>
                          {obras.map((o: any) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {equipamentos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhum equipamento cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
