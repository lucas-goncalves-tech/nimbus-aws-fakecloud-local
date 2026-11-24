# [005] VPC e subnets públicas e privadas

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Existe uma VPC por ambiente com CIDR planejado.
- [ ] Há subnets públicas e privadas em mais de uma zona de disponibilidade.

## Contexto

- Fundação de rede da arquitetura: backend e Lambda ficam em subnets privadas; apenas o necessário em públicas.
- Serviço envolvido: EC2 (plano de controle de VPC) no FakeCloud.
- Limitação importante: o FakeCloud armazena a configuração de rede, mas não isola tráfego de verdade. Os testes provam que a configuração foi criada corretamente, não que o isolamento funciona.
- Decisão: CIDRs distintos entre `dev` e `prod` para permitir peering futuro.

## Pré-requisitos

- [ ] Issues 001 a 004 concluídas.

## Tarefas

### 1. Preparação

- [ ] Planejar em `docs/network.md` uma tabela de VPC e subnets de `dev` e `prod` (nome, CIDR, zona, pública ou privada), sem sobreposição de CIDRs.

### 2. Implementação

- [ ] Criar `modules/network` com a VPC e subnets públicas e privadas em duas zonas, recebendo CIDRs e zonas por variável e devolvendo os IDs nos outputs.
- [ ] Ativar DNS support e hostnames.
- [ ] Aplicar tags padronizadas (`Project`, `Environment`, `ManagedBy`).
- [ ] Chamar o módulo em `dev` e `prod`.

### 3. Segurança e boas práticas

- [ ] Desativar IP público automático nas subnets privadas.
- [ ] Não usar a VPC default.

### 4. Testes e automação

- [ ] Escrever um teste que lê VPC e subnets e checa CIDRs e zonas.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `modules/network`
- `docs/network.md`
- Chamada do módulo em dev e prod

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] VPC e subnets existem em `dev` e `prod` com os CIDRs planejados.
- [ ] Limitação de não-enforcement de rede registrada em `docs/limitations.md`.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
