import { EquipamentoRepository } from '../../../domain/repositories/EquipamentoRepository';
import { Equipamento } from '@prisma/client';
import { prisma } from '../prisma';

export class PrismaEquipamentoRepository implements EquipamentoRepository {
  async listByTenant(tenantId: string): Promise<any[]> {
    return prisma.equipamento.findMany({ where: { tenantId } });
  }

  async findById(id: string): Promise<Equipamento | null> {
    return prisma.equipamento.findUnique({ where: { id } });
  }

  async updateAllocation(id: string, obraId: string | null, status: any): Promise<Equipamento> {
    return prisma.equipamento.update({
      where: { id },
      data: {
        obraId: obraId ?? undefined,
        status,
      },
    });
  }
}
