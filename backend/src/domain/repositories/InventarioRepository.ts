import { Inventario } from '@prisma/client';

export interface InventarioRepository {
  listByTenant(tenantId: string): Promise<any[]>;
  create(data: {
    tenantId: string;
    obraId: string;
    type: string;
    items: { materialId: string; qtySystem: number; qtyPhysical: number; diff: number }[];
  }): Promise<any>;
}
