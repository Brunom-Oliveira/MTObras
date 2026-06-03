import { prisma } from '../../../infrastructure/database/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../../errors/AppError';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';

export class RegisterTenantUseCase {
  async execute(tenantName: string, adminName: string, adminEmail: string, adminPassword: string) {
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existingUser) {
      throw new AppError('Email já está em uso.', 400);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 8);
    const mockCnpj = `00.000.000/0001-${Math.floor(Math.random() * 99)}`;

    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        cnpj: mockCnpj,
        users: {
          create: {
            name: adminName,
            email: adminEmail,
            password: passwordHash,
            role: Role.OWNER,
          }
        }
      },
      include: {
        users: true
      }
    });

    const user = tenant.users[0];

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1d' }
    );

    return {
      tenant: { id: tenant.id, name: tenant.name },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token
    };
  }
}
