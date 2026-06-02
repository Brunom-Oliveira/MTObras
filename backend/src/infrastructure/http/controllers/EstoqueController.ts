import { Request, Response } from 'express';
import { PrismaEstoqueRepository } from '../../database/repositories/PrismaEstoqueRepository';
import { CreateEstoque } from '../../../domain/usecases/estoque/CreateEstoque';
import { UpdateEstoqueQuantity } from '../../../domain/usecases/estoque/UpdateEstoqueQuantity';

const estoqueRepo = new PrismaEstoqueRepository();
const createEstoqueUseCase = new CreateEstoque(estoqueRepo);
const updateEstoqueQuantityUseCase = new UpdateEstoqueQuantity(estoqueRepo);

export class EstoqueController {
  static async create(req: Request, res: Response, next: any) {
    try {
      const result = await createEstoqueUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateQuantity(req: Request, res: Response, next: any) {
    try {
      const { id } = req.params;
      const { newQuantity } = req.body;
      const result = await updateEstoqueQuantityUseCase.execute({ estoqueId: id, newQuantity });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
