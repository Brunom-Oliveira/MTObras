import { Request, Response } from 'express';
import { PrismaEquipamentoRepository } from '../../database/repositories/PrismaEquipamentoRepository';
import { PrismaObraRepository } from '../../database/repositories/PrismaObraRepository';
import { AlocacaoEquipamentoUseCase, AlocacaoDTO } from '../../../domain/usecases/equipamento/AlocacaoEquipamentoUseCase';

const equipamentoRepo = new PrismaEquipamentoRepository();
const obraRepo = new PrismaObraRepository();
const alocacaoUseCase = new AlocacaoEquipamentoUseCase(equipamentoRepo, obraRepo);

export class AlocacaoEquipamentoController {
  static async allocate(req: Request, res: Response, next: any) {
    try {
      const dto: AlocacaoDTO = req.body;
      // Validação básica dos campos obrigatórios
      if (!dto.equipamentoId || !dto.obraId || !dto.status) {
        const { AppError } = require('../../../domain/errors/AppError');
        throw new AppError('Campos obrigatórios ausentes: equipamentoId, obraId e status', 400);
      }
      const result = await alocacaoUseCase.allocate(dto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async release(req: Request, res: Response, next: any) {
    try {
      const { equipamentoId } = req.params;
      if (!equipamentoId) {
        const { AppError } = require('../../../domain/errors/AppError');
        throw new AppError('ID do equipamento ausente na URL', 400);
      }
      const result = await alocacaoUseCase.release(equipamentoId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
