(function () {
  const order = [
    "cover",
    "verso",
    "contents",
    "plate-1",
    "plate-2",
    "plate-3",
    "plate-4",
    "plate-5",
    "plate-6",
    "plate-7",
    "plate-8",
    "plate-9",
    "colophon",
  ];

  const nodes = order
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  let current = 0;

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

  function go(delta) {
    const next = Math.max(0, Math.min(order.length - 1, current + delta));
    const target = document.getElementById(order[next]);
    if (!target) return;
    current = next;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#" + order[next]);
  }

  document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.key === "ArrowRight" || event.key === "j") {
      event.preventDefault();
      go(1);
    }
    if (event.key === "ArrowLeft" || event.key === "k") {
      event.preventDefault();
      go(-1);
    }
  });
})();
