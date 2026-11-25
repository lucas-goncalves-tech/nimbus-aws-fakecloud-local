# Nimbus Backend

API Express/TypeScript para o projeto Nimbus. Roda **somente** contra o FakeCloud local: nunca aponta para AWS real (o endpoint é validado na inicialização).

O serviço tem duas responsabilidades:

1. **Dominio LMS** (usuários, sessões, cursos, aulas e certificados), persistido em SQLite local.
2. **Fluxo Nimbus**: upload de vídeo → S3 → mensagem na SQS → Lambda → registro no DynamoDB → consulta de status pela API.

O contrato completo está em [`../docs/backend-contract.md`](../docs/backend-contract.md).

## Arquitetura

```
POST /api/v1/admin/lessons/upload-video  (autenticado, ADMIN)
        │
        ▼
UploadService ──► S3 (objeto)
        │
        ▼
FileService ────► DynamoDB (registro PENDING) ──► SQS (evento JSON)
                                                       │
                                                       ▼
                                          Lambda (backend/lambda)
                                                       │
                                                       ▼
                                          DynamoDB (PROCESSED / DLQ)

GET /api/v1/files/:id  (autenticado) ──► status do processamento
GET /health, GET /ready
```

## Pré-requisitos

- Node.js 24+ e npm.
- FakeCloud local em `http://localhost:4566` com bucket, fila (e DLQ) e tabela já criados pelo Terraform (Issues 009–013). O compose do emulador é responsabilidade da infra, não deste serviço.

## Como rodar

```bash
cp .env.example .env          # ajuste apenas valores locais/ficticios
npm install
npm run db:all                # cria e popula o SQLite do LMS
npm run dev                   # http://localhost:3333
```

Com Docker (o endpoint é reescrito para `host.docker.internal` dentro do container):

```bash
docker compose up --build
```

Verificação rápida:

```bash
curl http://localhost:3333/health   # { "status": "ok" }
curl http://localhost:3333/ready    # { "status": "ready", "checks": {...} }
```

## Endpoints principais

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| GET | `/health` | não | Liveness |
| GET | `/ready` | não | S3, SQS e DynamoDB |
| POST | `/api/v1/auth/login` | não | Retorna `{ token }` (Bearer) |
| POST | `/api/v1/admin/lessons/upload-video` | ADMIN | Envia `application/octet-stream` + header `x-filename`; grava no S3, publica na SQS |
| GET | `/api/v1/files/:id` | sim | Status do processamento |
| GET | `/api-docs` | não | OpenAPI/Scalar |

O token é aceito **somente** em `Authorization: Bearer <token>`. Nunca na query string.

## Variáveis de ambiente

Ver `.env.example`. As obrigatórias para o fluxo: `AWS_ENDPOINT_URL`, `S3_BUCKET`, `SQS_QUEUE_URL`, `DYNAMODB_TABLE`. Credenciais são fictícias (`test`/`test`). `S3_USE_MULTIPART=false` usa `PutObject` simples, útil se o emulador não suportar multipart.

## Lambda

```bash
npm run lambda:build     # gera dist/lambda/index.js
```

O zip desse arquivo é consumido pelo módulo `modules/compute` do Terraform. Envs da Lambda: `AWS_ENDPOINT_URL`, `AWS_REGION`, `DYNAMODB_TABLE` e credenciais fictícias. O event source mapping deve habilitar `ReportBatchItemFailures` e manter o timeout da Lambda menor que o visibility timeout da fila.

## Testes

```bash
npm test                 # unitarios (sem emulador)
npm run test:integration # fluxo ponta a ponta contra o FakeCloud
npm run cleanup          # remove objetos e registros de teste
```

## Limitações aceitas

- SQLite continua guardando usuários/sessões/cursos; só o fluxo de arquivos usa serviços "AWS". Migrar o domínio LMS para DynamoDB está fora de escopo.
- `seconds` do vídeo não é mais calculado por ffprobe no upload; o cliente informa o valor ao criar a aula (ou fica `0`).
- Rate limit é em memória (por processo); adequado para o ambiente local.
- Se o emulador não suportar notificação S3 → SQS, o backend publica a mensagem diretamente após o upload (alternativa prevista na Issue 013).
- Logs são JSON estruturados, sem query/body/token; erros seguem `{ code, message, requestId }`.
