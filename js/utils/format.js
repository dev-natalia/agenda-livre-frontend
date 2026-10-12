const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return valid ? date : null;
}

function parseTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const [hours, minutes] = match.slice(1).map(Number);
  return hours <= 23 && minutes <= 59 ? { hours: match[1], minutes: match[2] } : null;
}

const label = (time) => `${time.hours}h${time.minutes}`;

// A data da API é um dia do calendário (sem fuso): formatada em UTC para nunca recuar um dia.
export function formatOccurrence(occurrence) {
  if (!occurrence || typeof occurrence !== "object") return null;
  const date = parseDate(occurrence.date);
  if (!date) return null;

  const start = parseTime(occurrence.start_time);
  const end = start ? parseTime(occurrence.end_time) : null;

  let timeLabel = null;
  if (start) timeLabel = end ? `${label(start)} às ${label(end)}` : label(start);

  return {
    dateLabel: DATE_FORMAT.format(date),
    timeLabel,
    datetime: start ? `${occurrence.date}T${start.hours}:${start.minutes}` : occurrence.date,
  };
}

const DAY_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Dia do calendário por extenso ("20 de novembro de 2026"); null para valores inválidos.
export function formatDay(value) {
  const date = parseDate(value);
  return date ? DAY_FORMAT.format(date) : null;
}

// "14h00 às 15h00", "14h00" (sem fim) ou null (sem início ou início inválido).
export function formatTimeRange(startValue, endValue) {
  const start = parseTime(startValue);
  if (!start) return null;
  const end = parseTime(endValue);
  return end ? `${label(start)} às ${label(end)}` : label(start);
}

export function activityDetailsUrl(id) {
  const params = new URLSearchParams({ id: String(id) });
  return `atividade.html?${params}`;
}
