import { SolicitacaoRepository } from '../../../domain/repositories/SolicitacaoRepository';
import { PrismaClient, Prisma, RequestStatus, SolicitacaoMaterial } from '@prisma/client';
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
        status: RequestStatus.SOLICITADO,
        items: {
          create: data.items.map(i => ({ materialId: i.materialId, quantity: i.quantity })),
        },
      },
    });
  }

  async updateStatus(id: string, status: RequestStatus, approverId?: string): Promise<SolicitacaoMaterial> {
    return prisma.solicitacaoMaterial.update({
      where: { id },
      data: {
        status,
        approverId: approverId ?? undefined
      },
    });
  }
}
