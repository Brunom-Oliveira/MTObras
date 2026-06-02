import { MovimentacaoConsumo } from '@prisma/client';

export interface ConsumoRepository {
  listByTenant(tenantId: string): Promise<any[]>;
  create(data: {
    tenantId: string;
    obraId: string;
    materialId: string;
    quantity: number;
    team: string;
    responsibleId: string;
    activity: string;
  }): Promise<MovimentacaoConsumo>;
}
