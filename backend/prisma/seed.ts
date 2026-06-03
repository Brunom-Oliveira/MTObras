import { PrismaClient, Role, UnidadeMedida } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o Seeder...');

  // Limpar tabelas caso existam dados (cuidado em PRD)
  await prisma.enderecamentoEstoque.deleteMany();
  await prisma.estoqueObra.deleteMany();
  await prisma.solicitacaoItem.deleteMany();
  await prisma.pedidoItem.deleteMany();
  await prisma.inventarioItem.deleteMany();
  await prisma.movimentacaoConsumo.deleteMany();
  await prisma.solicitacaoMaterial.deleteMany();
  await prisma.pedidoCompra.deleteMany();
  await prisma.inventario.deleteMany();
  await prisma.equipamento.deleteMany();
  await prisma.material.deleteMany();
  await prisma.obra.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.tenant.deleteMany();

  // 1. Criar Tenant
  const tenant = await prisma.tenant.create({
    data: { name: 'Construtora Teste S.A.', cnpj: '00.000.000/0001-91' }
  });
  console.log(`✅ Tenant criado: ${tenant.name}`);

  // 2. Criar Usuários
  const passwordHash = await bcrypt.hash('123456', 8);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador Geral',
      email: 'admin@construtora.com',
      password: passwordHash,
      role: Role.OWNER,
      tenantId: tenant.id
    }
  });

  const almoxarife = await prisma.user.create({
    data: {
      name: 'Almoxarife Principal',
      email: 'almoxarife@construtora.com',
      password: passwordHash,
      role: Role.WAREHOUSE_KEEPER,
      tenantId: tenant.id
    }
  });

  const mestre = await prisma.user.create({
    data: {
      name: 'Mestre de Obras Zé',
      email: 'mestre@construtora.com',
      password: passwordHash,
      role: Role.FOREMAN,
      tenantId: tenant.id
    }
  });
  console.log('✅ Usuários criados (admin, almoxarife, mestre). Senha padrão: 123456');

  // 3. Criar Obras
  const obra1 = await prisma.obra.create({
    data: {
      tenantId: tenant.id,
      code: 'OB-001',
      name: 'Residencial Bella Vista',
      clientName: 'Incorporadora Alpha',
      address: 'Rua das Flores, 100',
      budget: 1500000.00,
      startDate: new Date(),
      expectedEndDate: new Date(new Date().setMonth(new Date().getMonth() + 12))
    }
  });

  const obra2 = await prisma.obra.create({
    data: {
      tenantId: tenant.id,
      code: 'OB-002',
      name: 'Torre Empresarial Centro',
      clientName: 'Investimentos Beta',
      address: 'Av. Paulista, 5000',
      budget: 4500000.00,
      startDate: new Date(),
      expectedEndDate: new Date(new Date().setMonth(new Date().getMonth() + 24))
    }
  });
  console.log('✅ Obras criadas.');

  // 4. Criar Materiais Básicos
  const materiais = [
    { code: 'MAT-CIM-01', description: 'Cimento CP II 50kg', category: 'Cimento e Argamassa', unit: UnidadeMedida.SACO, averageCost: 35.50 },
    { code: 'MAT-ARE-01', description: 'Areia Lavada Fina', category: 'Agregados', unit: UnidadeMedida.M3, averageCost: 120.00 },
    { code: 'MAT-BRI-01', description: 'Brita 1', category: 'Agregados', unit: UnidadeMedida.M3, averageCost: 110.00 },
    { code: 'MAT-TIJ-01', description: 'Tijolo Baiano 8 Furos', category: 'Alvenaria', unit: UnidadeMedida.UN, averageCost: 0.85 },
    { code: 'MAT-FER-01', description: 'Aço CA50 10mm (Barra 12m)', category: 'Aço e Ferro', unit: UnidadeMedida.BARRA, averageCost: 45.00 },
    { code: 'MAT-TIN-01', description: 'Tinta Acrílica Fosca Branca 18L', category: 'Acabamento', unit: UnidadeMedida.LATA, averageCost: 280.00 }
  ];

  for (const mat of materiais) {
    await prisma.material.create({
      data: { ...mat, tenantId: tenant.id }
    });
  }
  console.log('✅ Materiais (Catálogo) populados.');

  const createdMaterials = await prisma.material.findMany({ where: { tenantId: tenant.id } });
  
  // 5. Estoque Obra e Pedidos de Compra (Mock)
  const cimento = createdMaterials.find(m => m.code === 'MAT-CIM-01');
  const areia = createdMaterials.find(m => m.code === 'MAT-ARE-01');
  
  if (cimento && areia) {
    // Estoque
    await prisma.estoqueObra.create({
      data: {
        obraId: obra1.id,
        materialId: cimento.id,
        quantity: 150,
        reservedQty: 0,
        minQty: 100,
        avgConsumption: 50
      }
    });

    await prisma.estoqueObra.create({
      data: {
        obraId: obra1.id,
        materialId: areia.id,
        quantity: 5, // Abaixo do minQty! Vai gerar alerta!
        reservedQty: 0,
        minQty: 15,
        avgConsumption: 10
      }
    });

    // Pedido Compra
    await prisma.pedidoCompra.create({
      data: {
        tenantId: tenant.id,
        buyerId: admin.id,
        supplierName: 'Depósito São João',
        freightCost: 150.00,
        status: 'RECEBIDO',
        items: {
          create: [
            { materialId: cimento.id, qtyOrdered: 200, qtyReceived: 200, priceUnit: 34.50 },
            { materialId: areia.id, qtyOrdered: 20, qtyReceived: 20, priceUnit: 115.00 }
          ]
        }
      }
    });

    // Consumo
    await prisma.movimentacaoConsumo.create({
      data: {
        tenantId: tenant.id,
        obraId: obra1.id,
        materialId: cimento.id,
        quantity: 50,
        team: 'Equipe Alvenaria A',
        activity: 'Reboco fachada',
        responsibleId: mestre.id
      }
    });
    
    // Inventário com desvio (perda)
    const inv = await prisma.inventario.create({
      data: {
        tenantId: tenant.id,
        obraId: obra1.id,
        type: 'ROTATIVO',
        status: 'CONCLUIDO',
        items: {
          create: [
            { materialId: areia.id, qtySystem: 6, qtyPhysical: 5, diff: -1 } // 1 M3 perdido
          ]
        }
      }
    });
  }
  
  console.log('✅ Dados transacionais (Compras, Estoque, Consumos) populados.');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
