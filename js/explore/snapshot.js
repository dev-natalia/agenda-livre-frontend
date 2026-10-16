// Cópia dos resultados e da rolagem para a volta dos detalhes. Só `sessionStorage`, sempre em try/catch:
// sem ele a página continua correta (a listagem é reconstruída a partir do endereço).
export const TTL_MS = 5 * 60 * 1000;
export const MAX_ENTRIES = 10;

const PREFIX = "agenda-livre:explore:";
const INDEX_KEY = `${PREFIX}__index`;

function defaultStorage() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}

const keyFor = (search) => `${PREFIX}${search}`;

function readIndex(storage) {
  try {
    const list = JSON.parse(storage.getItem(INDEX_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((key) => typeof key === "string") : [];
  } catch {
    return [];
  }
}

function pick(activity) {
  return {
    id: activity.id,
    title: activity.title,
    unit: activity.unit ? { name: activity.unit.name, neighborhood: activity.unit.neighborhood } : null,
    category: activity.category ? { name: activity.category.name, slug: activity.category.slug } : null,
    next_occurrence: activity.next_occurrence ?? null,
    target_audiences: Array.isArray(activity.target_audiences)
      ? activity.target_audiences.filter(Boolean).map(({ id, name }) => ({ id, name }))
      : [],
  };
}

export function saveSnapshot(search, data, now = Date.now(), storage = defaultStorage()) {
  if (!storage || !Array.isArray(data?.results)) return;
  try {
    const entry = {
      savedAt: now,
      count: Number.isInteger(data.count) ? data.count : null,
      next: data.next ?? null,
      previous: data.previous ?? null,
      results: data.results.filter(Boolean).map(pick),
      scrollY: 0,
      activityId: null,
    };
    const key = keyFor(search);
    storage.setItem(key, JSON.stringify(entry));

    const index = readIndex(storage).filter((existing) => existing !== key);
    index.push(key);
    while (index.length > MAX_ENTRIES) storage.removeItem(index.shift());
    storage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch {
    // armazenamento cheio ou bloqueado: segue sem cópia
  }
}

export function readSnapshot(search, now = Date.now(), storage = defaultStorage()) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(keyFor(search));
    if (raw === null) return null;
    const entry = JSON.parse(raw);
    const valid =
      entry &&
      typeof entry === "object" &&
      Number.isFinite(entry.savedAt) &&
      Array.isArray(entry.results);
    if (!valid || now - entry.savedAt > TTL_MS) {
      storage.removeItem(keyFor(search));
      return null;
    }
    return {
      ...entry,
      scrollY: Number.isFinite(entry.scrollY) ? entry.scrollY : 0,
      activityId: typeof entry.activityId === "string" ? entry.activityId : null,
    };
  } catch {
    return null;
  }
}

// Atualiza só a entrada existente; `activityId` nulo preserva o card acionado antes.
export function updateScroll(search, scrollY, activityId = null, storage = defaultStorage()) {
  if (!storage) return;
  try {
    const raw = storage.getItem(keyFor(search));
    if (raw === null) return;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry !== "object") return;
    entry.scrollY = Number.isFinite(scrollY) ? scrollY : 0;
    if (activityId) entry.activityId = activityId;
    storage.setItem(keyFor(search), JSON.stringify(entry));
  } catch {
    // ignora
  }
}
