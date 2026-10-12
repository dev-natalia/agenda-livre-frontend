import { formatDay, formatOccurrence, formatTimeRange } from "../utils/format.js";

const LIST = new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" });

const isObject = (value) => value !== null && typeof value === "object";

function weekdaysLabel(names) {
  const list = Array.isArray(names) ? names.filter((n) => typeof n === "string" && n.trim() !== "") : [];
  return list.length ? LIST.format(list) : null;
}

function scheduleView(schedule) {
  if (!isObject(schedule)) return null;
  const start = formatDay(schedule.start_date);
  if (!start) return null;

  const recurring = schedule.schedule_type === "RECURRING";
  const end = formatDay(schedule.end_date);
  const periodLabel = recurring && end && end !== start ? `${start} a ${end}` : start;

  return {
    kind: recurring ? "recurring" : "one-time",
    periodLabel,
    timeLabel: formatTimeRange(schedule.start_time, schedule.end_time),
    weekdaysLabel: recurring ? weekdaysLabel(schedule.weekday_names) : null,
  };
}

function upcomingView(occurrence) {
  const formatted = formatOccurrence(occurrence);
  if (!formatted) return null;
  return {
    label: formatted.timeLabel ? `${formatted.dateLabel} · ${formatted.timeLabel}` : formatted.dateLabel,
    datetime: formatted.datetime,
  };
}

// Programações e próximas datas na ordem da API; nada é recalculado nem reordenado aqui.
export function scheduleViews(schedules, occurrences) {
  return {
    items: (Array.isArray(schedules) ? schedules : []).map(scheduleView).filter(Boolean),
    upcoming: (Array.isArray(occurrences) ? occurrences : []).map(upcomingView).filter(Boolean),
  };
}
