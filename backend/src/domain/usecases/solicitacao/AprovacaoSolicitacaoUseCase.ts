import { SolicitacaoRepository } from '../../../domain/repositories/SolicitacaoRepository';
import { AppError } from '../../errors/AppError';
import { z } from 'zod';
import { EstoqueRepository } from '../../../domain/repositories/EstoqueRepository';
import { prisma } from '../../../infrastructure/database/prisma';
import { SolicitacaoMaterial, RequestStatus } from '@prisma/client';

export interface AprovarDTO {
  solicitacaoId: string;
  approverId: string;
}

export class AprovacaoSolicitacaoUseCase {
  constructor(
    private solicitacaoRepo: SolicitacaoRepository,
    private estoqueRepo: EstoqueRepository,
  ) {}

  /**
   * Aprova a solicitação, atualiza seu status e reserva o estoque necessário.
   * Simplificação: somente marca a solicitação como APPROVED.
   */
  async approve(data: AprovarDTO): Promise<SolicitacaoMaterial> {
    // Validação usando Zod
    const AprovarSchema = z.object({
      solicitacaoId: z.string().uuid(),
      approverId: z.string().uuid(),
    });
    const parse = AprovarSchema.safeParse(data);
    if (!parse.success) {
      throw new AppError(parse.error.message, 400);
    }
    const { solicitacaoId, approverId } = parse.data;
    // Atualiza status da solicitação
    const updated = await this.solicitacaoRepo.updateStatus(solicitacaoId, RequestStatus.APROVADO, approverId);
    // Reserva de estoque: buscar itens da solicitação e atualizar quantidade reservada
    const items = await prisma.solicitacaoItem.findMany({ where: { solicitacaoId: solicitacaoId } });
    for (const item of items) {
      const estoque = await this.estoqueRepo.findEstoque(updated.obraId, item.materialId);
      if (!estoque) {
        throw new AppError(`Estoque não encontrado para material ${item.materialId}`, 404);
      }
      const newReserved = (estoque.reservedQty ?? 0) + item.quantity;
      if ((estoque.quantity ?? 0) < newReserved) {
        throw new AppError('Estoque insuficiente para reserva', 400);
      }
      await this.estoqueRepo.updateEstoqueReserved(estoque.id, newReserved);
    }
    // TODO: Implementar reserva de estoque adicional se necessário
    return updated;
  }
}
