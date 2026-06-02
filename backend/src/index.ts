import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

// --- IN-MEMORY DATABASE FALLBACK (Para demonstração imediata do WMS sem depender de PostgreSQL ativo) ---
let users = [
  { id: '1', email: 'proprietario@mtobras.com.br', name: 'Carlos Antunes (Proprietário)', role: 'OWNER' },
  { id: '2', email: 'engenheiro@mtobras.com.br', name: 'Marcos Souza (Engenheiro de Campo)', role: 'ENGINEER' },
  { id: '3', email: 'comprador@mtobras.com.br', name: 'Renata Lins (Comprador)', role: 'BUYER' },
  { id: '4', email: 'almoxarife@mtobras.com.br', name: 'Julio Silva (Almoxarife)', role: 'WAREHOUSE_KEEPER' },
  { id: '5', email: 'mestre@mtobras.com.br', name: 'Manoel Ramos (Mestre de Obras)', role: 'FOREMAN' }
];

let obras = [
  {
    id: 'obra-1',
    code: 'OB-001',
    name: 'Residencial Bella Vista',
    clientName: 'Bella Vista Incorporadora',
    address: 'Rua das Palmeiras, 1500, Setor Bueno - Goiânia/GO',
    budget: 2500000.0,
    status: 'ACTIVE',
    startDate: new Date('2026-01-10T12:00:00Z'),
    expectedEndDate: new Date('2026-12-20T12:00:00Z')
  },
  {
    id: 'obra-2',
    code: 'OB-002',
    name: 'Edifício Sky Tower',
    clientName: 'MTObras Empreendimentos',
    address: 'Av. Paulista, 450 - São Paulo/SP',
    budget: 8900000.0,
    status: 'ACTIVE',
    startDate: new Date('2026-03-01T12:00:00Z'),
    expectedEndDate: new Date('2027-08-30T12:00:00Z')
  }
];

let materiais = [
  { id: 'mat-1', code: 'MAT-CIM-01', description: 'Cimento CP II 50kg', category: 'Cimento e Argamassa', unit: 'SACO', averageCost: 32.50, defaultSupplier: 'Votorantim' },
  { id: 'mat-2', code: 'MAT-ACO-02', description: 'Vergalhão CA-50 10mm 12m', category: 'Aço e Ferro', unit: 'BARRA', averageCost: 45.90, defaultSupplier: 'Gerdau' },
  { id: 'mat-3', code: 'MAT-ARE-03', description: 'Areia Lavada Fina', category: 'Agregados', unit: 'M3', averageCost: 95.00, defaultSupplier: 'Mineradora Areia Pura' },
  { id: 'mat-4', code: 'MAT-BRI-04', description: 'Brita nº 1', category: 'Agregados', unit: 'M3', averageCost: 110.00, defaultSupplier: 'Britas União' },
  { id: 'mat-5', code: 'MAT-TIN-05', description: 'Tinta Acrílica Fosca Branca 18L', category: 'Acabamento', unit: 'LATA', averageCost: 280.00, defaultSupplier: 'Suvinil' }
];

// Estoques consolidados por obra
let estoques = [
  { id: 'est-1', obraId: 'obra-1', materialId: 'mat-1', quantity: 240.0, reservedQty: 40.0, minQty: 100.0, avgConsumption: 600.0 },
  { id: 'est-2', obraId: 'obra-1', materialId: 'mat-2', quantity: 85.0, reservedQty: 10.0, minQty: 50.0, avgConsumption: 120.0 },
  { id: 'est-3', obraId: 'obra-1', materialId: 'mat-3', quantity: 12.0, reservedQty: 0.0, minQty: 15.0, avgConsumption: 45.0 }, // Crítico! (Abaixo do mínimo)
  { id: 'est-4', obraId: 'obra-2', materialId: 'mat-1', quantity: 450.0, reservedQty: 100.0, minQty: 200.0, avgConsumption: 1200.0 },
  { id: 'est-5', obraId: 'obra-2', materialId: 'mat-2', quantity: 300.0, reservedQty: 50.0, minQty: 100.0, avgConsumption: 500.0 }
];

// Endereçamentos logísticos de WMS Simplificado para Canteiro
let enderecosEstoque = [
  { id: 'end-1', estoqueObraId: 'est-1', local: 'Sala de Cimento', subLocal: 'Pilha A1', quantity: 140.0 },
  { id: 'end-2', estoqueObraId: 'est-1', local: 'Sala de Cimento', subLocal: 'Pilha A2', quantity: 100.0 },
  { id: 'end-3', estoqueObraId: 'est-2', local: 'Pátio Externo', subLocal: 'Área Aberta Sul', quantity: 85.0 },
  { id: 'end-4', estoqueObraId: 'est-3', local: 'Pátio Externo', subLocal: 'Baia de Areia', quantity: 12.0 }
];

