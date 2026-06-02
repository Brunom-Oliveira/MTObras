import { Obra } from '@prisma/client';

export interface ObraRepository {
  findById(id: string): Promise<Obra | null>;
  listByTenant(tenantId: string): Promise<Obra[]>;
  create(data: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>): Promise<Obra>;
}
