import { Router } from 'express';
import { AlocacaoEquipamentoController } from '../controllers/AlocacaoEquipamentoController';

const router = Router();

// Allocate equipment to a worksite
router.post('/equipamento/allocate', AlocacaoEquipamentoController.allocate);

// Release equipment from a worksite
router.post('/equipamento/:equipamentoId/release', AlocacaoEquipamentoController.release);

export default router;
