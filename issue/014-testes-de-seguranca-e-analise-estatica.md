# [014] Testes de segurança e análise estática

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Há verificações automatizadas de IaC, policies e segredos executáveis localmente com um comando.

## Contexto

- Transforma as regras de segurança das Issues anteriores em checagens repetíveis.
- Ferramentas possíveis: `tflint`, `checkov` ou `tfsec`, `gitleaks`, testes próprios.
- Limitação: análise estática verifica a configuração, não o comportamento real de rede.

## Pré-requisitos

- [ ] Issues 004 a 013 concluídas.

## Tarefas

### 1. Preparação

- [ ] Escolher uma ferramenta para cada área: análise de IaC, análise de policies IAM e detecção de segredos.

### 2. Implementação

- [ ] Criar `make security`, que roda todas as análises.
- [ ] Configurar as ferramentas escolhidas.
- [ ] Escrever testes próprios: sem `0.0.0.0/0` indevido, sem wildcard em IAM, bucket sem acesso público.
- [ ] Criar `docs/security.md` com: controles aplicados, exceções aceitas (cada uma com seu motivo) e o que o emulador não consegue provar.

### 3. Segurança e boas práticas

- [ ] Exigir justificativa escrita para cada exceção.
- [ ] Fazer a falha das análises barrar o pipeline.

### 4. Testes e automação

- [ ] Criar em `tests/security/fixtures/` uma configuração propositalmente ruim (ex.: Security Group aberto, bucket público) que as análises devem barrar.

## Entrega

Artefatos que deverão existir ao final da Issue:

- Configuração das ferramentas
- `make security`
- Testes de segurança em `tests/security/`
- `docs/security.md` com limitações do emulador

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] `make security` passa no código atual.
- [ ] `make security` falha com a má configuração proposital.
- [ ] Toda exceção tem justificativa.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
