/* Tante Emma — light interactions, no dependencies, keyboard friendly. */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("hauptnavigation");

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!event.target.closest(".site-header")) setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Hero slideshow (decorative, pauses with reduced motion) ---------- */
  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
        slide.setAttribute("aria-hidden", String(i !== index));
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", String(i === index));
      });
    };

    var start = function () {
      if (reducedMotion || slides.length < 2 || timer) return;
      timer = window.setInterval(function () { show(index + 1); }, 5500);
    };
    var stop = function () {
      if (timer) { window.clearInterval(timer); timer = null; }
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        stop();
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    show(0);
    start();
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      revealables.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------- Menu: sticky category highlight ---------- */
  var menuLinks = Array.prototype.slice.call(document.querySelectorAll("[data-menu-link]"));
  if (menuLinks.length && "IntersectionObserver" in window) {
    var sections = menuLinks
      .map(function (link) { return document.querySelector(link.getAttribute("href")); })
      .filter(Boolean);

    var setActive = function (id) {
      menuLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    };

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- Visit page: highlight today's opening hours ---------- */
  var hoursBody = document.querySelector("[data-hours]");
  if (hoursBody) {
    var jsDay = new Date().getDay();        // 0 = Sunday
    var row = hoursBody.querySelector('[data-day="' + ((jsDay + 6) % 7) + '"]');
    if (row) row.classList.add("is-today");
  }

  /* ---------- Hero badge: today's opening status ---------- */
  var badgeText = document.querySelector("[data-hours-badge-text]");
  if (badgeText) {
    var today = new Date().getDay();        // 0 = Sunday, 6 = Saturday
    badgeText.textContent = (today === 0 || today === 6)
      ? "Heute geschlossen · Mo–Fr ab 9:30 Uhr"
      : "Heute geöffnet · 9:30–17 Uhr";
  }

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
