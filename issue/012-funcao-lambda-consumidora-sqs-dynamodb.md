# [012] Função Lambda consumidora (SQS → DynamoDB)

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Uma Lambda consome mensagens da fila e grava o resultado no DynamoDB.

## Contexto

- Primeiro componente de código de aplicação do projeto, executando no FakeCloud.
- Serviços: Lambda, SQS, DynamoDB, CloudWatch Logs.
- Decisão: handler idempotente, pois SQS entrega pelo menos uma vez.
- Limitação: confirmar quais runtimes e funcionalidades de Lambda o FakeCloud suporta.

## Pré-requisitos

- [ ] Issues 008, 010 e 011 concluídas.

## Tarefas

### 1. Preparação

- [ ] Escolher o runtime suportado pelo FakeCloud e criar `backend/lambda/`.
- [ ] Definir o contrato JSON da mensagem: campos obrigatórios, tipos e um identificador único que sirva de chave de idempotência.

### 2. Implementação

- [ ] Escrever o handler: lê o lote de mensagens, valida cada payload contra o contrato, grava no DynamoDB sem duplicar (usando o identificador único) e sinaliza à SQS quais mensagens falharam.
- [ ] Empacotar o código e criar a Lambda via Terraform.
- [ ] Criar o event source mapping ligando a fila à Lambda, com tamanho de lote e relatório de falhas parciais definidos.
- [ ] Passar nome da tabela e demais configurações por variáveis de ambiente.

### 3. Segurança e boas práticas

- [ ] Usar a role da Issue 008, sem permissões extras.
- [ ] Não registrar dados sensíveis nos logs.
- [ ] Rejeitar payloads inválidos antes de gravar.

### 4. Testes e automação

- [ ] Escrever testes unitários do handler cobrindo: payload válido, payload inválido e mensagem repetida.
- [ ] Escrever um teste de integração: mensagem na fila gera item na tabela.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `backend/lambda/`
- `modules/compute`
- Testes unitários e de integração

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Mensagem válida vira item no DynamoDB.
- [ ] Mensagem inválida acaba na DLQ.
- [ ] Reprocessar a mesma mensagem não duplica dados.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
