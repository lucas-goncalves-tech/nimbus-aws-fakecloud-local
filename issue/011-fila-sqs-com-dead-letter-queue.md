# [011] Fila SQS com Dead Letter Queue

## Objetivo

Ao concluir esta Issue, deverá ser possível:

- [ ] Existe fila principal e DLQ por ambiente com política de redrive.

## Contexto

- Desacopla a recepção do processamento; a DLQ captura mensagens que falham repetidamente.
- Serviço: SQS.
- Decisão: `maxReceiveCount`, visibility timeout e retenção parametrizados por ambiente.

## Pré-requisitos

- [ ] Issues 002 e 008 concluídas.

## Tarefas

### 1. Preparação

- [ ] Definir o visibility timeout (maior que o tempo máximo da Lambda) e o `maxReceiveCount` (quantas falhas até a mensagem ir para a DLQ).

### 2. Implementação

- [ ] Criar a DLQ e a fila principal.
- [ ] Configurar a política de redrive, ligando a fila principal à DLQ.
- [ ] Ativar criptografia.
- [ ] Parametrizar timeout, retenção e tentativas por ambiente.

### 3. Segurança e boas práticas

- [ ] Restringir a policy da fila aos principais necessários.
- [ ] Manter as filas sem acesso público.

### 4. Testes e automação

- [ ] Escrever um teste que envia uma mensagem que sempre falha e espera ela chegar à DLQ.

## Entrega

Artefatos que deverão existir ao final da Issue:

- `modules/messaging`
- Teste de redrive

## Definition of Done

Este é o único ponto de verificação da Issue.

- [ ] Mensagem enviada é recebida na fila.
- [ ] Mensagem com falha repetida chega à DLQ.
- [ ] Nenhuma credencial ou informação sensível versionada.
- [ ] Nada depende de alteração manual não documentada.
- [ ] Evidências principais (outputs, prints ou logs) guardadas no PR ou em `docs/`.
- [ ] A Issue pode ser encerrada sem pendências técnicas.
