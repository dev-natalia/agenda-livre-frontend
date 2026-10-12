// Link externo de inscrição ou informações: só `http`/`https`, sem credenciais embutidas.
// O backend já filtra o valor, mas o frontend não confia nisso para decidir o que vira link.
export function safeExternalUrl(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (text === "") return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.hostname === "" || url.username !== "" || url.password !== "") return null;
    return url.href;
  } catch {
    return null;
  }
}
