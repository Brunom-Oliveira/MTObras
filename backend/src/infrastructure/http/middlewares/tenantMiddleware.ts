import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that extracts tenantId from the JWT payload (assumed to be decoded
 * by an upstream auth middleware) and attaches it to the request object.
 * If no tenantId is present, the request is rejected with 401.
 */
export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // Assuming a previous auth middleware set req.user
  const user = (req as any).user;
  if (user && typeof user.tenantId === 'string') {
    (req as any).tenantId = user.tenantId;
    return next();
  }
  // Fallback: try to read a header (useful during dev without auth)
  const tenantIdHeader = req.headers['x-tenant-id'];
  if (typeof tenantIdHeader === 'string') {
    (req as any).tenantId = tenantIdHeader;
    return next();
  }
  return res.status(401).json({ error: 'Tenant identification missing' });
}
