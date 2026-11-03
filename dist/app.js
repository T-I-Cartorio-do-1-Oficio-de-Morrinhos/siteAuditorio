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

const gallery = document.querySelector(".gallery");
const galleryItems = [...document.querySelectorAll(".gallery-item")];
const filters = [...document.querySelectorAll("[data-filter]")];
const photos = galleryItems.map((item) => ({
  src:
    item.querySelector("img").dataset.full ||
    item.querySelector("img").getAttribute("src"),
  alt: item.querySelector("img").alt,
  caption: item.querySelector("figcaption").firstChild.textContent.trim(),
  trigger: item.querySelector(".photo-button"),
}));
let visiblePhotos = photos.map((_, index) => index);
filters.forEach((button) =>
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    filters.forEach((filter) =>
      filter.setAttribute("aria-pressed", String(filter === button)),
    );
    visiblePhotos = [];
    galleryItems.forEach((item, index) => {
      const visible =
        category === "todos" || category === item.dataset.category;
      item.hidden = !visible;
      if (visible) {
        visiblePhotos.push(index);
        item.classList.add("is-visible");
      }
    });
    gallery.classList.toggle("is-filtered", category !== "todos");
    gallery.classList.toggle("only-one", visiblePhotos.length === 1);
    document.querySelector("#gallery-count").textContent =
      `${visiblePhotos.length} ${visiblePhotos.length === 1 ? "memória" : "memórias"}`;
  }),
);

const dialog = document.getElementById("photo-dialog");
const largeImage = dialog.querySelector(".lightbox-image");
let photoPosition = 0;
let lastPhotoTrigger;
function renderPhoto() {
  const photo = photos[visiblePhotos[photoPosition]];
  largeImage.decoding = "async";
  largeImage.src = photo.src;
  largeImage.alt = photo.alt;
  dialog.querySelector(".lightbox-caption").textContent = photo.caption;
  dialog.querySelector(".lightbox-counter").textContent =
    `${String(photoPosition + 1).padStart(2, "0")} / ${String(visiblePhotos.length).padStart(2, "0")}`;
  dialog.querySelectorAll(".lightbox-prev,.lightbox-next").forEach((button) => {
    button.hidden = visiblePhotos.length < 2;
  });
}
function movePhoto(direction) {
  photoPosition =
    (photoPosition + direction + visiblePhotos.length) % visiblePhotos.length;
  renderPhoto();
}
photos.forEach((photo, index) =>
  photo.trigger.addEventListener("click", () => {
    photoPosition = visiblePhotos.indexOf(index);
    if (photoPosition < 0) return;
    lastPhotoTrigger = photo.trigger;
    renderPhoto();
    dialog.showModal();
    document.body.classList.add("dialog-open");
    dialog.querySelector(".lightbox-close").focus();
  }),
);
dialog
  .querySelector(".lightbox-close")
  .addEventListener("click", () => dialog.close());
dialog
  .querySelector(".lightbox-prev")
  .addEventListener("click", () => movePhoto(-1));
dialog
  .querySelector(".lightbox-next")
  .addEventListener("click", () => movePhoto(1));
dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  if (lastPhotoTrigger && !lastPhotoTrigger.closest("[hidden]"))
    lastPhotoTrigger.focus({ preventScroll: true });
});
dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    movePhoto(event.key === "ArrowLeft" ? -1 : 1);
  }
});
dialog.addEventListener("click", (event) => {
  if (
    event.target === dialog ||
    event.target.classList.contains("lightbox-stage")
  )
    dialog.close();
});
let touchOrigin;
const stage = dialog.querySelector(".lightbox-stage");
stage.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length === 1)
      touchOrigin = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
  },
  { passive: true },
);
stage.addEventListener(
  "touchend",
  (event) => {
    if (!touchOrigin || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchOrigin.x;
    const dy = event.changedTouches[0].clientY - touchOrigin.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4)
      movePhoto(dx < 0 ? 1 : -1);
    touchOrigin = undefined;
  },
  { passive: true },
);
stage.addEventListener(
  "touchcancel",
  () => {
    touchOrigin = undefined;
  },
  { passive: true },
);

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
