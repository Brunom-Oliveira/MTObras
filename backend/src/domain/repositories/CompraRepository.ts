import { PedidoCompra } from '@prisma/client';

export interface CompraRepository {
  findById(id: string): Promise<any | null>;
  listByTenant(tenantId: string): Promise<any[]>;
  create(data: {
    tenantId: string;
    solicitacaoId?: string | null;
    buyerId: string;
    supplierName: string;
    freightCost: number;
    deliveryTerms: string;
    items: { materialId: string; qtyOrdered: number; priceUnit: number }[];
  }): Promise<PedidoCompra>;
  updateStatus(id: string, status: string): Promise<PedidoCompra>;
  updateReceivedQuantity(itemId: string, quantity: number): Promise<void>;
}
