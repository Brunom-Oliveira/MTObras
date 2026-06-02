import { SolicitacaoMaterial, SolicitacaoItem } from '@prisma/client';

export interface SolicitacaoRepository {
  findById(id: string): Promise<SolicitacaoMaterial | null>;
  listByTenant(tenantId: string): Promise<any[]>;
  create(data: {
    tenantId: string;
    obraId: string;
    requesterId: string;
    items: { materialId: string; quantity: number }[];
  }): Promise<SolicitacaoMaterial>;
  updateStatus(id: string, status: string, approverId?: string | null): Promise<SolicitacaoMaterial>;
}
