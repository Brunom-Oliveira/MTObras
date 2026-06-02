import { Request, Response } from 'express';
import { PrismaCompraRepository } from '../../database/repositories/PrismaCompraRepository';
import { CompraRepository } from '../../../domain/repositories/CompraRepository';
import { PedidoCompra } from '@prisma/client';

const compraRepo: CompraRepository = new PrismaCompraRepository();

export class CompraController {
  static async getAll(req: Request, res: Response, next: any) {
    try {
      const list = await compraRepo.listByTenant((req as any).tenantId);
      res.json(list);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: any) {
    try {
      const data = req.body;
      const created: PedidoCompra = await compraRepo.create(data);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }
}
