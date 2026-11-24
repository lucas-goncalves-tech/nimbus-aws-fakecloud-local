# Nimbus

Projeto de estudo de infraestrutura como código **100% local**: Terraform contra o **FakeCloud** (emulador de AWS), com segurança, ambientes separados e pipeline de CI/CD. O **backend será adicionado depois** em `backend/`, seguindo o contrato definido na Issue 013.

## Objetivo

Construir e documentar, de forma reproduzível e sem conta AWS, uma base de infraestrutura com:

- Rede: VPC, subnets públicas e privadas, route tables e Security Groups.
- IAM com menor privilégio e sem uso de Root.
- Separação `dev` e `prod`, com state isolado.
- Variáveis tipadas e proteção de credenciais.
- S3, SQS (com DLQ), Lambda e DynamoDB integrados em um fluxo ponta a ponta.
- Testes de segurança, testes de integração e CI/CD.

## Limitações do emulador (leia antes de começar)

O FakeCloud é um emulador. Pelo que a documentação indica, ele aceita a configuração do plano de controle de EC2 (VPC, Security Groups), mas **armazena regras de Security Groups e NACLs sem aplicá-las ao tráfego**. Consequências:

- Testes locais de rede validam que a **configuração** foi criada corretamente, **não** que o isolamento de rede funciona.
- A avaliação de IAM e alguns recursos (notificações S3, runtimes de Lambda) também podem diferir da AWS real: cada Issue tem o item "Identificar limitações que dependam de validação na AWS real".
- Confirme sempre o suporte atual na documentação oficial do FakeCloud antes de implementar cada Issue.

## Estrutura

```
nimbus/
├── README.md
├── issue/            # Issues numeradas (template padrão)
├── infra/
│   ├── modules/      # network, security-groups, iam, storage, database, messaging, compute
│   └── envs/
│       ├── dev/
│       └── prod/
├── backend/          # será adicionado depois (lambda/ e app/)
├── tests/            # integração e segurança
├── docs/
├── scripts/
└── Makefile
```

## Ordem das Issues

| # | Issue |
|---|-------|
| 001 | [Estrutura do repositório e ambiente local com FakeCloud](issue/001-estrutura-do-repositorio-e-ambiente-local-com-fakecloud.md) |
| 002 | [Provider Terraform apontando para o FakeCloud](issue/002-provider-terraform-apontando-para-o-fakecloud.md) |
| 003 | [State isolado por ambiente (dev e prod)](issue/003-state-isolado-por-ambiente-dev-e-prod.md) |
| 004 | [Variáveis, segredos e proteção de credenciais](issue/004-variaveis-segredos-e-protecao-de-credenciais.md) |
| 005 | [VPC e subnets públicas e privadas](issue/005-vpc-e-subnets-publicas-e-privadas.md) |
| 006 | [Internet Gateway, route tables e associações](issue/006-internet-gateway-route-tables-e-associacoes.md) |
| 007 | [Security Groups com menor privilégio](issue/007-security-groups-com-menor-privilegio.md) |
| 008 | [IAM com menor privilégio e sem uso de Root](issue/008-iam-com-menor-privilegio-e-sem-uso-de-root.md) |
| 009 | [Bucket S3 seguro](issue/009-bucket-s3-seguro.md) |
| 010 | [Tabela DynamoDB](issue/010-tabela-dynamodb.md) |
| 011 | [Fila SQS com Dead Letter Queue](issue/011-fila-sqs-com-dead-letter-queue.md) |
| 012 | [Função Lambda consumidora (SQS → DynamoDB)](issue/012-funcao-lambda-consumidora-sqs-dynamodb.md) |
| 013 | [Fluxo S3 → SQS → Lambda e contrato para o backend](issue/013-fluxo-s3-sqs-lambda-e-contrato-para-o-backend.md) |
| 014 | [Testes de segurança e análise estática](issue/014-testes-de-seguranca-e-analise-estatica.md) |
| 015 | [CI/CD com GitHub Actions](issue/015-ci-cd-com-github-actions.md) |

## Como trabalhar com as Issues

1. Siga a ordem numérica; cada Issue lista seus pré-requisitos.
2. Trabalhe pelas Tarefas: elas dizem o que construir, não como. Pesquise e decida os detalhes.
3. A verificação fica toda na Definition of Done: só encerre a Issue quando ela estiver completa.
4. Limitações do emulador e decisões relevantes vão em `docs/limitations.md`.

## Princípios

- Nada é criado manualmente: tudo por código e scripts.
- Menor privilégio por padrão; Root nunca é usado.
- Nenhuma credencial ou state versionado.
- `prod` nunca é alterado sem aprovação explícita.
