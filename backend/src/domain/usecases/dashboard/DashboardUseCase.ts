import { CompraRepository } from '../../../domain/repositories/CompraRepository';
import { ConsumoRepository } from '../../../domain/repositories/ConsumoRepository';
import { EstoqueRepository } from '../../../domain/repositories/EstoqueRepository';
import { ObraRepository } from '../../../domain/repositories/ObraRepository';
import { PrismaClient } from '@prisma/client';

export interface DashboardDTO {
  totalComprasValor: number;
  totalConsumoQuantidade: number;
  totalEstoqueQuantidade: number;
  obrasAtivas: number;
  materiaisCriticos: number;
}

export class DashboardUseCase {
  constructor(
    private compraRepo: CompraRepository,
    private consumoRepo: ConsumoRepository,
    private estoqueRepo: EstoqueRepository,
    private obraRepo: ObraRepository,
  ) {}

  async execute(tenantId: string): Promise<DashboardDTO> {
    // 1. Valor total das compras (soma de freightCost + sum(item.priceUnit * item.qtyOrdered))
    const compras = await this.compraRepo.listByTenant(tenantId);
    const totalComprasValor = compras.reduce((acc: number, compra: any) => {
      const itemsTotal = (compra.items ?? []).reduce((iAcc: number, item: any) => iAcc + (item.priceUnit * item.qtyOrdered), 0);
      return acc + compra.freightCost + itemsTotal;
    }, 0);

    // 2. Quantidade total de consumo
    const consumos = await this.consumoRepo.listByTenant(tenantId);
    const totalConsumoQuantidade = consumos.reduce((acc: number, c: any) => acc + c.quantity, 0);

    // 3. Quantidade total em estoque (soma de quantity nos endereços de estoque)
    const estoques = await this.estoqueRepo.listByTenant(tenantId);
    const totalEstoqueQuantidade = estoques.reduce((acc: number, e: any) => acc + e.quantity, 0);

    // 4. Obras ativas (status != 'FECHADA')
    const obras = await this.obraRepo.listByTenant(tenantId);
    const obrasAtivas = obras.filter(o => o.status !== 'FECHADA').length;

    // 5. Materiais críticos (estoque < ponto de reposição ou quantidade baixa). Simplesmente abaixo de 10.
    const materiaisCriticos = estoques.filter(e => e.quantity < 10).length;

    return {
      totalComprasValor,
      totalConsumoQuantidade,
      totalEstoqueQuantidade,
      obrasAtivas,
      materiaisCriticos,
    };
  }
}
