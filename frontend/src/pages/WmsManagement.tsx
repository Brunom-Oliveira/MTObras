import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  RefreshCw, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Save, 
  Barcode,
  Layers,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  ListFilter,
  Boxes,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface EstoqueItem {
  id: string;
  obraId: string;
  materialId: string;
  materialCode: string;
  materialDesc: string;
  materialCategory: string;
  quantity: number;
  reservedQty: number;
  minQty: number;
  unit: string;
  enderecos: EnderecoItem[];
}

interface EnderecoItem {
  id: string;
  estoqueObraId: string;
  local: string;
  subLocal: string | null;
  quantity: number;
}

interface Obra {
  id: string;
  code: string;
  name: string;
}

export default function WmsManagement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: obras = [] } = useQuery({ queryKey: ['obras'], queryFn: async () => (await api.get('/obras')).data });
  const [selectedObraId, setSelectedObraId] = useState('obra-1');

  const { data: estoqueList = [], isLoading: loading } = useQuery({
    queryKey: ['estoques', selectedObraId],
    queryFn: async () => (await api.get(`/estoque/${selectedObraId}`)).data,
    enabled: !!selectedObraId
  });

  // Formulário de Endereçamento
  const [targetEstoqueId, setTargetEstoqueId] = useState('');
  const [local, setLocal] = useState('Contêiner Principal');
  const [subLocal, setSubLocal] = useState('Prateleira A1');
  const [qtdEnderecada, setQtdEnderecada] = useState('');

  if (!targetEstoqueId && estoqueList.length > 0) {
    setTargetEstoqueId(estoqueList[0].id);
  }

  // Painel de Inventário Rotativo
  const [isCounting, setIsCounting] = useState(false);
  const [inventarioCategory, setInventarioCategory] = useState('Todos');
  const [contagens, setContagens] = useState<{ [materialId: string]: string }>({});
  const [inventarioResults, setInventarioResults] = useState<any[]>([]);

  const categories = ['Todos', 'Cimento e Argamassa', 'Aço e Ferro', 'Agregados', 'Acabamento'];

  const enderecarMutation = useMutation({
    mutationFn: (data: any) => api.post('/estoque/enderecar', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoques'] });
      toast.success('Endereçamento concluído!');
      setQtdEnderecada('');
    },
    onError: () => toast.error('Erro ao endereçar.')
  });

  const handleEnderecar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEstoqueId || !qtdEnderecada) return;
    enderecarMutation.mutate({
      estoqueObraId: targetEstoqueId,
      local,
      subLocal,
      quantity: parseFloat(qtdEnderecada)
    });
  };

  const startInventario = () => {
    setIsCounting(true);
    const initialCounts: { [id: string]: string } = {};
    estoqueList
      .filter(est => inventarioCategory === 'Todos' || est.materialCategory === inventarioCategory)
      .forEach(est => {
        initialCounts[est.materialId] = '';
      });
    setContagens(initialCounts);
  };

  const handleContagemChange = (materialId: string, val: string) => {
    setContagens(prev => ({ ...prev, [materialId]: val }));
  };

  const inventarioMutation = useMutation({
    mutationFn: (data: any) => api.post('/inventario', data),
    onSuccess: () => {
      toast.success('Inventário rotativo concluído!');
      queryClient.invalidateQueries({ queryKey: ['estoques'] });
      setIsCounting(false);
      setContagens({});
      setInventarioResults([]);
    },
    onError: () => toast.error('Erro ao salvar inventário.')
  });

  const handleConcluirInventario = () => {
    const itemsToSave = Object.keys(contagens).map(matId => {
      const est = estoqueList.find((e: any) => e.materialId === matId);
      return {
        materialId: matId,
        systemQty: est?.quantity || 0,
        countedQty: parseFloat(contagens[matId]) || 0
      };
    });

    if (itemsToSave.length === 0) return;

    inventarioMutation.mutate({
      obraId: selectedObraId,
      responsibleId: user?.id,
      items: itemsToSave
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Selector Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="text-cyan-400 w-6 h-6" />
            Endereçamento & Inventário (WMS)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Controle a localização exata de cada material no canteiro e execute contagens cíclicas sem parar as atividades.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Canteiro de Obras:</label>
          <select 
            value={selectedObraId} 
            onChange={(e) => setSelectedObraId(e.target.value)}
            className="bg-slate-900 border border-white/10 text-white text-xs px-3 py-2 rounded-xl focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            {obras.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Register Slot Addresses */}
        <div className="space-y-6">
          <div className="p-6 glass-panel rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="text-cyan-400 w-4 h-4" />
              Entrada & Endereçamento WMS
            </h3>
            
            <form onSubmit={handleEnderecar} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Material:</label>
                <select 
                  value={targetEstoqueId} 
                  onChange={(e) => setTargetEstoqueId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white p-2.5 rounded-lg focus:border-cyan-500"
                >
                  {estoqueList.map(est => (
                    <option key={est.id} value={est.id}>{est.materialCode} - {est.materialDesc}</option>
                  ))}
                  {estoqueList.length === 0 && <option value="">Nenhum material no estoque desta obra</option>}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Local de Armazenamento:</label>
                <input 
                  type="text" 
                  value={local} 
                  onChange={e => setLocal(e.target.value)} 
                  className="w-full bg-slate-900 border border-white/10 text-white p-2.5 rounded-lg focus:border-cyan-500" 
                  placeholder="Ex: Contêiner 01, Sala de Cimento, Pátio Leste"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Sub-Local (Prateleira, Baia, Pilha - Opcional):</label>
                <input 
                  type="text" 
                  value={subLocal} 
                  onChange={e => setSubLocal(e.target.value)} 
                  className="w-full bg-slate-900 border border-white/10 text-white p-2.5 rounded-lg focus:border-cyan-500" 
                  placeholder="Ex: Prateleira B, Baia de Areia, Pilha Norte"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Quantidade no Endereço:</label>
                <input 
                  type="number" 
                  step="any"
                  value={qtdEnderecada} 
                  onChange={e => setQtdEnderecada(e.target.value)} 
                  className="w-full bg-slate-900 border border-white/10 text-white p-2.5 rounded-lg focus:border-cyan-500 font-bold" 
                  placeholder="Ex: 50"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Registrar Localização Física
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Physical WMS Inventory & Cycle Counting */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Current Stock Physical Address Mapping */}
          <div className="p-6 glass-panel rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4">Estrutura Física do Almoxarifado da Obra</h3>
            
            {loading ? (
              <p className="text-xs text-slate-400">Carregando estoque endereçado...</p>
            ) : (
              <div className="space-y-4">
                {estoqueList.map(est => (
                  <div key={est.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-sm">{est.materialDesc}</span>
                        <span className="text-slate-500 block text-[10px] font-mono mt-0.5">{est.materialCode} • Category: {est.materialCategory}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-400 font-bold text-base">{est.quantity} {est.unit}</span>
                        <span className="text-slate-500 block text-[10px] mt-0.5">Reservado: {est.reservedQty} {est.unit}</span>
                      </div>
                    </div>

                    {/* Address badges */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                      {est.enderecos.map(end => (
                        <div key={end.id} className="px-2.5 py-1.5 bg-slate-900/60 border border-white/10 rounded-lg flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-slate-300 font-medium">
                            {end.local} {end.subLocal && `› ${end.subLocal}`}
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                            {end.quantity} {est.unit}
                          </span>
                        </div>
                      ))}
                      {est.enderecos.length === 0 && (
                        <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Material ainda não endereçado fisicamente no canteiro!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {estoqueList.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">Nenhum estoque disponível.</p>
                )}
              </div>
            )}
          </div>

          {/* Section B: Inventário Rotativo (Cíclico) */}
          <div className="p-6 glass-panel rounded-2xl border border-emerald-500/10 relative overflow-hidden">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <RefreshCw className="text-emerald-400 w-4 h-4" />
              Inventário Cíclico Rotativo
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Realize contagens aleatórias diárias para identificar perdas por furtos, quebras ou desvios rapidamente.
            </p>

            {!isCounting ? (
              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={inventarioCategory} 
                  onChange={e => setInventarioCategory(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-white text-xs px-3 py-2 rounded-xl"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>

                <button 
                  onClick={startInventario}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Iniciar Contagem Cíclica
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                  {estoqueList
                    .filter(est => inventarioCategory === 'Todos' || est.materialCategory === inventarioCategory)
                    .map(est => (
                      <div key={est.id} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                        <div>
                          <p className="font-bold text-white">{est.materialDesc}</p>
                          <p className="text-[10px] text-slate-500">Sistema: {est.quantity} {est.unit}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            step="any"
                            value={contagens[est.materialId] || ''}
                            onChange={e => handleContagemChange(est.materialId, e.target.value)}
                            className="w-24 bg-slate-900 border border-white/10 text-white p-2 rounded text-right font-bold"
                            placeholder="Qtd Contada"
                          />
                          <span className="text-slate-400 w-8">{est.unit}</span>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="flex gap-3 justify-end text-xs">
                  <button 
                    onClick={() => setIsCounting(false)}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConcluirInventario}
                    className="py-2 px-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Finalizar e Ajustar Desvios
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
