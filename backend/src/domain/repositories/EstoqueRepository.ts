import { EstoqueObra, EnderecamentoEstoque } from '@prisma/client';

export interface EstoqueRepository {
  findByObra(obraId: string): Promise<any[]>;
  findEstoque(obraId: string, materialId: string): Promise<EstoqueObra | null>;
  createEstoque(data: Omit<EstoqueObra, 'id'>): Promise<EstoqueObra>;
  updateEstoqueQuantity(id: string, quantity: number): Promise<EstoqueObra>;
  updateEstoqueReserved(id: string, reservedQty: number): Promise<EstoqueObra>;
  findEndereco(estoqueObraId: string, local: string, subLocal: string | null): Promise<EnderecamentoEstoque | null>;
  createEndereco(data: Omit<EnderecamentoEstoque, 'id'>): Promise<EnderecamentoEstoque>;
  updateEnderecoQuantity(id: string, quantity: number): Promise<EnderecamentoEstoque>;
  listEnderecosByEstoque(estoqueObraId: string): Promise<EnderecamentoEstoque[]>;
}
