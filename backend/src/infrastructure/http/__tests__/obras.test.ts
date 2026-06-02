import request from 'supertest';
import { app } from '../../../index'; // Import app before setup to ensure proper mocking or setup runs first
import { prismaMock } from './setup';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Obras API', () => {
  it('should list all obras', async () => {
    const mockObras = [
      {
        id: 'obra-1',
        tenantId: 'tenant-1',
        code: 'OB-001',
        name: 'Obra Teste',
        clientName: 'Cliente Teste',
        address: 'Rua Teste, 123',
        budget: 1000000,
        status: 'ACTIVE',
        startDate: new Date(),
        expectedEndDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Mock the findMany call
    prismaMock.obra.findMany.mockResolvedValue(mockObras as any);

    const res = await request(app)
      .get('/api/obras')
      .set('x-tenant-id', 'tenant-1'); // From our tenantMiddleware

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Obra Teste');
  });

  it('should create a new obra', async () => {
    const newObra = {
      id: 'obra-2',
      tenantId: 'tenant-1',
      code: 'OB-002',
      name: 'Nova Obra',
      clientName: 'Novo Cliente',
      address: 'Avenida Teste',
      budget: 500000,
      status: 'ACTIVE',
      startDate: new Date(),
      expectedEndDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    prismaMock.obra.create.mockResolvedValue(newObra as any);

    const res = await request(app)
      .post('/api/obras')
      .set('x-tenant-id', 'tenant-1')
      .send({
        code: 'OB-002',
        name: 'Nova Obra',
        clientName: 'Novo Cliente',
        address: 'Avenida Teste',
        budget: 500000,
        startDate: new Date().toISOString(),
        expectedEndDate: new Date().toISOString()
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Nova Obra');
    expect(prismaMock.obra.create).toHaveBeenCalledTimes(1);
  });
});
