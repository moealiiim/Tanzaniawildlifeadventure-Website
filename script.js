(() => {
  let i18n = {};

  async function loadLocales() {
    try {
      const response = await fetch('locales.json');
      i18n = await response.json();
      console.log('Locales loaded:', Object.keys(i18n));
    } catch (error) {
      console.error('Failed to load locales:', error);
    }
  }

  function applyLanguage(lang) {
    const dict = i18n[lang] || i18n.en || {};
    console.log('Applying language:', lang, 'Keys available:', Object.keys(dict).length);

    // Translate text content
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = dict[key];
      if (typeof text === "string") el.textContent = text;
    });

    // Translate placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const text = dict[key];
      if (typeof text === "string") el.placeholder = text;
    });

    // Update the html lang attribute
    document.documentElement.lang = lang;

    try { localStorage.setItem("twa_lang", lang); } catch {}
  }

  function init() {
    const saved = (() => { try { return localStorage.getItem("twa_lang"); } catch { return null; } })() || "en";

    loadLocales().then(() => {
      // Flag button language switcher
      const activate = (lang) => document.querySelectorAll('.langBtn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      const initial = i18n[saved] ? saved : 'en';

      // Apply saved/initial language and set visual state
      applyLanguage(initial);
      activate(initial);

      // Attach click handler once per button (guard with data attribute)
      function attachLangHandler(btn) {
        if (btn.dataset.langWired) return;
        btn.addEventListener('click', () => {
          const lang = btn.dataset.lang;
          console.log('Language changed to:', lang);
          applyLanguage(lang);
          try { localStorage.setItem('twa_lang', lang); } catch {}
          activate(lang);
        });
        btn.dataset.langWired = '1';
      }

      // Wire existing buttons
      document.querySelectorAll('.langBtn').forEach(attachLangHandler);

      // Ensure flags are visible on mobile in the topbar (clone + wire handlers)
      function ensureMobileFlags() {
        const topbarRight = document.querySelector('.topbar__inner .topbar__right');
        if (!topbarRight) return;
        const existingMobile = document.querySelector('.langFlags--mobile');

        if (window.matchMedia('(max-width: 900px)').matches) {
          if (!existingMobile) {
            const orig = document.querySelector('.langFlags');
            if (orig) {
              const clone = orig.cloneNode(true);
              clone.classList.add('langFlags--mobile');
              // Remove any wiring markers from cloned buttons, then attach handlers
              clone.querySelectorAll('.langBtn').forEach(cb => { delete cb.dataset.langWired; attachLangHandler(cb); });
              // Insert at start of topbar right (before phone link)
              topbarRight.insertBefore(clone, topbarRight.firstChild);
              // Sync active state
              activate(initial);
            }
          }
        } else {
          if (existingMobile) existingMobile.remove();
        }
      }

      // Initial check and on resize (debounced)
      ensureMobileFlags();
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(ensureMobileFlags, 150);
      });
    });

    // Nav toggle for mobile
    const navToggle = document.querySelector('.navToggle');
    const nav = document.getElementById('siteNav');
    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.contains('nav--open');
        nav.classList.toggle('nav--open');
        navToggle.setAttribute('aria-expanded', !isOpen);
      });
    }

    // Countdown timer
    initCountdown();

    // Contact form WhatsApp submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = contactForm.name.value;
        const email = contactForm.email.value;
        const phone = contactForm.phone.value;
        const arrival_date = contactForm.arrival_date.value;
        const message = contactForm.message.value;
        const whatsappMessage = `New Safari Inquiry:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nArrival date: ${arrival_date}\nMessage: ${message}`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/46760088124?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      });
    }

    // Quick message form WhatsApp submission
    const quickMessageForm = document.getElementById('quickMessageForm');
    if (quickMessageForm) {
      quickMessageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = quickMessageForm.name.value;
        const email = quickMessageForm.email.value;
        const phone = quickMessageForm.phone.value;
        const arrival_date = quickMessageForm.arrival_date.value;
        const message = quickMessageForm.message.value;
        const whatsappMessage = `New Safari Inquiry:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nArrival date: ${arrival_date}\nMessage: ${message}`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/46760088124?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      });
    }
  }

  function initCountdown() {
    const countdownEl = document.querySelector('.countdown');
    if (!countdownEl) return;

    const timeBoxes = countdownEl.querySelectorAll('.timeBox');
    if (timeBoxes.length < 4) return;

    // Set target to 24 hours from now (or use stored target for consistency)
    let targetTime;
    try {
      const stored = localStorage.getItem('twa_countdown_target');
      if (stored) {
        targetTime = parseInt(stored, 10);
        // If target has passed, reset to 24 hours from now
        if (targetTime <= Date.now()) {
          targetTime = Date.now() + 24 * 60 * 60 * 1000;
          localStorage.setItem('twa_countdown_target', targetTime.toString());
        }
      } else {
        targetTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('twa_countdown_target', targetTime.toString());
      }
    } catch {
      targetTime = Date.now() + 24 * 60 * 60 * 1000;
    }

    function updateCountdown() {
      const now = Date.now();
      let diff = targetTime - now;

      if (diff <= 0) {
        // Reset countdown when it reaches zero
        targetTime = Date.now() + 24 * 60 * 60 * 1000;
        try { localStorage.setItem('twa_countdown_target', targetTime.toString()); } catch {}
        diff = targetTime - now;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      // Update the number spans (first span in each timeBox)
      timeBoxes[0].querySelector('span').textContent = String(days).padStart(2, '0');
      timeBoxes[1].querySelector('span').textContent = String(hours).padStart(2, '0');
      timeBoxes[2].querySelector('span').textContent = String(mins).padStart(2, '0');
      timeBoxes[3].querySelector('span').textContent = String(secs).padStart(2, '0');
    }

    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
