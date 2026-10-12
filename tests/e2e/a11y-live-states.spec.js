import { expect, test } from "@playwright/test";
import { DETAILS_ID, makeActivity, makeDetails, makeListing, mockApi } from "./helpers/mock-api.js";

// Estados dinâmicos (FE-038; WCAG 4.1.3): cada transição gera uma mensagem curta e única numa região
// de aviso, sem mover o foco além do previsto. Um MutationObserver registra o que os leitores de tela
// receberiam: cada lote de mudanças numa região live com texto vira uma entrada.
async function watchAnnouncements(page) {
  await page.addInitScript(() => {
    window.__announced = [];
    const live = (node) => {
      const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      return el?.closest?.("[role=status], [role=alert], [aria-live]") ?? null;
    };
    const start = () => {
      new MutationObserver((records) => {
        const regions = new Set();
        for (const record of records) {
          const region = live(record.target);
          if (region) regions.add(region);
        }
        for (const region of regions) {
          const text = region.textContent.trim().replace(/\s+/g, " ");
          if (text) window.__announced.push({ region: region.id || region.className || region.tagName, text });
        }
      }).observe(document, { subtree: true, childList: true, characterData: true });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  });
}

const announced = (page) => page.evaluate(() => window.__announced.map((a) => a.text));
const focusLabel = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return el && el !== document.body ? `${el.tagName.toLowerCase()}#${el.id}` : "body";
  });
const noConsecutiveDuplicates = (list) => list.every((text, i) => i === 0 || text !== list[i - 1]);
const listing = (total, delayMs = 0) => (url) => ({
  body: makeListing(total, { page: Number(url.searchParams.get("page") ?? 1) }),
  delayMs,
});

test.describe("Explorar", () => {
  test("carregar e concluir: duas mensagens no máximo, sem duplicata, foco intacto", async ({ page }) => {
    await watchAnnouncements(page);
    await mockApi(page, { activitiesResponder: listing(5, 700) });
    await page.goto("/explorar.html");
    await expect(page.locator("#results-content .activity-card")).toHaveCount(5);
    const messages = await announced(page);
    expect(messages.length).toBeLessThanOrEqual(2);
    expect(messages.at(-1)).toBe("5 atividades encontradas.");
    expect(noConsecutiveDuplicates(messages)).toBe(true);
    expect(await focusLabel(page)).toBe("body");
  });

  test("sem total confiável na resposta, a quantidade não é anunciada", async ({ page }) => {
    await watchAnnouncements(page);
    await mockApi(page, {
      activitiesResponder: () => ({ body: { results: [makeActivity(1), makeActivity(2)], next: null, previous: null } }),
    });
    await page.goto("/explorar.html");
    await expect(page.locator("#results-content .activity-card")).toHaveCount(2);
    const messages = await announced(page);
    expect(messages.join(" ")).not.toMatch(/\d+ atividades? encontrad/);
    expect(messages.at(-1)).toBe("Atividades carregadas.");
  });

  test("filtrar pelo teclado não tira o foco do botão Filtrar", async ({ page }) => {
    await watchAnnouncements(page);
    await mockApi(page, { activitiesResponder: listing(5, 300) });
    await page.goto("/explorar.html");
    await expect(page.locator("#results-content .activity-card")).toHaveCount(5);
    await page.locator("#explore-submit").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#results-content .activity-card")).toHaveCount(5);
    expect(await focusLabel(page)).toBe("button#explore-submit");
    expect(noConsecutiveDuplicates(await announced(page))).toBe(true);
  });

  test("vazio e erro são mensagens diferentes, cada uma anunciada uma vez", async ({ page }) => {
    await watchAnnouncements(page);
    await mockApi(page, { activitiesResponder: () => ({ body: makeListing(0) }) });
    await page.goto("/explorar.html?q=nada");
    await expect(page.locator(".region-state__empty")).toBeVisible();
    const emptyMessages = await announced(page);
    expect(emptyMessages.at(-1)).toMatch(/Nenhuma atividade encontrada/);
    expect(emptyMessages.at(-1)).not.toMatch(/falha|erro|tente/i);

    const other = await page.context().newPage();
    await watchAnnouncements(other);
    await mockApi(other, { failActivities: 500 });
    await other.goto("/explorar.html");
    await expect(other.locator(".error-state__message")).toBeVisible();
    const errorMessages = await announced(other);
    expect(errorMessages.at(-1)).not.toMatch(/Nenhuma atividade encontrada/);
    expect(errorMessages.at(-1)).toBe(await other.locator(".error-state__message").innerText());
    expect(noConsecutiveDuplicates(errorMessages)).toBe(true);
    await other.close();
  });

  test("erro: Tentar novamente é um botão operável por teclado e o foco vai para a região, não para o corpo", async ({ page }) => {
    await watchAnnouncements(page);
    const api = await mockApi(page, { failActivities: 500, delayMs: 200 });
    await page.goto("/explorar.html");
    const retry = page.getByRole("button", { name: "Tentar novamente" });
    await expect(retry).toBeVisible();
    await retry.focus();
    await page.keyboard.press("Space");
    // Durante a nova tentativa o botão é substituído; o foco fica na região, não se perde no corpo.
    expect(await focusLabel(page)).toBe("div#results-content");
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
    api.state.failActivities = null;
    await page.getByRole("button", { name: "Tentar novamente" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#results-content .activity-card")).toHaveCount(3);
    expect(await focusLabel(page)).toBe("div#results-content");
    // Uma nova tentativa que falha de novo repete o erro de propósito (a pessoa precisa saber que
    // nada mudou); fora isso, nenhuma mensagem se repete: erro, erro da 1ª nova tentativa, sucesso.
    const messages = await announced(page);
    expect(messages).toHaveLength(3);
    expect(messages[0]).toBe(messages[1]);
    expect(messages[2]).toBe("3 atividades encontradas.");
  });

  test("os esqueletos ficam ocultos das tecnologias assistivas", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listing(5, 1500) });
    await page.goto("/explorar.html");
    await expect(page.locator("#results-content .skeleton-card")).not.toHaveCount(0);
    const hidden = await page.locator(".skeleton-card").evaluateAll((els) => els.every((el) => el.closest("[aria-hidden='true']")));
    expect(hidden).toBe(true);
  });
});