// Fluxos de Solicitação de Materiais
let solicitacoes = [
  {
    id: 'sol-1',
    obraId: 'obra-1',
    requesterId: '5', // Mestre de obras
    approverId: '2', // Engenheiro
    status: 'APROVADO',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T10:30:00Z'),
    items: [
      { id: 'sol-item-1', materialId: 'mat-1', quantity: 40.0 },
      { id: 'sol-item-2', materialId: 'mat-2', quantity: 10.0 }
    ]
  },
  {
    id: 'sol-2',
    obraId: 'obra-1',
    requesterId: '5',
    approverId: null,
    status: 'SOLICITADO',
    createdAt: new Date('2026-06-02T07:15:00Z'),
    updatedAt: new Date('2026-06-02T07:15:00Z'),
    items: [
      { id: 'sol-item-3', materialId: 'mat-3', quantity: 20.0 }
    ]
  }
];

// Compras e Cotações
let pedidosCompra = [
  {
    id: 'ped-1',
    solicitacaoId: 'sol-1',
    buyerId: '3',
    supplierName: 'Distribuidora Liderança',
    status: 'PEDIDO_GERADO',
    freightCost: 150.00,
    deliveryTerms: 'CIF - Entrega em 3 dias',
    createdAt: new Date('2026-06-01T14:00:00Z'),
    updatedAt: new Date('2026-06-01T14:00:00Z'),
    items: [
      { id: 'ped-item-1', materialId: 'mat-1', qtyOrdered: 40.0, qtyReceived: 0.0, priceUnit: 31.00 },
      { id: 'ped-item-2', materialId: 'mat-2', qtyOrdered: 10.0, qtyReceived: 0.0, priceUnit: 44.50 }
    ]
  }
];

// Consumos Diários
let consumos = [
  { id: 'con-1', obraId: 'obra-1', materialId: 'mat-1', quantity: 20.0, team: 'Alvenaria', responsibleId: '5', activity: 'Fechamento de paredes bloco 1', date: new Date('2026-06-01T16:00:00Z') },
  { id: 'con-2', obraId: 'obra-1', materialId: 'mat-1', quantity: 15.0, team: 'Concretagem', responsibleId: '5', activity: 'Fundações da guarita', date: new Date('2026-06-02T08:30:00Z') }
];

// Inventários Cíclicos / Rotativos
let inventarios = [
  {
    id: 'inv-1',
    obraId: 'obra-1',
    type: 'ROTATIVO',
    status: 'CONCLUIDO',
    date: new Date('2026-05-28T14:00:00Z'),
    items: [
      { id: 'inv-item-1', materialId: 'mat-1', qtySystem: 275.0, qtyPhysical: 275.0, diff: 0.0 },
      { id: 'inv-item-2', materialId: 'mat-2', qtySystem: 100.0, qtyPhysical: 95.0, diff: -5.0 } // Desvio de 5 unidades perdidas
    ]
  }
];

// Equipamentos
let equipamentos = [
  { id: 'eq-1', code: 'BET-001', name: 'Betoneira 400L', type: 'Concretagem', status: 'EM_USO', obraId: 'obra-1' },
  { id: 'eq-2', code: 'BET-002', name: 'Betoneira 400L', type: 'Concretagem', status: 'DISPONIVEL', obraId: null },
  { id: 'eq-3', code: 'FUR-001', name: 'Martelete Rompedor Bosch', type: 'Ferramentas Elétricas', status: 'EM_USO', obraId: 'obra-1' },
  { id: 'eq-4', code: 'AND-010', name: 'Andaime Metálico 1.5m (Jogo)', type: 'Estruturas', status: 'MANUTENCAO', obraId: null }
];


// --- ROTAS DO SISTEMA ---

