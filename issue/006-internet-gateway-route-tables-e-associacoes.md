# [006] Internet Gateway, route tables e associações

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Subnets públicas têm rota para a internet via IGW.
- [ ] Subnets privadas não têm rota direta para a internet.
- [ ] Cada subnet está associada à route table correta.

## Contexto

- Define quais subnets são realmente públicas ou privadas: o nome da subnet não basta, o que importa é a rota.
- Serviços: EC2 (IGW, route tables).
- Decisão: não criar NAT Gateway nesta fase (custo e complexidade); documentar como alternativa para produção real.

## Pré-requisitos

- [ ] Issue 005 concluída.

## Tarefas

### 1. Preparação

- [ ] Desenhar em `docs/network.md` a tabela de rotas (destino → alvo) esperada para a subnet pública e para a privada.

### 2. Implementação

- [ ] Criar o Internet Gateway e anexá-lo à VPC.
- [ ] Criar as route tables pública e privada.
- [ ] Associar cada subnet à route table do seu tipo.

### 3. Segurança e boas práticas

- [ ] Manter as subnets privadas sem rota para o IGW.
- [ ] Evitar rotas e associações implícitas (como a route table principal da VPC) que deixem uma subnet pública sem querer.

### 4. Testes e automação

- [ ] Escrever um teste que falha se uma subnet privada tiver rota para o IGW.

## Entrega

Artefatos que deverão existir ao final da Issue:

- Recursos Terraform de roteamento no módulo de rede
- Teste de validação de rotas em `tests/`

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] As rotas de cada route table batem com a tabela planejada.
- [ ] O teste de rotas passa.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
