import express from 'express';
import cors from 'cors';
import { PrismaClient, Role, UnidadeMedida, ObraStatus, RequestStatus, PurchaseStatus, EquipStatus } from '@prisma/client';
import { tenantMiddleware } from './infrastructure/http/middlewares/tenantMiddleware';
import { errorHandler } from './infrastructure/http/errorHandler';
import { EstoqueController } from './infrastructure/http/controllers/EstoqueController';
import { AlocacaoEquipamentoController } from './infrastructure/http/controllers/AlocacaoEquipamentoController';
import { AprovacaoSolicitacaoController } from './infrastructure/http/controllers/AprovacaoSolicitacaoController';
import equipamentoRoutes from './infrastructure/http/routes/equipamentoRoutes';
import solicitacaoRoutes from './infrastructure/http/routes/solicitacaoRoutes';
import compraRoutes from './infrastructure/http/routes/compraRoutes';
import inventarioRoutes from './infrastructure/http/routes/inventarioRoutes';

// Exported app for testing
export const app = express();
app.use(cors());
app.use(express.json());
// Register modular routes
import routes from './infrastructure/http/routes';
app.use('/api/v1', routes);
app.use(errorHandler);

// Swagger documentation
import setupSwagger from './infrastructure/http/swagger';
setupSwagger(app);
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Auth routes (unprotected)
import { authRoutes } from './infrastructure/http/routes/authRoutes';
app.use('/api/auth', authRoutes);

// --- TENANT MIDDLEWARE (moved to separate file) ---
app.use(tenantMiddleware);

// --- ROTAS DO SISTEMA ---

// 1. Dashboard Executivo KPIs
app.get('/api/dashboard', async (req, res) => {
  const tenantId = (req as any).tenantId;

  try {
    // Calcular totais
    const pcItems = await prisma.pedidoItem.findMany({
      where: { pedido: { tenantId } },
    });
    const pcFreight = await prisma.pedidoCompra.aggregate({
      where: { tenantId },
      _sum: { freightCost: true }
    });
    const valorComprado = pcItems.reduce((acc, item) => acc + (item.qtyOrdered * item.priceUnit), 0) + (pcFreight._sum.freightCost || 0);

    const consumos = await prisma.movimentacaoConsumo.findMany({
      where: { tenantId },
      include: { material: true }
    });
    const valorConsumido = consumos.reduce((acc, con) => acc + (con.quantity * (con.material?.averageCost || 0)), 0);

    // Valor perdido (desvios negativos nos inventários)
    const invItems = await prisma.inventarioItem.findMany({
      where: { inventario: { tenantId }, diff: { lt: 0 } },
      include: { material: true }
    });
    const valorPerdido = invItems.reduce((acc, item) => acc + (Math.abs(item.diff) * (item.material?.averageCost || 0)), 0);

    // Quantidade de obras ativas
    const obrasAtivasCount = await prisma.obra.count({
      where: { tenantId, status: 'ACTIVE' }
    });

    // Quantidade de desvios de estoque
    const desviosEstoqueCount = await prisma.inventarioItem.count({
      where: { inventario: { tenantId }, diff: { not: 0 } }
    });

    // Materiais Críticos (Abaixo do estoque mínimo)
    const allEstoques = await prisma.estoqueObra.findMany({
      where: { obra: { tenantId } },
      include: { material: true, obra: true }
    });
    
    const materiaisCriticos = allEstoques
      .filter(est => est.quantity <= est.minQty)
      .map(est => {
        const diasRestantes = est.avgConsumption > 0 
          ? Math.max(0, Math.round((est.quantity / (est.avgConsumption / 30)))) 
          : 999;
        return {
          obraName: est.obra.name,
          materialCode: est.material.code,
          materialDesc: est.material.description,
          quantity: est.quantity,
          minQty: est.minQty,
          unit: est.material.unit,
          diasRestantes
        };
      });

    // Alertas de IA Preditiva baseados em dados reais
    const iaAlerts = [];
    
    materiaisCriticos.forEach(mat => {
      if (mat.diasRestantes <= 7) {
        iaAlerts.push({
          type: 'RUPTURA',
          message: `Atenção: Estoque de ${mat.materialDesc} na Obra ${mat.obraName} acabará em aproximadamente ${mat.diasRestantes} dias.`,
          urgency: 'HIGH'
        });
      }
    });

    // Alertas padrão se não houver dados críticos
    if (iaAlerts.length === 0) {
      iaAlerts.push({
        type: 'SUGESTAO',
        message: 'Níveis de estoques estáveis nos canteiros. Continue monitorando via inventários cíclicos.',
        urgency: 'LOW'
      });
    } else {
      iaAlerts.push({
        type: 'SUGESTAO',
        message: 'Recomendamos iniciar solicitações de compras emergenciais para cobrir os itens em ruptura iminente.',
        urgency: 'MEDIUM'
      });
    }

    res.json({
      kpis: {
        valorComprado,
        valorConsumido,
        valorPerdido,
        obrasAtivas: obrasAtivasCount,
        desviosEstoqueCount,
        materiaisCriticosCount: materiaisCriticos.length
      },
      materiaisCriticos,
      iaAlerts
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: 'Erro interno ao calcular KPIs do dashboard.' });
  }
});

