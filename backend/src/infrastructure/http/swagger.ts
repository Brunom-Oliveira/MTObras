import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';

export default function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'MTObras API',
        version: '1.0.0',
        description: 'Documentação da API do WMS MTObras',
      },
    },
    // Apontar para todos os arquivos de rotas e controladores onde as anotações @swagger podem estar presentes
    apis: [
      `${process.cwd()}/src/infrastructure/http/routes/*.ts`,
      `${process.cwd()}/src/infrastructure/http/controllers/*.ts`,
    ],
  };

  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
