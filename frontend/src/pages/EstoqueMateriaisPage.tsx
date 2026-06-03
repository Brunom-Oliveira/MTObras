import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Package, AlertCircle } from 'lucide-react';
import { api } from '../lib/axios';

export default function EstoqueMateriaisPage() {
  const queryClient = useQueryClient();

  const { data: estoqueList = [], isLoading } = useQuery({
    queryKey: ['estoqueGlobal'],
    queryFn: async () => {
      const res = await api.get('/estoque');
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

  const { data: materiais = [] } = useQuery({
    queryKey: ['materiais'],
    queryFn: async () => {
      const res = await api.get('/materiais');
      return res.data;
    }
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { obraId: '', materialId: '', quantity: '', minQty: '', avgConsumption: '' }
  });

  const createEstoqueMutation = useMutation({
    mutationFn: (newEstoque: any) => api.post('/estoque', newEstoque),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoqueGlobal'] });
      toast.success('Lançamento de estoque registrado!');
      reset();
    },
    onError: () => toast.error('Erro ao registrar estoque')
  });

  const onSubmit = (data: any) => {
    createEstoqueMutation.mutate({
      obraId: data.obraId,
      materialId: data.materialId,
      quantity: parseFloat(data.quantity),
      minQty: parseFloat(data.minQty || '0'),
      avgConsumption: parseFloat(data.avgConsumption || '0')
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 glass-panel rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Estoque Consolidado</h1>
          <p className="text-slate-400 text-sm mt-1">Visão geral do saldo físico e saldos de projeto em todos os canteiros.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Formulário Lançamento Avulso */}
        <div className="lg:col-span-1 p-6 glass-panel rounded-2xl space-y-4 self-start">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="text-cyan-400 w-4 h-4" />
            Lançamento / Ajuste
          </h3>
          <p className="text-[10px] text-slate-400">Use para lançamentos manuais. Em operações normais, o recebimento atualizará o estoque via WMS.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Obra / Canteiro:</label>
              <select {...register('obraId', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                <option value="">Selecione...</option>
                {obras.map((o: any) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Material:</label>
              <select {...register('materialId', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                <option value="">Selecione...</option>
                {materiais.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.description} ({m.unit})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Qtd a Adicionar (Ajuste):</label>
              <input type="number" step="any" {...register('quantity', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Ex: 50" />
            </div>
            
            <div className="pt-2 border-t border-white/5 space-y-3 mt-2">
              <p className="text-[10px] text-slate-400">Opcional: Redefinir Parâmetros</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Est. Mínimo:</label>
                  <input type="number" step="any" {...register('minQty')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Ex: 10" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Consumo Méd.:</label>
                  <input type="number" step="any" {...register('avgConsumption')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Mensal" />
                </div>
              </div>
            </div>
            
            <button type="submit" disabled={createEstoqueMutation.isPending} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition mt-4">
              {createEstoqueMutation.isPending ? 'Salvando...' : 'Registrar Saldo Físico'}
            </button>
          </form>
        </div>

        {/* Tabela de Estoque */}
        <div className="lg:col-span-3 p-6 glass-panel rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Saldos por Obra</h3>
          {isLoading ? (
            <p className="text-xs text-slate-400">Carregando estoques...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Obra</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider">Material / Código</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Saldo Real</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Reservado</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Disponível</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Est. Min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {estoqueList.map((est: any) => {
                    const disponivel = est.quantity - est.reservedQty;
                    const alertaRuptura = disponivel <= est.minQty;

                    return (
                      <tr key={est.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{est.obraName}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{est.materialDesc}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{est.materialCode}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-cyan-400">
                          {est.quantity} <span className="text-[10px] text-slate-500">{est.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400">
                          {est.reservedQty} <span className="text-[10px] text-slate-500">{est.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          <span className={alertaRuptura ? 'text-rose-400' : 'text-emerald-400'}>
                            {disponivel} <span className="text-[10px] opacity-50">{est.unit}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">
                          {est.minQty} <span className="text-[10px]">{est.unit}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {estoqueList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Nenhum estoque registrado ainda nas obras.
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
