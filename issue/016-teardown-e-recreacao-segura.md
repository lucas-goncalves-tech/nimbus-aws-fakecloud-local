# [016] Teardown e recriação segura dos ambientes

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Destruir `dev` e `prod` por comando, sem afetar o outro ambiente.
- [ ] Encerrar um ambiente com state vazio e sem recursos órfãos no FakeCloud.
- [ ] Recriar um ambiente do zero a partir do código.

## Contexto

- Fecha o ciclo do projeto: provisionar, testar e destruir de forma reproduzível.
- O projeto é 100% local; o `destroy` atua no FakeCloud, não em AWS real.
- Risco: state residual, volumes locais esquecidos e recursos criados fora do Terraform. `prod` exige confirmação explícita.
- Depende de todos os recursos das Issues anteriores existirem.

## Pré-requisitos

- [ ] Issues 001 a 015 concluídas.

## Tarefas

### 1. Preparação

- [ ] Listar os recursos e volumes que o FakeCloud mantém entre execuções.
- [ ] Definir a ordem de destruição e o que precisa ser removido manualmente (se algo não for gerenciado pelo Terraform).
- [ ] Documentar o processo em `docs/teardown.md`.

### 2. Implementação

- [ ] Criar o alvo `make destroy ENV=<dev|prod>`, rejeitando ambiente desconhecido.
- [ ] Exigir confirmação digitada para `prod`, como em `apply.sh`.
- [ ] Parametrizar `prevent_destroy` por variável, de modo que o fluxo de destroy a desative sem editar o código manualmente.
- [ ] Verificar com `terraform state list` que o state ficou vazio.
- [ ] Verificar recursos órfãos no FakeCloud e limpar volumes locais.
- [ ] Criar o alvo `make reset ENV=<dev|prod>` que destrói e recria do zero.

### 3. Segurança e boas práticas

- [ ] Não imprimir credenciais, URLs com tokens ou conteúdo de state nos logs.
- [ ] Não permitir destroy de `prod` sem confirmação.
- [ ] Não destruir um ambiente enquanto o outro estiver em uso.
- [ ] Registrar no `docs/limitations.md` que o teardown é do FakeCloud, não de AWS real.

### 4. Testes e automação

- [ ] Testar `destroy` + `create` em `dev`.
- [ ] Simular o fluxo de `prod` e verificar que a confirmação é obrigatória.
- [ ] Testar a recusa de ambiente desconhecido.
- [ ] Rodar o fluxo no CI como job de limpeza.

## Entrega

Artefatos que deverão existir ao final da Issue:

- Alvos `destroy` e `reset` no Makefile
- `docs/teardown.md`
- Registro da limpeza no CI

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] `make destroy ENV=dev` deixa o state vazio e remove os recursos.
- [ ] `make destroy ENV=prod` exige confirmação e funciona.
- [ ] `make reset ENV=dev` recria o ambiente do zero.
- [ ] Não restam recursos órfãos nem volumes locais.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
