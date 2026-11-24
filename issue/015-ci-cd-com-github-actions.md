# [015] CI/CD com GitHub Actions

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Cada pull request roda formatação, validação, análise de segurança, plan e testes.
- [ ] Deploy em `prod` exige aprovação manual.

## Contexto

- Automatiza a verificação e documenta o processo de entrega.
- Ferramenta: GitHub Actions, com o FakeCloud subindo como serviço no job.
- Decisão: `dev` aplicado após merge; `prod` somente por aprovação manual (environment protection).

## Pré-requisitos

- [ ] Issues 001 a 014 concluídas.

## Tarefas

### 1. Preparação

- [ ] Definir os jobs e a ordem: formatação, validação, segurança, plan, testes.

### 2. Implementação

- [ ] Criar `.github/workflows/ci.yml` que, a cada PR, sobe o FakeCloud como serviço do job e roda em sequência: formatação, validação, análise de segurança, plan em `dev` e testes.
- [ ] Aplicar em `dev` após o merge e rodar os testes de integração.
- [ ] Criar o workflow de `prod`: disparo manual, ligado a um environment do GitHub com revisor obrigatório.

### 3. Segurança e boas práticas

- [ ] Dar permissões mínimas ao `GITHUB_TOKEN`.
- [ ] Não usar segredos reais no pipeline.
- [ ] Proteger a branch principal.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `.github/workflows/`
- Documentação do pipeline

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Um PR dispara o pipeline completo com sucesso.
- [ ] Violação de segurança proposital derruba o pipeline.
- [ ] Deploy em `prod` só ocorre após aprovação manual.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