// 1. Dashboard Executivo KPIs
app.get('/api/dashboard', (req, res) => {
  // Calcular totais
  const valorComprado = pedidosCompra.reduce((acc, ped) => {
    return acc + ped.items.reduce((accI, item) => accI + (item.qtyOrdered * item.priceUnit), 0) + ped.freightCost;
  }, 0);

  const valorConsumido = consumos.reduce((acc, con) => {
    const mat = materiais.find(m => m.id === con.materialId);
    const custo = mat ? mat.averageCost : 0;
    return acc + (con.quantity * custo);
  }, 0);

  // Valor perdido (desvios nos inventários)
  const valorPerdido = inventarios.reduce((acc, inv) => {
    return acc + inv.items.reduce((accI, item) => {
      if (item.diff < 0) {
        const mat = materiais.find(m => m.id === item.materialId);
        const custo = mat ? mat.averageCost : 0;
        return accI + (Math.abs(item.diff) * custo);
      }
      return accI;
    }, 0);
  }, 0);

  // Materiais Críticos (Abaixo do estoque mínimo)
  const materiaisCriticos = estoques
    .filter(est => est.quantity <= est.minQty)
    .map(est => {
      const mat = materiais.find(m => m.id === est.materialId);
      const obra = obras.find(o => o.id === est.obraId);
      return {
        obraName: obra ? obra.name : 'Desconhecida',
        materialCode: mat ? mat.code : 'N/A',
        materialDesc: mat ? mat.description : 'Desconhecido',
        quantity: est.quantity,
        minQty: est.minQty,
        unit: mat ? mat.unit : 'UN',
        diasRestantes: Math.max(0, Math.round((est.quantity / (est.avgConsumption / 30))))
      };
    });

  // Alertas de IA Preditiva (Simulação)
  const iaAlerts = [
    { type: 'RUPTURA', message: 'Atenção: Estoque de Areia Lavada Fina na Obra Residencial Bella Vista acabará em aproximadamente 5 dias.', urgency: 'HIGH' },
    { type: 'DESVIO', message: 'Alerta de Consumo: O uso de Cimento CP II na Obra Edifício Sky Tower está 22% acima do cronograma projetado de alvenaria.', urgency: 'MEDIUM' },
    { type: 'SUGESTAO', message: 'Recomendamos efetuar compra de 80 sacos de Cimento CP II para a Obra Residencial Bella Vista para garantir os próximos 15 dias de reboco.', urgency: 'LOW' }
  ];

  res.json({
    kpis: {
      valorComprado,
      valorConsumido,
      valorPerdido,
      obrasAtivas: obras.filter(o => o.status === 'ACTIVE').length,
      desviosEstoqueCount: inventarios.reduce((acc, inv) => acc + inv.items.filter(item => item.diff !== 0).length, 0),
      materiaisCriticosCount: materiaisCriticos.length
    },
    materiaisCriticos,
    iaAlerts
  });
});

// 2. Gestão de Obras
app.get('/api/obras', (req, res) => {
  res.json(obras);
});

app.post('/api/obras', (req, res) => {
  const newObra = {
    id: `obra-${obras.length + 1}`,
    code: req.body.code || `OB-00${obras.length + 1}`,
    name: req.body.name,
    clientName: req.body.clientName || '',
    address: req.body.address || '',
    budget: parseFloat(req.body.budget) || 0,
    status: 'ACTIVE',
    startDate: new Date(req.body.startDate || new Date()),
    expectedEndDate: new Date(req.body.expectedEndDate || new Date())
  };
  obras.push(newObra);
  res.status(201).json(newObra);
});

// 3. Gestão de Materiais
app.get('/api/materiais', (req, res) => {
  res.json(materiais);
});

app.post('/api/materiais', (req, res) => {
  const newMaterial = {
    id: `mat-${materiais.length + 1}`,
    code: req.body.code || `MAT-NEW-${materiais.length + 1}`,
    description: req.body.description,
    category: req.body.category || 'Geral',
    unit: req.body.unit || 'UN',
    averageCost: parseFloat(req.body.averageCost) || 0.0,
    defaultSupplier: req.body.defaultSupplier || ''
  };
  materiais.push(newMaterial);
  res.status(201).json(newMaterial);
});

// 4. Estoque e Endereçamento (WMS)
app.get('/api/estoque/:obraId', (req, res) => {
  const { obraId } = req.params;
  const filteredEstoque = estoques.filter(est => est.obraId === obraId).map(est => {
    const mat = materiais.find(m => m.id === est.materialId);
    const endLocados = enderecosEstoque.filter(e => e.estoqueObraId === est.id);
    return {
      ...est,
      materialCode: mat ? mat.code : 'N/A',
      materialDesc: mat ? mat.description : 'Desconhecido',
      materialCategory: mat ? mat.category : 'N/A',
      unit: mat ? mat.unit : 'UN',
      enderecos: endLocados
    };
  });
  res.json(filteredEstoque);
});

