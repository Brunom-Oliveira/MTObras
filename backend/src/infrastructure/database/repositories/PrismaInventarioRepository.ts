import { InventarioRepository } from '../../../domain/repositories/InventarioRepository';
import { Inventario, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export class PrismaInventarioRepository implements InventarioRepository {
  async listByTenant(tenantId: string): Promise<any[]> {
    return prisma.inventario.findMany({ where: { tenantId } });
  }

  async create(data: {
    tenantId: string;
    obraId: string;
    type: string;
    items: { materialId: string; qtySystem: number; qtyPhysical: number; diff: number }[];
  }): Promise<any> {
    return prisma.inventario.create({
      data: {
        tenantId: data.tenantId,
        obraId: data.obraId,
        type: data.type,
        status: 'OPEN',
        items: {
          create: data.items.map(i => ({
            materialId: i.materialId,
            qtySystem: i.qtySystem,
            qtyPhysical: i.qtyPhysical,
            diff: i.diff,
          })),
        },
      },
    });
  }
}
