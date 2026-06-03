import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Truck, Flame, ClipboardList, Plus, Wrench } from 'lucide-react';
import { api } from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

export default function OperacoesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Queries
  const { data: obrasList = [] } = useQuery({ queryKey: ['obras'], queryFn: async () => (await api.get('/obras')).data });
  const { data: materiaisList = [] } = useQuery({ queryKey: ['materiais'], queryFn: async () => (await api.get('/materiais')).data });
  const { data: solicitacoes = [] } = useQuery({ queryKey: ['solicitacoes'], queryFn: async () => (await api.get('/solicitacoes')).data });
  const { data: compras = [] } = useQuery({ queryKey: ['compras'], queryFn: async () => (await api.get('/compras')).data });
  const { data: equipamentos = [] } = useQuery({ queryKey: ['equipamentos'], queryFn: async () => (await api.get('/equipamentos')).data });

  // Forms
  const { register: regRecebimento, handleSubmit: submitRecebimento, reset: resetRecebimento } = useForm();
  const { register: regConsumo, handleSubmit: submitConsumo, reset: resetConsumo } = useForm();

  // Mutations
  const recebimentoMutation = useMutation({
    mutationFn: (data: any) => api.post(`/wms/recebimento/${data.pedidoId}`, {
      items: [{
        pedidoItemId: 'item-1', // simplificação, na vida real seria dinamico
        materialId: compras.find((c: any) => c.id === data.pedidoId)?.items[0]?.materialId || 'mat-1',
        qtyReceived: parseFloat(data.qtd),
        localArmazenagem: data.local,
        subLocal: data.sublocal
      }]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Recebimento WMS concluído com sucesso!');
      resetRecebimento();
    },
    onError: () => toast.error('Erro no recebimento.')
  });

  const consumoMutation = useMutation({
    mutationFn: (data: any) => api.post('/consumo', {
      obraId: data.obraId,
      materialId: data.matId,
      quantity: parseFloat(data.qtd),
      team: data.team,
      activity: data.activity
    }),
    onSuccess: () => {
      toast.success('Consumo registrado e estoque deduzido!');
      resetConsumo();
    },
    onError: () => toast.error('Erro ao registrar consumo.')
  });

  const aprovarMutation = useMutation({
    mutationFn: (id: string) => api.post(`/solicitacoes/${id}/aprovar`, { approverId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Solicitação APROVADA e separada no WMS!');
    }
  });

  const simularPedidoMutation = useMutation({
    mutationFn: () => api.post('/solicitacoes', {
      obraId: obrasList[0]?.id || 'obra-1',
      requesterId: user?.id,
      items: [{ materialId: materiaisList[0]?.id || 'mat-1', quantity: 20.0 }]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Solicitação simulada enviada pelo Mestre!');
    }
  });

  const alocarEquipMutation = useMutation({
    mutationFn: ({ id, obraId }: { id: string, obraId: string | null }) => api.post(`/equipamentos/${id}/alocar`, { obraId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast.success('Status do equipamento atualizado!');
    }
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recebimento */}
        <div className="p-6 glass-panel rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="text-cyan-400 w-4 h-4" />
            Recebimento de Cargas (Entrada)
          </h3>
          <form onSubmit={submitRecebimento((data) => recebimentoMutation.mutate(data))} className="space-y-3">
            <div className="space-y-1">
              <label className="text-slate-400">Pedido de Compra Pendente:</label>
              <select {...regRecebimento('pedidoId')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                {compras.filter((c: any) => c.status === 'PEDIDO_GERADO').map((p: any) => (
                  <option key={p.id} value={p.id}>{p.id} - Fornecedor: {p.supplierName}</option>
                ))}
                {compras.filter((c: any) => c.status === 'PEDIDO_GERADO').length === 0 && <option value="">Nenhum pedido</option>}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Quantidade Recebida:</label>
                <input type="number" step="any" {...regRecebimento('qtd', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Obra Destino:</label>
                <select className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                  {obrasList.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Local de Armazenamento:</label>
                <input type="text" {...regRecebimento('local', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" defaultValue="Contêiner Principal" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Sub-Local (Opcional):</label>
                <input type="text" {...regRecebimento('sublocal')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" />
              </div>
            </div>
            <button type="submit" disabled={recebimentoMutation.isPending} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition disabled:opacity-50">
              Processar Recebimento Logístico
            </button>
          </form>

          {/* List Pedidos */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white">Últimos Pedidos / Compras:</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {compras.map((p: any) => (
                <div key={p.id} className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">Cotação: {p.supplierName}</span>
                    <span className="text-[10px] text-slate-500 block">Condição: {p.deliveryTerms}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${p.status === 'RECEBIDO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Consumo */}
        <div className="p-6 glass-panel rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="text-rose-400 w-4 h-4" />
            Controle de Consumo (Retiradas)
          </h3>
          <form onSubmit={submitConsumo(data => consumoMutation.mutate(data))} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Obra:</label>
                <select {...regConsumo('obraId')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                  {obrasList.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Material:</label>
                <select {...regConsumo('matId')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                  {materiaisList.map((m: any) => <option key={m.id} value={m.id}>{m.description}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Quantidade Retirada:</label>
                <input type="number" step="any" {...regConsumo('qtd', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Equipe Executora:</label>
                <select {...regConsumo('team')} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                  <option value="Alvenaria">Alvenaria</option>
                  <option value="Concretagem">Concretagem</option>
                  <option value="Hidráulica">Hidráulica</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Atividade Destino:</label>
              <input type="text" {...regConsumo('activity', { required: true })} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" />
            </div>
            <button type="submit" disabled={consumoMutation.isPending} className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition disabled:opacity-50">Registrar e Deduzir Estoque WMS</button>
          </form>
        </div>
      </div>

      {/* Solicitações */}
      <div className="p-6 glass-panel rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ClipboardList className="text-cyan-400 w-4 h-4" />
            Solicitações de Materiais
          </h3>
          <button className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/20" onClick={() => simularPedidoMutation.mutate()}>
            <Plus className="w-4 h-4" /> Simular Pedido do Mestre
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">Obra</th>
                <th className="py-2.5 px-3">Solicitante</th>
                <th className="py-2.5 px-3">Itens</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {solicitacoes.map((sol: any) => (
                <tr key={sol.id} className="hover:bg-white/[0.01]">
                  <td className="py-2.5 px-3 font-semibold text-white">{sol.obraName}</td>
                  <td className="py-2.5 px-3">{sol.requesterName}</td>
                  <td className="py-2.5 px-3">
                    {sol.items.map((item: any, i: number) => <span key={i} className="block">{item.quantity} {item.unit} • {item.description}</span>)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${sol.status === 'APROVADO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : sol.status === 'SOLICITADO' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/10'}`}>
                      {sol.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {sol.status === 'SOLICITADO' ? (
                      <button onClick={() => aprovarMutation.mutate(sol.id)} className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold">Aprovar</button>
                    ) : <span className="text-slate-500 font-medium">Concluído</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipamentos */}
      <div className="p-6 glass-panel rounded-2xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Wrench className="text-amber-400 w-4 h-4" />
          Alocação de Equipamentos e Ferramentas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {equipamentos.map((eq: any) => (
            <div key={eq.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{eq.name}</span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-white/5 rounded text-[9px] font-mono">{eq.code}</span>
              </div>
              <p className="text-slate-500 text-[10px] uppercase">Categoria: {eq.type}</p>
              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${eq.status === 'DISPONIVEL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{eq.status}</span>
                <button 
                  onClick={() => alocarEquipMutation.mutate({ id: eq.id, obraId: eq.obraId ? null : 'obra-1' })}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded font-semibold text-[10px] transition"
                >
                  {eq.status === 'DISPONIVEL' ? 'Alocar Obra' : 'Devolver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
