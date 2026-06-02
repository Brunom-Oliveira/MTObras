import { Equipamento } from '@prisma/client';

export interface EquipamentoRepository {
  listByTenant(tenantId: string): Promise<any[]>;
  findById(id: string): Promise<Equipamento | null>;
  updateAllocation(id: string, obraId: string | null, status: any): Promise<Equipamento>;
}
