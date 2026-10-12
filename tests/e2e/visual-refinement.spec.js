// Refinamento visual (feature 011): marca, alinhamento, larguras de referência e composição.
// Mede propriedades (alinhamento, tamanho, sobreposição, cor computada), nunca pixels.
import { expect, test } from "@playwright/test";
import { DETAILS_ID, makeActivity, makeDetails, mockApi } from "./helpers/mock-api.js";
import { PAGES, WIDTHS } from "./helpers/viewports.js";

const REM = 16;

async function open(page, path, width) {
  await page.setViewportSize({ width, height: 900 });
  await mockApi(page);
  await page.goto(`/${path}`);
  await page.waitForLoadState("networkidle");
}

const noHorizontalScroll = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe("marca e estrutura global", () => {
  for (const path of PAGES) {
    for (const width of WIDTHS) {
      test(`${path} em ${width}px: sem rolagem horizontal, conteúdo alinhado e logo carregado`, async ({ page }) => {
        await open(page, path, width);
        expect(await noHorizontalScroll(page)).toBe(true);

        // O conteúdo de cabeçalho, main e rodapé começa no mesmo eixo horizontal.
        const lefts = await page.evaluate(() => {
          const edge = (el) => {
            const box = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return Math.round(box.left + parseFloat(style.paddingLeft));
          };
          return ["header", "main", "footer"].map((tag) => edge(document.querySelector(`body > ${tag}`)));
        });
        expect(new Set(lefts).size, `eixos ${lefts}`).toBe(1);

        const logo = page.locator(".site-header__brand img");
        await expect(logo).toHaveCount(1);
        expect(await logo.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
      });
    }
  }

  test("o logo tem a mesma altura nas cinco páginas", async ({ page }) => {
    const heights = [];
    for (const path of PAGES) {
      await open(page, path, 1440);
      heights.push(await page.locator(".site-header__brand img").evaluate((img) => Math.round(img.getBoundingClientRect().height)));
    }
    expect(new Set(heights).size).toBe(1);
  });

  test("em 1440px o conteúdo não passa de 80rem e o texto de Sobre mantém largura de leitura", async ({ page }) => {
    await open(page, "sobre.html", 1440);
    const widths = await page.evaluate(() => {
      const main = document.querySelector("main").getBoundingClientRect().width;
      const paragraph = document.querySelector("main p").getBoundingClientRect().width;
      const chWidth = parseFloat(getComputedStyle(document.querySelector("main p")).fontSize) * 0.6;
      return { main, paragraph, chWidth };
    });
    expect(widths.main).toBeLessThanOrEqual(80 * REM + 1);
    expect(widths.paragraph).toBeLessThanOrEqual(65 * widths.chWidth * 1.4); // 65ch, folga para a métrica da fonte
    expect(widths.paragraph).toBeLessThan(widths.main);
  });

  test("em página curta o rodapé fica ao final da janela", async ({ page }) => {
    await open(page, "sobre.html", 1440);
    await page.setViewportSize({ width: 1440, height: 2400 });
    const gap = await page.evaluate(() => window.innerHeight - document.querySelector("body > footer").getBoundingClientRect().bottom);
    expect(Math.abs(gap)).toBeLessThanOrEqual(1);
  });

  test("a página atual se distingue na navegação por mais que a cor", async ({ page }) => {
    await open(page, "sobre.html", 1440);
    const current = await page.locator("#site-nav-list a[aria-current=page]").evaluate((el) => {
      const s = getComputedStyle(el);
      return { weight: Number(s.fontWeight), border: parseFloat(s.borderBottomWidth) };
    });
    expect(current.weight).toBeGreaterThanOrEqual(700);
    expect(current.border).toBeGreaterThanOrEqual(3);
  });
});

test.describe("Início: hero, busca e próximas atividades", () => {
  test("o título é o maior texto da página e o hero é um painel com a ilustração decorativa", async ({ page }) => {
    await open(page, "index.html", 1440);
    const sizes = await page.evaluate(() => {
      const size = (el) => parseFloat(getComputedStyle(el).fontSize);
      const h1 = size(document.querySelector("main h1"));
      const others = [...document.querySelectorAll("main h2, main h3, main p, main label, main button")].map(size);
      return { h1, max: Math.max(...others) };
    });
    expect(sizes.h1).toBeGreaterThan(sizes.max);
    const hero = await page.locator(".hero").evaluate((el) => {
      const s = getComputedStyle(el);
      return { radius: parseFloat(s.borderTopLeftRadius), background: s.backgroundColor };
    });
    expect(hero.radius).toBeGreaterThanOrEqual(12);
    expect(hero.background).not.toBe("rgba(0, 0, 0, 0)");
    await expect(page.locator(".hero__image")).toHaveAttribute("alt", "");
  });

  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`a busca em ${width}px forma um painel, sem controles sobrepostos nem menores que o alvo mínimo`, async ({ page }) => {
      await open(page, "index.html", width);
      const panel = await page.locator(".quick-search").evaluate((el) => {
        const s = getComputedStyle(el);
        return { shadow: s.boxShadow, border: parseFloat(s.borderTopWidth) };
      });
      expect(panel.shadow).not.toBe("none");
      expect(panel.border).toBeGreaterThanOrEqual(1);

      const boxes = await page.evaluate(() =>
        [...document.querySelectorAll(".quick-search input, .quick-search select, .quick-search button")].map((el) => {
          const b = el.getBoundingClientRect();
          return { top: b.top, left: b.left, right: b.right, bottom: b.bottom, height: b.height };
        }),
      );
      for (const box of boxes) expect(box.height).toBeGreaterThanOrEqual(44 - 1);
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i];
          const b = boxes[j];
          const overlap = a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
          expect(overlap, `controles ${i} e ${j}`).toBe(false);
        }
      }
      // Rótulo acima do campo.
      const labelAbove = await page.evaluate(() => {
        const label = document.querySelector('label[for="search-q"]').getBoundingClientRect();
        const input = document.querySelector("#search-q").getBoundingClientRect();
        return label.bottom <= input.top + 1;
      });
      expect(labelAbove).toBe(true);
    });
  }

  test("'Explorar' tem a mesma altura dos campos e é o botão principal da busca", async ({ page }) => {
    await open(page, "index.html", 1440);
    const info = await page.evaluate(() => {
      const button = document.querySelector(".quick-search__submit");
      const select = document.querySelector("#filter-unit");
      return {
        button: Math.round(button.getBoundingClientRect().height),
        select: Math.round(select.getBoundingClientRect().height),
        background: getComputedStyle(button).backgroundColor,
      };
    });
    expect(Math.abs(info.button - info.select)).toBeLessThanOrEqual(2);
    expect(info.background).toBe("rgb(37, 99, 235)");
  });

  test("a busca envia os mesmos parâmetros para Explorar", async ({ page }) => {
    await open(page, "index.html", 1024);
    await page.getByLabel("Buscar por nome da atividade").fill("oficina");
    await page.getByLabel("Quando?").selectOption("week");
    await page.getByRole("button", { name: "Explorar" }).click();
    await page.waitForURL(/explorar\.html/);
    const params = new URL(page.url()).searchParams;
    expect(params.get("q")).toBe("oficina");
    expect(params.get("date_from")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(params.get("date_to")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  for (const [label, options] of [
    ["três cards", {}],
    ["um card", { one: true }],
    ["estado vazio", { activities: [] }],
    ["erro", { failActivities: 500 }],
  ]) {
    test(`a seção de próximas atividades mantém 'Ver todas' visível com ${label}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      const { makeActivity } = await import("./helpers/mock-api.js");
      await mockApi(page, options.one ? { activities: [makeActivity(1)] } : options);
      await page.goto("/index.html");
      await page.waitForLoadState("networkidle");
      const link = page.getByRole("link", { name: "Ver todas" });
      await expect(link).toBeVisible();
      expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(43);
      expect(await noHorizontalScroll(page)).toBe(true);
    });
  }
});

test.describe("cards, etiquetas e estados", () => {
  const SAMPLE = (n, slug, name, extra = {}) =>
    makeActivity(n, { category: { id: `c${n}`, name, slug }, ...extra });

  test("cards da mesma linha têm a mesma altura e a data na mesma posição, em 1440 e 768", async ({ page }) => {
    for (const width of [1440, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await mockApi(page, {
        activities: [
          SAMPLE(1, "cultura-e-artes", "Cultura e Artes", { title: "Curta" }),
          SAMPLE(2, "esporte-e-atividade-fisica", "Esporte", { title: "Um título bem mais longo para forçar a quebra em várias linhas dentro do card" }),
          SAMPLE(3, "cursos-e-formacao", "Cursos"),
        ],
      });
      await page.goto("/index.html");
      await page.waitForLoadState("networkidle");
      const rows = await page.evaluate(() => {
        const cards = [...document.querySelectorAll("#upcoming-content .activity-card")];
        const top = Math.round(cards[0].getBoundingClientRect().top);
        return cards
          .filter((c) => Math.round(c.getBoundingClientRect().top) === top)
          .map((c) => ({
            height: Math.round(c.getBoundingClientRect().height),
            whenBottom: Math.round(c.querySelector(".activity-card__when").getBoundingClientRect().bottom),
          }));
      });
      expect(rows.length).toBeGreaterThanOrEqual(2);
      expect(new Set(rows.map((r) => r.height)).size, `alturas ${width}`).toBe(1);
      expect(new Set(rows.map((r) => r.whenBottom)).size, `datas ${width}`).toBe(1);
    }
  });

  test("título de 120 caracteres sem espaços não transborda o card em 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await mockApi(page, { activities: [SAMPLE(1, "cultura-e-artes", "Cultura e Artes", { title: "X".repeat(120) })] });
    await page.goto("/index.html");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => {
      const card = document.querySelector(".activity-card").getBoundingClientRect();
      const link = document.querySelector(".activity-card__title a").getBoundingClientRect();
      return link.right > card.right + 0.5;
    });
    expect(overflow).toBe(false);
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("a cor da etiqueta muda por categoria, é neutra para slug desconhecido e o nome continua escrito", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await mockApi(page, {
      activities: [
        SAMPLE(1, "cultura-e-artes", "Cultura e Artes"),
        SAMPLE(2, "esporte-e-atividade-fisica", "Esporte e Atividade Física"),
        SAMPLE(3, "categoria-nova", "Categoria Nova"),
      ],
    });
    await page.goto("/index.html");
    await page.waitForLoadState("networkidle");
    const tags = await page.locator(".activity-card__category").evaluateAll((els) =>
      els.map((el) => ({ text: el.textContent, bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color })),
    );
    expect(tags.map((t) => t.text)).toEqual(["Cultura e Artes", "Esporte e Atividade Física", "Categoria Nova"]);
    expect(tags[0].bg).toBe("rgb(185, 28, 28)");
    expect(tags[1].bg).toBe("rgb(21, 128, 61)");
    expect(tags[2].bg).toBe("rgb(230, 238, 250)");
    expect(tags[0].color).toBe("rgb(255, 255, 255)");
  });

  test("a mesma categoria tem a mesma cor em Início e Explorar", async ({ page }) => {
    const activities = [SAMPLE(1, "saude-e-bem-estar", "Saúde e Bem-Estar")];
    const colors = [];
    for (const path of ["index.html", "explorar.html"]) {
      await mockApi(page, { activities });
      await page.goto(`/${path}`);
      await page.waitForLoadState("networkidle");
      colors.push(await page.locator(".activity-card__category").first().evaluate((el) => getComputedStyle(el).backgroundColor));
    }
    expect(colors[0]).toBe(colors[1]);
    expect(colors[0]).toBe("rgb(15, 118, 110)");
  });

  test("vazio, carregando e erro têm formas de borda distintas", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    const shapes = {};
    await mockApi(page, { activities: [] });
    await page.goto("/index.html");
    await page.waitForLoadState("networkidle");
    shapes.empty = await page.locator(".region-state__empty").first().evaluate((el) => getComputedStyle(el).borderTopStyle);

    await mockApi(page, { failActivities: 500 });
    await page.goto("/index.html");
    await page.waitForLoadState("networkidle");
    shapes.error = await page.locator(".error-state__message").first().evaluate((el) => getComputedStyle(el).borderLeftWidth);

    await mockApi(page, { delayMs: 2000 });
    await page.goto("/index.html");
    shapes.loading = await page.locator(".region-state__loading, .skeleton-card").first().evaluate((el) => getComputedStyle(el).borderTopStyle);

    expect(shapes.empty).toBe("dashed");
    expect(shapes.error).toBe("6px");
    expect(["dotted", "solid"]).toContain(shapes.loading);
    expect(shapes.loading).not.toBe(shapes.empty);
  });

  test("por teclado, um Tab no card foca o link do título com foco visível", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await mockApi(page);
    await page.goto("/index.html");
    await page.waitForLoadState("networkidle");
    await page.locator("#upcoming-content .activity-card a").first().focus();
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      const card = el.closest(".activity-card");
      const cs = getComputedStyle(card);
      return { tag: el.tagName, inCard: !!card, outline: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
    expect(focused.tag).toBe("A");
    expect(focused.inCard).toBe(true);
    expect(focused.outline).not.toBe("none");
    expect(focused.width).toBeGreaterThanOrEqual(3);
    // Um único link por card: o Tab seguinte sai do primeiro card.
    const links = await page.locator("#upcoming-content .activity-card").first().getByRole("link").count();
    expect(links).toBe(1);
  });
});

test.describe("botões, campos e links entre páginas", () => {
  const PROBE = `
    <div id="probe">
      <p>Texto com <a id="probe-link" href="sobre.html">um link</a>.</p>
      <button id="probe-primary" class="button" type="button">Primário</button>
      <button id="probe-accent" class="button button--secondary" type="button">Destaque</button>
      <button id="probe-outline" class="button button--outline" type="button">Contornado</button>
      <label for="probe-input">Campo</label><input id="probe-input" type="text">
      <select id="probe-select" aria-label="Seletor"><option>A</option></select>
    </div>`;

  async function readControls(page) {
    await page.evaluate((html) => document.querySelector("main").insertAdjacentHTML("beforeend", html), PROBE);
    return page.evaluate(() => {
      const read = (id, props) => {
        const cs = getComputedStyle(document.getElementById(id));
        return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
      };
      const button = ["background-color", "border-top-left-radius", "min-height", "font-weight", "color"];
      const field = ["min-height", "border-top-left-radius", "border-top-width", "border-top-color"];
      return {
        primary: read("probe-primary", button),
        accent: read("probe-accent", button),
        outline: read("probe-outline", button),
        input: read("probe-input", field),
        select: read("probe-select", field),
        link: read("probe-link", ["text-decoration-line"]),
      };
    });
  }

  test("botões e campos têm a mesma aparência nas cinco páginas, e links continuam sublinhados", async ({ page }) => {
    const seen = [];
    for (const path of PAGES) {
      await open(page, path, 1024);
      seen.push(JSON.stringify(await readControls(page)));
    }
    expect(new Set(seen).size).toBe(1);
    const sample = JSON.parse(seen[0]);
    expect(sample.link["text-decoration-line"]).toContain("underline");
    expect(sample.primary["background-color"]).toBe("rgb(37, 99, 235)");
    expect(sample.accent["background-color"]).toBe("rgb(249, 115, 22)");
    expect(sample.outline["background-color"]).toBe("rgb(255, 255, 255)");
    expect(parseFloat(sample.primary["min-height"])).toBeGreaterThanOrEqual(44);
    expect(parseFloat(sample.input["min-height"])).toBeGreaterThanOrEqual(44);
    expect(sample.input["border-top-left-radius"]).toBe(sample.primary["border-top-left-radius"]);
  });
});

test.describe("páginas internas", () => {
  test("Explorar: filtros em painel com Filtrar primário e Limpar contornado, sem sobreposição em 320px", async ({ page }) => {
    await open(page, "explorar.html", 320);
    const panel = await page.locator("#explore-form").evaluate((el) => {
      const s = getComputedStyle(el);
      return { shadow: s.boxShadow, radius: parseFloat(s.borderTopLeftRadius) };
    });
    expect(panel.shadow).not.toBe("none");
    expect(panel.radius).toBeGreaterThanOrEqual(12);
    const bg = (sel) => page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await bg("#explore-submit")).toBe("rgb(37, 99, 235)");
    expect(await bg("#explore-clear")).toBe("rgb(255, 255, 255)");
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll("#explore-form input, #explore-form select, #explore-form button")].map((el) => {
        const b = el.getBoundingClientRect();
        return { top: b.top, left: b.left, right: b.right, bottom: b.bottom };
      }),
    );
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        expect(a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1, `${i}/${j}`).toBe(false);
      }
    }
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("Explorar: Filtrar monta a URL e Limpar filtros a esvazia", async ({ page }) => {
    await open(page, "explorar.html", 1024);
    await page.getByLabel("Buscar por nome da atividade").fill("dança");
    await page.locator("#explore-submit").click();
    await expect(page).toHaveURL(/explorar\.html\?q=dan%C3%A7a/);
    await page.locator("#explore-clear").click();
    await expect(page).toHaveURL(/explorar\.html$/);
  });

  test("Detalhes: título antes da descrição, categoria com cor e metadados com ícone", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await mockApi(page, {
      detailsResponder: () => ({
        body: makeDetails({ category: { id: "c1", name: "Esporte", slug: "esporte-e-atividade-fisica" } }),
      }),
    });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator("h1")).toBeVisible();
    const info = await page.evaluate(() => {
      const top = (sel) => document.querySelector(sel).getBoundingClientRect().top;
      const tag = document.querySelector(".activity-details__category");
      return {
        titleTop: top("h1"),
        descriptionTop: top(".activity-details__description"),
        bg: getComputedStyle(tag).backgroundColor,
        slug: tag.getAttribute("data-category"),
        icons: document.querySelectorAll(".activity-details__header svg.meta-icon").length,
      };
    });
    expect(info.titleTop).toBeLessThan(info.descriptionTop);
    expect(info.slug).toBe("esporte-e-atividade-fisica");
    expect(info.bg).toBe("rgb(21, 128, 61)");
    expect(info.icons).toBeGreaterThan(0);
  });

  test("Detalhes: não encontrada mostra o botão para Explorar", async ({ page }) => {
    await open(page, "atividade.html", 375);
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.getByRole("link", { name: "Explorar outras atividades" })).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("Sobre: parágrafos em largura de leitura e convite como botão primário", async ({ page }) => {
    await open(page, "sobre.html", 1440);
    const info = await page.evaluate(() => {
      const p = document.querySelector(".prose p").getBoundingClientRect().width;
      const button = document.querySelector(".prose .button");
      return { p, bg: getComputedStyle(button).backgroundColor };
    });
    expect(info.p).toBeLessThanOrEqual(65 * 16 * 0.62 * 1.4);
    expect(info.bg).toBe("rgb(37, 99, 235)");
  });

  test("Contato: aviso evidente acima do primeiro campo, formulário em painel e sem rede", async ({ page }) => {
    await open(page, "contato.html", 1024);
    const order = await page.evaluate(() => {
      const notice = document.querySelector(".demo-notice").getBoundingClientRect();
      const first = document.querySelector("#contact-name").getBoundingClientRect();
      const form = getComputedStyle(document.querySelector("#contact-form"));
      return { noticeAbove: notice.bottom <= first.top, shadow: form.boxShadow, radius: parseFloat(form.borderTopLeftRadius) };
    });
    expect(order.noticeAbove).toBe(true);
    expect(order.shadow).not.toBe("none");
    expect(order.radius).toBeGreaterThanOrEqual(12);

    const requests = [];
    page.on("request", (r) => {
      if (!r.url().startsWith("http://localhost:5500")) requests.push(r.url());
    });
    await page.getByLabel("Nome").fill("Maria Silva");
    await page.getByLabel("E-mail").fill("maria@exemplo.com");
    await page.getByLabel("Assunto").fill("Dúvida");
    await page.getByLabel("Mensagem").fill("Gostaria de saber mais sobre as atividades.");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.locator("#contact-confirmation")).toBeVisible();
    expect(requests).toEqual([]);
  });

  test("Contato: enviar vazio mostra o resumo de erros", async ({ page }) => {
    await open(page, "contato.html", 375);
    await page.getByRole("button", { name: "Enviar mensagem" }).click({ force: true });
    await expect(page.locator("#contact-summary")).not.toBeEmpty();
  });
});
