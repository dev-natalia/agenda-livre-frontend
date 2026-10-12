const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Lê `?id=` do endereço dos detalhes: UUID em minúsculas ou null (ausente, vazio ou inválido).
// Com `id` repetido vale o primeiro; o identificador nunca é enviado à API sem passar por aqui.
export function parseActivityId(search) {
  if (typeof search !== "string") return null;
  const value = new URLSearchParams(search).get("id");
  if (value === null) return null;
  const id = value.trim().toLowerCase();
  return UUID.test(id) ? id : null;
}
