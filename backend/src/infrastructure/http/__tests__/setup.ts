import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock the PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  Role: {
    ADMIN: 'ADMIN',
    ENGINEER: 'ENGINEER',
    WAREHOUSE_KEEPER: 'WAREHOUSE_KEEPER',
    SITE_MANAGER: 'SITE_MANAGER'
  },
  UnidadeMedida: { UN: 'UN', KG: 'KG' },
  ObraStatus: { ACTIVE: 'ACTIVE' },
  RequestStatus: { SOLICITADO: 'SOLICITADO', APROVADO: 'APROVADO' },
  PurchaseStatus: { PEDIDO_GERADO: 'PEDIDO_GERADO' },
  EquipStatus: { DISPONIVEL: 'DISPONIVEL' }
}));
