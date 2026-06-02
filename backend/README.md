# MTObras Backend – Sprint 2 Finalização

## Visão geral
Este repositório contém a API backend do **MTObras**, um sistema WMS para construção civil. Nesta sprint concluímos a camada de aplicação (use‑cases), controllers, rotas e a lógica de reserva de estoque ao aprovar solicitações de materiais.

## Principais funcionalidades implementadas
- **Use‑case `AprovacaoSolicitacaoUseCase`**: valida UUIDs com Zod, atualiza o status da solicitação e reserva o estoque (atualiza `reservedQty`).
- **Validação centralizada** via `AppError` para mensagens de erro consistentes.
- **Controllers** e rotas REST expostas em `src/infrastructure/http/routes/index.ts`.
- **Swagger/OpenAPI** (esboço) para todos os endpoints.
- **Testes** (planejados) para use‑cases e controllers.

## Instalação e execução
```bash
# Clone o repositório
git clone <repo-url>
cd Obra/backend

# Instalar dependências
npm install

# Configurar .env (exemplo)
cp .env.example .env
# Ajuste as variáveis de conexão ao PostgreSQL

# Executar migrações Prisma
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run dev
```

A API ficará disponível em `http://localhost:3000` e a documentação Swagger pode ser acessada em `/api-docs` (ou conforme configuração).

## Endpoints principais
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/solicitacoes/aprovar` | Aprova solicitação, atualiza status e reserva estoque. |
| `POST` | `/equipamentos/alocar` | Aloca equipamento a uma obra. |
| `POST` | `/equipamentos/:id/liberar` | Libera equipamento. |
| `POST` | `/inventarios` | Cria inventário cíclico. |
| `GET`  | `/dashboard` | Retorna KPIs consolidados. |

## Documentação da lógica de reserva de estoque
Quando uma solicitação é aprovada:
1. Busca os itens ligados à solicitação (`solicitacaoItem`).
2. Para cada item verifica o estoque (`EstoqueObra`).
3. Calcula a nova quantidade reservada (`reservedQty`).
4. Se o estoque total for insuficiente lança `AppError(400)`.  
5. Atualiza o registro de estoque via `updateEstoqueReserved`.

## Testes
Os testes unitários e de integração estão planejados em `src/domain/usecases/**/__tests__` e `src/infrastructure/http/controllers/__tests__` usando **Jest** e **Supertest**. Execute:
```bash
npm test
```

## Contribuição
1. Fork o repositório.
2. Crie uma branch para sua feature (`git checkout -b feature/foo`).
3. Commit suas alterações (`git commit -m 'feat: add foo'`).
4. Push (`git push origin feature/foo`).
5. Abra um Pull Request.

## Licença
MIT
