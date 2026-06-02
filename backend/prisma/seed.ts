import { PrismaClient, Role, UnidadeMedida, ObraStatus, RequestStatus, PurchaseStatus, EquipStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding do banco de dados...');

  // 1. Limpar banco de dados existente
  await prisma.equipamento.deleteMany({});
  await prisma.inventarioItem.deleteMany({});
  await prisma.inventario.deleteMany({});
  await prisma.movimentacaoConsumo.deleteMany({});
  await prisma.pedidoItem.deleteMany({});
  await prisma.pedidoCompra.deleteMany({});
  await prisma.solicitacaoItem.deleteMany({});
  await prisma.solicitacaoMaterial.deleteMany({});
  await prisma.enderecamentoEstoque.deleteMany({});
  await prisma.estoqueObra.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.obra.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('Banco de dados limpo com sucesso.');

  // 2. Criar Tenant
  const tenant = await prisma.tenant.create({
    data: {
      id: 'c8d06faf-fdf0-4c77-9555-4b7a64223ff1',
      name: 'MTObras Empreendimentos',
      cnpj: '12.345.678/0001-99',
    },
  });
  console.log(`Tenant criado: ${tenant.name} (${tenant.id})`);

  // 3. Criar Usuários
  const owner = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'proprietario@mtobras.com.br',
      password: 'senha123', // Em texto plano conforme plano de implementação MVP
      name: 'Carlos Antunes (Proprietário)',
      role: Role.OWNER,
    },
  });

  const engineer = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'engenheiro@mtobras.com.br',
      password: 'senha123',
      name: 'Marcos Souza (Engenheiro de Campo)',
      role: Role.ENGINEER,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'comprador@mtobras.com.br',
      password: 'senha123',
      name: 'Renata Lins (Comprador)',
      role: Role.BUYER,
    },
  });

  const warehouseKeeper = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'almoxarife@mtobras.com.br',
      password: 'senha123',
      name: 'Julio Silva (Almoxarife)',
      role: Role.WAREHOUSE_KEEPER,
    },
  });

  const foreman = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'mestre@mtobras.com.br',
      password: 'senha123',
      name: 'Manoel Ramos (Mestre de Obras)',
      role: Role.FOREMAN,
    },
  });

  console.log('Usuários criados com sucesso.');

  // 4. Criar Obras
  const obra1 = await prisma.obra.create({
    data: {
      tenantId: tenant.id,
      code: 'OB-001',
      name: 'Residencial Bella Vista',
      clientName: 'Bella Vista Incorporadora',
      address: 'Rua das Palmeiras, 1500, Setor Bueno - Goiânia/GO',
      budget: 2500000.00,
      status: ObraStatus.ACTIVE,
      startDate: new Date('2026-01-10T12:00:00Z'),
      expectedEndDate: new Date('2026-12-20T12:00:00Z'),
    },
  });

  const obra2 = await prisma.obra.create({
    data: {
      tenantId: tenant.id,
      code: 'OB-002',
      name: 'Edifício Sky Tower',
      clientName: 'MTObras Empreendimentos',
      address: 'Av. Paulista, 450 - São Paulo/SP',
      budget: 8900000.00,
      status: ObraStatus.ACTIVE,
      startDate: new Date('2026-03-01T12:00:00Z'),
      expectedEndDate: new Date('2027-08-30T12:00:00Z'),
    },
  });

  console.log('Obras criadas com sucesso.');

  // 5. Criar Catálogo de Materiais
  const matCimento = await prisma.material.create({
    data: {
      tenantId: tenant.id,
      code: 'MAT-CIM-01',
      description: 'Cimento CP II 50kg',
      category: 'Cimento e Argamassa',
      unit: UnidadeMedida.SACO,
      averageCost: 32.50,
      defaultSupplier: 'Votorantim',
    },
  });

  const matAreia = await prisma.material.create({
    data: {
      tenantId: tenant.id,
      code: 'MAT-ARE-03',
      description: 'Areia Lavada Fina',
      category: 'Agregados',
      unit: UnidadeMedida.M3,
      averageCost: 95.00,
      defaultSupplier: 'Areal Norte',
    },
  });

  const matTijolo = await prisma.material.create({
    data: {
      tenantId: tenant.id,
      code: 'MAT-TIJ-05',
      description: 'Tijolo Baiano 8 Furos',
      category: 'Blocos e Tijolos',
      unit: UnidadeMedida.UN,
      averageCost: 0.85,
      defaultSupplier: 'Cerâmica São Bento',
    },
  });

  const matTubo = await prisma.material.create({
    data: {
      tenantId: tenant.id,
      code: 'MAT-TUB-02',
      description: 'Tubo PVC 100mm Esgoto 6m',
      category: 'Hidráulica',
      unit: UnidadeMedida.BARRA,
      averageCost: 45.00,
      defaultSupplier: 'Amanco Wavin',
    },
  });

  const matTinta = await prisma.material.create({
    data: {
      tenantId: tenant.id,
      code: 'MAT-TIN-10',
      description: 'Tinta Acrílica Branca 18L',
      category: 'Pintura e Acabamentos',
      unit: UnidadeMedida.LATA,
      averageCost: 280.00,
      defaultSupplier: 'Suvinil',
    },
  });

  console.log('Materiais criados com sucesso.');

  // 6. Criar Saldo de Estoque consolidado por Obra e Posições WMS
  // Cimento na Obra 1
  const estCimentoObra1 = await prisma.estoqueObra.create({
    data: {
      obraId: obra1.id,
      materialId: matCimento.id,
      quantity: 120.00,
      reservedQty: 20.00,
      minQty: 50.00,
      avgConsumption: 300.00,
    },
  });

  // Endereçamento do Cimento
  await prisma.enderecamentoEstoque.create({
    data: {
      estoqueObraId: estCimentoObra1.id,
      local: 'Sala de Cimento',
      subLocal: 'Pilha Sul',
      quantity: 80.00,
    },
  });
  await prisma.enderecamentoEstoque.create({
    data: {
      estoqueObraId: estCimentoObra1.id,
      local: 'Contêiner 01',
      subLocal: 'Prateleira A',
      quantity: 40.00,
    },
  });

  // Areia na Obra 1
  const estAreiaObra1 = await prisma.estoqueObra.create({
    data: {
      obraId: obra1.id,
      materialId: matAreia.id,
      quantity: 12.00, // Menor que o mínimo de 15 -> crítico
      reservedQty: 0.00,
      minQty: 15.00,
      avgConsumption: 60.00,
    },
  });

  await prisma.enderecamentoEstoque.create({
    data: {
      estoqueObraId: estAreiaObra1.id,
      local: 'Pátio Leste',
      subLocal: 'Baia de Areia',
      quantity: 12.00,
    },
  });

  // Tijolos na Obra 1
  const estTijoloObra1 = await prisma.estoqueObra.create({
    data: {
      obraId: obra1.id,
      materialId: matTijolo.id,
      quantity: 1500.00,
      reservedQty: 0.00,
      minQty: 500.00,
      avgConsumption: 3000.00,
    },
  });

  await prisma.enderecamentoEstoque.create({
    data: {
      estoqueObraId: estTijoloObra1.id,
      local: 'Pátio Oeste',
      subLocal: 'Pilha Norte',
      quantity: 1500.00,
    },
  });

  // Cimento na Obra 2
  const estCimentoObra2 = await prisma.estoqueObra.create({
    data: {
      obraId: obra2.id,
      materialId: matCimento.id,
      quantity: 45.00,
      reservedQty: 0.00,
      minQty: 80.00, // Menor que o mínimo de 80 -> crítico
      avgConsumption: 400.00,
    },
  });

  await prisma.enderecamentoEstoque.create({
    data: {
      estoqueObraId: estCimentoObra2.id,
      local: 'Depósito A',
      subLocal: 'Portão 1',
      quantity: 45.00,
    },
  });

  console.log('Estoques e posições WMS criados.');

  // 7. Criar Equipamentos
  await prisma.equipamento.create({
    data: {
      tenantId: tenant.id,
      code: 'BET-01',
      name: 'Betoneira 400L CSM',
      type: 'Betoneiras',
      status: EquipStatus.EM_USO,
      obraId: obra1.id,
    },
  });

  await prisma.equipamento.create({
    data: {
      tenantId: tenant.id,
      code: 'BET-02',
      name: 'Betoneira 400L CSM',
      type: 'Betoneiras',
      status: EquipStatus.DISPONIVEL,
      obraId: null,
    },
  });

  await prisma.equipamento.create({
    data: {
      tenantId: tenant.id,
      code: 'MAR-01',
      name: 'Martelete Rompedor 15kg Bosch',
      type: 'Marteletes',
      status: EquipStatus.EM_USO,
      obraId: obra1.id,
    },
  });

  await prisma.equipamento.create({
    data: {
      tenantId: tenant.id,
      code: 'AND-01',
      name: 'Jogo de Andaimes 1.5m (10 peças)',
      type: 'Andaimes',
      status: EquipStatus.DISPONIVEL,
      obraId: null,
    },
  });

  console.log('Equipamentos criados.');

  // 8. Criar Solicitações e Pedidos de Compra para o fluxo operacional
  const solicitacao = await prisma.solicitacaoMaterial.create({
    data: {
      tenantId: tenant.id,
      obraId: obra1.id,
      requesterId: foreman.id,
      approverId: engineer.id,
      status: RequestStatus.APROVADO,
    },
  });

  await prisma.solicitacaoItem.create({
    data: {
      solicitacaoId: solicitacao.id,
      materialId: matCimento.id,
      quantity: 50.00,
    },
  });

  // Pedido de compra de cimento
  const pedido = await prisma.pedidoCompra.create({
    data: {
      tenantId: tenant.id,
      solicitacaoId: solicitacao.id,
      buyerId: buyer.id,
      supplierName: 'Votorantim Cimentos',
      status: PurchaseStatus.PEDIDO_GERADO,
      freightCost: 150.00,
      deliveryTerms: 'CIF - Prazo: 3 dias',
    },
  });

  await prisma.pedidoItem.create({
    data: {
      pedidoId: pedido.id,
      materialId: matCimento.id,
      qtyOrdered: 50.00,
      qtyReceived: 0.00,
      priceUnit: 30.50,
    },
  });

  console.log('Fluxo operacional de compras e solicitações sementeado.');

  // 9. Histórico de Consumo para IA Preditiva
  // Criar consumo para os últimos 7 dias na obra 1 para gerar estatísticas no Dashboard
  const equipes = ['Alvenaria', 'Estrutura', 'Revestimento'];
  const atividades = ['Alvenaria de vedação', 'Concretagem pilares', 'Reboco fachada'];

  for (let i = 1; i <= 7; i++) {
    const dataMov = new Date();
    dataMov.setDate(dataMov.getDate() - i);

    await prisma.movimentacaoConsumo.create({
      data: {
        tenantId: tenant.id,
        obraId: obra1.id,
        materialId: matCimento.id,
        quantity: Math.floor(Math.random() * 15) + 5, // Consumo diário simulado (5 a 20 sacos)
        team: equipes[i % 3],
        responsibleId: warehouseKeeper.id,
        activity: atividades[i % 3],
        date: dataMov,
      },
    });
  }

  // 10. Criar um inventário rotativo fechado com desvio
  const inventario = await prisma.inventario.create({
    data: {
      tenantId: tenant.id,
      obraId: obra1.id,
      type: 'ROTATIVO',
      status: 'CONCLUIDO',
      date: new Date(),
    },
  });

  // Registrar item com desvio de 3 sacos de cimento perdidos (valorConsumido/perdido)
  await prisma.inventarioItem.create({
    data: {
      inventarioId: inventario.id,
      materialId: matCimento.id,
      qtySystem: 123.00,
      qtyPhysical: 120.00,
      diff: -3.00, // Desvio negativo de 3 sacos
    },
  });

  console.log('Histórico de consumo e inventários concluído.');
  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
