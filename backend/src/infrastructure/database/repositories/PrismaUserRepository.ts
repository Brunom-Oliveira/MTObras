import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '@prisma/client';
import { prisma } from '../prisma';

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async listByTenant(tenantId: string): Promise<User[]> {
    return prisma.user.findMany({ where: { tenantId } });
  }
}
