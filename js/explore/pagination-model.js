export const MAX_ITEMS = 7;
const DEFAULT_PAGE_SIZE = 12;

const page = (number) => ({ type: "page", number });
const gap = () => ({ type: "gap" });
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => page(from + i));

// No máximo 7 itens (cabe em 320 px): primeira, última, atual ±1 e reticências nos saltos.
export function pageItems(current, total) {
  if (total <= MAX_ITEMS) return range(1, total);
  if (current <= 4) return [...range(1, 5), gap(), page(total)];
  if (current >= total - 3) return [page(1), gap(), ...range(total - 4, total)];
  return [page(1), gap(), ...range(current - 1, current + 1), gap(), page(total)];
}

// `null` quando não há o que paginar. Sem total confiável, só anterior/próxima conforme a API informou.
export function buildPaginationModel({ current, count, pageSize = DEFAULT_PAGE_SIZE, hasPrevious = false, hasNext = false }) {
  if (Number.isInteger(count) && count >= 0) {
    const total = Math.ceil(count / pageSize);
    if (total <= 1) return null;
    return {
      current,
      total,
      items: pageItems(current, total),
      previous: current > 1 ? current - 1 : null,
      next: current < total ? current + 1 : null,
    };
  }
  if (!hasPrevious && !hasNext) return null;
  return {
    current,
    total: null,
    items: [],
    previous: hasPrevious && current > 1 ? current - 1 : null,
    next: hasNext ? current + 1 : null,
  };
}