// Registrar ou alterar o endereçamento logístico físico
app.post('/api/estoque/enderecar', (req, res) => {
  const { estoqueObraId, local, subLocal, quantity } = req.body;
  
  // Buscar se já existe esse endereço
  const idx = enderecosEstoque.findIndex(e => 
    e.estoqueObraId === estoqueObraId &&
    e.local === local &&
    e.subLocal === subLocal
  );

  if (idx !== -1) {
    enderecosEstoque[idx].quantity = parseFloat(quantity);
  } else {
    enderecosEstoque.push({
      id: `end-${enderecosEstoque.length + 1}`,
      estoqueObraId,
      local,
      subLocal: subLocal || null,
      quantity: parseFloat(quantity)
    });
  }

  // Recalcular saldo total consolidado
  const total = enderecosEstoque
    .filter(e => e.estoqueObraId === estoqueObraId)
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const estIdx = estoques.findIndex(est => est.id === estoqueObraId);
  if (estIdx !== -1) {
    estoques[estIdx].quantity = total;
  }

  res.json({ message: 'Endereçamento atualizado e saldo consolidado recalculado.', totalQuantity: total });
});

// 5. Solicitações de Materiais
app.get('/api/solicitacoes', (req, res) => {
  const formatted = solicitacoes.map(sol => {
    const obra = obras.find(o => o.id === sol.obraId);
    const reqUser = users.find(u => u.id === sol.requesterId);
    const appUser = users.find(u => u.id === sol.approverId);
    const enrichedItems = sol.items.map(item => {
      const mat = materiais.find(m => m.id === item.materialId);
      return {
        ...item,
        code: mat ? mat.code : 'N/A',
        description: mat ? mat.description : 'Desconhecido',
        unit: mat ? mat.unit : 'UN'
      };
    });
    return {
      ...sol,
      obraName: obra ? obra.name : 'N/A',
      requesterName: reqUser ? reqUser.name : 'N/A',
      approverName: appUser ? appUser.name : 'Pendente',
      items: enrichedItems
    };
  });
  res.json(formatted);
});

app.post('/api/solicitacoes', (req, res) => {
  const { obraId, requesterId, items } = req.body;
  const newSol = {
    id: `sol-${solicitacoes.length + 1}`,
    obraId,
    requesterId,
    approverId: null,
    status: 'SOLICITADO' as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: items.map((item: any, index: number) => ({
      id: `sol-item-new-${solicitacoes.length + 1}-${index}`,
      materialId: item.materialId,
      quantity: parseFloat(item.quantity)
    }))
  };
  solicitacoes.push(newSol);
  res.status(201).json(newSol);
});

// Aprovação de Solicitação
app.post('/api/solicitacoes/:id/aprovar', (req, res) => {
  const { id } = req.params;
  const { approverId } = req.body;
  
  const idx = solicitacoes.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Solicitação não encontrada' });

  solicitacoes[idx].status = 'APROVADO';
  solicitacoes[idx].approverId = approverId;
  solicitacoes[idx].updatedAt = new Date();

  // Bloquear e reservar saldos
  solicitacoes[idx].items.forEach(item => {
    const estIdx = estoques.findIndex(e => e.obraId === solicitacoes[idx].obraId && e.materialId === item.materialId);
    if (estIdx !== -1) {
      estoques[estIdx].reservedQty += item.quantity;
    }
  });

  res.json({ message: 'Solicitação aprovada e saldos reservados no WMS.', solicitacao: solicitacoes[idx] });
});

// 6. Compras e Cotações
app.get('/api/compras', (req, res) => {
  const formatted = pedidosCompra.map(ped => {
    const enrichedItems = ped.items.map(item => {
      const mat = materiais.find(m => m.id === item.materialId);
      return {
        ...item,
        code: mat ? mat.code : 'N/A',
        description: mat ? mat.description : 'Desconhecido',
        unit: mat ? mat.unit : 'UN'
      };
    });
    return {
      ...ped,
      items: enrichedItems
    };
  });
  res.json(formatted);
});

app.post('/api/compras', (req, res) => {
  const { solicitacaoId, buyerId, supplierName, freightCost, deliveryTerms, items } = req.body;
  const newPed = {
    id: `ped-${pedidosCompra.length + 1}`,
    solicitacaoId: solicitacaoId || null,
    buyerId,
    supplierName,
    status: 'PEDIDO_GERADO' as any,
    freightCost: parseFloat(freightCost) || 0.0,
    deliveryTerms: deliveryTerms || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: items.map((item: any, idx: number) => ({
      id: `ped-item-new-${pedidosCompra.length + 1}-${idx}`,
      materialId: item.materialId,
      qtyOrdered: parseFloat(item.qtyOrdered),
      qtyReceived: 0.0,
      priceUnit: parseFloat(item.priceUnit)
    }))
  };
  pedidosCompra.push(newPed);
  res.status(201).json(newPed);
});

