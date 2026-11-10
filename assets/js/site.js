(function () {
  "use strict";

  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Solid top bar once the hero has scrolled past
  const topbar = document.getElementById("topbar");
  const updateTopbar = () => topbar.classList.toggle("is-solid", window.scrollY > 40);
  updateTopbar();
  window.addEventListener("scroll", updateTopbar, { passive: true });

  // Photo viewer (delegated, so the carousel's copies open it too)
  const viewer = document.getElementById("viewer");
  const viewerImg = viewer.querySelector("img");
  let suppressClick = false;
  let viewerRestoringFocus = false;
  document.addEventListener("click", (e) => {
    const shot = e.target.closest(".shot");
    if (!shot) return;
    if (suppressClick) { e.preventDefault(); return; }
    const thumb = shot.querySelector("img");
    viewerImg.src = shot.dataset.full;
    viewerImg.alt = thumb.alt;
    viewerRestoringFocus = true;
    viewer.showModal();
  });
  viewer.addEventListener("close", () => { setTimeout(() => { viewerRestoringFocus = false; }, 0); });
  viewer.addEventListener("click", (e) => {
    if (e.target === viewer) viewer.close();
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Top bar: a small surfer rides a thin wave, following the mouse ----------
  const topwave = document.getElementById("topwave");
  const waveLine = document.getElementById("topwave-line");
  const mini = document.getElementById("mini-surfer");
  if (topwave && waveLine && mini) {
    const BASE = 21;
    const ripple = (x, t) => BASE - 2.5 - 2.5 * Math.sin(x / 38 - t / 600) - 1.5 * Math.sin(x / 17 + t / 900);
    const rippleSlope = (x, t) => -(2.5 / 38) * Math.cos(x / 38 - t / 600) - (1.5 / 17) * Math.cos(x / 17 + t / 900);
    console.assert(Math.abs(ripple(0, 0) - BASE) < 7, "top wave stays inside its strip");

    const body = mini.querySelector(".surfer-body");
    let width = topwave.clientWidth || 1440;
    let x = width / 2;
    let target = x;
    let lastMouse = -Infinity;

    const draw = (t) => {
      let d = "M0 " + ripple(0, t).toFixed(1);
      for (let px = 8; px <= width; px += 8) d += " L" + px + " " + ripple(px, t).toFixed(1);
      waveLine.setAttribute("d", d);
      const angle = Math.atan(rippleSlope(x, t)) * 180 / Math.PI;
      mini.setAttribute("transform", "translate(" + x.toFixed(1) + " " + ripple(x, t).toFixed(1) + ") rotate(" + angle.toFixed(1) + ")");
    };
    const resize = () => {
      width = topwave.clientWidth || 1440;
      topwave.setAttribute("viewBox", "0 0 " + width + " 26"); // one unit per pixel, so the surfer never stretches
      x = Math.min(x, width - 20);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    draw(0);

    if (motionOK) {
      window.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        target = Math.min(Math.max(e.clientX, 20), width - 20);
        lastMouse = performance.now();
      }, { passive: true });

      const ride = (t) => {
        // with no mouse (phones) or a resting mouse, ride back and forth alone
        if (t - lastMouse > 2500) target = width * (0.5 + 0.42 * Math.sin(t / 3200));
        const step = (target - x) * 0.07;
        if (Math.abs(step) > 0.05) body.classList.toggle("is-left", step < 0);
        x += step;
        draw(t);
        window.requestAnimationFrame(ride);
      };
      window.requestAnimationFrame(ride);
    }
  }

  // ---------- Hero: framed slideshow with numbered tabs, arrows and a spec card ----------
  const hero = document.getElementById("hero");
  const slides = hero ? [...hero.querySelectorAll(".slide")] : [];
  if (slides.length) {
    const DURATION = 7000;
    const tabsBox = document.getElementById("tabs");
    const spec = hero.querySelector(".spec");
    const fields = ["k1", "v1", "k2", "v2"].map((k) => [k, document.getElementById("spec-" + k)]);
    const backdrop = [...hero.querySelectorAll(".hero-backdrop i")];
    let current = 0;
    let layer = 0;
    let timer = null;
    let paused = false;

    const tabs = slides.map((slide, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tab";
      b.setAttribute("aria-label", "Show photo " + (i + 1) + ": " + slide.dataset.tab);
      b.innerHTML = "<b>" + String(i + 1).padStart(2, "0") + "</b><span></span>";
      b.querySelector("span").textContent = slide.dataset.tab;
      b.addEventListener("click", () => { spec.setAttribute("aria-live", "polite"); show(i); });
      tabsBox.appendChild(b);
      return b;
    });
    hero.style.setProperty("--dur", DURATION + "ms");

    const setBackdrop = (src) => {
      layer = 1 - layer;
      backdrop[layer].style.backgroundImage = "url(\"" + src + "\")";
      backdrop[layer].classList.add("is-on");
      backdrop[1 - layer].classList.remove("is-on");
    };

    const show = (i) => {
      current = (i + slides.length) % slides.length;
      const slide = slides[current];
      slides.forEach((s, j) => s.classList.toggle("is-active", j === current));
      const img = slide.querySelector("img");
      img.loading = "eager";
      setBackdrop(img.currentSrc || img.src);
      fields.forEach(([k, el]) => { el.textContent = slide.dataset[k]; });
      tabs.forEach((t, j) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-current", j === current ? "true" : "false");
      });
      // restart the fill: force a reflow so the width transition runs again from zero
      void tabs[current].offsetWidth;
      tabs[current].classList.add("is-active");
      schedule();
    };

    const schedule = () => {
      clearTimeout(timer);
      if (!motionOK || paused) return;
      timer = setTimeout(() => { spec.setAttribute("aria-live", "off"); show(current + 1); }, DURATION);
    };

    document.getElementById("prev").addEventListener("click", () => { spec.setAttribute("aria-live", "polite"); show(current - 1); });
    document.getElementById("next").addEventListener("click", () => { spec.setAttribute("aria-live", "polite"); show(current + 1); });

    // Pause while the visitor reads or uses the controls; resume from the start of that photo
    const pause = (on) => {
      paused = on;
      tabs[current].classList.toggle("is-paused", on);
      if (on) { clearTimeout(timer); tabs[current].classList.remove("is-active"); void tabs[current].offsetWidth; tabs[current].classList.add("is-active"); }
      else schedule();
    };
    const frame = hero.querySelector(".frame");
    frame.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") pause(true); });
    frame.addEventListener("pointerleave", () => pause(false));
    frame.addEventListener("focusin", () => pause(true));
    frame.addEventListener("focusout", (e) => { if (!frame.contains(e.relatedTarget)) pause(false); });
    document.addEventListener("visibilitychange", () => (document.hidden ? clearTimeout(timer) : schedule()));

    spec.setAttribute("aria-live", "off");
    show(0);
  }

  // ---------- Photos: a carousel that drifts on the waves ----------
  const sea = document.getElementById("photo-sea");
  const gallery = document.getElementById("gallery");
  if (!sea || !gallery || !motionOK) return; // reduced motion: the strip just scrolls by hand

  const originals = [...gallery.children];
  originals.forEach((node) => {
    const copy = node.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.tabIndex = -1;
    gallery.appendChild(copy);
  });
  const shots = [...gallery.children];
  sea.classList.add("is-drifting");

  const SPEED = 28; // px per second
  let setWidth = 0;
  let lefts = [];
  const measure = () => {
    setWidth = shots[originals.length].offsetLeft - shots[0].offsetLeft;
    lefts = shots.map((s) => s.offsetLeft + s.offsetWidth / 2);
  };
  measure();
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("load", measure);

  let offset = 0;
  const wrap = () => {
    if (setWidth > 0) offset = ((offset % setWidth) - setWidth) % setWidth; // keep in (-setWidth, 0]
  };

  let hovering = false;
  let focused = false;
  let dragging = false;
  sea.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovering = true; });
  sea.addEventListener("pointerleave", () => { hovering = false; });
  // Hold still for keyboard users only; focus returning from the photo viewer must not freeze the sea
  gallery.addEventListener("focusin", (e) => {
    const shot = e.target.closest(".shot");
    if (!shot || viewerRestoringFocus || !shot.matches(":focus-visible")) return;
    focused = true;
    offset = -(shot.offsetLeft - 24);
    wrap();
  });
  viewer.addEventListener("close", () => { focused = false; });
  gallery.addEventListener("focusout", () => { focused = false; });

  // Drag to move; a drag never counts as a click on a photo
  let startX = 0;
  let startOffset = 0;
  let moved = false;
  gallery.addEventListener("pointerdown", (e) => {
    dragging = true;
    moved = false;
    startX = e.clientX;
    startOffset = offset;
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) {
      if (!moved) gallery.setPointerCapture(e.pointerId);
      moved = true;
    }
    if (moved) { offset = startOffset + dx; wrap(); }
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    if (moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
  };
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  let running = false;
  let last = 0;
  const frame = (t) => {
    if (!running) return;
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
    last = t;
    if (!hovering && !focused && !dragging) { offset -= SPEED * dt; wrap(); }
    gallery.style.transform = "translate3d(" + offset.toFixed(1) + "px,0,0)";
    // each photo rises and falls as the swell passes under it
    shots.forEach((shot, i) => {
      const phase = (lefts[i] + offset) / 260 + t / 900;
      shot.style.transform = "translateY(" + (9 * Math.sin(phase)).toFixed(1) + "px) rotate(" + (1.6 * Math.cos(phase)).toFixed(2) + "deg)";
    });
    window.requestAnimationFrame(frame);
  };
  new IntersectionObserver(([entry]) => {
    const was = running;
    running = entry.isIntersecting;
    if (running && !was) { last = 0; window.requestAnimationFrame(frame); }
  }).observe(sea);
})();
