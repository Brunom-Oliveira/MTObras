import { SolicitacaoRepository } from '../../../domain/repositories/SolicitacaoRepository';
import { SolicitacaoMaterial, SolicitacaoItem, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export class PrismaSolicitacaoRepository implements SolicitacaoRepository {
  async findById(id: string): Promise<SolicitacaoMaterial | null> {
    return prisma.solicitacaoMaterial.findUnique({ where: { id } });
  }

  async listByTenant(tenantId: string): Promise<any[]> {
    return prisma.solicitacaoMaterial.findMany({ where: { tenantId } });
  }

  async create(data: {
    tenantId: string;
    obraId: string;
    requesterId: string;
    items: { materialId: string; quantity: number }[];
  }): Promise<SolicitacaoMaterial> {
    return prisma.solicitacaoMaterial.create({
      data: {
        tenantId: data.tenantId,
        obraId: data.obraId,
        requesterId: data.requesterId,
        status: 'PENDING',
        items: {
          create: data.items.map(i => ({ materialId: i.materialId, quantity: i.quantity } as Prisma.SolicitacaoItemCreateInput)),
        },
      },
    });
  }

  async updateStatus(id: string, status: string, approverId?: string | null): Promise<SolicitacaoMaterial> {
    return prisma.solicitacaoMaterial.update({
      where: { id },
      data: {
        status,
        approverId: approverId ?? undefined,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
      },
    });
  }
}
