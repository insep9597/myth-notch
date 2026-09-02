(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * 1. Repo detection
   * GitHub Pages serves this at https://{user}.github.io/{repo}/...
   * We read both from the URL so nothing is hardcoded per-deployment.
   * If this page is ever served from a custom domain, GITHUB_USER/REPO
   * below act as the fallback — edit them once and everything still works.
   * ------------------------------------------------------------------- */
  var FALLBACK_USER = "insep9597";
  var FALLBACK_REPO = "myth-notch";

  function detectRepo() {
    var host = window.location.hostname; // e.g. insep9597.github.io
    var path = window.location.pathname.split("/").filter(Boolean); // ["myth-notch", ...]
    var isGithubIo = /\.github\.io$/.test(host);
    var user = isGithubIo ? host.replace(".github.io", "") : FALLBACK_USER;
    var repo = isGithubIo && path.length > 0 ? path[0] : FALLBACK_REPO;
    return { user: user, repo: repo };
  }

  var REPO = detectRepo();

  function releaseUrl(filename) {
    return (
      "https://github.com/" +
      REPO.user +
      "/" +
      REPO.repo +
      "/releases/latest/download/" +
      filename
    );
  }

  /* ---------------------------------------------------------------------
   * 2. Static asset filenames (must match the GitHub Actions release job)
   * ------------------------------------------------------------------- */
  var ASSETS = {
    windows: "MythNotch-Setup.exe",
    macos: "myth_notch_macos.zip",
    linux: "myth_notch_linux_x64.tar.gz",
    ios: "myth_notch_ios_archive.zip",
    androidApk: "app-release.apk"
  };

  // TODO: replace with the real Google Play listing URL.
  var PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.myth.notch";

  var LINKS = {
    windows: releaseUrl(ASSETS.windows),
    macos: releaseUrl(ASSETS.macos),
    linux: releaseUrl(ASSETS.linux),
    ios: releaseUrl(ASSETS.ios),
    androidApk: releaseUrl(ASSETS.androidApk),
    android: PLAY_STORE_URL
  };

  function applyLinks() {
    document.querySelectorAll("[data-dl]").forEach(function (el) {
      var key = el.getAttribute("data-dl");
      if (LINKS[key]) el.setAttribute("href", LINKS[key]);
    });
  }

  /* ---------------------------------------------------------------------
   * 3. OS detection for the hero CTA
   * ------------------------------------------------------------------- */
  var OS_LABELS = {
    windows: { tr: "Windows i\u00e7in indir", en: "Download for Windows", link: "windows" },
    macos: { tr: "Mac i\u00e7in indir", en: "Download for Mac", link: "macos" },
    linux: { tr: "Linux i\u00e7in indir", en: "Download for Linux", link: "linux" },
    android: { tr: "Play Store'dan a\u00e7", en: "Get it on Google Play", link: "android" },
    ios: { tr: "iOS i\u00e7in indir", en: "Download for iOS", link: "ios" }
  };

  function detectOS() {
    var ua = navigator.userAgent || "";
    var platform = navigator.platform || "";
    if (/android/i.test(ua)) return "android";
    if (/iphone|ipad|ipod/i.test(ua)) return "ios";
    if (/mac/i.test(platform)) return "macos";
    if (/win/i.test(platform)) return "windows";
    if (/linux/i.test(platform)) return "linux";
    return "windows";
  }

  function applyHeroCTA(lang) {
    var os = detectOS();
    var meta = OS_LABELS[os];
    var btn = document.getElementById("hero-cta");
    if (!btn || !meta) return;
    btn.setAttribute("href", LINKS[meta.link]);
    var label = btn.querySelector(".cta-label");
    if (label) label.textContent = meta[lang];
  }

  /* ---------------------------------------------------------------------
   * 4. Language toggle (TR default, persisted)
   * ------------------------------------------------------------------- */
  var LANG_KEY = "notch-lang";

  function getLang() {
    return localStorage.getItem(LANG_KEY) || "en";
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-lang]").forEach(function (el) {
      el.classList.toggle("lang-active", el.getAttribute("data-lang") === lang);
    });
    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-set-lang") === lang);
    });
    applyHeroCTA(lang);
  }

  function initLangToggle() {
    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-set-lang"));
      });
    });
    setLang(getLang());
  }

  /* ---------------------------------------------------------------------
   * 5. Scroll reveal for bento cards
   * ------------------------------------------------------------------- */
  function initScrollReveal() {
    var cards = document.querySelectorAll(".bento-card");
    if (!cards.length) return;
    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) { c.classList.add("visible"); });
      return;
    }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    cards.forEach(function (c) { obs.observe(c); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyLinks();
    initLangToggle();
    initScrollReveal();
  });
})();
