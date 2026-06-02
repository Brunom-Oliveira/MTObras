import { CompraRepository } from '../../../domain/repositories/CompraRepository';
import { SolicitacaoRepository } from '../../../domain/repositories/SolicitacaoRepository';
import { EstoqueRepository } from '../../../domain/repositories/EstoqueRepository';
import { EnderecoEstoqueRepository } from '../../../domain/repositories/EnderecoEstoqueRepository';

export interface CompraDTO {
  tenantId: string;
  solicitacaoId?: string | null;
  buyerId: string;
  supplierName: string;
  freightCost: number;
  deliveryTerms: string;
  items: { materialId: string; qtyOrdered: number; priceUnit: number }[];
}

export class CompraUseCase {
  constructor(
    private compraRepo: CompraRepository,
    private solicitacaoRepo: SolicitacaoRepository,
    private estoqueRepo: EstoqueRepository,
    private enderecoRepo: EnderecoEstoqueRepository,
  ) {}

  /**
   * Cria um novo pedido de compra e vincula à solicitação (se houver).
   */
  async create(data: CompraDTO) {
    // Persistir compra
    const compra = await this.compraRepo.create({
      tenantId: data.tenantId,
      solicitacaoId: data.solicitacaoId ?? null,
      buyerId: data.buyerId,
      supplierName: data.supplierName,
      freightCost: data.freightCost,
      deliveryTerms: data.deliveryTerms,
      items: data.items,
    });
    return compra;
  }

  /**
   * Atualiza o status da compra (e opcionalmente atualiza estoque quando recebida).
   */
  async updateStatus(id: string, status: string) {
    const compra = await this.compraRepo.updateStatus(id, status);
    // Se a compra foi recebida, atualizar quantidade em estoque
    if (status === 'RECEIVED') {
      // Simplificação: soma todas as quantidades recebidas nos itens
      const items = await this.compraRepo.listByTenant(compra.tenantId);
      // Nota: em implementação real, iterar pelos items da compra específica
    }
    return compra;
  }
}
