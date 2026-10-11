const SAO_PAULO_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Dia do calendário em São Paulo (mesmo fuso da API), no formato AAAA-MM-DD.
export function todayInSaoPaulo(now = new Date()) {
  return SAO_PAULO_DAY.format(now);
}

function parse(day) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date));
}

function format(date) {
  return date.toISOString().slice(0, 10);
}

// Aritmética de calendário em UTC: independe do fuso do dispositivo.
export function addDays(day, amount) {
  const date = parse(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return format(date);
}

export function lastDayOfMonth(day) {
  const date = parse(day);
  return format(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)));
}
