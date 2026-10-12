# Research: Páginas institucionais e contato

Sem `NEEDS CLARIFICATION` no Technical Context. Decisões tomadas a partir dos DOC-09, 11, 12, 13, 14 e 15, do DOC-05 §3.3 e do código existente.

## D1 — Sobre e Contato não usam a API
- **Decision**: nenhuma chamada à API; `about.js` e `contact.js` deixam de chamar `showConfigNotice`.
- **Rationale**: DOC-05 §3.3 e feature 009 do backend: sem endpoint, o frontend não deve consultar a API para essas páginas. O aviso "API não configurada" seria ruído e quebraria SC-009.
- **Alternatives**: manter o aviso (rejeitado: informa algo irrelevante); buscar o texto de Sobre na API (rejeitado: não existe e exigiria nova especificação).

## D2 — Formulário sem rede, sem `action` e sem armazenamento
- **Decision**: `<form novalidate>` sem `action`; `submit` interceptado com `preventDefault`; os módulos não importam o cliente da API nem usam `fetch`/`XHR`/`sendBeacon`/storage. Teste unitário inspeciona o código-fonte e teste de navegador observa as requisições.
- **Rationale**: privacidade (dados pessoais) e transparência do escopo demonstrativo.
- **Alternatives**: `sessionStorage` para preservar valores entre recargas (rejeitado: dado pessoal guardado sem necessidade; a spec define formulário vazio ao reabrir).

## D3 — Validação própria, regra pura e limites num lugar só
- **Decision**: `validateContact(values) → { valid, errors, order }` em `validation.js`, com `CONTACT_LIMITS = { name: {min: 2, max: 100}, email: {max: 254}, subject: {min: 3, max: 100}, message: {min: 10, max: 1000} }`. Valores são aparados antes de contar. E-mail: padrão simples `parte@domínio.sufixo` sem espaços (checa formato, não existência). Mensagens específicas por causa (vazio, curto, longo, formato). O texto de ajuda do HTML cita os mesmos limites e um teste confere a coerência.
- **Rationale**: DOC-13 §11 exige limites consistentes com os testes. A validação nativa do navegador (balões) mostra um erro por vez e não permite mensagens associadas, por isso `novalidate` com mensagens próprias, mantendo `required` e `type` pela semântica.
- **Alternatives**: Constraint Validation API com `setCustomValidity`/`reportValidity` (rejeitado: um balão por vez); biblioteca de validação (rejeitado: sem dependências).
- **Sem `maxlength`**: impediria digitar ou colar além do limite descartando texto em silêncio; a spec exige não descartar. O limite é explicado na ajuda e validado, com mensagem de excesso.

## D4 — Erros: resumo anunciado uma vez, mensagem junto ao campo, foco no primeiro inválido
- **Decision**: cada campo tem `<p class="field-error" id="<campo>-error">` criado/removido; `aria-invalid="true"` e `aria-describedby` = ajuda + erro. Um `<p role="status" class="form-summary">` recebe "N campo(s) precisa(m) de correção." uma vez por envio inválido; o foco vai ao primeiro campo inválido. O erro some ao corrigir (evento `input`) e nenhum erro aparece antes do primeiro envio.
- **Rationale**: DOC-15 §5.4 e DOC-13 §11; `.field-error` e `[aria-invalid]` já existem com indício não cromático (borda tracejada, prefixo "Erro:").
- **Alternatives**: `role="alert"` por campo (rejeitado: anúncios duplicados); lista de erros com âncoras no topo (rejeitada: duplica mensagens e adiciona foco extra, enquanto a spec pede foco no campo).

## D5 — Painel de confirmação e retorno
- **Decision**: painel (`<section hidden>` com `<h2 tabindex="-1">`) e formulário alternam por `hidden`. Ao confirmar: oculta o formulário, mostra o painel, foca o `<h2>` e escreve o resumo na região de status. "Voltar ao formulário" reexibe o formulário com os valores, limpa erros/resumo e foca o primeiro campo. "Limpar campos" é um `<button type="button">` no formulário. O painel não repete os valores digitados.
- **Rationale**: foco no título faz o leitor de tela ler a confirmação (convenção do projeto: `main[tabindex=-1]`, `region-state`); evita perder o foco quando o formulário focado some.
- **Alternatives**: só `role="status"` sem mover o foco (rejeitado: o foco se perde); `<dialog>` modal (rejeitado: excesso).

## D6 — Dados digitados são texto
- **Decision**: valores só passam por `.value`/`textContent`; nenhum `innerHTML`.
- **Rationale**: evita injeção (003) e reduz exposição de dados pessoais.

## D7 — Estilo
- **Decision**: reutilizar `.button`, `.field-error`, `[aria-invalid]`, tokens e foco; novas classes `.prose`, `.contact`, `.form-field`, `.form-hint`, `.form-summary`, `.confirmation` só com variáveis de `tokens.css`; largura de leitura limitada (`max-width` em `ch`), sem animação de entrada.
- **Rationale**: consistência visual (004) e movimento reduzido (DOC-15).

## D8 — Texto base de Sobre
- **Decision**: três seções do wireframe (O que é o projeto?, Nosso objetivo, Acesso à cultura e à educação), uma nota "O que o Agenda Livre não faz" (sem inscrições; o link externo da atividade leva ao serviço responsável) e botão "Explorar atividades". Sem nomes de parceiros, números ou datas.
- **Rationale**: DOC-12 §7 manda não inventar parcerias nem promessas; DOC-11 define que o site não processa inscrições.
