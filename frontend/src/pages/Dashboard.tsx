import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  DollarSign, 
  Package,
  Layers,
  ArrowRight,
  Brain,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';

interface KPI {
  valorComprado: number;
  valorConsumido: number;
  valorPerdido: number;
  obrasAtivas: number;
  desviosEstoqueCount: number;
  materiaisCriticosCount: number;
}

interface MaterialCritico {
  obraName: string;
  materialCode: string;
  materialDesc: string;
  quantity: number;
  minQty: number;
  unit: string;
  diasRestantes: number;
}

interface IAAlert {
  type: string;
  message: string;
  urgency: string;
}

import { api } from '../lib/axios';

// ... (interfaces removed for brevity in this chunk to focus on useEffect)

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPI>({
    valorComprado: 6420.0,
    valorConsumido: 1187.50,
    valorPerdido: 229.50,
    obrasAtivas: 2,
    desviosEstoqueCount: 1,
    materiaisCriticosCount: 1
  });

  const [materiaisCriticos, setMateriaisCriticos] = useState<MaterialCritico[]>([
    {
      obraName: 'Residencial Bella Vista',
      materialCode: 'MAT-ARE-03',
      materialDesc: 'Areia Lavada Fina',
      quantity: 12.0,
      minQty: 15.0,
      unit: 'M3',
      diasRestantes: 5
    }
  ]);

  const [iaAlerts, setIaAlerts] = useState<IAAlert[]>([
    { type: 'RUPTURA', message: 'Atenção: Estoque de Areia Lavada Fina na Obra Residencial Bella Vista acabará em aproximadamente 5 dias.', urgency: 'HIGH' },
    { type: 'DESVIO', message: 'Alerta de Consumo: O uso de Cimento CP II na Obra Edifício Sky Tower está 22% acima do cronograma projetado de alvenaria.', urgency: 'MEDIUM' },
    { type: 'SUGESTAO', message: 'Recomendamos efetuar compra de 80 sacos de Cimento CP II para a Obra Residencial Bella Vista para garantir os próximos 15 dias de reboco.', urgency: 'LOW' }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => {
        const data = res.data;
        if (data.kpis) setKpis(data.kpis);
        if (data.materiaisCriticos) setMateriaisCriticos(data.materiaisCriticos);
        if (data.iaAlerts) setIaAlerts(data.iaAlerts);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar dados do Dashboard, usando local fallback", err);
        setLoading(false);
      });
  }, []);

  const { data: chartData = [
    { name: 'Semana 1', compras: 0, consumo: 0 },
    { name: 'Semana 2', compras: 0, consumo: 0 },
    { name: 'Semana 3', compras: 0, consumo: 0 },
    { name: 'Semana 4', compras: 0, consumo: 0 },
    { name: 'Semana Atual', compras: 0, consumo: 0 },
  ] } = useQuery({
    queryKey: ['dashboardChart'],
    queryFn: async () => {
      const res = await api.get('/dashboard/chart');
      return res.data;
    }
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 glass-panel rounded-2xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Visão Geral do Canteiro
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Métricas consolidadas de compras, auditoria de estoque endereçado (WMS) e consumo de insumos em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-sm font-medium self-start lg:self-auto">
          <Activity className="w-4 h-4 animate-pulse" />
          Conectado ao PostgreSQL
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-6 glass-panel rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500"></div>
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Valor Total Comprado</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(kpis.valorComprado)}</h3>
            <div className="flex items-center gap-1 text-xs text-cyan-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cotações ativas inclusas</span>
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 glass-panel rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500"></div>
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Valor Consumido em Campo</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(kpis.valorConsumido)}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Apropriado nas atividades</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 glass-panel rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-1 bg-rose-500"></div>
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Desvios / Perda Auditada</p>
            <h3 className="text-2xl font-bold text-rose-400 tracking-tight">{formatCurrency(kpis.valorPerdido)}</h3>
            <div className="flex items-center gap-1 text-xs text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{kpis.desviosEstoqueCount} desvios de inventário</span>
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-6 glass-panel rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-1 bg-amber-500"></div>
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Obras Ativas / Críticos</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{kpis.obrasAtivas} / <span className="text-amber-400">{kpis.materiaisCriticosCount}</span></h3>
            <div className="flex items-center gap-1 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Estoque abaixo do mínimo</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Charts + IA Preditiva */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Charts (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 glass-panel rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Consumo vs. Compras de Materiais</h3>
                <p className="text-xs text-slate-400">Visão histórica semanal de entradas e saídas financeiras do estoque.</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-full inline-block"></span><span className="text-slate-300">Compras</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span><span className="text-slate-300">Consumo</span></div>
              </div>
            </div>

            {/* Glowing Responsive Area Chart with Recharts */}
            <div className="h-64 w-full relative mt-4 text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="emeraldGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="compras" 
                    name="Compras"
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#cyanGlow)" 
                    activeDot={{ r: 6, fill: '#06b6d4', stroke: 'rgba(6,182,212,0.5)', strokeWidth: 4 }}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="consumo" 
                    name="Consumo"
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#emeraldGlow)" 
                    activeDot={{ r: 6, fill: '#10b981', stroke: 'rgba(16,185,129,0.5)', strokeWidth: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* IA Preditiva Alerts Panel (1/3 width on desktop) */}
        <div className="space-y-4">
          <div className="p-6 glass-panel rounded-2xl border border-indigo-500/10 relative overflow-hidden h-full flex flex-col justify-between">
            {/* Background vector glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">MTObras Preditiva (IA)</h3>
                  <p className="text-[10px] text-indigo-400 font-mono">Modelo de Ruptura & Desvio</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nossos algoritmos analisam o consumo diário apropriado nas atividades de obra para sugerir reabastecimentos automatizados e identificar anomalias.
              </p>

              {/* Alert items */}
              <div className="space-y-3 mt-4">
                {iaAlerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border text-xs leading-relaxed flex gap-2.5 ${
                      alert.urgency === 'HIGH' 
                        ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' 
                        : alert.urgency === 'MEDIUM'
                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                        : 'bg-cyan-500/5 border-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${
                      alert.urgency === 'HIGH' ? 'text-rose-400' : alert.urgency === 'MEDIUM' ? 'text-amber-400' : 'text-cyan-400'
                    }`} />
                    <p>{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 px-4 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
              Processar Sugestões de Compra
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Critical Materials List */}
      <div className="p-6 glass-panel rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Materiais Críticos / Ruptura Iminente</h3>
            <p className="text-xs text-slate-400">Itens com saldo físico abaixo do estoque mínimo definido para a obra.</p>
          </div>
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-medium font-mono">
            {materiaisCriticos.length} Alertas Ativos
          </span>
        </div>

        {/* Desktop and Mobile Responsive Card Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Obra</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Código</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Material</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Qtd Atual</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Est. Mínimo</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-center">Status Preditivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {materiaisCriticos.map((mat, idx) => (
                <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{mat.obraName}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{mat.materialCode}</td>
                  <td className="py-3 px-4">{mat.materialDesc}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-400">{mat.quantity} {mat.unit}</td>
                  <td className="py-3 px-4 text-right text-slate-400">{mat.minQty} {mat.unit}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg font-medium inline-block animate-pulse">
                      Acaba em {mat.diasRestantes} dias
                    </span>
                  </td>
                </tr>
              ))}
              {materiaisCriticos.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhum material crítico detectado no momento. Excelente gestão de canteiro!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
