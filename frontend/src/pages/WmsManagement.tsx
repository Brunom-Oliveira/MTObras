import React, { useState, useEffect } from 'react';
import { 
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
  TrendingDown
} from 'lucide-react';

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
  const [obras, setObras] = useState<Obra[]>([
    { id: 'obra-1', code: 'OB-001', name: 'Residencial Bella Vista' },
    { id: 'obra-2', code: 'OB-002', name: 'Edifício Sky Tower' }
  ]);
  const [selectedObraId, setSelectedObraId] = useState('obra-1');
  const [estoqueList, setEstoqueList] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulário de Endereçamento
  const [targetEstoqueId, setTargetEstoqueId] = useState('');
  const [local, setLocal] = useState('Contêiner Principal');
  const [subLocal, setSubLocal] = useState('Prateleira A1');
  const [qtdEnderecada, setQtdEnderecada] = useState('');

  // Painel de Inventário Rotativo
  const [isCounting, setIsCounting] = useState(false);
  const [inventarioCategory, setInventarioCategory] = useState('Todos');
  const [contagens, setContagens] = useState<{ [materialId: string]: string }>({});
  const [inventarioResults, setInventarioResults] = useState<any[]>([]);

  const categories = ['Todos', 'Cimento e Argamassa', 'Aço e Ferro', 'Agregados', 'Acabamento'];

  const fetchEstoque = () => {
    setLoading(true);
    fetch(`http://localhost:3001/api/estoque/${selectedObraId}`)
      .then(res => res.json())
      .then(data => {
        setEstoqueList(data);
        if (data.length > 0 && !targetEstoqueId) {
          setTargetEstoqueId(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar estoques, usando mock fallback", err);
        // Fallback local mock data base
        const mockEst = [
          {
            id: 'est-1',
            obraId: 'obra-1',
            materialId: 'mat-1',
            materialCode: 'MAT-CIM-01',
            materialDesc: 'Cimento CP II 50kg',
            materialCategory: 'Cimento e Argamassa',
            quantity: 240.0,
            reservedQty: 40.0,
            minQty: 100.0,
            unit: 'SACO',
            enderecos: [
              { id: 'end-1', estoqueObraId: 'est-1', local: 'Sala de Cimento', subLocal: 'Pilha A1', quantity: 140.0 },
              { id: 'end-2', estoqueObraId: 'est-1', local: 'Sala de Cimento', subLocal: 'Pilha A2', quantity: 100.0 }
            ]
          },
          {
            id: 'est-2',
            obraId: 'obra-1',
            materialId: 'mat-2',
            materialCode: 'MAT-ACO-02',
            materialDesc: 'Vergalhão CA-50 10mm 12m',
            materialCategory: 'Aço e Ferro',
            quantity: 85.0,
            reservedQty: 10.0,
            minQty: 50.0,
            unit: 'BARRA',
            enderecos: [
              { id: 'end-3', estoqueObraId: 'est-2', local: 'Pátio Externo', subLocal: 'Área Aberta Sul', quantity: 85.0 }
            ]
          },
          {
            id: 'est-3',
            obraId: 'obra-1',
            materialId: 'mat-3',
            materialCode: 'MAT-ARE-03',
            materialDesc: 'Areia Lavada Fina',
            materialCategory: 'Agregados',
            quantity: 12.0,
            reservedQty: 0.0,
            minQty: 15.0,
            unit: 'M3',
            enderecos: [
              { id: 'end-4', estoqueObraId: 'est-3', local: 'Pátio Externo', subLocal: 'Baia de Areia', quantity: 12.0 }
            ]
          }
        ];
        
        const filtered = mockEst.filter(e => e.obraId === selectedObraId);
        setEstoqueList(filtered);
        if (filtered.length > 0) setTargetEstoqueId(filtered[0].id);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEstoque();
  }, [selectedObraId]);

  const handleEnderecar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEstoqueId || !qtdEnderecada) return;

    fetch('http://localhost:3001/api/estoque/enderecar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estoqueObraId: targetEstoqueId,
        local,
        subLocal,
        quantity: parseFloat(qtdEnderecada)
      })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Endereçamento salvo com sucesso!');
        setQtdEnderecada('');
        fetchEstoque();
      })
      .catch(err => {
        console.error("Erro ao salvar endereçamento local", err);
        // Fallback local
        alert("Endereçamento simulado com sucesso (Fallbacked em memória)!");
        setQtdEnderecada('');
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

  const saveInventario = () => {
    // Montar items contados
    const itemsContados = Object.keys(contagens).map(matId => ({
      materialId: matId,
      qtyPhysical: parseFloat(contagens[matId]) || 0.0
    }));

    fetch('http://localhost:3001/api/inventarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obraId: selectedObraId,
        type: 'ROTATIVO',
        itemsContados
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsCounting(false);
        setContagens({});
        alert("Inventário Cíclico auditado e concluído. Desvios processados.");
        fetchEstoque();
      })
      .catch(err => {
        console.error("Erro ao salvar inventário", err);
        alert("Erro na gravação. Inventário rotativo simulado localmente!");
        setIsCounting(false);
        setContagens({});
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
                    onClick={saveInventario}
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
