/* =========================================================
   Ultimate Video Editing Bundle — page behaviour
   Reads everything from window.SITE_CONFIG (config.js).
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var IMG = CFG.IMAGES || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var val = function (k) { return typeof CFG[k] === "string" ? CFG[k].trim() : ""; };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Text bindings (PRICE, MRP, BRAND_NAME, contacts) ---------- */
  $$("[data-bind]").forEach(function (el) {
    var v = val(el.getAttribute("data-bind")) || el.getAttribute("data-fallback") || "";
    if (!v) {
      if (el.hasAttribute("data-hide-empty")) el.hidden = true;
      el.textContent = "";
      return;
    }
    el.textContent = (el.getAttribute("data-prefix") || "") + v;
  });

  /* ---------- 2. Links (contact + policies) — hide when empty ---------- */
  $$("[data-link]").forEach(function (a) {
    var v = val(a.getAttribute("data-link"));
    var type = a.getAttribute("data-link-type");
    var li = a.closest("li") || a;
    if (!v) { li.hidden = true; a.removeAttribute("href"); return; }
    if (type === "mailto") a.href = "mailto:" + v;
    else if (type === "tel") a.href = "tel:" + v.replace(/[^\d+]/g, "");
    else {
      a.href = v;
      if (/^https?:\/\//i.test(v) && v.indexOf(location.host) === -1) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      if (a.closest(".footer-links") && v.replace(/\/$/, "") === location.pathname.replace(/\.html$/, "").replace(/\/$/, "")) {
        a.setAttribute("aria-current", "page");
      }
    }
  });
  $$("[data-bind-li]").forEach(function (li) {
    if (!val(li.getAttribute("data-bind-li"))) li.hidden = true;
  });
  $$("[data-hide-if-empty-children]").forEach(function (box) {
    var visible = $$("li", box).some(function (li) { return !li.hidden; });
    if (!visible) box.hidden = true;
  });

  /* ---------- 3. Buy buttons ---------- */
  var BUY = val("BUY_LINK");
  $$(".js-buy").forEach(function (a) {
    a.setAttribute("href", BUY || "#");
    a.removeAttribute("target");
  });
  if (!BUY) {
    console.warn("[SITE_CONFIG] BUY_LINK is empty — all Buy buttons point to '#'. Add your SuperProfile checkout link in config.js.");
    $$(".js-buy").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); });
    });
  }

  /* ---------- 4. Image slots ---------- */
  $$("[data-img]").forEach(function (slot) {
    var key = slot.getAttribute("data-img");
    var url = typeof IMG[key] === "string" ? IMG[key].trim() : "";
    slot.textContent = "";
    if (url) {
      var img = document.createElement("img");
      img.src = url;
      img.alt = slot.getAttribute("data-alt") || "";
      img.decoding = "async";
      if (slot.getAttribute("data-w")) img.width = +slot.getAttribute("data-w");
      if (slot.getAttribute("data-h")) img.height = +slot.getAttribute("data-h");
      if (slot.getAttribute("data-eager") === "true") {
        if (key === "HERO_MOCKUP") img.setAttribute("fetchpriority", "high");
      } else {
        img.loading = "lazy";
      }
      slot.appendChild(img);
    } else {
      var ph = document.createElement("div");
      ph.className = "ph";
      ph.setAttribute("role", "img");
      ph.setAttribute("aria-label", (slot.getAttribute("data-alt") || key) + " (image placeholder)");
      if (key === "LOGO") {
        slot.hidden = true; // no logo yet → hide it completely
        return;
      } else {
        var code = document.createElement("code");
        code.textContent = key;
        ph.appendChild(code);
        ph.appendChild(document.createTextNode(" — add image link in config.js"));
      }
      slot.appendChild(ph);
    }
  });

  /* ---------- 5. Head: favicon + social meta ---------- */
  var setAttr = function (sel, attr, v) { var el = $(sel); if (el) el.setAttribute(attr, v); };
  if (IMG.FAVICON) setAttr("#favicon", "href", IMG.FAVICON);
  var abs = function (u) { try { return new URL(u, location.href).href; } catch (e) { return u; } };
  if (IMG.OG_IMAGE) {
    setAttr("#meta-og-image", "content", abs(IMG.OG_IMAGE));
    setAttr("#meta-tw-image", "content", abs(IMG.OG_IMAGE));
  }
  setAttr("#meta-og-url", "content", location.origin + location.pathname);
  if (val("BRAND_NAME")) setAttr("#meta-og-site", "content", val("BRAND_NAME"));

  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 6. Preview video ---------- */
  var VIDEO = val("PREVIEW_VIDEO_URL");
  var previewSection = $("#preview");
  if (VIDEO && previewSection) {
    var frame = $("#video-frame");
    var ytId = (VIDEO.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/) || [])[1];
    if (ytId) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "yt-facade";
      btn.setAttribute("aria-label", "Play preview video");
      btn.innerHTML =
        '<img src="https://i.ytimg.com/vi/' + ytId + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">' +
        '<span class="yt-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5L7 4.5z" fill="currentColor"/></svg></span>';
      btn.addEventListener("click", function () {
        var ifr = document.createElement("iframe");
        ifr.src = "https://www.youtube-nocookie.com/embed/" + ytId + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
        ifr.title = "Ultimate Video Editing Bundle preview";
        ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        ifr.allowFullscreen = true;
        frame.textContent = "";
        frame.appendChild(ifr);
        ifr.focus();
      }, { once: true });
      frame.appendChild(btn);
    } else {
      var vid = document.createElement("video");
      vid.src = VIDEO;
      vid.controls = true;
      vid.preload = "none";
      vid.playsInline = true;
      vid.setAttribute("aria-label", "Ultimate Video Editing Bundle preview");
      frame.appendChild(vid);
    }
    previewSection.hidden = false;
  }

  /* ---------- 7. FAQ accordion (one open at a time) ---------- */
  var faqItems = $$(".faq-item");
  function setOpen(item, open) {
    var q = $(".faq-q", item);
    var a = $(".faq-a", item);
    var isOpen = q.getAttribute("aria-expanded") === "true";
    if (open === isOpen) return;
    q.setAttribute("aria-expanded", String(open));
    item.classList.toggle("is-open", open);

    if (reduceMotion) { a.hidden = !open; a.style.height = ""; return; }

    if (open) {
      a.hidden = false;
      var h = a.scrollHeight;
      a.style.height = "0px";
      a.getBoundingClientRect(); // force reflow
      a.style.height = h + "px";
    } else {
      a.style.height = a.scrollHeight + "px";
      a.getBoundingClientRect();
      a.style.height = "0px";
    }
    var done = function (e) {
      if (e && e.target !== a) return;
      a.removeEventListener("transitionend", done);
      if (q.getAttribute("aria-expanded") === "true") a.style.height = "";
      else a.hidden = true;
    };
    a.addEventListener("transitionend", done);
  }
  faqItems.forEach(function (item) {
    $(".faq-q", item).addEventListener("click", function () {
      var willOpen = this.getAttribute("aria-expanded") !== "true";
      faqItems.forEach(function (other) { if (other !== item) setOpen(other, false); });
      setOpen(item, willOpen);
    });
  });

  /* ---------- 8. Scroll reveal (once) ---------- */
  var reveals = $$(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); ro.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- 8b. Stats strip: auto-looping slider on mobile/tablet ---------- */
  var statsRow = $(".stats-row");
  var statsView = $(".stats-viewport");
  if (statsRow && statsView && !reduceMotion && window.matchMedia) {
    var mqDesktop = window.matchMedia("(min-width: 900px)");
    var originals = $$(".stat", statsRow);
    var setMarquee = function () {
      $$(".stat-clone", statsRow).forEach(function (c) { statsRow.removeChild(c); });
      if (mqDesktop.matches) {
        statsRow.classList.remove("is-marquee");
        statsView.classList.remove("has-marquee");
        statsRow.setAttribute("tabindex", "0");
        return;
      }
      originals.forEach(function (li) {
        var c = li.cloneNode(true);
        c.classList.add("stat-clone");
        c.setAttribute("aria-hidden", "true");
        statsRow.appendChild(c);
      });
      statsRow.removeAttribute("tabindex");
      statsRow.setAttribute("aria-label", "Bundle contents");
      statsRow.classList.add("is-marquee");
      statsView.classList.add("has-marquee");
    };
    setMarquee();
    if (mqDesktop.addEventListener) mqDesktop.addEventListener("change", setMarquee);
    // Pause while the user is touching it
    statsRow.addEventListener("touchstart", function () { statsRow.classList.add("is-paused"); }, { passive: true });
    statsRow.addEventListener("touchend", function () { statsRow.classList.remove("is-paused"); });
    statsRow.addEventListener("touchcancel", function () { statsRow.classList.remove("is-paused"); });
  }

  /* ---------- 9. Sticky mobile buy bar ---------- */
  var bar = $("#buy-bar");
  var heroCta = $("#hero-cta");
  var finalCta = $("#final-cta");
  if (bar && heroCta && finalCta && "IntersectionObserver" in window) {
    var pastHero = false, finalVisible = false;
    var barLink = $(".js-buy", bar);
    var update = function () {
      var show = pastHero && !finalVisible;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", String(!show));
      barLink.tabIndex = show ? 0 : -1;
    };
    // Position check on scroll (rAF-throttled). Works even when the user flings
    // past the hero CTA so fast that it never enters the viewport.
    var ticking = false;
    var check = function () {
      ticking = false;
      var vh = window.innerHeight;
      var f = finalCta.getBoundingClientRect();
      pastHero = heroCta.getBoundingClientRect().bottom < 0;
      finalVisible = f.top < vh - f.height * 0.15 && f.bottom > f.height * 0.15;
      update();
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    check();
  }

  /* ---------- 10. Meta Pixel (only if META_PIXEL_ID is set) ---------- */
  var PIXEL = val("META_PIXEL_ID");
  if (PIXEL) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", PIXEL);
    window.fbq("track", "PageView");

    var priceValue = parseFloat(String(CFG.PRICE || "").replace(/[^\d.]/g, "")) || 599;

    var inside = $("#inside");
    if (inside && "IntersectionObserver" in window) {
      var vcSent = false;
      var vo = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !vcSent) {
          vcSent = true;
          window.fbq("track", "ViewContent", {
            content_name: "Ultimate Video Editing Bundle (2026) Pro Toolkit",
            content_type: "product",
            value: priceValue,
            currency: "INR"
          });
          vo.disconnect();
        }
      }, { threshold: 0.2 });
      vo.observe(inside);
    }

    $$(".js-buy").forEach(function (a) {
      a.addEventListener("click", function () {
        window.fbq("track", "InitiateCheckout", { value: priceValue, currency: "INR" });
      });
    });
  }
})();
