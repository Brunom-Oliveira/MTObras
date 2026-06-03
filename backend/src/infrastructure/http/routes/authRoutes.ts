import { Router } from 'express';
import { AuthUseCase } from '../../../domain/usecases/auth/AuthUseCase';
import { RegisterTenantUseCase } from '../../../domain/usecases/auth/RegisterTenantUseCase';

export const authRoutes = Router();

const authUseCase = new AuthUseCase();
const registerTenantUseCase = new RegisterTenantUseCase();

authRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authUseCase.execute(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

authRoutes.post('/register', async (req, res) => {
  try {
    const { tenantName, adminName, adminEmail, adminPassword } = req.body;
    const result = await registerTenantUseCase.execute(tenantName, adminName, adminEmail, adminPassword);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});
