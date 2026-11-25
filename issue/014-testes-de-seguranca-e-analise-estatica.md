# [014] Testes de segurança e análise estática

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Há verificações automatizadas de IaC, policies e segredos executáveis localmente com um comando.

## Contexto

- Transforma as regras de segurança das Issues anteriores em checagens repetíveis.
- Ferramentas possíveis: `tflint`, `checkov` ou `tfsec`, `gitleaks`, testes próprios.
- Limitação: análise estática verifica a configuração, não o comportamento real de rede ou IAM. Testes comportamentais de autorização estão fora de escopo, pois o FakeCloud não enforça policies e não há AWS real.

## Pré-requisitos

- [ ] Issues 004 a 013 concluídas.

## Tarefas

### 1. Preparação

- [ ] Escolher uma ferramenta para cada área: análise de IaC, análise de policies IAM e detecção de segredos.

### 2. Implementação

- [ ] Criar `make security`, que roda todas as análises.
- [ ] Configurar as ferramentas escolhidas.
- [ ] Escrever testes próprios: endpoint local, sem `0.0.0.0/0` indevido, sem wildcard em IAM, sem IAM user/access key, bucket sem acesso público e sem porta administrativa exposta.
- [ ] Criar `docs/security.md` com: os três princípios (Secure by Design, Least Privilege, Environment Isolation), controles aplicados, exceções aceitas (cada uma com seu motivo) e o que o emulador não consegue provar.

### 3. Segurança e boas práticas

- [ ] Exigir justificativa escrita para cada exceção.
- [ ] Fazer a falha das análises barrar o pipeline.

### 4. Testes e automação

- [ ] Criar em `tests/security/fixtures/` configurações propositalmente ruins (Security Group aberto, bucket público, IAM com wildcard, endpoint real) que as análises devem barrar.

## Entrega

Artefatos que deverão existir ao final da Issue:

- Configuração das ferramentas
- `make security`
- Testes de segurança em `tests/security/`
- `docs/security.md` com limitações do emulador

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] `make security` passa no código atual.
- [ ] `make security` falha com as más configurações propositais.
- [ ] Toda exceção tem justificativa.
- [ ] As checagens cobrem endpoint, IAM, bucket, Security Group, porta exposta e segredo.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
