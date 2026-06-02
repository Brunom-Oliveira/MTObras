import { EstoqueRepository } from '../../../domain/repositories/EstoqueRepository';
import { EstoqueObra, EnderecamentoEstoque } from '@prisma/client';
import { prisma } from '../prisma';

export class PrismaEstoqueRepository implements EstoqueRepository {
  async findByObra(obraId: string): Promise<any[]> {
    return prisma.estoqueObra.findMany({
      where: { obraId },
      include: {
        material: true,
        enderecos: true
      }
    });
  }

  async findEstoque(obraId: string, materialId: string): Promise<EstoqueObra | null> {
    return prisma.estoqueObra.findFirst({
      where: { obraId, materialId }
    });
  }

  async createEstoque(data: Omit<EstoqueObra, 'id'>): Promise<EstoqueObra> {
    return prisma.estoqueObra.create({ data });
  }

  async updateEstoqueQuantity(id: string, quantity: number): Promise<EstoqueObra> {
    return prisma.estoqueObra.update({
      where: { id },
      data: { quantity }
    });
  }

  async updateEstoqueReserved(id: string, reservedQty: number): Promise<EstoqueObra> {
    return prisma.estoqueObra.update({
      where: { id },
      data: { reservedQty }
    });
  }

  async findEndereco(estoqueObraId: string, local: string, subLocal: string | null): Promise<EnderecamentoEstoque | null> {
    return prisma.enderecamentoEstoque.findFirst({
      where: {
        estoqueObraId,
        local,
        subLocal: subLocal || null
      }
    });
  }

  async createEndereco(data: Omit<EnderecamentoEstoque, 'id'>): Promise<EnderecamentoEstoque> {
    return prisma.enderecamentoEstoque.create({ data });
  }

  async updateEnderecoQuantity(id: string, quantity: number): Promise<EnderecamentoEstoque> {
    return prisma.enderecamentoEstoque.update({
      where: { id },
      data: { quantity }
    });
  }

  async listEnderecosByEstoque(estoqueObraId: string): Promise<EnderecamentoEstoque[]> {
    return prisma.enderecamentoEstoque.findMany({
      where: { estoqueObraId }
    });
  }
}
