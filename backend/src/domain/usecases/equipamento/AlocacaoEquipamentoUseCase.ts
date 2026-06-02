import { EquipamentoRepository } from '../../../domain/repositories/EquipamentoRepository';
import { ObraRepository } from '../../../domain/repositories/ObraRepository';
import { Equipamento } from '@prisma/client';

export interface AlocacaoDTO {
  equipamentoId: string;
  obraId: string;
  status: 'EM_USO' | 'DISPONIVEL';
}

export class AlocacaoEquipamentoUseCase {
  constructor(
    private equipamentoRepo: EquipamentoRepository,
    private obraRepo: ObraRepository,
  ) {}

  /**
   * Aloca um equipamento a uma obra, marcando-o como EM_USO.
   */
  async allocate(dto: AlocacaoDTO): Promise<Equipamento> {
    // Verifica se a obra existe (optional validation)
    const obra = await this.obraRepo.findById(dto.obraId);
    if (!obra) {
      throw new Error(`Obra ${dto.obraId} não encontrada`);
    }
    // Atualiza a alocação no equipamento
    return this.equipamentoRepo.updateAllocation(dto.equipamentoId, dto.obraId, dto.status);
  }

  /**
   * Libera o equipamento, removendo a associação com a obra e definindo status DISPONIVEL.
   */
  async release(equipamentoId: string): Promise<Equipamento> {
    return this.equipamentoRepo.updateAllocation(equipamentoId, null, 'DISPONIVEL');
  }
}
