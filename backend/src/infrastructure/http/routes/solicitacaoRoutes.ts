import { Router } from 'express';
import { AprovacaoSolicitacaoController } from '../controllers/AprovacaoSolicitacaoController';

const router = Router();

// Approve a solicitation
router.post('/solicitacoes/:id/aprovar', AprovacaoSolicitacaoController.approve);

export default router;
