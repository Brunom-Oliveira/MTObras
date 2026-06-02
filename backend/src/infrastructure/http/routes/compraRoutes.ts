import { Router } from 'express';
import { CompraController } from '../controllers/CompraController';

const router = Router();

// Listar todas as compras do tenant
router.get('/compras', CompraController.getAll);

// Criar nova compra
router.post('/compras', CompraController.create);

export default router;
