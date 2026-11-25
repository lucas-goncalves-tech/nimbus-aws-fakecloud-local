# [009] Bucket S3 seguro

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Existe bucket S3 por ambiente com bloqueio de acesso público, versionamento e criptografia.

## Contexto

- O bucket recebe arquivos (uploads, artefatos) e dispara o fluxo assíncrono das Issues 011 a 013.
- Serviço: S3.
- Decisão: nome do bucket com prefixo `nimbus-<env>`; sem ACLs públicas.
- Não usar KMS/CMK nesta fase: criptografia gerenciada pelo serviço. KMS fica fora de escopo por não haver AWS real.

## Pré-requisitos

- [ ] Issues 002 e 008 concluídas.

## Tarefas

### 1. Preparação

- [ ] Definir o nome do bucket, os prefixos de objeto (ex.: `uploads/`, `processed/`) e por quanto tempo cada prefixo deve ser mantido.

### 2. Implementação

- [ ] Criar o bucket com versionamento e criptografia gerenciada pelo serviço (sem CMK).
- [ ] Definir Object Ownership como `BucketOwnerEnforced` e desabilitar ACLs.
- [ ] Bloquear todo acesso público.
- [ ] Escrever a policy de bucket: negar acesso sem TLS, não usar `Principal: *` e conceder leitura/escrita por prefixo aos principais que já existem. Os grants para a role do backend são finalizados na Issue 013.
- [ ] Configurar o ciclo de vida: expiração de versões antigas e do prefixo temporário, conforme definido na preparação.

### 3. Segurança e boas práticas

- [ ] Proibir `Principal: *`.
- [ ] Permitir `force_destroy` só em `dev`.
- [ ] Não usar KMS/CMK; registrar a decisão de usar criptografia gerenciada.

### 4. Testes e automação

- [ ] Escrever um script que envia e baixa um objeto de teste e verifica public access block, TLS-only e ausência de `Principal: *`.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `modules/storage`
- Testes de configuração do bucket

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Upload e download funcionam.
- [ ] Duas versões do mesmo objeto são mantidas.
- [ ] O bloqueio de acesso público está ativo.
- [ ] A policy nega acesso sem TLS e não contém `Principal: *`.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
