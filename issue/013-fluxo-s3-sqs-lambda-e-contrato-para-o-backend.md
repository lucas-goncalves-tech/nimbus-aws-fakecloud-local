# [013] Fluxo S3 → SQS → Lambda e contrato para o backend

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Upload no S3 dispara mensagem na SQS e processamento pela Lambda de ponta a ponta.
- [ ] O contrato de integração com o backend futuro está documentado.

## Contexto

- Integra os componentes anteriores em um fluxo completo.
- Serviços: S3 (notificações), SQS, Lambda, DynamoDB.
- O backend será adicionado depois em `backend/app/`; esta Issue define o que ele precisa: variáveis de ambiente, endpoint do FakeCloud, nomes de recursos e permissões.
- Limitação: confirmar se o FakeCloud suporta notificações de S3 para SQS; se não, documentar o fluxo alternativo (backend envia a mensagem diretamente).

## Pré-requisitos

- [ ] Issues 009 a 012 concluídas.

## Tarefas

### 1. Preparação

- [ ] Definir qual evento do S3 dispara o fluxo (ex.: criação de objeto em um prefixo) e como esse evento vira a mensagem consumida pela Lambda.

### 2. Implementação

- [ ] Configurar a notificação do bucket para a fila (ou o fluxo alternativo, se o FakeCloud não suportar).
- [ ] Ajustar a policy da fila para aceitar o bucket como origem.
- [ ] Expor em `outputs.tf` nome, ARN e URL de bucket, fila e tabela, para o backend e os testes consumirem.
- [ ] Escrever `docs/backend-contract.md` com: variáveis de ambiente que o backend deve receber, nomes e URLs de bucket, fila e tabela, endpoint do FakeCloud e permissões que a role do backend terá.

### 3. Segurança e boas práticas

- [ ] Restringir a policy da fila ao ARN do bucket.
- [ ] Listar as permissões mínimas que o backend deverá ter.

### 4. Testes e automação

- [ ] Escrever um teste ponta a ponta: do upload no bucket até o item na tabela.

## Entrega

Artefatos que deverão existir ao final da Issue:

- Configuração de integração
- `outputs.tf`
- `docs/backend-contract.md`
- Teste de integração em `tests/`

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] O teste ponta a ponta passa.
- [ ] Falha forçada chega à DLQ.
- [ ] `docs/backend-contract.md` cobre variáveis, endpoints e permissões.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
