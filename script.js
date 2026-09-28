document.documentElement.setAttribute("data-theme", "light");
try {
  localStorage.removeItem("mediception-theme");
} catch (error) {
  // Ignore storage restrictions; light mode remains enforced by the document attribute.
}

document.addEventListener("DOMContentLoaded", () => {
  /* ── Lucide Icons ─────────────────────────────────────── */
  if (window.lucide) window.lucide.createIcons();

  /* ── Theme Toggle ─────────────────────────────────────── */
  document.documentElement.setAttribute("data-theme", "light");
  document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => toggle.remove());

  /* Keyboard-friendly tabs and non-critical image loading */
  document.querySelectorAll('[role="tablist"]').forEach((tabList) => {
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
    const syncTabFocus = (activeTab) => {
      tabs.forEach((tab) => tab.setAttribute("tabindex", tab === activeTab ? "0" : "-1"));
    };
    syncTabFocus(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => syncTabFocus(tab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      });
    });
  });

  document.querySelectorAll("img").forEach((image) => {
    image.decoding = "async";
    if (!image.closest("header") && !image.closest(".page-intro-media")) image.loading = "lazy";
  });

  /* ── Hero Typewriter (Typing & Untyping effect) ──────────── */
  const typewriter = document.querySelector(".hero-typewriter");

  const phrases = [
    "Mediception",
    "Clinical Research",
    "Medical Affairs",
    "Real-world Evidence"
  ];

  if (typewriter) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      typewriter.textContent = phrases[0];
      typewriter.classList.add("is-static");
    } else {
      let phraseIndex = 0;
      let characterIndex = 0;
      let deleting = false;

      const typeDelay = (character) => (character === " " ? 140 : 85);
      const deleteDelay = 50;

      const tick = () => {
        const phrase = phrases[phraseIndex];
        if (!deleting) {
          characterIndex += 1;
          typewriter.textContent = phrase.slice(0, characterIndex);
          if (characterIndex === phrase.length) {
            deleting = true;
            window.setTimeout(tick, 2200);
            return;
          }
          window.setTimeout(tick, typeDelay(phrase[characterIndex - 1]));
          return;
        }

        characterIndex -= 1;
        typewriter.textContent = phrase.slice(0, characterIndex);
        if (characterIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          window.setTimeout(tick, 450);
          return;
        }
        window.setTimeout(tick, deleteDelay);
      };

      typewriter.textContent = "";
      tick();
    }
  }

  /* Hero service orbit: the capabilities move around a fixed center while labels stay upright. */
  const serviceOrbit = document.querySelector("[data-services-orbit]");
  const serviceNodes = serviceOrbit ? Array.from(serviceOrbit.querySelectorAll("[data-service-node]")) : [];

  if (serviceOrbit && !serviceOrbit.hidden && serviceNodes.length) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const orbitStartedAt = performance.now();
    const orbitDuration = 32000;

    const renderServiceOrbit = (now) => {
      const elapsed = reduceMotion ? 0 : now - orbitStartedAt;
      const progress = (elapsed % orbitDuration) / orbitDuration;
      const rotation = progress * Math.PI * 2 - Math.PI / 2;
      const orbitWidth = serviceOrbit.clientWidth;
      const orbitHeight = serviceOrbit.clientHeight;
      const radiusX = orbitWidth * 0.39;
      const radiusY = orbitHeight * 0.34;

      serviceNodes.forEach((node, index) => {
        const angle = rotation + (index / serviceNodes.length) * Math.PI * 2;
        node.style.left = `${50 + (Math.cos(angle) * radiusX / orbitWidth) * 100}%`;
        node.style.top = `${50 + (Math.sin(angle) * radiusY / orbitHeight) * 100}%`;
      });

      if (!reduceMotion) window.requestAnimationFrame(renderServiceOrbit);
    };

    renderServiceOrbit(orbitStartedAt);
  }

  /* ── Header ───────────────────────────────────────────── */
  const header = document.querySelector("[data-header]");
  const scrollProgress = document.querySelector("[data-scroll-progress]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (menuToggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      menuToggle.innerHTML = '<i data-lucide="menu"></i>';
      if (window.lucide) window.lucide.createIcons();
    };
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      menuToggle.innerHTML = `<i data-lucide="${isOpen ? "x" : "menu"}"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  }

  const updateScrollState = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 22);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress && scrollable > 0) {
      scrollProgress.style.width = `${(window.scrollY / scrollable) * 100}%`;
    }
  };
  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();

  /* ── Scroll Reveal ────────────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger child cards within grids
        const delay = entry.target.dataset.revealDelay
          ? Number(entry.target.dataset.revealDelay)
          : 0;
        setTimeout(() => {
          entry.target.classList.add("is-visible");
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.09 });

  document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => observer.observe(el));

  // Stagger cards inside grids
  document.querySelectorAll(".home-feature-grid, .insight-grid, .capability-grid, .steps-grid").forEach((grid) => {
    Array.from(grid.children).forEach((card, i) => {
      card.style.transitionDelay = `${i * 80}ms`;
    });
  });

  /* ── Hero Particle Canvas ─────────────────────────────── */
  const hero = document.querySelector(".hero");
  if (hero) {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.55";
    hero.insertBefore(canvas, hero.querySelector(".hero-shade").nextSibling);

    const ctx = canvas.getContext("2d");
    let W, H, particles;

    function getPalette() {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      return isLight
        ? ["rgba(29,78,216,0.75)", "rgba(3,105,161,0.75)", "rgba(180,83,9,0.7)"]
        : ["rgba(59,130,246,0.7)", "rgba(6,182,212,0.6)", "rgba(245,158,11,0.45)"];
    }

    const N = 55;

    function makeParticle() {
      const colors = getPalette();
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 0.5,
        colorIndex: Math.floor(Math.random() * 3),
      };
    }

    function init() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: N }, makeParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const palette = getPalette();
      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isLight
              ? `rgba(29,78,216,${0.18 * (1 - dist / 120)})`
              : `rgba(59,130,246,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      // Draw dots
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = palette[p.colorIndex];
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener("resize", init, { passive: true });

    // Parallax on hero text
    const heroCopy = hero.querySelector(".hero-copy");
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y < window.innerHeight && heroCopy) {
        heroCopy.style.transform = `translateY(${y * 0.18}px)`;
        heroCopy.style.opacity = 1 - y / (window.innerHeight * 0.75);
      }
    }, { passive: true });
  }

  /* ── Cursor Glow ──────────────────────────────────────── */
  if (window.matchMedia("(pointer: fine)").matches) {
    const glow = document.createElement("div");
    glow.style.cssText = `
      position:fixed;pointer-events:none;z-index:9999;
      width:480px;height:480px;
      border-radius:50%;
      background:radial-gradient(circle, rgba(59,130,246,0.065) 0%, transparent 70%);
      transform:translate(-50%,-50%);
      transition:opacity 0.6s ease;
      opacity:0;
    `;
    document.body.appendChild(glow);
    document.addEventListener("mousemove", (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
      glow.style.opacity = "1";
    }, { passive: true });
    document.addEventListener("mouseleave", () => { glow.style.opacity = "0"; });
  }

  /* ── Purpose tabs ─────────────────────────────────────── */
  const purposeContent = {
    purpose: {
      kicker: "Our purpose",
      title: "Evidence that improves care.",
      description: "We bring the right scientific, clinical, and digital perspectives together so every decision can move closer to better healthcare.",
      cta: "Read more",
      href: "#contact"
    },
    evidence: {
      kicker: "Evidence to action",
      title: "Make the signal useful.",
      description: "From clinical development to real-world evidence, we connect the data, context, and expertise needed to move with confidence.",
      cta: "Explore capabilities",
      href: "#capabilities"
    },
    people: {
      kicker: "Our people. Our pride.",
      title: "Clinical thinking with human judgement.",
      description: "Our leadership and mentors bring practical experience, scientific discipline, and accountability to every partnership.",
      cta: "Meet our people",
      href: "leadership.html"
    },
    digital: {
      kicker: "Our platform network",
      title: "See the study between milestones.",
      description: "Medceps gives teams a clearer view of participant data, study progress, and the operational moments that shape quality.",
      cta: "Explore platforms",
      href: "platforms.html"
    },
    outcomes: {
      kicker: "Real-world outcomes",
      title: "Turn insight into momentum.",
      description: "We make scientific work easier to use, easier to communicate, and more connected to the decisions that improve outcomes.",
      cta: "See our proof",
      href: "contact.html"
    }
  };

  const purposeStage = document.querySelector("[data-purpose-stage]");
  const purposeTitle = document.querySelector("[data-purpose-title]");
  const purposeKicker = document.querySelector("[data-purpose-kicker-label]");
  const purposeDescription = document.querySelector("[data-purpose-description]");
  const purposeCta = document.querySelector("[data-purpose-cta]");

  document.querySelectorAll("[data-purpose-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const content = purposeContent[tab.dataset.purposeTab];
      if (!content || !purposeStage) return;
      document.querySelectorAll("[data-purpose-tab]").forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      purposeStage.classList.remove("is-switching");
      void purposeStage.offsetWidth;
      purposeStage.classList.add("is-switching");
      if (purposeKicker) purposeKicker.textContent = content.kicker;
      if (purposeTitle) purposeTitle.textContent = content.title;
      if (purposeDescription) purposeDescription.textContent = content.description;
      if (purposeCta) {
        purposeCta.setAttribute("href", content.href);
        if (purposeCta.firstChild) purposeCta.firstChild.nodeValue = `${content.cta} `;
      }
      if (window.lucide) window.lucide.createIcons();
    });
  });

  /* ── Animated counters ────────────────────────────────── */
  const counters = document.querySelectorAll("[data-count]");
  const countObserver = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const duration = target > 1000 ? 1700 : 1100;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased).toLocaleString("en-US");
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      instance.unobserve(el);
    });
  }, { threshold: 0.65 });
  counters.forEach((c) => countObserver.observe(c));

  /* ── Capability filter ────────────────────────────────── */
  const filterButtons = document.querySelectorAll("[data-filter]");
  const capabilityCards = document.querySelectorAll("[data-capability-grid] .capability-card");
  const emptyMessage = document.querySelector("[data-filter-empty]");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      let visible = 0;
      capabilityCards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) visible++;
      });
      if (emptyMessage) emptyMessage.style.display = visible ? "none" : "block";
    });
  });

  /* ── Proof tabs ───────────────────────────────────────── */
  const proofContent = {
    trial: {
      kicker: "Case direction / 01",
      title: "From a complex protocol to a study team that could move.",
      body: "We brought documentation, operational support, data review, and quality thinking into one connected clinical trial workstream.",
      result: "Less friction between design, delivery, and reporting."
    },
    evidence: {
      kicker: "Case direction / 02",
      title: "From scattered routine data to a useful evidence story.",
      body: "We helped a healthcare team shape the right data question, connect the available sources, and make the resulting insight easier to act on.",
      result: "A clearer route from real-world data to real-world decision."
    },
    medical: {
      kicker: "Case direction / 03",
      title: "From scientific complexity to engagement people could use.",
      body: "We translated specialist evidence into medical content, conversations, and education designed for the people who needed to use it.",
      result: "More relevant engagement, with the science intact."
    }
  };
  const proofDetail = document.querySelector("[data-proof-detail]");
  document.querySelectorAll("[data-proof]").forEach((button) => {
    button.addEventListener("click", () => {
      const content = proofContent[button.dataset.proof];
      document.querySelectorAll("[data-proof]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      if (proofDetail) {
        proofDetail.innerHTML = `<span class="proof-kicker">${content.kicker}</span><h3>${content.title}</h3><p>${content.body}</p><div class="proof-result"><span>What changed</span><strong>${content.result}</strong></div>`;
      }
    });
  });

  /* ── Map ──────────────────────────────────────────────── */
  const officeMapElement = document.querySelector("#office-map");
  if (officeMapElement && window.L) {
    const officeMap = window.L.map(officeMapElement, {
      zoomControl: true, scrollWheelZoom: true, attributionControl: true
    });
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    }).addTo(officeMap);
    const locations = [
      { name: "Gurugram", type: "Corporate office", coordinates: [28.4595, 77.0266], color: "coral" },
      { name: "Mumbai", type: "Regional office", coordinates: [19.076, 72.8777], color: "aqua" },
      { name: "Bengaluru", type: "Regional office", coordinates: [12.9716, 77.5946], color: "aqua" },
      { name: "Australia", type: "International office", coordinates: [-37.767, 145.0], color: "lime" },
      { name: "Europe", type: "International office", coordinates: [51.889, 0.904], color: "lime" },
      { name: "Japan", type: "International office", coordinates: [35.694, 139.983], color: "lime" },
      { name: "Singapore", type: "International office", coordinates: [1.3521, 103.8198], color: "lime" },
      { name: "USA", type: "International office", coordinates: [39.9, -75.35], color: "lime" }
    ];
    const markerIcon = (color) => window.L.divIcon({
      className: `office-map-marker office-map-marker-${color}`,
      html: "<span></span>",
      iconSize: [16, 16], iconAnchor: [8, 8]
    });
    locations.forEach((loc) => {
      window.L.marker(loc.coordinates, { icon: markerIcon(loc.color) })
        .addTo(officeMap)
        .bindTooltip(`<strong>${loc.name}</strong><small>${loc.type}</small>`, {
          permanent: true, direction: "right", offset: [10, 0], className: "office-map-tooltip"
        })
        .bindPopup(`<strong>${loc.name}</strong><br />${loc.type}`);
    });
    officeMap.fitBounds(locations.map((l) => l.coordinates), { padding: [24, 24] });
    setTimeout(() => officeMap.invalidateSize(), 250);
  }

  /* ── Contact form ─────────────────────────────────────── */
  const form = document.querySelector("[data-inquiry-form]");
  const status = document.querySelector("[data-form-status]");
  if (form && status) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = new FormData(form).get("name")?.trim();
      status.textContent = `Thanks${name ? `, ${name}` : ""}. We will be in touch.`;
      status.classList.add("is-success");
      form.reset();
    });
  }

  /* ── Card magnetic hover ──────────────────────────────── */
  if (window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    document.querySelectorAll(".home-feature-card, .capability-card, .insight-card, .step").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
        card.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
        card.style.transformOrigin = "center center";
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }
});