// 2. Gestão de Obras
app.get('/api/obras', async (req, res) => {
  const tenantId = (req as any).tenantId;
  try {
    const list = await prisma.obra.findMany({
      where: { tenantId }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar obras' });
  }
});

app.post('/api/obras', async (req, res) => {
  const tenantId = (req as any).tenantId;
  const { code, name, clientName, address, budget, startDate, expectedEndDate } = req.body;
  try {
    const newObra = await prisma.obra.create({
      data: {
        tenantId,
        code: code || `OB-NEW-${Date.now().toString().slice(-4)}`,
        name,
        clientName: clientName || '',
        address: address || '',
        budget: parseFloat(budget) || 0.0,
        status: ObraStatus.ACTIVE,
        startDate: new Date(startDate || new Date()),
        expectedEndDate: new Date(expectedEndDate || new Date())
      }
    });
    res.status(201).json(newObra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar obra' });
  }
});

// 3. Gestão de Materiais
app.get('/api/materiais', async (req, res) => {
  const tenantId = (req as any).tenantId;
  try {
    const list = await prisma.material.findMany({
      where: { tenantId }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar materiais' });
  }
});

app.post('/api/materiais', async (req, res) => {
  const tenantId = (req as any).tenantId;
  const { code, description, category, unit, averageCost, defaultSupplier } = req.body;
  try {
    const newMaterial = await prisma.material.create({
      data: {
        tenantId,
        code: code || `MAT-NEW-${Date.now().toString().slice(-4)}`,
        description,
        category: category || 'Geral',
        unit: unit as UnidadeMedida,
        averageCost: parseFloat(averageCost) || 0.0,
        defaultSupplier: defaultSupplier || ''
      }
    });
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar material' });
  }
});

// 4. Estoque e Endereçamento (WMS)
app.get('/api/estoque', async (req, res) => {
  const tenantId = (req as any).tenantId;
  try {
    const list = await prisma.estoqueObra.findMany({
      where: { obra: { tenantId } },
      include: {
        material: true,
        obra: true
      }
    });

    const mapped = list.map(est => ({
      id: est.id,
      obraId: est.obraId,
      obraName: est.obra.name,
      materialId: est.materialId,
      quantity: est.quantity,
      reservedQty: est.reservedQty,
      minQty: est.minQty,
      avgConsumption: est.avgConsumption,
      materialCode: est.material.code,
      materialDesc: est.material.description,
      materialCategory: est.material.category,
      unit: est.material.unit
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar estoque consolidado.' });
  }
});

app.get('/api/estoque/:obraId', async (req, res) => {
  const { obraId } = req.params;
  try {
    const filteredEstoque = await prisma.estoqueObra.findMany({
      where: { obraId },
      include: {
        material: true,
        enderecos: true
      }
    });

    // Adaptar para a assinatura de resposta esperada pelo frontend
    const mapped = filteredEstoque.map(est => ({
      id: est.id,
      obraId: est.obraId,
      materialId: est.materialId,
      quantity: est.quantity,
      reservedQty: est.reservedQty,
      minQty: est.minQty,
      avgConsumption: est.avgConsumption,
      materialCode: est.material.code,
      materialDesc: est.material.description,
      materialCategory: est.material.category,
      unit: est.material.unit,
      enderecos: est.enderecos.map(end => ({
        id: end.id,
        estoqueObraId: end.estoqueObraId,
        local: end.local,
        subLocal: end.subLocal,
        quantity: end.quantity
      }))
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar estoque da obra.' });
  }
});

// Registrar ou alterar o endereçamento logístico físico
app.post('/api/estoque/enderecar', async (req, res) => {
  const { estoqueObraId, local, subLocal, quantity } = req.body;
  const qty = parseFloat(quantity) || 0.0;

  try {
    // Usar transação para garantir integridade física/lógica
    const result = await prisma.$transaction(async (tx) => {
      // Buscar ou atualizar endereço
      const key = { estoqueObraId, local, subLocal: subLocal || null };
      
      const existing = await tx.enderecamentoEstoque.findFirst({
        where: key
      });

      if (existing) {
        await tx.enderecamentoEstoque.update({
          where: { id: existing.id },
          data: { quantity: qty }
        });
      } else {
        await tx.enderecamentoEstoque.create({
          data: {
            estoqueObraId,
            local,
            subLocal: subLocal || null,
            quantity: qty
          }
        });
      }

      // Recalcular saldo total consolidado
      const allAddresses = await tx.enderecamentoEstoque.findMany({
        where: { estoqueObraId }
      });

      const totalQuantity = allAddresses.reduce((acc, curr) => acc + curr.quantity, 0);

      // Atualizar saldo consolidado no EstoqueObra
      await tx.estoqueObra.update({
        where: { id: estoqueObraId },
        data: { quantity: totalQuantity }
      });

      return totalQuantity;
    });

    res.json({ message: 'Endereçamento atualizado e saldo consolidado recalculado.', totalQuantity: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar o endereçamento logístico.' });
  }
});
app.post('/api/estoque', EstoqueController.create);
app.put('/api/estoque/:id/quantity', EstoqueController.updateQuantity);

// 5. Solicitações de Materiais
app.get('/api/solicitacoes', async (req, res) => {
  const tenantId = (req as any).tenantId;
  try {
    const list = await prisma.solicitacaoMaterial.findMany({
      where: { tenantId },
      include: {
        obra: true,
        requester: true,
        approver: true,
        items: {
          include: {
            material: true
          }
        }
      }
    });

    const formatted = list.map(sol => ({
      id: sol.id,
      obraId: sol.obraId,
      requesterId: sol.requesterId,
      approverId: sol.approverId,
      status: sol.status,
      createdAt: sol.createdAt,
      updatedAt: sol.updatedAt,
      obraName: sol.obra.name,
      requesterName: sol.requester.name,
      approverName: sol.approver ? sol.approver.name : 'Pendente',
      items: sol.items.map(item => ({
        id: item.id,
        materialId: item.materialId,
        quantity: item.quantity,
        code: item.material.code,
        description: item.material.description,
        unit: item.material.unit
      }))
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar solicitações.' });
  }
});

app.post('/api/solicitacoes', async (req, res) => {
  const tenantId = (req as any).tenantId;
  const { obraId, requesterId, items } = req.body;

  try {
    const newSol = await prisma.solicitacaoMaterial.create({
      data: {
        tenantId,
        obraId,
        requesterId,
        status: RequestStatus.SOLICITADO,
        items: {
          create: items.map((item: any) => ({
            materialId: item.materialId,
            quantity: parseFloat(item.quantity)
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json(newSol);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar solicitação.' });
  }
});

// Aprovação de Solicitação
app.post('/api/solicitacoes/:id/aprovar', async (req, res) => {
  const { id } = req.params;
  const { approverId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sol = await tx.solicitacaoMaterial.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!sol) throw new Error('Solicitação não encontrada');

      const updated = await tx.solicitacaoMaterial.update({
        where: { id },
        data: {
          status: RequestStatus.APROVADO,
          approverId,
          updatedAt: new Date()
        },
        include: { items: true }
      });

      // Reservar saldos
      for (const item of sol.items) {
        const est = await tx.estoqueObra.findFirst({
          where: { obraId: sol.obraId, materialId: item.materialId }
        });

        if (est) {
          await tx.estoqueObra.update({
            where: { id: est.id },
            data: { reservedQty: est.reservedQty + item.quantity }
          });
        } else {
          // Criar estoque consolidado com reserva caso não exista
          await tx.estoqueObra.create({
            data: {
              obraId: sol.obraId,
              materialId: item.materialId,
              quantity: 0.0,
              reservedQty: item.quantity,
              minQty: 10.0,
              avgConsumption: 30.0
            }
          });
        }
      }

      return updated;
    });

    res.json({ message: 'Solicitação aprovada e saldos reservados no WMS.', solicitacao: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Erro ao aprovar solicitação.' });
  }
});

// 6. Compras e Cotações
app.get('/api/compras', async (req, res) => {
  const tenantId = (req as any).tenantId;
  try {
    const list = await prisma.pedidoCompra.findMany({
      where: { tenantId },
      include: {
        items: {
          include: {
            material: true
          }
        }
      }
    });

    const formatted = list.map(ped => ({
      id: ped.id,
      solicitacaoId: ped.solicitacaoId,
      buyerId: ped.buyerId,
      supplierName: ped.supplierName,
      status: ped.status,
      freightCost: ped.freightCost,
      deliveryTerms: ped.deliveryTerms,
      createdAt: ped.createdAt,
      updatedAt: ped.updatedAt,
      items: ped.items.map(item => ({
        id: item.id,
        materialId: item.materialId,
        qtyOrdered: item.qtyOrdered,
        qtyReceived: item.qtyReceived,
        priceUnit: item.priceUnit,
        code: item.material.code,
        description: item.material.description,
        unit: item.material.unit
      }))
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedidos de compra.' });
  }
});

app.post('/api/compras', async (req, res) => {
  const tenantId = (req as any).tenantId;
  const { solicitacaoId, buyerId, supplierName, freightCost, deliveryTerms, items } = req.body;

  try {
    const newPed = await prisma.pedidoCompra.create({
      data: {
        tenantId,
        solicitacaoId: solicitacaoId || null,
        buyerId,
        supplierName,
        status: PurchaseStatus.PEDIDO_GERADO,
        freightCost: parseFloat(freightCost) || 0.0,
        deliveryTerms: deliveryTerms || '',
        items: {
          create: items.map((item: any) => ({
            materialId: item.materialId,
            qtyOrdered: parseFloat(item.qtyOrdered),
            qtyReceived: 0.0,
            priceUnit: parseFloat(item.priceUnit)
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json(newPed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao emitir pedido de compra.' });
  }
});

// 7. Recebimento e Conferência WMS (Divergências)
app.post('/api/recebimento', async (req, res) => {
  const { pedidoId, itemsRecebidos, obraId, local, subLocal } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedidoCompra.findUnique({
        where: { id: pedidoId },
        include: { items: true }
      });

      if (!pedido) throw new Error('Pedido de compra não encontrado.');

      let hasDivergence = false;
      const divergenciasList: any[] = [];

      for (const itemRec of itemsRecebidos) {
        const pedidoItem = pedido.items.find(i => i.materialId === itemRec.materialId);
        if (!pedidoItem) continue;

        const ordered = pedidoItem.qtyOrdered;
        const received = parseFloat(itemRec.qtyReceived) || 0.0;
        const currentReceived = pedidoItem.qtyReceived + received;

        // Atualizar recebimento no item do pedido
        await tx.pedidoItem.update({
          where: { id: pedidoItem.id },
          data: { qtyReceived: currentReceived }
        });

        if (ordered !== received) {
          hasDivergence = true;
          divergenciasList.push({
            materialId: itemRec.materialId,
            ordered,
            received,
            diff: received - ordered
          });
        }

        // Buscar ou criar estoque consolidado
        let est = await tx.estoqueObra.findFirst({
          where: { obraId, materialId: itemRec.materialId }
        });

        if (!est) {
          est = await tx.estoqueObra.create({
            data: {
              obraId,
              materialId: itemRec.materialId,
              quantity: received,
              reservedQty: 0.0,
              minQty: 10.0,
              avgConsumption: 30.0
            }
          });
        } else {
          est = await tx.estoqueObra.update({
            where: { id: est.id },
            data: { quantity: est.quantity + received }
          });
        }

        // Registrar no endereçamento logístico do WMS físico da Obra
        const end = await tx.enderecamentoEstoque.findFirst({
          where: { estoqueObraId: est.id, local, subLocal: subLocal || null }
        });

        if (end) {
          await tx.enderecamentoEstoque.update({
            where: { id: end.id },
            data: { quantity: end.quantity + received }
          });
        } else {
          await tx.enderecamentoEstoque.create({
            data: {
              estoqueObraId: est.id,
              local,
              subLocal: subLocal || null,
              quantity: received
            }
          });
        }
      }

      // Atualizar status do pedido
      const newStatus = hasDivergence ? PurchaseStatus.PARCIALMENTE_RECEBIDO : PurchaseStatus.RECEBIDO;
      await tx.pedidoCompra.update({
        where: { id: pedidoId },
        data: {
          status: newStatus,
          updatedAt: new Date()
        }
      });

      // Se houver uma solicitação vinculada, dar baixa no status e na reserva
      if (pedido.solicitacaoId) {
        await tx.solicitacaoMaterial.update({
          where: { id: pedido.solicitacaoId },
          data: { status: RequestStatus.RECEBIDO }
        });

        const solItems = await tx.solicitacaoItem.findMany({
          where: { solicitacaoId: pedido.solicitacaoId }
        });

        for (const solItem of solItems) {
          const est = await tx.estoqueObra.findFirst({
            where: { obraId, materialId: solItem.materialId }
          });

          if (est) {
            const newReserve = Math.max(0, est.reservedQty - solItem.quantity);
            await tx.estoqueObra.update({
              where: { id: est.id },
              data: { reservedQty: newReserve }
            });
          }
        }
      }

      return { status: newStatus, hasDivergence, divergenciasList };
    });

    res.json({
      message: 'Recebimento concluído com endereçamento físico lógico.',
      status: result.status,
      hasDivergence: result.hasDivergence,
      divergenciasList: result.divergenciasList
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Erro ao processar recebimento.' });
  }
});

// 8. Controle de Consumo Diário por Equipe
app.get('/api/consumo', async (req, res) => {
  const tenantId = (req as any).tenantId;
  try {
    const list = await prisma.movimentacaoConsumo.findMany({
      where: { tenantId },
      include: {
        material: true,
        obra: true,
        responsible: true
      }
    });

    const formatted = list.map(con => ({
      id: con.id,
      obraId: con.obraId,
      materialId: con.materialId,
      quantity: con.quantity,
      team: con.team,
      responsibleId: con.responsibleId,
      activity: con.activity,
      date: con.date,
      materialDesc: con.material.description,
      unit: con.material.unit,
      obraName: con.obra.name,
      responsibleName: con.responsible.name
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar histórico de consumos.' });
  }
});

app.post('/api/consumo', async (req, res) => {
  const tenantId = (req as any).tenantId;
  const { obraId, materialId, quantity, team, responsibleId, activity } = req.body;
  const qty = parseFloat(quantity) || 0.0;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Validar se há estoque consolidado na obra
      const est = await tx.estoqueObra.findFirst({
        where: { obraId, materialId }
      });

      if (!est || est.quantity < qty) {
        throw new Error('Estoque físico insuficiente no canteiro para esta retirada.');
      }

      // Deduzir do estoque consolidado
      const updatedEst = await tx.estoqueObra.update({
        where: { id: est.id },
        data: { quantity: est.quantity - qty }
      });

      // Deduzir do endereçamento físico (FIFO simples nas posições que possuem saldo)
      let remainingToDeduct = qty;
      const addresses = await tx.enderecamentoEstoque.findMany({
        where: { estoqueObraId: est.id, quantity: { gt: 0 } },
        orderBy: { quantity: 'asc' } // Deduz primeiro dos locais menores para otimizar espaço
      });

      for (const addr of addresses) {
        if (remainingToDeduct <= 0) break;
        const toDeduct = Math.min(addr.quantity, remainingToDeduct);
        
        await tx.enderecamentoEstoque.update({
          where: { id: addr.id },
          data: { quantity: addr.quantity - toDeduct }
        });
        
        remainingToDeduct -= toDeduct;
      }

      // Registrar histórico de consumo
      const newConsumo = await tx.movimentacaoConsumo.create({
        data: {
          tenantId,
          obraId,
          materialId,
          quantity: qty,
          team,
          responsibleId,
          activity
        }
      });

      return newConsumo;
    });

    res.status(201).json({ message: 'Consumo registrado e deduzido do estoque endereçado.', consumo: result });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Erro ao registrar movimentação de consumo.' });
  }
});

// 9. Inventários Cíclicos / Rotativos
app.get('/api/inventarios', async (req, res) => {
  const tenantId = (req as any).tenantId;
  try {
    const list = await prisma.inventario.findMany({
      where: { tenantId },
      include: {
        obra: true,
        items: {
          include: {
            material: true
          }
        }
      }
    });

    const formatted = list.map(inv => ({
      id: inv.id,
      obraId: inv.obraId,
      type: inv.type,
      status: inv.status,
      date: inv.date,
      obraName: inv.obra.name,
      items: inv.items.map(item => ({
        id: item.id,
        materialId: item.materialId,
        qtySystem: item.qtySystem,
        qtyPhysical: item.qtyPhysical,
        diff: item.diff,
        code: item.material.code,
        description: item.material.description,
        unit: item.material.unit
      }))
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar inventários.' });
  }
});

app.post('/api/inventarios', async (req, res) => {
  const tenantId = (req as any).tenantId;
  const { obraId, type, itemsContados } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Criar cabeçalho do inventário
      const inv = await tx.inventario.create({
        data: {
          tenantId,
          obraId,
          type,
          status: 'CONCLUIDO'
        }
      });

      const processedItems = [];

      for (const item of itemsContados) {
        // Buscar estoque atual
        const est = await tx.estoqueObra.findFirst({
          where: { obraId, materialId: item.materialId }
        });

        const qtySystem = est ? est.quantity : 0.0;
        const qtyPhysical = parseFloat(item.qtyPhysical) || 0.0;
        const diff = qtyPhysical - qtySystem;

        // Se houver desvio, ajustar o estoque consolidado
        if (est) {
          await tx.estoqueObra.update({
            where: { id: est.id },
            data: { quantity: qtyPhysical }
          });

          // Ajustar no primeiro local WMS disponível
          const firstAddr = await tx.enderecamentoEstoque.findFirst({
            where: { estoqueObraId: est.id }
          });

          if (firstAddr) {
            await tx.enderecamentoEstoque.update({
              where: { id: firstAddr.id },
              data: { quantity: Math.max(0, firstAddr.quantity + diff) }
            });
          }
        }

        // Criar registro do item
        const invItem = await tx.inventarioItem.create({
          data: {
            inventarioId: inv.id,
            materialId: item.materialId,
            qtySystem,
            qtyPhysical,
            diff
          }
        });

        processedItems.push(invItem);
      }

      return { ...inv, items: processedItems };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar contagem do inventário.' });
  }
});

// 10. Gestão de Equipamentos
app.get('/api/equipamentos', async (req, res) => {
  const tenantId = (req as any).tenantId;
  try {
    const list = await prisma.equipamento.findMany({
      where: { tenantId },
      include: {
        obra: true
      }
    });

    const formatted = list.map(eq => ({
      id: eq.id,
      code: eq.code,
      name: eq.name,
      type: eq.type,
      status: eq.status,
      obraId: eq.obraId,
      obraName: eq.obra ? eq.obra.name : 'Almoxarifado Central (Livre)'
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar catálogo de equipamentos.' });
  }
});

app.post('/api/equipamentos', async (req, res) => {
  const tenantId = (req as any).tenantId;
  const { code, name, type } = req.body;
  try {
    const newEq = await prisma.equipamento.create({
      data: {
        tenantId,
        code: code || `EQ-${Date.now().toString().slice(-4)}`,
        name,
        type: type || 'Geral',
        status: EquipStatus.DISPONIVEL
      }
    });
    res.status(201).json(newEq);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar equipamento.' });
  }
});

app.post('/api/equipamentos/:id/alocar', async (req, res) => {
  const { id } = req.params;
  const { obraId } = req.body;

  try {
    const eq = await prisma.equipamento.findUnique({
      where: { id }
    });

    if (!eq) return res.status(404).json({ error: 'Equipamento não encontrado.' });

    const updated = await prisma.equipamento.update({
      where: { id },
      data: {
        obraId: obraId || null,
        status: obraId ? EquipStatus.EM_USO : EquipStatus.DISPONIVEL
      }
    });

    res.json({ message: 'Alocação de equipamento atualizada.', equipamento: updated });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar a alocação de equipamento.' });
  }
});

// 11. Dashboard Analytics
app.get('/api/dashboard/chart', async (req, res) => {
  const tenantId = (req as any).tenantId;
  try {
    const today = new Date();
    const thirtyFiveDaysAgo = new Date();
    thirtyFiveDaysAgo.setDate(today.getDate() - 35);

    const pedidos = await prisma.pedidoCompra.findMany({
      where: { tenantId, createdAt: { gte: thirtyFiveDaysAgo } },
      include: { items: true }
    });

    const consumos = await prisma.movimentacaoConsumo.findMany({
      where: { tenantId, date: { gte: thirtyFiveDaysAgo } },
      include: { material: true }
    });

    const weeksData = [
      { name: 'Semana 1', compras: 0, consumo: 0 },
      { name: 'Semana 2', compras: 0, consumo: 0 },
      { name: 'Semana 3', compras: 0, consumo: 0 },
      { name: 'Semana 4', compras: 0, consumo: 0 },
      { name: 'Semana Atual', compras: 0, consumo: 0 },
    ];

    const getWeekIndex = (dateStr: string | Date) => {
      const d = new Date(dateStr);
      const diffTime = Math.abs(today.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) return 4;
      if (diffDays <= 14) return 3;
      if (diffDays <= 21) return 2;
      if (diffDays <= 28) return 1;
      return 0;
    };

    pedidos.forEach(p => {
      const wIdx = getWeekIndex(p.createdAt);
      const valorTotal = p.items.reduce((acc, item) => acc + (item.qtyOrdered * item.priceUnit), 0) + p.freightCost;
      weeksData[wIdx].compras += valorTotal;
    });

    consumos.forEach(c => {
      const wIdx = getWeekIndex(c.date);
      const valorTotal = c.quantity * (c.material.averageCost || 0);
      weeksData[wIdx].consumo += valorTotal;
    });

    res.json(weeksData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar dados do gráfico.' });
  }
});

// Middleware de tratamento de erros (global)


// Iniciar o Servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[BACKEND] WMS de Obras rodando em http://localhost:${port}`);
  });
}
