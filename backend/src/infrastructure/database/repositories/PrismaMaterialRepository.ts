import { MaterialRepository } from '../../../domain/repositories/MaterialRepository';
import { Material } from '@prisma/client';
import { prisma } from '../prisma';

export class PrismaMaterialRepository implements MaterialRepository {
  async findById(id: string): Promise<Material | null> {
    return prisma.material.findUnique({ where: { id } });
  }

  async listByTenant(tenantId: string): Promise<Material[]> {
    return prisma.material.findMany({ where: { tenantId } });
  }

  async create(data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material> {
    return prisma.material.create({ data });
  }
}
