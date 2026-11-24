# [010] Tabela DynamoDB

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Existe uma tabela DynamoDB por ambiente com chaves bem definidas.

## Contexto

- Guarda o estado de processamento do fluxo (ex.: registro por arquivo ou mensagem).
- Serviço: DynamoDB.
- Decisão: modelagem orientada ao padrão de acesso, definido antes do código.

## Pré-requisitos

- [ ] Issues 002 e 008 concluídas.

## Tarefas

### 1. Preparação

- [ ] Escrever em `docs/data-model.md` as perguntas que a aplicação faz à tabela (ex.: buscar por id, listar por status) e, a partir delas, escolher as chaves de partição e ordenação e os atributos de cada item.

### 2. Implementação

- [ ] Criar a tabela com o modo de cobrança adequado.
- [ ] Ativar TTL, se o modelo pedir.
- [ ] Ativar criptografia e recuperação point-in-time em `prod`.

### 3. Segurança e boas práticas

- [ ] Dar acesso apenas às roles da Issue 008.
- [ ] Ativar proteção contra deleção em `prod`.

### 4. Testes e automação

- [ ] Escrever um script que insere, lê e consulta itens de exemplo.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `modules/database`
- `docs/data-model.md`

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Os padrões de acesso planejados funcionam na tabela.
- [ ] Proteção contra deleção ativa em `prod`.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
