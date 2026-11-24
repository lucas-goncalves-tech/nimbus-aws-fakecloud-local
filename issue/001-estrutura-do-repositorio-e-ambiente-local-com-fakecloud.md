# [001] Estrutura do repositório e ambiente local com FakeCloud

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] O repositório Nimbus tem estrutura de pastas definida (`infra/`, `backend/`, `tests/`, `scripts/`, `issue/`).
- [ ] O FakeCloud sobe e derruba com um único comando documentado.
- [ ] As versões de Terraform e demais ferramentas estão fixadas.

## Contexto

- Base de todas as outras Issues: sem estrutura e ambiente reproduzível, o restante vira trabalho manual.
- O Nimbus é um projeto local: toda a infraestrutura roda contra o FakeCloud, sem conta AWS. O backend será adicionado depois em `backend/`.
- Ferramentas: Docker (ou o método de execução indicado na documentação do FakeCloud), Terraform, Make ou scripts shell.
- Decisão a respeitar: nada de infraestrutura criada manualmente; tudo reproduzível por código e scripts.

## Pré-requisitos

- [ ] Docker instalado e funcionando.
- [ ] Terraform instalado.
- [ ] Git inicializado e repositório remoto criado.

## Tarefas

### 1. Preparação

- [ ] Criar a árvore de diretórios do projeto: `infra/` (com `modules/` e `envs/`), `backend/`, `tests/`, `docs/`, `scripts/` e `issue/`.
- [ ] Fixar a versão do Terraform em um arquivo que a ferramenta e quem clonar o projeto leiam (ex.: `.terraform-version` ou `required_version`).

### 2. Implementação

- [ ] Escrever o `docker-compose.yml` que sobe o FakeCloud, definindo: imagem, porta publicada só em `localhost`, variáveis de ambiente e se o estado local persiste entre execuções.
- [ ] Criar o `Makefile` com os alvos `up`, `down`, `status` e `logs`, cada um chamando o compose ou um script correspondente.
- [ ] Escrever o `.gitignore` cobrindo: state e cache do Terraform, arquivos `.env` e `.tfvars` reais, pacotes de build da Lambda e dados locais do FakeCloud.
- [ ] Escrever o `.env.example` listando o nome de toda variável que o projeto lê (endpoint, região, ambiente, credenciais fictícias), sem nenhum valor real.
- [ ] Criar `backend/README.md` explicando que o backend entra depois e o que ele precisará receber do ambiente (endpoint, variáveis, nomes de recursos), apontando para a Issue 013.

### 3. Segurança e boas práticas

- [ ] Publicar a porta do FakeCloud apenas em `localhost`.
- [ ] Usar só credenciais fictícias no `.env.example`.

### 4. Testes e automação

- [ ] Escrever `scripts/wait-ready.sh`, que tenta o endpoint do FakeCloud em intervalos e falha após um tempo limite (será reaproveitado no CI).

## Entrega

Artefatos que deverão existir ao final da Issue:

- `docker-compose.yml`
- `Makefile`
- `.gitignore`, `.env.example`
- Estrutura de pastas versionada

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] `make up` sobe o ambiente e `make down && make up` o recria limpo.
- [ ] Estrutura de pastas versionada.
- [ ] Limitações do FakeCloud listadas em `docs/limitations.md`.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
