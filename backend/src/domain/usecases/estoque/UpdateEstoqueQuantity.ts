import { EstoqueRepository } from '../../../domain/repositories/EstoqueRepository';
import { AppError } from '../../../domain/errors/AppError';

export interface UpdateEstoqueQuantityDTO {
  estoqueId: string;
  newQuantity: number;
}

export class UpdateEstoqueQuantity {
  constructor(private estoqueRepo: EstoqueRepository) {}

  async execute({ estoqueId, newQuantity }: UpdateEstoqueQuantityDTO) {
    if (newQuantity < 0) {
      throw new AppError('Quantidade não pode ser negativa', 400, 'NEGATIVE_QUANTITY');
    }
    return this.estoqueRepo.updateEstoqueQuantity(estoqueId, newQuantity);
  }
}
