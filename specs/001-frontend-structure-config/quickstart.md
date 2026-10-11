# Quickstart: validação da feature 001

## Pré-requisitos
Node.js 20+ (testes) e qualquer servidor estático.

## Passos
1. `npm install` e `npm test` → os testes de configuração passam (válida, ausente, malformada, esquema não permitido, barra final, insecure) — SC-006.
2. Servir a raiz do repositório: `python -m http.server 5500` (ou `npx serve -l 5500`).
3. Abrir `http://localhost:5500/` e `explorar.html`, `atividade.html`, `sobre.html`, `contato.html` diretamente → carregam sem erros no console (SC-001).
4. Em `js/config.js`, trocar a URL por outra válida → nenhum outro arquivo muda; uma busca por endereços de API fora de `config.js` retorna zero ocorrências (SC-002).
5. Esvaziar o valor → aviso de configuração ausente; `javascript:alert(1)` ou `abc` → aviso de configuração inválida; a aba Rede não mostra requisições à API (SC-004).
6. Abrir `atividade.html` sem parâmetro → carrega sem erro de script.
7. Desativar JavaScript → o conteúdo estático continua visível.
8. Conferir que não há arquivos vazios nem segredos (SC-005) e que o README descreve a estrutura real e permite servir o site em até 10 minutos (SC-003).

Contrato: [contracts/config-module.md](contracts/config-module.md). Modelo: [data-model.md](data-model.md).
