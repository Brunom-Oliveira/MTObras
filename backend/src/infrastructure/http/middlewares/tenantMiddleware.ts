import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/prisma';

/**
 * Middleware que garante isolamento lógico de tenants.
 * Busca o tenantId no cabeçalho `x-tenant-id` ou usa o tenant padrão.
 */
export async function tenantMiddleware(req: Request, _res: Response, next: NextFunction) {
  let tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) {
    const defaultTenant = await prisma.tenant.findFirst();
    tenantId = defaultTenant ? defaultTenant.id : '';
  }
  (req as any).tenantId = tenantId;
  next();
}
