/* =========================================================================
   GALERÍA DE FOTOS — lightbox simple (sin librerías externas)
   Se usa en cada página de departamento: al tocar la foto grande o
   cualquier miniatura, se abre una foto grande con flechas para pasar
   a la anterior/siguiente, sin salir de la página.
   ========================================================================= */

function openLightbox(images, startIndex) {
  let cur = startIndex;

  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Cerrar">&times;</button>
    <button type="button" class="lightbox-prev" aria-label="Foto anterior">&lsaquo;</button>
    <img class="lightbox-img" src="" alt="Foto del departamento">
    <button type="button" class="lightbox-next" aria-label="Foto siguiente">&rsaquo;</button>
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(overlay);
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const imgEl = overlay.querySelector(".lightbox-img");
  const counterEl = overlay.querySelector(".lightbox-counter");

  function render() {
    imgEl.src = images[cur];
    counterEl.textContent = `${cur + 1} / ${images.length}`;
  }
  function close() {
    document.body.removeChild(overlay);
    document.body.style.overflow = prevOverflow;
    document.removeEventListener("keydown", onKey);
  }
  function prev() {
    cur = (cur - 1 + images.length) % images.length;
    render();
  }
  function next() {
    cur = (cur + 1) % images.length;
    render();
  }
  function onKey(e) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
  }

  overlay.querySelector(".lightbox-close").addEventListener("click", close);
  overlay.querySelector(".lightbox-prev").addEventListener("click", prev);
  overlay.querySelector(".lightbox-next").addEventListener("click", next);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", onKey);

  render();
}

function initGallery() {
  const root = document.querySelector("[data-gallery-images]");
  if (!root) return;
  const images = JSON.parse(root.getAttribute("data-gallery-images"));
  root.querySelectorAll("[data-index]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = parseInt(el.getAttribute("data-index"), 10);
      openLightbox(images, idx);
    });
  });
}

document.addEventListener("DOMContentLoaded", initGallery);
