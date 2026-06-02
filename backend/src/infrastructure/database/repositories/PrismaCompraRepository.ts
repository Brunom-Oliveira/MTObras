import { CompraRepository } from '../../../domain/repositories/CompraRepository';
import { PedidoCompra, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export class PrismaCompraRepository implements CompraRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.pedidoCompra.findUnique({ where: { id } });
  }

  async listByTenant(tenantId: string): Promise<any[]> {
    return prisma.pedidoCompra.findMany({ where: { tenantId } });
  }

  async create(data: {
    tenantId: string;
    solicitacaoId?: string | null;
    buyerId: string;
    supplierName: string;
    freightCost: number;
    deliveryTerms: string;
    items: { materialId: string; qtyOrdered: number; priceUnit: number }[];
  }): Promise<PedidoCompra> {
    return prisma.pedidoCompra.create({
      data: {
        tenantId: data.tenantId,
        solicitacaoId: data.solicitacaoId ?? undefined,
        buyerId: data.buyerId,
        supplierName: data.supplierName,
        freightCost: data.freightCost,
        deliveryTerms: data.deliveryTerms,
        items: {
          create: data.items.map(i => ({
            materialId: i.materialId,
            qtyOrdered: i.qtyOrdered,
            priceUnit: i.priceUnit,
          } as Prisma.PedidoCompraItemCreateInput)),
        },
        status: 'CREATED',
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<PedidoCompra> {
    return prisma.pedidoCompra.update({
      where: { id },
      data: { status },
    });
  }

  async updateReceivedQuantity(itemId: string, quantity: number): Promise<void> {
    await prisma.pedidoCompraItem.update({
      where: { id: itemId },
      data: { qtyReceived: quantity },
    });
  }
}
