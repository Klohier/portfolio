const menu = document.querySelector(".menu");
const header = document.querySelector("header");

document.addEventListener("click", (event) => {
  if (!menu) return;

  const isExpanded = menu.getAttribute("aria-expanded") === "true";

  if (menu.contains(event.target)) {
    menu.setAttribute("aria-expanded", `${!isExpanded}`);
  } else if (isExpanded && !header?.contains(event.target)) {
    menu.setAttribute("aria-expanded", "false");
  }
});