// 7. Recebimento e Conferência WMS (Divergências)
app.post('/api/recebimento', (req, res) => {
  const { pedidoId, itemsRecebidos, obraId, local, subLocal } = req.body;
  
  const pedIdx = pedidosCompra.findIndex(p => p.id === pedidoId);
  if (pedIdx === -1) return res.status(404).json({ error: 'Pedido não encontrado.' });

  let hasDivergence = false;
  const divergenciasList: any[] = [];

  itemsRecebidos.forEach((itemRec: any) => {
    const itemIdx = pedidosCompra[pedIdx].items.findIndex(i => i.materialId === itemRec.materialId);
    if (itemIdx !== -1) {
      const ordered = pedidosCompra[pedIdx].items[itemIdx].qtyOrdered;
      const received = parseFloat(itemRec.qtyReceived);
      
      pedidosCompra[pedIdx].items[itemIdx].qtyReceived += received;

      if (ordered !== received) {
        hasDivergence = true;
        divergenciasList.push({
          materialId: itemRec.materialId,
          ordered,
          received,
          diff: received - ordered
        });
      }

      // Adicionar entrada ao WMS da Obra
      let estIdx = estoques.findIndex(e => e.obraId === obraId && e.materialId === itemRec.materialId);
      if (estIdx === -1) {
        // Criar estoque consolidado se não existir
        const newEstId = `est-${estoques.length + 1}`;
        estoques.push({
          id: newEstId,
          obraId,
          materialId: itemRec.materialId,
          quantity: received,
          reservedQty: 0.0,
          minQty: 10.0,
          avgConsumption: 30.0
        });
        estIdx = estoques.length - 1;
      } else {
        estoques[estIdx].quantity += received;
      }

      // Adicionar ao Endereçamento do WMS físico da Obra
      const estObra = estoques[estIdx];
      const endIdx = enderecosEstoque.findIndex(e => 
        e.estoqueObraId === estObra.id &&
        e.local === local &&
        e.subLocal === subLocal
      );

      if (endIdx !== -1) {
        enderecosEstoque[endIdx].quantity += received;
      } else {
        enderecosEstoque.push({
          id: `end-${enderecosEstoque.length + 1}`,
          estoqueObraId: estObra.id,
          local,
          subLocal: subLocal || null,
          quantity: received
        });
      }
    }
  });

  pedidosCompra[pedIdx].status = hasDivergence ? 'PARCIALMENTE_RECEBIDO' : 'RECEBIDO';
  pedidosCompra[pedIdx].updatedAt = new Date();

  // Se houver uma solicitação atrelada, dar baixa nas reservas
  const solId = pedidosCompra[pedIdx].solicitacaoId;
  if (solId) {
    const solIdx = solicitacoes.findIndex(s => s.id === solId);
    if (solIdx !== -1) {
      solicitacoes[solIdx].status = 'RECEBIDO';
      solicitacoes[solIdx].items.forEach(item => {
        const estIdx = estoques.findIndex(e => e.obraId === obraId && e.materialId === item.materialId);
        if (estIdx !== -1) {
          estoques[estIdx].reservedQty = Math.max(0, estoques[estIdx].reservedQty - item.quantity);
        }
      });
    }
  }

  res.json({
    message: 'Recebimento concluído com endereçamento físico lógico.',
    status: pedidosCompra[pedIdx].status,
    hasDivergence,
    divergenciasList
  });
});

// 8. Controle de Consumo Diário por Equipe
app.get('/api/consumo', (req, res) => {
  const formatted = consumos.map(con => {
    const mat = materiais.find(m => m.id === con.materialId);
    const obra = obras.find(o => o.id === con.obraId);
    const user = users.find(u => u.id === con.responsibleId);
    return {
      ...con,
      materialDesc: mat ? mat.description : 'Desconhecido',
      unit: mat ? mat.unit : 'UN',
      obraName: obra ? obra.name : 'N/A',
      responsibleName: user ? user.name : 'N/A'
    };
  });
  res.json(formatted);
});

