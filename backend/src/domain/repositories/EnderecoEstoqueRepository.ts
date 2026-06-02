import { EnderecamentoEstoque } from '@prisma/client';

export interface EnderecoEstoqueRepository {
  findFirst(params: { estoqueObraId: string; local: string; subLocal?: string | null }): Promise<EnderecamentoEstoque | null>;
  create(data: {
    estoqueObraId: string;
    local: string;
    subLocal?: string | null;
    quantity: number;
  }): Promise<EnderecamentoEstoque>;
  updateQuantity(id: string, quantity: number): Promise<EnderecamentoEstoque>;
  findWithPositiveQty(estoqueObraId: string): Promise<EnderecamentoEstoque[]>;
}
