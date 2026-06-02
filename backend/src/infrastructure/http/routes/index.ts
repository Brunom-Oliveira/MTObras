import { Router } from 'express';
import equipamentoRoutes from './equipamentoRoutes';
import solicitacaoRoutes from './solicitacaoRoutes';
import compraRoutes from './compraRoutes';
import inventarioRoutes from './inventarioRoutes';

const router = Router();

// Prefix each module's routes (they already start with their own path, e.g., '/compras')
router.use(equipamentoRoutes);
router.use(solicitacaoRoutes);
router.use(compraRoutes);
router.use(inventarioRoutes);

export default router;
