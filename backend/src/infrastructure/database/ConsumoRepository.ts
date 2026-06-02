import { prisma } from './prisma';
import { ConsumoRepository } from '../../domain/repositories/ConsumoRepository';
import { MovimentacaoConsumo } from '@prisma/client';

export class PrismaConsumoRepository implements ConsumoRepository {
  async listByTenant(tenantId: string): Promise<any[]> {
    return prisma.movimentacaoConsumo.findMany({ where: { tenantId } });
  }

  async create(data: {
    tenantId: string;
    obraId: string;
    materialId: string;
    quantity: number;
    team: string;
    responsibleId: string;
    activity: string;
  }): Promise<MovimentacaoConsumo> {
    return prisma.movimentacaoConsumo.create({ data });
  }
}
