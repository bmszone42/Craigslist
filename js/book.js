(function () {
  const order = [
    "cover",
    "verso",
    "contents",
    "map",
    "rare-blue-cycad",
    "encephalartos",
    "zombie-palm",
    "red-sealing-wax-palm",
    "blue-bamboo",
    "beehive-ginger",
    "montgomery-palms",
    "untitled",
    "chamberonia-palm",
    "brownea-pod",
    "brownea-opening",
    "brownea-pale-flush",
    "brownea-leaflets",
    "brownea-greening",
    "brownea-mature",
    "pigafetta",
    "wanted",
    "wanted-encephalartos-ferox",
    "wanted-encephalartos-horridus",
    "wanted-dioon-spinulosum",
    "wanted-microcycas-calocoma",
    "wanted-chambeyronia-lepidota",
    "wanted-areca-vestiaria",
    "wanted-copernicia-macroglossa",
    "wanted-latania-loddigesii",
    "wanted-licuala-grandis",
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
    "plate-10": "brownea-pod",
    "plate-11": "brownea-opening",
    "plate-12": "brownea-pale-flush",
    "plate-13": "brownea-leaflets",
    "plate-14": "brownea-greening",
    "plate-15": "brownea-mature",
    "plate-16": "pigafetta",
    atlas: "map",
    "wanted-1": "wanted-encephalartos-ferox",
    "wanted-2": "wanted-encephalartos-horridus",
    "wanted-3": "wanted-dioon-spinulosum",
    "wanted-4": "wanted-microcycas-calocoma",
    "wanted-5": "wanted-chambeyronia-lepidota",
    "wanted-6": "wanted-areca-vestiaria",
    "wanted-7": "wanted-copernicia-macroglossa",
    "wanted-8": "wanted-latania-loddigesii",
    "wanted-9": "wanted-licuala-grandis",
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

  document.querySelectorAll(".print-booklet").forEach(function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });

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
      if (!event.target.closest(".plate, .wanted-open, .map-page")) return;
      if (event.target.closest(".map-pin-link, .atlas-strip a, .atlas-slip, .map-legend")) return;
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
      if (!event.target.closest(".plate, .wanted-open, .map-page")) return;
      if (event.target.closest(".map-pin-link, .atlas-strip a, .atlas-slip, .map-legend")) return;
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
      go(dx < 0 ? 1 : -1);
    },
    { passive: true }
  );

  window.addEventListener("hashchange", syncHash);
  if (window.location.hash) syncHash();

  (function initAtlas() {
    const root = document.getElementById("map");
    const slip = document.getElementById("atlas-slip");
    if (!root || !slip) return;

    const places = {
      "rare-blue-cycad": {
        plate: "Plates I–II",
        href: "#rare-blue-cycad",
        title: "Rare Blue Cycad",
        latin: "No binomial given · genus almost certainly <em>Encephalartos</em>",
        range: "Africa · Zamiaceae",
        thumb: "photos/rare-blue-cycad.jpg",
        note: "Craig did not name a species. The wax that reads blue is an African cycad habit.",
        alsoHref: "#encephalartos",
        also: "Plate II is the same genus, labeled only to <em>Encephalartos</em>.",
      },
      "zombie-palm": {
        plate: "Plate III",
        href: "#zombie-palm",
        title: "Zombie Palm trunk",
        latin: "<em>Zombia antillarum</em>",
        range: "Hispaniola · Arecaceae",
        thumb: "photos/zombie-palm-trunk.jpg",
        note: "A genus of one. The armored trunk is persistent, spiny leaf sheaths on a clustered fan palm.",
      },
      "red-sealing-wax-palm": {
        plate: "Plate IV",
        href: "#red-sealing-wax-palm",
        title: "Red Sealing Wax Palm",
        latin: "<em>Cyrtostachys renda</em> Blume",
        range: "Malay peat swamp · Arecaceae",
        thumb: "photos/red-sealing-wax-palm.jpg",
        note: "The scarlet crownshaft, west of Wallace’s Line. It shares this coast with the ginger on plate VI.",
      },
      "blue-bamboo": {
        plate: "Plate V",
        href: "#blue-bamboo",
        title: "Blue Bamboo",
        latin: "<em>Bambusa chungii</em> McClure",
        range: "Southern China · Vietnam · Poaceae",
        thumb: "photos/blue-bamboo.jpg",
        note: "A clumping bamboo whose young culms wear a white wax that reads blue. The weavers on plate VII belong with this coast.",
      },
      "beehive-ginger": {
        plate: "Plate VI",
        href: "#beehive-ginger",
        title: "Beehive Ginger",
        latin: "<em>Zingiber spectabile</em> Griff.",
        range: "Thailand to Peninsular Malaysia · Zingiberaceae",
        thumb: "photos/beehive-ginger.jpg",
        note: "The inflorescence is a stack of incurved bracts. Native range sits with the sealing-wax palm on this coast.",
      },
      "montgomery-palms": {
        plate: "Plate VII",
        href: "#montgomery-palms",
        title: "Montgomery Palms",
        latin: "<em>Veitchia arecina</em> Becc.",
        range: "Vanuatu · Arecaceae",
        thumb: "photos/montgomery-palms-and-slender-weavers-bamboo.jpg",
        note: "The pair on the left of that photograph. The weavers bamboo on the right belongs with the China pin.",
      },
      "chamberonia-palm": {
        plate: "Plate IX",
        href: "#chamberonia-palm",
        title: "Chamberonia Palm",
        latin: "Craig’s spelling. Accepted name: <em>Chambeyronia macrocarpa</em>",
        range: "New Caledonia · Arecaceae",
        thumb: "photos/chamberonia-palm-emerging-red-frond.jpg",
        note: "What this plate shows is the new frond: it emerges red or burgundy, then greens.",
      },
      "brownea-pod": {
        plate: "Plates X–XV",
        href: "#brownea-pod",
        title: "Brownea grandiceps",
        latin: "Craig wrote <em>Brownea Grandiceps</em> — Venezuela",
        range: "Venezuela · Fabaceae",
        thumb: "photos/brownea-grandiceps-pod.jpg",
        note: "Six photographs of one tree. The new leaves start out as a pod.",
        alsoHref: "#brownea-mature",
        also: "The series ends on the mature leaf, plate XV.",
      },
      pigafetta: {
        plate: "Plate XVI",
        href: "#pigafetta",
        title: "Pigafetta",
        latin: "Possibly <em>elata</em> or <em>filaris</em>. This book does not choose.",
        range: "Wallacea · Arecaceae",
        thumb: "photos/pigafetta.jpg",
        note: "A received note named the genus. The green trunk is the tell; this plant is still too young to show it.",
      },
    };

    let activeId = "";

    function coarsePointer() {
      return window.matchMedia("(hover: none), (pointer: coarse)").matches;
    }

    function show(id) {
      const place = places[id];
      if (!place) return;
      activeId = id;
      root.querySelectorAll("[data-place]").forEach(function (el) {
        el.classList.toggle("is-active", el.getAttribute("data-place") === id);
      });
      const also = place.also
        ? '<p class="atlas-slip__also">' +
          (place.alsoHref
            ? '<a href="' + place.alsoHref + '">' + place.also + "</a>"
            : place.also) +
          "</p>"
        : "";
      slip.innerHTML =
        '<p class="atlas-slip__eyebrow">' +
        place.plate +
        "</p>" +
        '<img class="atlas-slip__thumb" src="' +
        place.thumb +
        '" alt="">' +
        "<h3>" +
        place.title +
        "</h3>" +
        '<p class="latin">' +
        place.latin +
        "</p>" +
        '<p class="atlas-slip__range">' +
        place.range +
        "</p>" +
        '<p class="atlas-slip__note essay">' +
        place.note +
        "</p>" +
        also +
        '<a class="atlas-slip__open" href="' +
        place.href +
        '">Open the plate</a>';
    }

    root.querySelectorAll("[data-place]").forEach(function (el) {
      const id = el.getAttribute("data-place");
      el.addEventListener("mouseenter", function () {
        show(id);
      });
      el.addEventListener("focus", function () {
        show(id);
      });
      el.addEventListener("click", function (event) {
        if (!coarsePointer()) return;
        if (activeId !== id) {
          event.preventDefault();
          show(id);
        }
      });
    });
  })();
})();
