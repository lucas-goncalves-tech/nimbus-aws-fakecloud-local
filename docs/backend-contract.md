# Contrato do backend com a infraestrutura (Issue 013)

Este documento é o contrato entre o backend em `backend/` e os recursos criados pelo Terraform no FakeCloud. **Não há uso de AWS real.**

## Variáveis de ambiente

O backend valida na inicialização que `AWS_ENDPOINT_URL` aponta para host local (`localhost`, `127.0.0.1`; `fakecloud`/`host.docker.internal` apenas em dev/test). Qualquer outro host falha em startup.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | não (3333) | Porta HTTP |
| `NODE_ENV` | não (`development`) | `development`, `test` ou `production` |
| `AWS_ENDPOINT_URL` | **sim** | `http://localhost:4566` |
| `AWS_REGION` | não (`us-east-1`) | Região do emulador |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | não (`test`) | Credenciais **fictícias** |
| `S3_BUCKET` | **sim** | Nome do bucket de uploads |
| `SQS_QUEUE_URL` | **sim** | URL da fila principal (com DLQ configurada na infra) |
| `DYNAMODB_TABLE` | **sim** | Tabela de registros de processamento |
| `S3_KEY_PREFIX` | não (`uploads`) | Prefixo dos objetos |
| `S3_USE_MULTIPART` | não (`true`) | `false` usa `PutObject` simples |
| `PEPPER`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DB_FILE_NAME` | **sim** | Domínio LMS (SQLite local) |

Valores de exemplo estão em `backend/.env.example`. Nenhum valor real deve ser versionado.

## Recursos esperados da infra

- **S3**: bucket com Object Ownership controlado por bucket, ACLs desabilitadas, criptografia gerenciada pelo serviço e TLS-only (Issue 009).
- **SQS**: fila principal + DLQ, redrive com `maxReceiveCount > 1`, visibility timeout maior que o timeout da Lambda, criptografia gerenciada (Issue 011).
- **DynamoDB**: tabela com chave de partição `pk` (string) e chave de ordenação `sk` (string), criptografia gerenciada (Issue 010).
- **IAM**: role do backend com `s3:PutObject`, `s3:GetObject`, `s3:HeadObject`, `s3:DeleteObject` no ARN `bucket/*`; `sqs:SendMessage` na fila principal; `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:UpdateItem` na tabela. Sem IAM user, sem access key de longo prazo, sem `*` (Issue 013).
- A role da Lambda é definida na Issue 008 e recebe SQS receive/delete e DynamoDB update pela Issue 011/013.

## Autenticação

- Token opaco de sessão, hasheado no banco, enviado como `Authorization: Bearer <token>`.
- Token na query string **não é aceito** e não é logado.
- Rotas `/health` e `/ready` são públicas; `/api/v1/files/:id` exige sessão; rotas `/admin` exigem role `ADMIN`.
- Modelo definido pelo backend; a infra não expõe API Gateway/ALB neste projeto.

## Formato de erro

```json
{ "code": "NOT_FOUND", "message": "Recurso não encontrado!", "requestId": "uuid" }
```

- `requestId` é o valor do header `X-Request-Id` (gerado quando ausente).
- `code` é estável, derivado da classe de erro (`BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `SESSION`, `INTERNAL_ERROR`, ...).
- Stack traces e detalhes internos nunca são devolvidos ao cliente.

## Upload e mensagem

O upload entra por `POST /api/v1/admin/lessons/upload-video` com `Content-Type: application/octet-stream` e header `x-filename`. O backend valida tipo (`video/mp4`, `video/webm`) e tamanho (máx. 500 MB), grava o objeto, cria o registro `PENDING` e publica a mensagem. Se a publicação falhar, marca o registro como `FAILED` com `error = FALHA_PUBLICACAO_SQS`.

Mensagem SQS (contrato `version: 1`):

```json
{
  "version": 1,
  "fileId": "uuid",
  "bucket": "nimbus-dev-uploads",
  "key": "uploads/uuid.mp4",
  "etag": "...",
  "contentType": "video/mp4",
  "size": 12345,
  "uploadedAt": "2026-11-24T00:00:00.000Z"
}
```

- `fileId` é a chave de idempotência (`pk = FILE#<fileId>`).
- O payload é validado por Zod na API e na Lambda (schema único em `backend/src/features/files/file-event.dto.ts`).
- Origem do evento: o backend publica diretamente na fila. Se o FakeCloud suportar notificação S3 → SQS de forma confiável, a infra pode trocar a origem; nesse caso o formato da mensagem deve ser adaptado e o fato registrado em `docs/limitations.md`.

## Registro no DynamoDB

```
pk          = FILE#<fileId>       (string, partição)
sk          = META                (string, ordenação)
fileId      = uuid
status      = PENDING | PROCESSED | FAILED
bucket, key, etag, contentType, size, uploadedAt
createdAt, updatedAt, processedAt?
error?      = motivo curto da falha (sem dados sensíveis)
```

- A API cria `PENDING` com `attribute_not_exists(pk) AND attribute_not_exists(sk)`.
- A Lambda atualiza `PENDING → PROCESSED` com condição `#status = :pending`.
- Reentrega da SQS com registro já `PROCESSED` é tratada como sucesso (sem duplicata).
- Payload inválido ou registro fora de `PENDING` gera falha de lote (`batchItemFailures`); após as tentativas configuradas, a mensagem vai para a DLQ.

## Consulta de status

`GET /api/v1/files/:id` retorna `{ fileId, status, key, bucket, size, contentType, createdAt, updatedAt, processedAt }` com 200, ou 404 se o registro não existir.

## Verificação

- `curl http://localhost:3333/health` → 200.
- `curl http://localhost:3333/ready` → 200 com `checks.s3`, `checks.sqs`, `checks.dynamodb` = `ok`.
- Upload de um vídeo pequeno cria objeto no bucket, mensagem na fila e item `PROCESSED` na tabela.
- `npm run test:integration` cobre o fluxo ponta a ponta; `npm run cleanup` remove os artefatos de teste.

## Limitações aceitas

- O SQLite do LMS não é substituído nesta entrega.
- Notificação nativa S3 → SQS depende do emulador; quando ausente, a publicação pelo backend é a origem oficial.
- Multipart no S3 depende do emulador (`S3_USE_MULTIPART=false` como alternativa).
- Rate limit em memória e logs locais não são serviços gerenciados.
