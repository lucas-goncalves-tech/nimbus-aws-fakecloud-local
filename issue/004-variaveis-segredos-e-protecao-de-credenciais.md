# [004] Variáveis, segredos e proteção de credenciais

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Variáveis são tipadas, validadas e documentadas.
- [ ] Nenhum segredo existe no repositório nem no histórico.
- [ ] Há verificação automática de segredos antes do commit.

## Contexto

- Mesmo com credenciais fictícias, o hábito correto precisa existir desde o início, pois o código poderá ir para a AWS real.
- Ferramentas: `variables.tf` com `type`, `description`, `validation`; `sensitive = true`; `gitleaks` ou similar como hook pre-commit.
- Decisão: valores por ambiente em `*.tfvars`; segredos apenas por variável de ambiente (`TF_VAR_*`).

## Pré-requisitos

- [ ] Issues 002 e 003 concluídas.

## Tarefas

### 1. Preparação

- [ ] Listar as variáveis do projeto e separá-las em comuns, por ambiente e sensíveis.

### 2. Implementação

- [ ] Tipar as variáveis e escrever `description` e `validation` onde houver valores inválidos óbvios (ambiente fora de `dev`/`prod`, CIDR malformado, nome fora do padrão).
- [ ] Marcar as sensíveis com `sensitive = true`.
- [ ] Criar `.env.example` e `*.tfvars.example` com todas as chaves esperadas e valores de exemplo claramente fictícios.
- [ ] Instalar um hook pre-commit que bloqueia o commit ao encontrar padrões de segredo (chaves de acesso, tokens, senhas).
- [ ] Escrever `docs/secrets.md` respondendo: quais segredos o projeto tem, onde cada um vive em `dev`, quem pode lê-los e como isso mudaria em produção real (ex.: Secrets Manager).

### 3. Segurança e boas práticas

- [ ] Colocar `.env`, `*.tfvars` reais e state no `.gitignore`.

### 4. Testes e automação

- [ ] Escrever um script que roda a varredura de segredos no repositório inteiro, incluindo o histórico do Git, para uso local e no CI.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `variables.tf` revisados
- `.env.example`, `*.tfvars.example`
- Configuração do hook
- `docs/secrets.md`

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Commit com segredo falso é bloqueado pelo hook.
- [ ] Valor inválido é rejeitado pela `validation`.
- [ ] Varredura do histórico não encontra segredos.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
