import React, { useState } from 'react';
import { Package, CheckCircle, ArrowLeft, Search, Plus, Minus } from 'lucide-react';

interface Material {
  id: string;
  code: string;
  description: string;
  category: string;
  unit: string;
}

interface MestreObrasAppProps {
  obras: any[];
  materiais: Material[];
  onExit: () => void;
  onSolicitar: (obraId: string, materialId: string, quantity: number) => Promise<boolean>;
}

export default function MestreObrasApp({ obras, materiais, onExit, onSolicitar }: MestreObrasAppProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Categoria, 2: Material, 3: Quantidade, 4: Sucesso
  
  const [selectedObraId, setSelectedObraId] = useState<string>(obras.length > 0 ? obras[0].id : '');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Array.from(new Set(materiais.map(m => m.category)));

  const filteredMaterials = materiais.filter(m => 
    m.category === selectedCategory && 
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setStep(2);
  };

  const handleSelectMaterial = (mat: Material) => {
    setSelectedMaterial(mat);
    setQuantity(1);
    setStep(3);
  };

  const handleConfirm = async () => {
    if (!selectedMaterial || !selectedObraId) return;
    setLoading(true);
    const success = await onSolicitar(selectedObraId, selectedMaterial.id, quantity);
    setLoading(false);
    if (success) {
      setStep(4);
    } else {
      alert("Falha ao realizar solicitação.");
    }
  };

  const resetFlow = () => {
    setSelectedCategory('');
    setSelectedMaterial(null);
    setQuantity(1);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden border-x border-white/5">
      
      {/* Header Mobile */}
      <header className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between z-10 shadow-md">
        <div className="flex items-center gap-2">
          {step > 1 && step < 4 && (
            <button onClick={() => setStep(prev => (prev - 1) as any)} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition">
              <ArrowLeft className="w-5 h-5 text-cyan-400" />
            </button>
          )}
          <span className="font-extrabold text-white text-lg tracking-tight">MTObras</span>
        </div>
        
        {step < 4 && (
          <select 
            value={selectedObraId} 
            onChange={e => setSelectedObraId(e.target.value)}
            className="bg-slate-800 text-xs text-slate-300 border border-white/10 rounded px-2 py-1 max-w-[120px] truncate"
          >
            {obras.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-6 relative z-0">
        
        {/* Step 1: Seleção de Categoria */}
        {step === 1 && (
          <div className="p-5 space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-white">Qual material você precisa?</h2>
            <p className="text-slate-400 text-sm">Selecione uma categoria para começar.</p>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 active:scale-95 transition shadow-lg active:from-cyan-900/50"
                >
                  <Package className="w-8 h-8 text-cyan-400" />
                  <span className="font-bold text-sm text-center line-clamp-2">{cat}</span>
                </button>
              ))}
              {categories.length === 0 && (
                <p className="col-span-2 text-center text-slate-500 py-10">Nenhum material no catálogo.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Seleção do Material */}
        {step === 2 && (
          <div className="p-5 space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-white">Selecione o Insumo</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder={`Buscar em ${selectedCategory}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition"
              />
            </div>
            
            <div className="space-y-2 mt-4">
              {filteredMaterials.map(mat => (
                <button
                  key={mat.id}
                  onClick={() => handleSelectMaterial(mat)}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition active:bg-slate-800 text-left"
                >
                  <div>
                    <h4 className="font-bold text-white text-base">{mat.description}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{mat.code}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 text-cyan-400 rotate-180" />
                  </div>
                </button>
              ))}
              {filteredMaterials.length === 0 && (
                <p className="text-center text-slate-500 py-10">Nenhum material encontrado.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Quantidade */}
        {step === 3 && selectedMaterial && (
          <div className="p-5 space-y-8 animate-fade-in flex flex-col h-full justify-between">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">{selectedMaterial.description}</h2>
                <p className="text-slate-400 text-sm mt-1">{selectedCategory} • Unidade: <span className="font-bold text-cyan-400">{selectedMaterial.unit}</span></p>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-6 shadow-inner">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Quantidade Necessária</span>
                
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center active:scale-95 active:bg-slate-700 transition shadow-lg"
                  >
                    <Minus className="w-6 h-6 text-white" />
                  </button>
                  
                  <div className="w-24 text-center">
                    <input 
                      type="number"
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-full bg-transparent text-center text-4xl font-black text-white outline-none"
                    />
                  </div>

                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-14 h-14 rounded-full bg-cyan-600 border border-cyan-500 flex items-center justify-center active:scale-95 active:bg-cyan-500 transition shadow-lg shadow-cyan-500/20"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl font-black text-lg text-white shadow-xl shadow-emerald-900/50 active:scale-95 transition flex items-center justify-center gap-2 mt-auto"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  CONFIRMAR PEDIDO
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Sucesso */}
        {step === 4 && (
          <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in pt-20">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black text-white">Pedido Enviado!</h2>
            <p className="text-slate-400 text-lg">O almoxarifado já recebeu sua solicitação e fará a separação.</p>
            
            <button 
              onClick={resetFlow}
              className="w-full py-4 mt-8 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
            >
              Fazer Nova Solicitação
            </button>
          </div>
        )}

      </main>

      {/* Sair do Modo Mobile (Apenas para demonstração) */}
      <div className="absolute bottom-4 right-4 z-50">
         <button onClick={onExit} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg backdrop-blur hover:bg-rose-500/20 transition">
           Sair Modo Mobile
         </button>
      </div>
    </div>
  );
}
