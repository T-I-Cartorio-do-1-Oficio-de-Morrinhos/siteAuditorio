"use strict";

document.documentElement.classList.add("js");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  navigation.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  navigation.classList.toggle("is-open", isOpen);
});
navigation
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, focus = false) {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden =
      !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      activateTab(tabs[next], true);
    }
  });
});

if ("IntersectionObserver" in window) {
  const reveals = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          reveals.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.07, rootMargin: "0px 0px -15px 0px" },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => reveals.observe(element));

  const chapters = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigation.querySelectorAll("a").forEach((link) => {
          const active =
            link.getAttribute("href") === `#${entry.target.id}` &&
            !link.classList.contains("nav-cta");
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-15% 0px -50% 0px", threshold: 0 },
  );
  document
    .querySelectorAll("main>section[id]")
    .forEach((section) => chapters.observe(section));
} else {
  document
    .querySelectorAll(".reveal")
    .forEach((element) => element.classList.add("is-visible"));
}
let progressQueued = false;
function updateProgress() {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty(
    "--progress",
    range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0,
  );
  progressQueued = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!progressQueued) {
      progressQueued = true;
      requestAnimationFrame(updateProgress);
    }
  },
  { passive: true },
);
window.addEventListener("resize", updateProgress, { passive: true });
updateProgress();

// Como chegar: abre o vídeo do caminho até o auditório numa janela
const routeDialog = document.querySelector(".route-dialog");
const routeOpen = document.querySelector("[data-route-open]");
if (routeDialog && routeOpen && typeof routeDialog.showModal === "function") {
  const routeVideo = routeDialog.querySelector("video");
  routeOpen.addEventListener("click", (event) => {
    event.preventDefault();
    routeDialog.showModal();
    routeVideo.play().catch(() => {});
  });
  routeDialog
    .querySelector(".route-close")
    .addEventListener("click", () => routeDialog.close());
  routeDialog.addEventListener("click", (event) => {
    if (event.target === routeDialog) routeDialog.close();
  });
  routeDialog.addEventListener("close", () => {
    routeVideo.pause();
    routeOpen.focus();
  });
}
