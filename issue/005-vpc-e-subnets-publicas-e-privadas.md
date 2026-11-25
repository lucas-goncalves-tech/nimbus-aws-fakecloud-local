# [005] VPC e subnets públicas e privadas

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Existe uma VPC por ambiente com CIDR planejado.
- [ ] Há subnets públicas e privadas em mais de uma zona de disponibilidade.

## Contexto

- Fundação de rede da arquitetura: backend e Lambda ficam em subnets privadas; apenas o necessário em públicas.
- Serviço envolvido: EC2 (plano de controle de VPC) no FakeCloud.
- Limitação importante: o FakeCloud armazena a configuração de rede, mas não isola tráfego de verdade. Os testes provam que a configuração foi criada corretamente, não que o isolamento funciona. Não haverá validação em AWS real; a limitação é aceita e registrada.
- Subnet de dados separada é N/A: o DynamoDB é regional e não fica na VPC. Reavaliar apenas se entrar um banco relacional.
- As subnets públicas existem como modelo da topologia; não há ALB nem endpoint público nesta fase.
- Decisão: CIDRs distintos entre `dev` e `prod` para permitir peering futuro.

## Pré-requisitos

- [ ] Issues 001 a 004 concluídas.

## Tarefas

### 1. Preparação

- [ ] Planejar em `docs/network.md` uma tabela de VPC e subnets de `dev` e `prod` (nome, CIDR, zona, pública ou privada), sem sobreposição de CIDRs.

### 2. Implementação

- [ ] Criar `modules/network` com a VPC e subnets públicas e privadas em duas zonas, recebendo CIDRs e zonas por variável e devolvendo os IDs nos outputs. As zonas devem vir de `data.aws_availability_zones` e o módulo deve exigir pelo menos duas.
- [ ] Ativar DNS support e hostnames.
- [ ] Aplicar tags padronizadas (`Project`, `Environment`, `ManagedBy`).
- [ ] Chamar o módulo em `dev` e `prod`.

### 3. Segurança e boas práticas

- [ ] Desativar IP público automático nas subnets privadas.
- [ ] Não usar a VPC default.
- [ ] Não usar NACLs nesta fase; registrar a decisão em `docs/network.md`.
- [ ] Não implementar VPC Flow Logs; registrar como limitação aceita.

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
- [ ] IP público automático desativado nas subnets privadas.
- [ ] Limitação de não-enforcement de rede registrada em `docs/limitations.md`.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
