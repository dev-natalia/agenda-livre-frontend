# Quickstart: validar o cliente e a integração com a API

Pré-requisitos: Node.js 20+, `npm install` executado.

## 1. Testes unitários
```powershell
npm test
```
Esperado: passam `api-client`, `api-errors`, `request-scope`, `error-state` e os testes da feature 001. Cobrem: montagem de endereço ([contracts/api-client.md](contracts/api-client.md)), cada categoria de [data-model.md](data-model.md), timeout, resposta sem corpo/inválida, descarte de respostas antigas e componente de erro.

## 2. Teste de navegador (falha → nova tentativa)
```powershell
npm run test:e2e
```
Esperado: `api-error-retry.spec.js` intercepta `/api/v1/**`, responde falha, vê a mensagem e o botão "Tentar novamente", responde sucesso e vê os dados sem recarregar.

## 3. Verificação manual
1. Servir: `python -m http.server 5500` e abrir uma página.
2. Com o DevTools em *Offline*, disparar uma consulta pelo console (`import('/js/api/client.js').then(m => m.request('/activities/'))`): erro `network`, sem texto técnico exibido.
3. Verificar com leitor de tela que o erro é anunciado e que o foco do teclado não se move.
4. Busca no código: `fetch(` e a URL da API só aparecem em `js/api/client.js` e `js/config.js`.

## 4. Integração real (quando o backend estiver disponível)
Subir `agenda-livre-backend`, autorizar a origem do frontend em `CORS_ALLOWED_ORIGINS` e repetir o passo 3 contra `GET /api/v1/activities/`; confirmar `count: 0` como sucesso e `?page=999` como `not_found`. Testes com mocks não substituem esta etapa (DOC-16 §15).
