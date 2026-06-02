import { ObraRepository } from '../../../domain/repositories/ObraRepository';
import { Obra } from '@prisma/client';
import { prisma } from '../prisma';

export class PrismaObraRepository implements ObraRepository {
  async findById(id: string): Promise<Obra | null> {
    return prisma.obra.findUnique({ where: { id } });
  }

  async listByTenant(tenantId: string): Promise<Obra[]> {
    return prisma.obra.findMany({ where: { tenantId } });
  }

  async create(data: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>): Promise<Obra> {
    return prisma.obra.create({ data });
  }
}
