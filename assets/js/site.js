(function () {
  "use strict";

  // Solid top bar once the hero photo has scrolled past
  const topbar = document.getElementById("topbar");
  const updateTopbar = () => topbar.classList.toggle("is-solid", window.scrollY > 40);
  updateTopbar();
  window.addEventListener("scroll", updateTopbar, { passive: true });

  // Photo viewer
  const viewer = document.getElementById("viewer");
  const viewerImg = viewer.querySelector("img");
  document.querySelectorAll(".shot").forEach((shot) => {
    shot.addEventListener("click", () => {
      const thumb = shot.querySelector("img");
      viewerImg.src = shot.dataset.full;
      viewerImg.alt = thumb.alt;
      viewer.showModal();
    });
  });
  viewer.addEventListener("click", (e) => {
    if (e.target === viewer) viewer.close();
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
