import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';

/**
 * Centralizado middleware de tratamento de erros.
 * Converte erros lançados (especialmente AppError) em respostas JSON amigáveis.
 * Para erros inesperados, registra no console e devolve mensagem genérica.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    // Erro de negócio com código de status customizado
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code ?? 'UNKNOWN',
    });
  }

  // Fallback para erros internos
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Erro interno do servidor. Por favor, tente novamente mais tarde.',
  });
}
