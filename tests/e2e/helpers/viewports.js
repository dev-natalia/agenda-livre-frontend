export const WIDTHS = [320, 375, 768, 1024, 1440];
export const PAGES = ["index.html", "explorar.html", "atividade.html", "sobre.html", "contato.html"];

const ACTIVITY = (n) => ({
  id: `550e8400-e29b-41d4-a716-44665544${String(n).padStart(4, "0")}`,
  title: n === 0 ? "X".repeat(200) : `Atividade de teste ${n}`,
  unit: { name: "CEU Navegantes", neighborhood: "Grajaú" },
  category: { name: "Cultura e Artes", slug: "cultura-e-artes" },
  next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
});

export async function mountProbeCards(page, count = 6) {
  const activities = Array.from({ length: count }, (_, i) => ACTIVITY(i));
  await page.evaluate(async (items) => {
    const { createActivityCard } = await import("/js/components/activity-card.js");
    const grid = document.createElement("div");
    grid.className = "card-grid";
    grid.id = "probe-grid";
    grid.append(...items.map((a) => createActivityCard(a, { headingLevel: 2 })));
    document.querySelector("main").append(grid);
  }, activities);
}

// Quantidade de cards na primeira linha da grade.
export async function columnsOf(page, selector = "#probe-grid") {
  return page.evaluate((sel) => {
    const tops = [...document.querySelector(sel).children].map((c) => Math.round(c.getBoundingClientRect().top));
    return tops.filter((top) => top === tops[0]).length;
  }, selector);
}
