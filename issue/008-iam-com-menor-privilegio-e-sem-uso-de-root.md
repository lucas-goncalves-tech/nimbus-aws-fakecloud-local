# [008] IAM com menor privilégio e sem uso de Root

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Existem roles distintas para Lambda e backend com policies mínimas.
- [ ] Nenhuma policy usa `Action: *` ou `Resource: *` sem justificativa.

## Contexto

- IAM é o principal controle de segurança em nuvem. O Root nunca deve ser usado para operar o projeto.
- Recursos: roles, policies, trust policies.
- Limitação: o FakeCloud pode não avaliar policies como a AWS real; checar na documentação até onde vai a avaliação de IAM e registrar.
- Decisão: policies escritas com `aws_iam_policy_document`, ARNs específicos vindos dos outros módulos.

## Pré-requisitos

- [ ] Issue 004 concluída.
- [ ] Idealmente, antes das Issues 009 a 012 (para referenciar ARNs).

## Tarefas

### 1. Preparação

- [ ] Listar, por componente, as ações de API e os recursos que ele realmente usa (ex.: receber mensagens da fila X, escrever na tabela Y).

### 2. Implementação

- [ ] Criar a role da Lambda (logs, consumo de SQS, escrita em DynamoDB).
- [ ] Criar a role do backend (envio a SQS, acesso a S3 e DynamoDB).
- [ ] Escrever as trust policies: quem pode assumir cada role (o serviço Lambda para a role da Lambda; o principal do backend para a role dele).
- [ ] Montar as policies com `aws_iam_policy_document`, usando ARNs vindos dos módulos.

### 3. Segurança e boas práticas

- [ ] Evitar `Action: *` e `Resource: *`.
- [ ] Separar permissões por ambiente.
- [ ] Não usar Root em nenhum script.

### 4. Testes e automação

- [ ] Escrever um teste que falha ao encontrar wildcard indevido nas policies.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `modules/iam`
- Testes de policy
- Seção em `docs/` sobre limitações de IAM no emulador

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Nenhuma policy com wildcard injustificado.
- [ ] O teste de policies passa.
- [ ] O que o FakeCloud avalia de IAM está listado em `docs/limitations.md`.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
