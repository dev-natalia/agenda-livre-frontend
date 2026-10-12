// Mídia de uma atividade (cartão e detalhes): imagem da API ou fallback visual.
// `image` vem da API como { url, alt, decorative } ou null (contracts/api-image-contract.md).
// Os dados entram só por atributos, nunca por innerHTML.

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Devolve o contêiner com a <img> ou, sem imagem utilizável, o que `createFallback()` criar.
// Se a imagem falhar ao carregar, o contêiner é trocado por um novo fallback.
export function createActivityMedia(image, { className, createFallback }) {
  if (!image || typeof image !== "object" || !isHttpUrl(image.url)) return createFallback();

  const decorative = image.decorative === true;
  const media = document.createElement("div");
  media.className = className;
  if (decorative) media.setAttribute("aria-hidden", "true");

  const img = document.createElement("img");
  img.src = image.url;
  img.alt = !decorative && typeof image.alt === "string" ? image.alt : "";
  img.loading = "lazy";
  img.addEventListener("error", () => media.replaceWith(createFallback()), { once: true });
  media.append(img);
  return media;
}
