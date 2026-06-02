import { Material } from '@prisma/client';

export interface MaterialRepository {
  findById(id: string): Promise<Material | null>;
  listByTenant(tenantId: string): Promise<Material[]>;
  create(data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material>;
}
