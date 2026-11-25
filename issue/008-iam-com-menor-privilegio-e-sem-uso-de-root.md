# [008] IAM com menor privilégio e sem uso de Root

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Existe uma role da Lambda com policy mínima, criada por um módulo reutilizável.
- [ ] Nenhuma policy usa `Action: *` ou `Resource: *` sem justificativa.

## Contexto

- IAM é o principal controle de segurança em nuvem. O Root é a identidade da conta, não uma role: nunca deve ser usado por workloads nem por scripts.
- Recursos: roles, policies e trust policies. Não haverá IAM users nem access keys de longo prazo; workloads usam roles.
- Não-objetivo: MFA, SSO, STS/OIDC e credenciais temporárias de identidade humana, pois não há AWS real nem identidade humana na nuvem.
- Limitação: o FakeCloud pode não avaliar policies como a AWS real. Os testes validam a configuração, não o bloqueio; não haverá validação em AWS real.
- Decisão: policies escritas com `aws_iam_policy_document` e ARNs específicos. Esta Issue entrega a base; as Issues 009 a 012 adicionam os statements de recurso.
- A role do backend será definida na Issue 013, quando o contrato do backend existir.

## Pré-requisitos

- [ ] Issue 004 concluída.
- [ ] Entender que o módulo é parametrizado por ARNs e que os recursos entram nas Issues 009 a 012, sem dependência circular.

## Tarefas

### 1. Preparação

- [ ] Listar as ações de API que a Lambda realmente usa (receber mensagens da fila X, escrever na tabela Y, escrever logs).

### 2. Implementação

- [ ] Criar a role da Lambda com trust policy para `lambda.amazonaws.com` e permissão base de logs.
- [ ] Montar o módulo `modules/iam` com variáveis para os ARNs de fila, tabela e bucket, preenchidas nas Issues 009 a 012.
- [ ] Usar `aws_iam_policy_document` com ARNs específicos, sem wildcard.
- [ ] Não criar `aws_iam_user` nem `aws_iam_access_key`.

### 3. Segurança e boas práticas

- [ ] Evitar `Action: *` e `Resource: *`.
- [ ] Separar permissões por ambiente.
- [ ] Não usar Root em nenhum script nem como identidade de execução.
- [ ] Não criar IAM users nem access keys de longo prazo.

### 4. Testes e automação

- [ ] Escrever um teste que falha ao encontrar wildcard indevido nas policies.
- [ ] Escrever um teste que falha ao encontrar `aws_iam_user` ou `aws_iam_access_key` declarado.
- [ ] Registrar que o enforcement de IAM não é verificável no emulador.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `modules/iam`
- Testes de policy
- `docs/iam.md` com o modelo de identidade e as limitações do emulador

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Nenhuma policy com wildcard injustificado.
- [ ] Nenhum IAM user ou access key declarado.
- [ ] Os testes de policy e de identidade passam.
- [ ] O que o FakeCloud avalia de IAM está listado em `docs/limitations.md`.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
