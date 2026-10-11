# Contrato: movimento e animação

## Regra central (em `css/base.css`)

```css
@media (prefers-reduced-motion: reduce) {
  :root { --motion-duration: 0s; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

## Regras para componentes

1. Toda transição usa `var(--motion-duration)` e `var(--motion-ease)`; nenhuma duração em milissegundos fora de `tokens.css`.
2. Propriedades permitidas em transições: `background-color`, `border-color`, `color`, `box-shadow`, `opacity`; nenhuma transição de `width`/`height`/posição para abrir ou fechar o menu (a lista usa o atributo `hidden`, sem animação de deslocamento).
3. Esqueletos são estáticos; se algum dia animarem, a regra central já os desliga.
4. Nenhuma informação ou função depende da animação; o estado final é sempre alcançável.
5. Sem piscadas (> 3 por segundo), sem movimento automático > 5 s, sem carrossel automático.
6. A preferência é lida pelo CSS e responde à mudança com a página aberta; nenhum JavaScript participa.

## Verificação

- Unitário (`motion-rule.test.js`): o bloco de redução existe em `base.css`, `--motion-duration` tem valor positivo em `tokens.css`, e nenhum arquivo CSS declara `transition`/`animation` com duração literal fora de `tokens.css`.
- Playwright (`reduced-motion.spec.js`): com `emulateMedia({ reducedMotion: "reduce" })`, `getComputedStyle` de botão, campo, card, menu e esqueleto devolve duração de transição ≈ 0 e `scroll-behavior: auto`; com `no-preference`, a duração é ≤ 300 ms e o menu continua abrindo/fechando por teclado.
- Manual: ativar a opção do sistema operacional e percorrer as cinco páginas (registro em `quickstart.md`).
