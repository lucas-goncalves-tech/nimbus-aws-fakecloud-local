# [007] Security Groups com menor privilégio

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Existem Security Groups separados para backend, Lambda e acesso administrativo.
- [ ] Nenhuma regra libera `0.0.0.0/0` sem justificativa documentada.

## Contexto

- Security Groups são a primeira camada de controle de acesso à rede. Mesmo que o FakeCloud não os aplique ao tráfego, o desenho deve estar correto para a AWS real.
- Limitação: regras são armazenadas, não enforçadas; os testes validam a configuração, não o bloqueio real de tráfego.
- Decisão: referenciar Security Groups entre si em vez de usar CIDRs amplos.

## Pré-requisitos

- [ ] Issues 005 e 006 concluídas.

## Tarefas

### 1. Preparação

- [ ] Montar em `docs/network.md` a matriz de fluxos: origem, destino, porta, protocolo e motivo de cada comunicação permitida (backend, Lambda, administração).

### 2. Implementação

- [ ] Criar o Security Group do backend, com entrada só das origens necessárias.
- [ ] Criar o da Lambda, sem entrada.
- [ ] Criar o de acesso administrativo, liberando apenas portas de gestão e apenas para um CIDR ou Security Group de origem definido por variável.
- [ ] Referenciar Security Groups entre si em vez de usar CIDRs amplos.
- [ ] Restringir o egress ao necessário e parametrizar as portas por variável.

### 3. Segurança e boas práticas

- [ ] Não liberar `0.0.0.0/0` em portas administrativas.
- [ ] Descrever cada regra com `description`.
- [ ] Deixar `dev` mais flexível que `prod` apenas por variável.

### 4. Testes e automação

- [ ] Escrever um teste que lê as regras e falha em CIDR aberto sem justificativa.

## Entrega

Artefatos que deverão existir ao final da Issue:

- Módulo `modules/security-groups`
- Matriz de fluxos
- Teste de regras

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Nenhuma regra com `0.0.0.0/0` sem justificativa.
- [ ] As regras coincidem com a matriz de fluxos.
- [ ] O teste de regras passa.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
