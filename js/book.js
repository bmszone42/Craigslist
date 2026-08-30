(function () {
  const order = [
    "cover",
    "verso",
    "contents",
    "rare-blue-cycad",
    "encephalartos",
    "zombie-palm",
    "red-sealing-wax-palm",
    "blue-bamboo",
    "beehive-ginger",
    "montgomery-palms",
    "untitled",
    "chamberonia-palm",
    "colophon",
  ];

  const aliases = {
    "plate-1": "rare-blue-cycad",
    "plate-2": "encephalartos",
    "plate-3": "zombie-palm",
    "plate-4": "red-sealing-wax-palm",
    "plate-5": "blue-bamboo",
    "plate-6": "beehive-ginger",
    "plate-7": "montgomery-palms",
    "plate-8": "untitled",
    "plate-9": "chamberonia-palm",
  };

  const guestKey = "craigslist-guest";
  const guestToggle = document.getElementById("guest-toggle");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");

  const nodes = order
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  let current = 0;

  function resolveId(raw) {
    const id = (raw || "").replace(/^#/, "");
    return aliases[id] || id;
  }

  function hashFor(id) {
    const params = new URLSearchParams(window.location.search);
    const query = params.toString();
    return (query ? "?" + query : "") + "#" + id;
  }

  function goTo(id, replace) {
    const target = document.getElementById(id);
    if (!target) return;
    current = Math.max(0, order.indexOf(id));
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (replace) {
      history.replaceState(null, "", hashFor(id));
    } else {
      history.pushState(null, "", hashFor(id));
    }
  }

  function go(delta) {
    const next = Math.max(0, Math.min(order.length - 1, current + delta));
    goTo(order[next], true);
  }

  function syncHash() {
    const id = resolveId(window.location.hash);
    if (document.getElementById(id)) goTo(id, true);
  }

  if ("IntersectionObserver" in window && nodes.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const index = order.indexOf(entry.target.id);
          if (index !== -1) current = index;
        });
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0.01 }
    );
    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function applyGuest(on) {
    document.body.classList.toggle("guest", on);
    if (guestToggle) {
      guestToggle.setAttribute("aria-pressed", on ? "true" : "false");
      guestToggle.textContent = on ? "Guest on" : "Guest";
    }
  }

  function setGuest(on, fromQuery) {
    applyGuest(on);
    if (!fromQuery) {
      try {
        localStorage.setItem(guestKey, on ? "1" : "0");
      } catch (err) {
        /* ignore quota / private mode */
      }
    }
    const params = new URLSearchParams(window.location.search);
    if (on) params.set("guest", "1");
    else params.delete("guest");
    const query = params.toString();
    const hash = window.location.hash || "";
    history.replaceState(null, "", (query ? "?" + query : "") + hash);
  }

  (function initGuest() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("guest") === "1") {
      applyGuest(true);
      return;
    }
    try {
      applyGuest(localStorage.getItem(guestKey) === "1");
    } catch (err) {
      applyGuest(false);
    }
  })();

  if (guestToggle) {
    guestToggle.addEventListener("click", function () {
      setGuest(!document.body.classList.contains("guest"));
    });
  }

  function openLightbox(img) {
    if (!lightbox || !lightboxImg || !img) return;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "";
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    if (lightboxImg) {
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
    }
  }

  document.querySelectorAll(".photo-open").forEach(function (button) {
    button.addEventListener("click", function () {
      openLightbox(button.querySelector("img"));
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.key === "Escape" && lightbox && !lightbox.hidden) {
      event.preventDefault();
      closeLightbox();
      return;
    }
    if (lightbox && !lightbox.hidden) return;
    if (event.key === "ArrowRight" || event.key === "j") {
      event.preventDefault();
      go(1);
    }
    if (event.key === "ArrowLeft" || event.key === "k") {
      event.preventDefault();
      go(-1);
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener(
    "touchstart",
    function (event) {
      if (lightbox && !lightbox.hidden) return;
      if (!event.touches || event.touches.length !== 1) return;
      if (!event.target.closest(".plate")) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    function (event) {
      if (lightbox && !lightbox.hidden) return;
      if (!event.changedTouches || event.changedTouches.length !== 1) return;
      if (!event.target.closest(".plate")) return;
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
      go(dx < 0 ? 1 : -1);
    },
    { passive: true }
  );

  window.addEventListener("hashchange", syncHash);
  if (window.location.hash) syncHash();
})();