test.describe("Início", () => {
  test("carregar: uma mensagem por estado, esqueletos ocultos, foco intacto", async ({ page }) => {
    await watchAnnouncements(page);
    await mockApi(page, { activitiesResponder: listing(3, 700) });
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content .skeleton-card").first()).toBeAttached();
    const hidden = await page.locator("#upcoming-content .skeleton-card").evaluateAll((els) => els.every((el) => el.getAttribute("aria-hidden") === "true"));
    expect(hidden).toBe(true);
    await expect(page.locator("#upcoming-content .activity-card")).toHaveCount(3);
    const messages = await announced(page);
    expect(messages.length).toBeLessThanOrEqual(2);
    expect(noConsecutiveDuplicates(messages)).toBe(true);
    expect(await focusLabel(page)).toBe("body");
  });

  test("erro sem mover o foco e com Tentar novamente", async ({ page }) => {
    await watchAnnouncements(page);
    await mockApi(page, { failActivities: 500 });
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content .error-state__message")).toBeVisible();
    expect(await focusLabel(page)).toBe("body");
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
    const messages = await announced(page);
    expect(messages.at(-1)).toBe(await page.locator(".error-state__message").innerText());
  });
});

test.describe("Detalhes", () => {
  test("sucesso anuncia a conclusão", async ({ page }) => {
    await watchAnnouncements(page);
    await mockApi(page, { detailsResponder: () => ({ body: makeDetails(), delayMs: 600 }) });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator("#details-content h1")).toBeVisible();
    const ok = await announced(page);
    expect(ok.at(-1)).toBe("Detalhes da atividade carregados.");
    expect(noConsecutiveDuplicates(ok)).toBe(true);
  });

  test("não encontrada é anunciada sem mover o foco", async ({ page }) => {
    await watchAnnouncements(page);
    await mockApi(page, {});
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator("#details-content h1")).toBeVisible();
    expect((await announced(page)).at(-1)).toBe("Atividade não encontrada ou não disponível.");
    expect(await focusLabel(page)).toBe("body");
  });

  test("erro técnico oferece Tentar novamente sem mover o foco", async ({ page }) => {
    await watchAnnouncements(page);
    await mockApi(page, { detailsResponder: () => ({ status: 500, body: { detail: "x" } }) });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
    expect(await focusLabel(page)).toBe("body");
    const messages = await announced(page);
    expect(messages.at(-1)).not.toBe("Atividade não encontrada ou não disponível.");
  });
});

test.describe("Contato", () => {
  test("erros: resumo uma vez e foco no primeiro campo inválido; confirmação anunciada e com foco no título", async ({ page }) => {
    await watchAnnouncements(page);
    await page.goto("/contato.html");
    await page.waitForFunction(() => !document.querySelector("#contact-form button[type=submit]").disabled);
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.locator("#contact-name")).toBeFocused();
    expect(await announced(page)).toEqual(["4 campos precisam de correção."]);

    await page.locator("#contact-name").fill("Maria de Teste");
    await page.locator("#contact-email").fill("maria@exemplo.com");
    await page.locator("#contact-subject").fill("Dúvida sobre o site");
    await page.locator("#contact-message").fill("Mensagem de teste com mais de dez caracteres.");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.locator("#contact-confirmation")).toBeVisible();
    await expect(page.locator("#contact-confirmation h2")).toBeFocused();
    const all = await announced(page);
    expect(noConsecutiveDuplicates(all)).toBe(true);
    expect(all.at(-1)).toMatch(/demonstrativo/i);
  });
});
