/* =========================================================
   Montra Studio — main.js (GSAP + ScrollTrigger)
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const header = $('.header');
  const burger = $('.burger');
  const menu = $('#mobileMenu');

  if (!window.gsap) {
    document.documentElement.classList.remove('js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 1 });

  /* ---------- Header: kaydırınca arka plan ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Aktif menü linki ---------- */
  const navLinks = $$('.nav__link');
  ['anasayfa', 'hizmetler', 'portfolyo', 'paketler', 'iletisim'].forEach((id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (!self.isActive) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
      },
    });
  });

  /* ---------- Mobil menü ---------- */
  const menuTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
    .to(menu, { autoAlpha: 1, duration: 0.35 })
    .fromTo($$('.mmenu__list li', menu), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.6 }, '-=0.1')
    .fromTo('.mmenu__cta', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, '-=0.35');

  const setMenu = (open) => {
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    open ? menuTl.timeScale(1).play() : menuTl.timeScale(1.6).reverse();
  };
  burger.addEventListener('click', () => setMenu(!burger.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && burger.classList.contains('is-open')) setMenu(false); });

  /* ---------- Mobil paket kaydırma ---------- */
  const cards = $('.pricing__cards');
  $('.pricing__next').addEventListener('click', () => {
    const w = cards.firstElementChild.getBoundingClientRect().width + 14;
    const atEnd = cards.scrollLeft + cards.clientWidth >= cards.scrollWidth - 4;
    cards.scrollTo({ left: atEnd ? 0 : cards.scrollLeft + w, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------- Video modal ---------- */
  const modal = $('#videoModal');
  const frame = $('.vmodal__frame', modal);
  const playBtn = $('.play');
  const openModal = () => {
    const src = playBtn.dataset.video;
    if (src) frame.innerHTML = `<iframe src="${src}" allow="autoplay; fullscreen" allowfullscreen title="Tanıtım videosu"></iframe>`;
    modal.setAttribute('aria-hidden', 'false');
    gsap.to(modal, { autoAlpha: 1, duration: 0.35 });
    gsap.fromTo('.vmodal__box', { scale: 0.92, y: 20 }, { scale: 1, y: 0, duration: 0.6 });
    $('.vmodal__close').focus();
  };
  const closeModal = () => {
    gsap.to(modal, { autoAlpha: 0, duration: 0.3, onComplete: () => {
      if (playBtn.dataset.video) frame.innerHTML = '<p>Tanıtım videosu yakında burada.</p>';
    } });
    modal.setAttribute('aria-hidden', 'true');
    playBtn.focus();
  };
  playBtn.addEventListener('click', openModal);
  $('.vmodal__close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal(); });

  /* =========================================================
     Animasyonlar (responsive + reduced motion)
     ========================================================= */
  let reduced = false;
  const mm = gsap.matchMedia();

  mm.add({
    motion: '(prefers-reduced-motion: no-preference)',
    reduce: '(prefers-reduced-motion: reduce)',
    desktop: '(min-width: 681px)',
  }, (ctx) => {
    const { motion, desktop } = ctx.conditions;
    reduced = !motion;

    if (!motion) {
      gsap.set(['.header', '[data-hero]', '[data-reveal]', '.hero__visual'], { autoAlpha: 1 });
      return;
    }

    /* --- Giriş (hero) timeline --- */
    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    intro
      .fromTo('.hero__visual', { autoAlpha: 0, scale: 1.08, xPercent: 4 }, { autoAlpha: 1, scale: 1, xPercent: 0, duration: 1.8, ease: 'power2.out' }, 0)
      .fromTo('.header', { autoAlpha: 0, y: -24 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.2)
      .fromTo('.hero .eyebrow', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.35)
      .fromTo('.hero__title .line__in', { yPercent: 110, rotate: 2 }, { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.12 }, 0.45)
      .fromTo('.hero__text', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.9)
      .fromTo('.hero__actions', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1 }, 1.05);

    // Neon ışık nefes alma
    gsap.fromTo('.hero__neonimg', { autoAlpha: 0, clipPath: 'inset(100% 0 0 0)' }, { autoAlpha: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'power3.inOut', delay: 0.6 });
    gsap.to('.hero__neonimg', { opacity: 0.75, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.3 });
    gsap.fromTo('.hero__arch', { autoAlpha: 0, x: 40 }, { autoAlpha: 0.42, x: 0, duration: 2, ease: 'power2.out', delay: 0.3 });
    gsap.to('.hero__neon', { opacity: 1, scale: 1.08, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    // Play butonu halka dalgası
    gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: 2 })
      .fromTo('.play__circle', { boxShadow: '0 0 0 0 rgba(255,31,102,.45)' }, { boxShadow: '0 0 0 14px rgba(255,31,102,0)', duration: 1.4, ease: 'power2.out' });

    // Hero kaydırma parallax
    gsap.to('.hero__stage', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__content', {
      y: -40, autoAlpha: 0.2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Fare ile heykel parallax (sadece masaüstü)
    if (desktop && matchMedia('(pointer: fine)').matches) {
      const qx = gsap.quickTo('.hero__stage', 'x', { duration: 1.2, ease: 'power3.out' });
      const qy = gsap.quickTo('.hero__stage', 'y', { duration: 1.2, ease: 'power3.out' });
      const hero = $('.hero');
      const move = (e) => {
        const r = hero.getBoundingClientRect();
        qx(((e.clientX - r.left) / r.width - 0.5) * -18);
        qy(((e.clientY - r.top) / r.height - 0.5) * -12);
      };
      hero.addEventListener('mousemove', move);
      ctx.add(() => () => hero.removeEventListener('mousemove', move));
    }

    /* --- Genel scroll reveal --- */
    const revealEls = $$('[data-reveal]');
    gsap.set(revealEls, { autoAlpha: 0, y: 30 });
    ScrollTrigger.batch(revealEls, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }),
    });

    /* --- Hizmet kartları --- */
    gsap.fromTo('.scard', { autoAlpha: 0, y: 40 }, {
      autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09,
      scrollTrigger: { trigger: '.services__grid', start: 'top 88%', once: true },
    });

    /* --- Portfolyo --- */
    const pMedia = desktop ? '.ptile img' : '.portfolio__laptop';
    gsap.fromTo('.portfolio__media', { clipPath: 'inset(0 0 0 100%)' }, {
      clipPath: 'inset(0 0 0 0%)', duration: 1.6, ease: 'power3.inOut',
      scrollTrigger: { trigger: '.portfolio', start: 'top 85%', once: true },
    });
    if (desktop) gsap.fromTo('.ptile', { yPercent: 18, autoAlpha: 0 }, {
      yPercent: 0, autoAlpha: (i, el) => (el.classList.contains('ptile--ghost') ? 0.35 : 1), duration: 1.2, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.portfolio', start: 'top 85%', once: true },
    });
    gsap.fromTo(pMedia, { scale: 1.15 }, {
      scale: 1, duration: 1.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.portfolio', start: 'top 85%', once: true },
    });
    gsap.fromTo(pMedia, { xPercent: desktop ? 2 : 0, yPercent: 0 }, {
      xPercent: desktop ? -3 : 0, yPercent: desktop ? 0 : -4, ease: 'none',
      scrollTrigger: { trigger: '.portfolio', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* --- Paket kartları --- */
    gsap.fromTo('.pcard', { autoAlpha: 0, y: 50 }, {
      autoAlpha: 1, y: 0, duration: 1, stagger: 0.12,
      scrollTrigger: { trigger: '.pricing__cards', start: 'top 88%', once: true },
    });
    gsap.to('.pcard--popular', {
      boxShadow: '0 0 40px 2px rgba(255,31,102,.55), inset 0 0 26px rgba(255,31,102,.18)',
      duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
    gsap.fromTo('.pcard__badge', { scale: 0.6, autoAlpha: 0 }, {
      scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(2.2)',
      scrollTrigger: { trigger: '.pricing__cards', start: 'top 80%', once: true },
    });

    /* --- Footer --- */
    gsap.fromTo('.footer__temple', { autoAlpha: 0, y: 30 }, {
      autoAlpha: 0.9, y: 0, duration: 1.4,
      scrollTrigger: { trigger: '.footer', start: 'top 98%', once: true },
    });
    gsap.fromTo(['.footer__top > .logo', '.footer__links li', '.footer__social li', '.footer__mcta', '.footer__bottom > *'], { autoAlpha: 0, y: 16 }, {
      autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05,
      scrollTrigger: { trigger: '.footer', start: 'top 95%', once: true },
    });

  });

  // Görseller yüklenince tetik noktalarını güncelle
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
