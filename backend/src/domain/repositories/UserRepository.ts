import { User } from '@prisma/client';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  listByTenant(tenantId: string): Promise<User[]>;
}