app.post('/api/consumo', (req, res) => {
  const { obraId, materialId, quantity, team, responsibleId, activity } = req.body;
  const qty = parseFloat(quantity);

  // Validar se há estoque consolidado na obra
  const estIdx = estoques.findIndex(e => e.obraId === obraId && e.materialId === materialId);
  if (estIdx === -1 || estoques[estIdx].quantity < qty) {
    return res.status(400).json({ error: 'Estoque físico insuficiente no canteiro para esta retirada.' });
  }

  // Deduzir do estoque consolidado
  estoques[estIdx].quantity -= qty;

  // Deduzir do endereçamento do WMS físico por ordem (FIFO / esvaziar posições)
  let remainingToDeduct = qty;
  const ends = enderecosEstoque.filter(e => e.estoqueObraId === estoques[estIdx].id && e.quantity > 0);
  
  for (const end of ends) {
    if (remainingToDeduct <= 0) break;
    const toDeduct = Math.min(end.quantity, remainingToDeduct);
    end.quantity -= toDeduct;
    remainingToDeduct -= toDeduct;
  }

  // Registrar consumo
  const newConsumo = {
    id: `con-${consumos.length + 1}`,
    obraId,
    materialId,
    quantity: qty,
    team,
    responsibleId,
    activity,
    date: new Date()
  };
  consumos.push(newConsumo);

  res.status(201).json({ message: 'Consumo registrado e deduzido do estoque endereçado.', consumo: newConsumo });
});

// 9. Inventários Cíclicos / Rotativos
app.get('/api/inventarios', (req, res) => {
  const formatted = inventarios.map(inv => {
    const obra = obras.find(o => o.id === inv.obraId);
    const enrichedItems = inv.items.map(item => {
      const mat = materiais.find(m => m.id === item.materialId);
      return {
        ...item,
        code: mat ? mat.code : 'N/A',
        description: mat ? mat.description : 'Desconhecido',
        unit: mat ? mat.unit : 'UN'
      };
    });
    return {
      ...inv,
      obraName: obra ? obra.name : 'N/A',
      items: enrichedItems
    };
  });
  res.json(formatted);
});

app.post('/api/inventarios', (req, res) => {
  const { obraId, type, itemsContados } = req.body;
  
  const newInv = {
    id: `inv-${inventarios.length + 1}`,
    obraId,
    type,
    status: 'CONCLUIDO',
    date: new Date(),
    items: itemsContados.map((item: any, index: number) => {
      // Buscar saldo do sistema atual
      const est = estoques.find(e => e.obraId === obraId && e.materialId === item.materialId);
      const qtySystem = est ? est.quantity : 0.0;
      const qtyPhysical = parseFloat(item.qtyPhysical);
      const diff = qtyPhysical - qtySystem;

      // Se houver desvio, ajustar o estoque consolidado no sistema de imediato
      if (est) {
        const estIdx = estoques.findIndex(e => e.id === est.id);
        estoques[estIdx].quantity = qtyPhysical;

        // Ajustar também o primeiro endereço físico correspondente
        const end = enderecosEstoque.find(e => e.estoqueObraId === est.id);
        if (end) {
          const endIdx = enderecosEstoque.findIndex(e => e.id === end.id);
          enderecosEstoque[endIdx].quantity = Math.max(0, end.quantity + diff);
        }
      }

      return {
        id: `inv-item-${inventarios.length + 1}-${index}`,
        materialId: item.materialId,
        qtySystem,
        qtyPhysical,
        diff
      };
    })
  };

  inventarios.push(newInv);
  res.status(201).json(newInv);
});

// 10. Gestão de Equipamentos
app.get('/api/equipamentos', (req, res) => {
  const formatted = equipamentos.map(eq => {
    const obra = obras.find(o => o.id === eq.obraId);
    return {
      ...eq,
      obraName: obra ? obra.name : 'Almoxarifado Central (Livre)'
    };
  });
  res.json(formatted);
});

app.post('/api/equipamentos/:id/alocar', (req, res) => {
  const { id } = req.params;
  const { obraId } = req.body;

  const idx = equipamentos.findIndex(eq => eq.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Equipamento não encontrado.' });

  equipamentos[idx].obraId = obraId || null;
  equipamentos[idx].status = obraId ? 'EM_USO' : 'DISPONIVEL';

  res.json({ message: 'Alocação de equipamento atualizada.', equipamento: equipamentos[idx] });
});


// Iniciar o Servidor
app.listen(port, () => {
  console.log(`[BACKEND] WMS de Obras rodando em http://localhost:${port}`);
});
