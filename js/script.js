/* ============================================================
   BEAM'S MOBILE MECHANIC — site scripts
   Gallery engine: the incoming photo/video slides OVER the current one
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Header ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    siteNav.classList.toggle("open");
  });
  siteNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navToggle.classList.remove("open");
      siteNav.classList.remove("open");
    })
  );

  /* ---------- Footer year ---------- */
  document.getElementById("footerYear").textContent = new Date().getFullYear();

  /* ---------- Booking form (demo) ---------- */
  const form = document.getElementById("bookingForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    document.getElementById("formSuccess").hidden = false;
    form.reset();
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ============================================================
     GALLERY — slide-over slider
     ============================================================ */
  const MEDIA = window.BEAM_MEDIA || [];

  const stage = document.getElementById("galleryStage");
  const thumbsEl = document.getElementById("galleryThumbs");
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");
  const progress = document.getElementById("galleryProgress");
  const counterEl = document.getElementById("galleryCounter");
  const captionEl = document.getElementById("galleryCaption");

  const IMG_BADGE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-4.5-4.5L9 19"/></svg> PHOTO';
  const VID_BADGE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-3.6-3.6H9v1.8"/><path d="m22 16-3.6 3.6H12v-2"/><circle cx="9" cy="17" r="2.4"/></svg> VIDEO';

  const SLIDE_MS = 680;          // slide-over animation duration
  const IMAGE_HOLD_MS = 5200;    // how long a photo shows
  const VIDEO_MAX_MS = 90000;    // safety cap per video

  let list = [];        // active (filtered) items
  let nodes = [];       // slide DOM nodes (same order as list)
  let current = 0;
  let animating = false;
  let autoplay = true;
  let holdTimer = null;
  let idleTimer = null;
  let rafId = null;
  let activeVideo = null;

  const mod = (n) => (n % list.length + list.length) % list.length;

  /* ---------- Build one slide node ---------- */
  function buildSlide(item) {
    const el = document.createElement("figure");
    el.className = "g-slide";

    let media;
    if (item.type === "video") {
      media = document.createElement("video");
      media.muted = true;
      media.playsInline = true;
      media.preload = "auto";
      media.src = item.src;
      media.addEventListener("loadeddata", () => { media.currentTime = 0.1; }, { once: true });
    } else {
      media = document.createElement("img");
      media.loading = "lazy";
      media.src = item.src;
      media.alt = item.title || "";
      media.draggable = false;
    }
    media.className = "g-media";
    el.appendChild(media);

    const badge = document.createElement("span");
    badge.className = "g-badge";
    badge.innerHTML = item.type === "video" ? VID_BADGE : IMG_BADGE;
    el.appendChild(badge);

    if (item.title) {
      const cap = document.createElement("figcaption");
      cap.className = "g-cap";
      cap.textContent = item.title;
      el.appendChild(cap);
    }
    return el;
  }

  /* ---------- Render the whole slider (currently active filter) ---------- */
  let filter = "all";

  function render() {
    stopTimers();
    stopIdle();
    autoplay = true;
    if (activeVideo) { activeVideo.pause(); activeVideo = null; }

    list = MEDIA.filter((m) => filter === "all" || m.type === filter);
    current = 0;
    animating = false;
    stage.innerHTML = "";
    thumbsEl.innerHTML = "";

    if (!list.length) {
      stage.innerHTML =
        '<p style="color:#6c6c75;display:grid;place-items:center;height:100%;font-family:Oswald,sans-serif;letter-spacing:2px">NO MEDIA IN THIS CATEGORY YET</p>';
      counterEl.textContent = "0 / 0";
      captionEl.textContent = "";
      return;
    }

    list.forEach((item, idx) => {
      const el = buildSlide(item);
      nodes[idx] = el;
      stage.appendChild(el);

      const th = document.createElement("button");
      th.className = "g-thumb";
      th.setAttribute("aria-label", "Go to slide " + (idx + 1));
      const t = item.type === "video"
        ? Object.assign(document.createElement("video"), { src: item.src, muted: true })
        : Object.assign(document.createElement("img"), { src: item.src, loading: "lazy", alt: "" });
      t.preload = "metadata";
      t.draggable = false;
      th.appendChild(t);
      th.addEventListener("click", () => goToIdx(idx, idx > current ? 1 : -1));
      thumbsEl.appendChild(th);
    });

    applyActive(false, 0);
  }

  /* ---------- Show slide current (with slide-over transition) ---------- */
  function applyActive(animate, dir) {
    // stack: current slide on level 2, everything else hidden below
    nodes.forEach((n, i) => {
      n.classList.toggle("active", i === current);
      n.style.zIndex = "";
      n.style.transition = "";
      n.style.transform = "";
      n.style.boxShadow = "";
      n.style.visibility = "";
    });

    // thumbnails + meta
    thumbsEl.querySelectorAll(".g-thumb").forEach((t, i) => t.classList.toggle("active", i === current));
    counterEl.textContent = (current + 1) + " / " + list.length;
    captionEl.textContent = list[current].title || list[current].src.split("/").pop();

    // videos
    const item = list[current];
    if (item.type === "video") {
      const vid = nodes[current].querySelector("video");
      activeVideo = vid;
      try { vid.currentTime = 0; } catch (err) { /* metadata not loaded yet */ }
      vid.play().catch(() => {}); // muted => autoplay allowed
    }

    if (animate) {
      // ===== THE SLIDE-OVER EFFECT =====
      // The old slide stays put; the new one glides in ON TOP of it.
      animating = true;
      const incoming = nodes[current];
      incoming.style.zIndex = 4;
      incoming.style.visibility = "visible";
      incoming.style.transform = "translateX(" + (dir < 0 ? -100 : 100) + "%)";
      incoming.style.boxShadow = "-40px 0 80px rgba(0,0,0,.6)";
      void incoming.offsetWidth; // style flush so the start position sticks
      incoming.style.transition = "transform " + SLIDE_MS + "ms cubic-bezier(.22,.68,.2,1)";
      incoming.style.transform = "translateX(0)";
      setTimeout(() => {
        incoming.style.transition = "";
        incoming.style.transform = "";
        incoming.style.boxShadow = "";
        incoming.style.zIndex = "";
        incoming.style.visibility = "";
        animating = false;
      }, SLIDE_MS + 40);
    }

    startHold();
  }

  /* ---------- Autoplay hold + progress bar ---------- */
  function startHold() {
    stopTimers();
    progress.style.transition = "none";
    progress.style.width = "0";
    if (!autoplay || list.length < 2) return;

    const item = list[current];
    const dur = item.type === "video" ? VIDEO_MAX_MS : IMAGE_HOLD_MS;
    requestAnimationFrame(() => {
      progress.style.transition = "width " + dur + "ms linear";
      progress.style.width = "100%";
    });

    if (item.type === "video" && activeVideo) {
      const vid = activeVideo;
      const tick = () => {
        if (vid.duration) {
          progress.style.transition = "none";
          progress.style.width = Math.min(100, (vid.currentTime / vid.duration) * 100) + "%";
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    holdTimer = setTimeout(() => go(1), dur);
  }
  function stopTimers() {
    clearTimeout(holdTimer);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }
  function stopIdle() { clearTimeout(idleTimer); }

  /* ---------- Navigation ---------- */
  function go(dir) {
    if (animating || list.length < 2) return;
    current = mod(current + dir);
    applyActive(true, dir);
  }
  function goToIdx(idx, dir) {
    if (animating || idx === current) return;
    current = idx;
    applyActive(true, dir);
  }
  function userGo(dir) {
    pauseAutoplay(true); // manual navigation pauses auto-advancing…
    go(dir);             // …then auto-resumes after 10s of inactivity
  }
  function pauseAutoplay(idleResume) {
    autoplay = false;
    stopTimers();
    clearTimeout(idleTimer);
    progress.style.transition = "none";
    progress.style.width = "0";
    if (idleResume) {
      idleTimer = setTimeout(() => { autoplay = true; startHold(); }, 10000);
    }
  }

  nextBtn.addEventListener("click", () => userGo(1));
  prevBtn.addEventListener("click", () => userGo(-1));

  // pause autoplay while the cursor is over the stage
  stage.addEventListener("mouseenter", stopTimers);
  stage.addEventListener("mouseleave", () => {
    if (autoplay) startHold();
  });

  // keyboard
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") userGo(1);
    if (e.key === "ArrowLeft") userGo(-1);
  });

  // when a video finishes playing, glide to the next slide
  // (media 'ended' doesn't bubble, but a capture-phase listener on the stage still catches it)
  stage.addEventListener("ended", (e) => {
    if (e.target.tagName === "VIDEO" && autoplay) go(1);
  }, true);

  // swipe
  let pDown = null;
  stage.addEventListener("pointerdown", (e) => { pDown = { x: e.clientX, y: e.clientY }; stopTimers(); });
  stage.addEventListener("pointerup", (e) => {
    if (!pDown) return;
    const dx = e.clientX - pDown.x, dy = e.clientY - pDown.y;
    pDown = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) userGo(dx < 0 ? 1 : -1);
    else startHold();
  });
  stage.addEventListener("pointercancel", () => { pDown = null; startHold(); });

  // filter tabs
  document.querySelectorAll(".filter-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-tabs button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filter = btn.dataset.filter;
      render();
    });
  });

  render();
})();
