export function showConfigNotice(state, root = document) {
  if (state.status === "valid") return;

  const main = root.querySelector("main");
  if (!main || main.querySelector(".config-notice")) return;

  const notice = root.createElement("div");
  notice.className = "config-notice";
  notice.setAttribute("role", "alert");
  notice.textContent = state.message;
  main.prepend(notice);
}
