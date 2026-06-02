import { Request, Response } from 'express';
import { PrismaSolicitacaoRepository } from '../../database/repositories/PrismaSolicitacaoRepository';
import { PrismaEstoqueRepository } from '../../database/repositories/PrismaEstoqueRepository';
import { PrismaEnderecoEstoqueRepository } from '../../database/repositories/PrismaEnderecoEstoqueRepository';
import { AprovacaoSolicitacaoUseCase, AprovarDTO } from '../../../domain/usecases/solicitacao/AprovacaoSolicitacaoUseCase';

const solicitacaoRepo = new PrismaSolicitacaoRepository();
const estoqueRepo = new PrismaEstoqueRepository();
const enderecoRepo = new PrismaEnderecoEstoqueRepository();
const aprovacaoUseCase = new AprovacaoSolicitacaoUseCase(solicitacaoRepo, estoqueRepo, enderecoRepo);

export class AprovacaoSolicitacaoController {
  static async approve(req: Request, res: Response, next: any) {
    try {
      const dto: AprovarDTO = req.body;
      const result = await aprovacaoUseCase.approve(dto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
