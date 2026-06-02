import { Router } from 'express';
import { InventarioController } from '../controllers/InventarioController';

const router = Router();

// Listar todos os inventários do tenant
router.get('/inventarios', InventarioController.getAll);

// Criar novo inventário
router.post('/inventarios', InventarioController.create);

export default router;
