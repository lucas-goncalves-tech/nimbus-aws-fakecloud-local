# [002] Provider Terraform apontando para o FakeCloud

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] O provider AWS do Terraform aponta para o endpoint do FakeCloud.
- [ ] `terraform init`, `validate` e `plan` funcionam em `infra/`.
- [ ] Convenções de código (formatação e nomes) estão definidas.

## Contexto

- Faz a ponte entre o Terraform e o emulador: todas as Issues seguintes dependem disso.
- O provider AWS aceita sobrescrever endpoints por serviço e desativar validações que exigem a AWS real (conta, credenciais). Conferir quais opções a documentação do FakeCloud recomenda.
- Decisão: o endpoint é variável, mas restrito a `localhost`/`127.0.0.1`. AWS real está fora do escopo do projeto.

## Pré-requisitos

- [ ] Issue 001 concluída.

## Tarefas

### 1. Preparação

- [ ] Fixar as versões do Terraform e do provider AWS em `versions.tf`, com versão exata do provider.
- [ ] Versionar o `.terraform.lock.hcl` e documentar como atualizá-lo.
- [ ] Definir o padrão de nomes `nimbus-<env>-<recurso>`.

### 2. Implementação

- [ ] Criar as variáveis `endpoint`, `region` e `environment`, com tipo e descrição, limitando `environment` a `dev` e `prod`.
- [ ] Validar `endpoint` para aceitar apenas `localhost` ou `127.0.0.1` (porta opcional); qualquer outro host deve falhar no `plan`.
- [ ] Configurar o provider AWS apontando cada serviço (EC2, S3, SQS, Lambda, DynamoDB, IAM) para o endpoint do FakeCloud.
- [ ] Ativar as opções do provider que dispensam validação de credenciais, de conta e de metadados da AWS real, isoladas em `providers.tf` (nomes exatos na documentação do provider).
- [ ] Criar um bucket descartável para exercitar a conexão e removê-lo em seguida.

### 3. Segurança e boas práticas

- [ ] Receber credenciais fictícias por variáveis de ambiente, nunca pelo código.
- [ ] Manter o que é específico do emulador isolado em `providers.tf`.
- [ ] Rejeitar endpoint não-local por `validation`, como proteção contra uso acidental da AWS.

### 4. Testes e automação

- [ ] Adicionar `make fmt` e `make validate` ao Makefile.
- [ ] Escrever um teste que falha quando `endpoint` aponta para um host não-local.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `infra/versions.tf`, `infra/providers.tf`, `infra/variables.tf`
- `.terraform.lock.hcl` versionado
- Documento curto de convenções no README de `infra/`

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] `terraform init`, `validate` e `plan` rodam sem erro.
- [ ] O bucket descartável foi criado e destruído.
- [ ] O teste de endpoint não-local falha como esperado.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
