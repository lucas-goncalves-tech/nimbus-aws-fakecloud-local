# [007] Security Groups com menor privilégio

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Existem Security Groups separados para backend, Lambda e acesso administrativo.
- [ ] Nenhuma regra libera `0.0.0.0/0` sem justificativa documentada.

## Contexto

- Security Groups são a primeira camada de controle de acesso à rede. Mesmo que o FakeCloud não os aplique ao tráfego, o desenho deve estar correto e documentado; não haverá validação em AWS real.
- Limitação: regras são armazenadas, não enforçadas; os testes validam a configuração, não o bloqueio real de tráfego.
- Decisão: referenciar Security Groups entre si em vez de usar CIDRs amplos.
- Administração é local (Docker/CLI); não há SSH, bastion nem acesso administrativo pela VPC.

## Pré-requisitos

- [ ] Issues 005 e 006 concluídas.

## Tarefas

### 1. Preparação

- [ ] Montar em `docs/network.md` a matriz de fluxos: origem, destino, porta, protocolo e motivo de cada comunicação permitida (backend, Lambda, administração).

### 2. Implementação

- [ ] Criar o Security Group do backend, com entrada só das origens necessárias.
- [ ] Criar o da Lambda, sem entrada.
- [ ] Criar o Security Group administrativo como modelo, sem nenhuma regra de entrada; o acesso administrativo não passa pela VPC.
- [ ] Referenciar Security Groups entre si em vez de usar CIDRs amplos.
- [ ] Restringir o egress ao necessário e parametrizar as portas por variável. Como não há NAT nem endpoints, o egress é apenas declarativo; registrar a limitação.

### 3. Segurança e boas práticas

- [ ] Não liberar `0.0.0.0/0` em nenhuma regra de entrada.
- [ ] Permitir egress aberto só com justificativa escrita.
- [ ] Descrever cada regra com `description`.
- [ ] Deixar `dev` mais flexível que `prod` apenas por variável.

### 4. Testes e automação

- [ ] Escrever um teste que lê as regras e falha em CIDR aberto sem justificativa ou porta administrativa exposta.

## Entrega

Artefatos que deverão existir ao final da Issue:

- Módulo `modules/security-groups`
- Matriz de fluxos
- Teste de regras

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Nenhuma regra de entrada com `0.0.0.0/0`; egress aberto só com justificativa.
- [ ] O Security Group administrativo não tem regras de entrada.
- [ ] As regras coincidem com a matriz de fluxos.
- [ ] O teste de regras passa.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
