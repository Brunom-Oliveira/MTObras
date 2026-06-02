import { InventarioRepository } from '../../../domain/repositories/InventarioRepository';
import { EstoqueRepository } from '../../../domain/repositories/EstoqueRepository';
import { EnderecoEstoqueRepository } from '../../../domain/repositories/EnderecoEstoqueRepository';

export interface InventarioDTO {
  tenantId: string;
  obraId: string;
  type: string;
  items: { materialId: string; qtySystem: number; qtyPhysical: number }[];
}

export class InventarioUseCase {
  constructor(
    private inventarioRepo: InventarioRepository,
    private estoqueRepo: EstoqueRepository,
    private enderecoRepo: EnderecoEstoqueRepository,
  ) {}

  /**
   * Cria um novo inventário e retorna o registro criado.
   */
  async create(data: InventarioDTO) {
    // Persistir inventário
    const inventario = await this.inventarioRepo.create({
      tenantId: data.tenantId,
      obraId: data.obraId,
      type: data.type,
      items: data.items.map(i => ({
        materialId: i.materialId,
        qtySystem: i.qtySystem,
        qtyPhysical: i.qtyPhysical,
        diff: i.qtyPhysical - i.qtySystem,
      })),
    });
    return inventario;
  }

  /**
   * Simples consulta de inventários por tenant.
   */
  async list(tenantId: string) {
    return this.inventarioRepo.listByTenant(tenantId);
  }
}
