import { EstoqueRepository } from '../../repositories/EstoqueRepository';
import { AppError } from '../../../domain/errors/AppError';

export interface CreateEstoqueDTO {
  obraId: string;
  materialId: string;
  quantity: number;
  reservedQty?: number;
  minQty?: number;
  avgConsumption?: number;
}

export class CreateEstoque {
  constructor(private estoqueRepo: EstoqueRepository) { }

  async execute(data: CreateEstoqueDTO) {
    if (data.quantity < 0) {
      throw new AppError('Quantidade não pode ser negativa', 400, 'NEGATIVE_QUANTITY');
    }
    // Verificar se já existe estoque para a obra e material
    const existing = await this.estoqueRepo.findEstoque(data.obraId, data.materialId);
    if (existing) {
      // Atualiza a quantidade somando a nova quantidade
      const newQty = (existing.quantity ?? 0) + data.quantity;
      return this.estoqueRepo.updateEstoqueQuantity(existing.id, newQty);
    }
    // Caso não exista, cria um novo registro
    return this.estoqueRepo.createEstoque({
      obraId: data.obraId,
      materialId: data.materialId,
      quantity: data.quantity,
      reservedQty: data.reservedQty ?? 0,
      minQty: data.minQty ?? 0,
      avgConsumption: data.avgConsumption ?? 0,
    });
  }
}
