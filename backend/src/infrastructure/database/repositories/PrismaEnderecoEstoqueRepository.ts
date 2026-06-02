import { EnderecoEstoqueRepository } from '../../../domain/repositories/EnderecoEstoqueRepository';
import { EnderecamentoEstoque } from '@prisma/client';
import { prisma } from '../prisma';

export class PrismaEnderecoEstoqueRepository implements EnderecoEstoqueRepository {
  /**
   * Busca o primeiro endereço de estoque que coincide com os parâmetros.
   * Utiliza `findFirst` para garantir que apenas um registro seja retornado.
   */
  async findFirst(params: {
    estoqueObraId: string;
    local: string;
    subLocal?: string | null;
  }): Promise<EnderecamentoEstoque | null> {
    return prisma.enderecamentoEstoque.findFirst({
      where: {
        estoqueObraId: params.estoqueObraId,
        local: params.local,
        ...(params.subLocal ? { subLocal: params.subLocal } : {}),
      },
    });
  }

  /**
   * Cria um novo endereço de estoque.
   */
  async create(data: {
    estoqueObraId: string;
    local: string;
    subLocal?: string | null;
    quantity: number;
  }): Promise<EnderecamentoEstoque> {
    return prisma.enderecamentoEstoque.create({
      data: {
        estoqueObraId: data.estoqueObraId,
        local: data.local,
        subLocal: data.subLocal ?? undefined,
        quantity: data.quantity,
      },
    });
  }

  /**
   * Atualiza a quantidade disponível em um endereço de estoque existente.
   */
  async updateQuantity(id: string, quantity: number): Promise<EnderecamentoEstoque> {
    return prisma.enderecamentoEstoque.update({
      where: { id },
      data: { quantity },
    });
  }

  /**
   * Retorna todos os endereços de estoque de uma obra que possuem quantidade > 0.
   */
  async findWithPositiveQty(estoqueObraId: string): Promise<EnderecamentoEstoque[]> {
    return prisma.enderecamentoEstoque.findMany({
      where: {
        estoqueObraId,
        quantity: { gt: 0 },
      },
    });
  }
}
