import { prisma } from './prisma';
import { EnderecoEstoqueRepository } from '../../domain/repositories/EnderecoEstoqueRepository';
import { EnderecamentoEstoque } from '@prisma/client';

export class PrismaEnderecoEstoqueRepository implements EnderecoEstoqueRepository {
  async findFirst(params: { estoqueObraId: string; local: string; subLocal?: string | null }) {
    return prisma.enderecamentoEstoque.findFirst({
      where: {
        estoqueObraId: params.estoqueObraId,
        local: params.local,
        subLocal: params.subLocal ?? null,
      },
    });
  }

  async create(data: { estoqueObraId: string; local: string; subLocal?: string | null; quantity: number }) {
    return prisma.enderecamentoEstoque.create({ data });
  }

  async updateQuantity(id: string, quantity: number) {
    return prisma.enderecamentoEstoque.update({ where: { id }, data: { quantity } });
  }

  async findWithPositiveQty(estoqueObraId: string) {
    return prisma.enderecamentoEstoque.findMany({
      where: { estoqueObraId, quantity: { gt: 0 } },
      orderBy: { quantity: 'asc' },
    });
  }
}
