# [003] State isolado por ambiente (dev e prod)

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] `dev` e `prod` têm states separados e não se afetam.
- [ ] A estrutura de pastas ou workspaces reflete essa separação.

## Contexto

- State compartilhado entre ambientes é a causa clássica de destruir produção por engano.
- Estrutura sugerida: `infra/modules/` reutilizável e `infra/envs/dev` e `infra/envs/prod` consumindo os módulos.
- Backend de state: local, com caminho distinto por ambiente. Backend remoto e locking distribuído ficam fora de escopo, pois não há AWS real; registrar a justificativa.

## Pré-requisitos

- [ ] Issue 002 concluída.

## Tarefas

### 1. Preparação

- [ ] Escolher entre pastas por ambiente ou workspaces (pastas é o mais simples de ler).
- [ ] Definir onde cada state fica no disco e ignorá-lo no Git.
- [ ] Registrar em `docs/` a decisão de manter state local e sem backend remoto.

### 2. Implementação

- [ ] Criar `infra/modules/` e `infra/envs/{dev,prod}`.
- [ ] Escrever o `backend.tf` de cada ambiente (onde o state daquele ambiente fica) e o `terraform.tfvars.example` com os valores que mudam entre `dev` e `prod` (CIDRs, retenção, proteção contra deleção). Os `terraform.tfvars` reais ficam fora do Git e são passados com `-var-file`.
- [ ] Criar um módulo mínimo de tags usado pelos dois ambientes: recebe projeto e ambiente e devolve o mapa de tags padrão.
- [ ] Criar scripts `plan.sh` e `apply.sh` que recebem o ambiente como argumento, rejeitam ambiente desconhecido e, para `prod`, exigem que o nome do ambiente seja digitado para confirmar.
- [ ] Salvar o plano em `plan.out` e fazer o `apply` somente a partir desse plano revisado.

### 3. Segurança e boas práticas

- [ ] Manter arquivos `.tfstate` fora do Git.
- [ ] Parametrizar as diferenças entre ambientes (proteção contra deleção, retenção).
- [ ] Não compartilhar recursos críticos entre ambientes; se inevitável, registrar a justificativa.
- [ ] Aplicar `lifecycle { prevent_destroy }` nos recursos stateful de `prod`.

### 4. Testes e automação

- [ ] Escrever um teste que falha se `dev` e `prod` apontarem para o mesmo state ou referenciarem recursos um do outro.

## Entrega

Artefatos que deverão existir ao final da Issue:

- Estrutura `infra/envs/{dev,prod}`
- `backend.tf` por ambiente
- `terraform.tfvars.example` por ambiente
- Documentação da decisão de isolamento

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Aplicar em `dev` não altera `prod`.
- [ ] `terraform state list` mostra recursos distintos em cada ambiente.
- [ ] O plano de `prod` foi salvo em `plan.out` e revisado antes do apply.
- [ ] `git status` não mostra arquivos de state.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
