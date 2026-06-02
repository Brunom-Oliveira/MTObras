import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  ClipboardList, 
  FileText, 
  Home, 
  Package, 
  ShoppingCart, 
  Download, 
  User, 
  Menu, 
  X,
  Plus,
  Save,
  CheckCircle,
  Truck,
  Flame,
  Wrench
} from 'lucide-react';

// Import Pages
import Dashboard from './pages/Dashboard';
import WmsManagement from './pages/WmsManagement';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wms' | 'cadastros' | 'operacoes'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cadastros States
  const [obrasList, setObrasList] = useState<any[]>([]);
  const [materiaisList, setMateriaisList] = useState<any[]>([]);
  
  // Obras Form
  const [obraName, setObraName] = useState('');
  const [obraClient, setObraClient] = useState('');
  const [obraAddress, setObraAddress] = useState('');
  const [obraBudget, setObraBudget] = useState('');
  const [obraCode, setObraCode] = useState('');

  // Materiais Form
  const [matCode, setMatCode] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matCategory, setMatCategory] = useState('Cimento e Argamassa');
  const [matUnit, setMatUnit] = useState('UN');
  const [matCost, setMatCost] = useState('');
  const [matSupplier, setMatSupplier] = useState('');

  // Operations States
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);

  // Recebimento Form
  const [recPedidoId, setRecPedidoId] = useState('');
  const [recLocal, setRecLocal] = useState('Contêiner Principal');
  const [recSubLocal, setRecSubLocal] = useState('Prateleira A1');
  const [recQtd, setRecQtd] = useState('');

  // Consumo Form
  const [conObraId, setConObraId] = useState('');
  const [conMatId, setConMatId] = useState('');
  const [conQtd, setConQtd] = useState('');
  const [conTeam, setConTeam] = useState('Alvenaria');
  const [conActivity, setConActivity] = useState('');

  const loadData = () => {
    fetch('http://localhost:3001/api/obras')
      .then(res => res.json())
      .then(data => setObrasList(data));

    fetch('http://localhost:3001/api/materiais')
      .then(res => res.json())
      .then(data => {
        setMateriaisList(data);
        if (data.length > 0) setConMatId(data[0].id);
      });

    fetch('http://localhost:3001/api/solicitacoes')
      .then(res => res.json())
      .then(data => setSolicitacoes(data));

    fetch('http://localhost:3001/api/compras')
      .then(res => res.json())
      .then(data => {
        setCompras(data);
        if (data.length > 0) setRecPedidoId(data[0].id);
      });

    fetch('http://localhost:3001/api/equipamentos')
      .then(res => res.json())
      .then(data => setEquipamentos(data));
  };

  useEffect(() => {
    loadData();
    // Auto populate first obra if exists
    if (obrasList.length > 0) {
      setConObraId(obrasList[0].id);
    }
  }, []);

  useEffect(() => {
    if (obrasList.length > 0 && !conObraId) {
      setConObraId(obrasList[0].id);
    }
  }, [obrasList]);

  const handleCreateObra = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/obras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: obraName,
        clientName: obraClient,
        address: obraAddress,
        budget: parseFloat(obraBudget) || 0,
        code: obraCode,
        startDate: new Date(),
        expectedEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // +180 dias
      })
    })
      .then(res => res.json())
      .then(data => {
        alert('Obra cadastrada com sucesso!');
        setObraName('');
        setObraClient('');
        setObraAddress('');
        setObraBudget('');
        setObraCode('');
        loadData();
      });
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/materiais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: matCode,
        description: matDesc,
        category: matCategory,
        unit: matUnit,
        averageCost: parseFloat(matCost) || 0.0,
        defaultSupplier: matSupplier
      })
    })
      .then(res => res.json())
      .then(data => {
        alert('Material cadastrado no catálogo geral!');
        setMatCode('');
        setMatDesc('');
        setMatCost('');
        setMatSupplier('');
        loadData();
      });
  };

  const handleAprovarSolicitacao = (id: string) => {
    fetch(`http://localhost:3001/api/solicitacoes/${id}/aprovar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverId: '2' }) // Engenheiro
    })
      .then(res => res.json())
      .then(data => {
        alert('Solicitação aprovada e estoque reservado.');
        loadData();
      });
  };

  const handleRecebimento = (e: React.FormEvent) => {
    e.preventDefault();
    const ped = compras.find(p => p.id === recPedidoId);
    if (!ped) return;

    // Simular que recebemos o primeiro item do pedido
    const item = ped.items[0];
    if (!item) return;

    fetch('http://localhost:3001/api/recebimento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pedidoId: recPedidoId,
        obraId: 'obra-1', // Obra Bella Vista
        local: recLocal,
        subLocal: recSubLocal,
        itemsRecebidos: [
          { materialId: item.materialId, qtyReceived: parseFloat(recQtd) || item.qtyOrdered }
        ]
      })
    })
      .then(res => res.json())
      .then(data => {
        alert('Recebimento WMS concluído com sucesso! Saldo adicionado e endereçado.');
        setRecQtd('');
        loadData();
      });
  };

  const handleConsumo = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/consumo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obraId: conObraId,
        materialId: conMatId,
        quantity: parseFloat(conQtd),
        team: conTeam,
        responsibleId: '5', // Mestre de Obras
        activity: conActivity
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Erro ao processar retirada.');
        } else {
          alert('Saída de estoque endereçada e consumo gravado!');
          setConQtd('');
          setConActivity('');
          loadData();
        }
      });
  };

  return (
    <div className="min-h-screen flex text-slate-200">
      {/* Sidebar - Desktop Layout */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-white/5 flex flex-col justify-between transition-transform transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden lg:flex'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                🏗️
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight block">MTObras</span>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase block -mt-1">WMS OBRAS</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 text-sm">
            <button 
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-cyan-600/30 to-emerald-600/30 border-l-2 border-cyan-500 text-white font-semibold' : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Painel Executivo
            </button>

            <button 
              onClick={() => { setActiveTab('wms'); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'wms' ? 'bg-gradient-to-r from-cyan-600/30 to-emerald-600/30 border-l-2 border-cyan-500 text-white font-semibold' : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'}`}
            >
              <Layers className="w-4 h-4" />
              Gestão WMS
            </button>

            <button 
              onClick={() => { setActiveTab('cadastros'); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'cadastros' ? 'bg-gradient-to-r from-cyan-600/30 to-emerald-600/30 border-l-2 border-cyan-500 text-white font-semibold' : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'}`}
            >
              <ClipboardList className="w-4 h-4" />
              Cadastros Gerais
            </button>

            <button 
              onClick={() => { setActiveTab('operacoes'); setSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'operacoes' ? 'bg-gradient-to-r from-cyan-600/30 to-emerald-600/30 border-l-2 border-cyan-500 text-white font-semibold' : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'}`}
            >
              <FileText className="w-4 h-4" />
              Operações
            </button>
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-6 border-t border-white/5 flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold">
            U
          </div>
          <div>
            <p className="font-bold text-white leading-none">Almoxarife Principal</p>
            <p className="text-slate-500 text-[10px] mt-0.5 leading-none">ID: 4 • WAREHOUSE_KEEPER</p>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header - Mobile Only Toggle */}
        <header className="p-4 border-b border-white/5 flex items-center justify-between lg:hidden glass-panel">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-2 bg-slate-900 rounded-xl text-slate-300 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-white text-base ml-1">🏗️ MTObras</span>
          </div>
          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">WMS</span>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          
          {activeTab === 'wms' && <WmsManagement />}

          {/* Cadastros Tab */}
          {activeTab === 'cadastros' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Obra Cadastro */}
                <div className="p-6 glass-panel rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Home className="text-cyan-400 w-4 h-4" />
                    Cadastrar Nova Obra
                  </h3>
                  <form onSubmit={handleCreateObra} className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1 col-span-2">
                        <label className="text-slate-400">Nome do Canteiro:</label>
                        <input type="text" value={obraName} onChange={e => setObraName(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Residencial Vert" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Código:</label>
                        <input type="text" value={obraCode} onChange={e => setObraCode(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="OB-003" required />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Cliente Incorporador:</label>
                      <input type="text" value={obraClient} onChange={e => setObraClient(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Cliente S.A." required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Endereço Completo:</label>
                      <input type="text" value={obraAddress} onChange={e => setObraAddress(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Av. Principal, 10" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Orçamento Previsto (R$):</label>
                      <input type="number" step="any" value={obraBudget} onChange={e => setObraBudget(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white font-bold" placeholder="1500000" required />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition">Salvar Canteiro de Obras</button>
                  </form>

                  {/* List Obras */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <h4 className="text-xs font-bold text-white">Obras Existentes:</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {obrasList.map(o => (
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
                  <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1 col-span-2">
                        <label className="text-slate-400">Descrição do Insumo:</label>
                        <input type="text" value={matDesc} onChange={e => setMatDesc(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Areia Lavada Média" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Unidade:</label>
                        <select 
                          value={matUnit} 
                          onChange={e => setMatUnit(e.target.value)} 
                          className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white"
                        >
                          <option value="UN">UN (Unidade)</option>
                          <option value="M">M (Metro linear)</option>
                          <option value="M2">M2 (Metro quadrado)</option>
                          <option value="M3">M3 (Metro cúbico)</option>
                          <option value="KG">KG (Quilograma)</option>
                          <option value="L">L (Litro)</option>
                          <option value="SACO">SACO (Saco)</option>
                          <option value="CX">CX (Caixa)</option>
                          <option value="ROLO">ROLO (Rolo)</option>
                          <option value="BARRA">BARRA (Barra)</option>
                          <option value="LATA">LATA (Lata)</option>
                          <option value="PAR">PAR (Par)</option>
                          <option value="TON">TON (Tonelada)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400">Código Único:</label>
                        <input type="text" value={matCode} onChange={e => setMatCode(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="MAT-ARE-04" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Categoria:</label>
                        <select value={matCategory} onChange={e => setMatCategory(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
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
                        <input type="number" step="any" value={matCost} onChange={e => setMatCost(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="95.00" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Fornecedor Padrão:</label>
                        <input type="text" value={matSupplier} onChange={e => setMatSupplier(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Votorantim" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition">Salvar no Catálogo Geral</button>
                  </form>

                  {/* List Materiais */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <h4 className="text-xs font-bold text-white">Catálogo de Materiais:</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {materiaisList.map(m => (
                        <div key={m.id} className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white">{m.description}</span>
                            <span className="text-[10px] text-slate-500 block">{m.code} • {m.category}</span>
                          </div>
                          <span className="font-mono text-cyan-400 font-bold">R$ {m.averageCost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operações Tab */}
          {activeTab === 'operacoes' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Recebimento de Cargas (Conferência Cega WMS) */}
                <div className="p-6 glass-panel rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Truck className="text-cyan-400 w-4 h-4" />
                    Recebimento de Cargas (Entrada)
                  </h3>
                  <form onSubmit={handleRecebimento} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-slate-400">Pedido de Compra Pendente:</label>
                      <select value={recPedidoId} onChange={e => setRecPedidoId(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                        {compras.filter(c => c.status === 'PEDIDO_GERADO').map(p => (
                          <option key={p.id} value={p.id}>{p.id} - Fornecedor: {p.supplierName}</option>
                        ))}
                        {compras.filter(c => c.status === 'PEDIDO_GERADO').length === 0 && <option value="">Nenhum pedido de compra pendente</option>}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400">Quantidade Recebida:</label>
                        <input type="number" step="any" value={recQtd} onChange={e => setRecQtd(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white font-bold" placeholder="Quantidade Física Contada" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Obra Destino:</label>
                        <select className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                          <option value="obra-1">Residencial Bella Vista</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400">Local de Armazenamento:</label>
                        <input type="text" value={recLocal} onChange={e => setRecLocal(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Ex: Contêiner 01" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Sub-Local (Opcional):</label>
                        <input type="text" value={recSubLocal} onChange={e => setRecSubLocal(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Ex: Prateleira A1" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition">Processar Recebimento Logístico</button>
                  </form>

                  {/* List Pedidos */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <h4 className="text-xs font-bold text-white">Últimos Pedidos / Compras:</h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {compras.map(p => (
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

                {/* 2. Controle de Consumo Diário */}
                <div className="p-6 glass-panel rounded-2xl space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="text-rose-400 w-4 h-4" />
                    Controle de Consumo (Retiradas)
                  </h3>
                  <form onSubmit={handleConsumo} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400">Obra:</label>
                        <select value={conObraId} onChange={e => setConObraId(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                          {obrasList.map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Material:</label>
                        <select value={conMatId} onChange={e => setConMatId(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                          {materiaisList.map(m => (
                            <option key={m.id} value={m.id}>{m.description}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400">Quantidade Retirada:</label>
                        <input type="number" step="any" value={conQtd} onChange={e => setConQtd(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white font-bold" placeholder="Quantidade" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400">Equipe Executora:</label>
                        <select value={conTeam} onChange={e => setConTeam(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white">
                          <option value="Alvenaria">Alvenaria</option>
                          <option value="Concretagem">Concretagem</option>
                          <option value="Hidráulica">Hidráulica</option>
                          <option value="Pintura e Acabamento">Pintura e Acabamento</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">Atividade Destino:</label>
                      <input type="text" value={conActivity} onChange={e => setConActivity(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-lg text-white" placeholder="Concretagem da viga V5" required />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition">Registrar e Deduzir Estoque WMS</button>
                  </form>
                </div>
              </div>

              {/* 3. Solicitações de Materiais Operacionais */}
              <div className="p-6 glass-panel rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ClipboardList className="text-cyan-400 w-4 h-4" />
                    Solicitações de Materiais (Mestre ➔ Engenheiro)
                  </h3>
                  <button className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-xs font-semibold flex items-center gap-1.5" onClick={() => {
                    // Simular nova solicitação simples
                    fetch('http://localhost:3001/api/solicitacoes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        obraId: 'obra-1',
                        requesterId: '5', // Mestre de obras
                        items: [{ materialId: 'mat-1', quantity: 20.0 }]
                      })
                    })
                      .then(res => res.json())
                      .then(() => {
                        alert('Solicitação de cimento enviada pelo Mestre de Obras!');
                        loadData();
                      });
                  }}>
                    <Plus className="w-4 h-4" />
                    Simular Pedido do Mestre
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
                      {solicitacoes.map(sol => (
                        <tr key={sol.id} className="hover:bg-white/[0.01]">
                          <td className="py-2.5 px-3 font-semibold text-white">{sol.obraName}</td>
                          <td className="py-2.5 px-3">{sol.requesterName}</td>
                          <td className="py-2.5 px-3">
                            {sol.items.map((item: any, i: number) => (
                              <span key={i} className="block">{item.quantity} {item.unit} • {item.description}</span>
                            ))}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${sol.status === 'APROVADO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : sol.status === 'SOLICITADO' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/10'}`}>
                              {sol.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {sol.status === 'SOLICITADO' && (
                              <button 
                                onClick={() => handleAprovarSolicitacao(sol.id)}
                                className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                              >
                                Aprovar
                              </button>
                            )}
                            {sol.status !== 'SOLICITADO' && (
                              <span className="text-slate-500 font-medium">Concluído</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Gestão de Equipamentos do Canteiro */}
              <div className="p-6 glass-panel rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Wrench className="text-amber-400 w-4 h-4" />
                  Alocação de Equipamentos e Ferramentas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {equipamentos.map(eq => (
                    <div key={eq.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{eq.name}</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-white/5 rounded text-[9px] font-mono">{eq.code}</span>
                      </div>
                      <p className="text-slate-500 text-[10px] uppercase">Categoria: {eq.type}</p>
                      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${eq.status === 'DISPONIVEL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {eq.status}
                        </span>
                        <button 
                          onClick={() => {
                            const newObra = eq.obraId ? null : 'obra-1';
                            fetch(`http://localhost:3001/api/equipamentos/${eq.id}/alocar`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ obraId: newObra })
                            })
                              .then(res => res.json())
                              .then(() => {
                                alert(newObra ? 'Equipamento enviado para a obra!' : 'Equipamento devolvido ao almoxarifado central.');
                                loadData();
                              });
                          }}
                          className="py-1 px-2 bg-slate-900 border border-white/10 hover:bg-slate-800 rounded font-semibold text-[10px]"
                        >
                          {eq.obraId ? 'Recolher' : 'Alocar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
