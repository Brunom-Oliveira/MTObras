declare namespace Express {
  export interface Request {
    tenantId: string;
    userId: string;
    userRole: string;
  }
}
