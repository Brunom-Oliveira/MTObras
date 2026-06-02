import { Request, Response } from 'express';
import { PrismaInventarioRepository } from '../../database/repositories/PrismaInventarioRepository';
import { InventarioRepository } from '../../../domain/repositories/InventarioRepository';
import { Inventario } from '@prisma/client';

const inventarioRepo: InventarioRepository = new PrismaInventarioRepository();

export class InventarioController {
  static async getAll(req: Request, res: Response, next: any) {
    try {
      const list = await inventarioRepo.listByTenant((req as any).tenantId);
      res.json(list);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: any) {
    try {
      const data = req.body;
      const created: Inventario = await inventarioRepo.create(data);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }
}
