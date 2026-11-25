/* =========================================================
   Montra Studio — Sipariş sayfası (order.js)
   Paket + mesaj + ek hizmetler → WhatsApp hazır mesaj
   ========================================================= */
(() => {
  /* ---------- Ayarlar: fiyat ve içerikleri buradan düzenleyin ---------- */
  const WHATSAPP_NUMBER = '905550459337'; // 0555 045 93 37

  const PACKAGES = {
    tasarim: {
      name: 'Tasarım Paketi', price: 2999,
      features: ['Kişiye Özel Tasarım', 'Kod Dosyası Teslimi'],
      includes: [],
    },
    baslangic: {
      name: 'Başlangıç Paketi', price: 6999, popular: true,
      features: ['Kişiye Özel Tasarım', 'Domain', 'Hosting', 'SSL Sertifikası', 'Kod Dosyası Teslimi'],
      includes: ['domain'],
    },
    profesyonel: {
      name: 'Profesyonel Paket', price: 11999,
      features: ['Kişiye Özel Tasarım', 'Domain', 'Hosting', 'SSL Sertifikası', 'Temel SEO', '1 Revizyon Hakkı', 'Tanıtım Videosu', 'İlk 3 Ay Ücretsiz Bakım'],
      includes: ['domain', 'seo', 'video'],
    },
    premium: {
      name: 'Premium Paket', price: 17999,
      features: ['Kişiye Özel Tasarım', 'Domain', 'Hosting', 'SSL Sertifikası', 'Temel SEO', '3 Revizyon Hakkı', 'Tanıtım Videosu', 'Logo ve Kartvizit Tasarımı', '6 Ay Ücretsiz Bakım'],
      includes: ['domain', 'seo', 'video', 'logo', 'kartvizit'],
    },
  };

  // qty: true → adet seçilebilen hizmet (fiyat adet başına)
  const ADDONS = [
    { id: 'hizli', icon: 'i-bolt', title: 'Hızlı Teslim', desc: 'Projeniz öncelikli sıraya alınır, teslim süresi kısalır.', price: 999 },
    { id: 'bakim', icon: 'i-shield', title: '1 Yıl Bakım Paketi', desc: 'Güncellemeler, yedekleme ve teknik destek.', price: 2499 },
    { id: 'revizyon', icon: 'i-refresh', title: 'Ek Revizyon Hakkı', desc: 'Paketinizdeki haklara ek revizyon.', price: 399, qty: true, max: 10 },
    { id: 'domain', icon: 'i-server', title: 'Domain + Hosting + SSL', desc: '1 yıllık alan adı, sunucu ve güvenlik sertifikası.', price: 1499 },
    { id: 'seo', icon: 'i-search', title: 'Temel SEO Kurulumu', desc: 'Google için temel optimizasyon ve kayıtlar.', price: 999 },
    { id: 'video', icon: 'i-video', title: 'Tanıtım Videosu', desc: 'Markanızı anlatan kısa tanıtım videosu.', price: 1999 },
    { id: 'logo', icon: 'i-feather', title: 'Logo Tasarımı', desc: 'Markanıza özgün logo ve renk paleti.', price: 1499 },
    { id: 'kartvizit', icon: 'i-card', title: 'Kartvizit Tasarımı', desc: 'Baskıya hazır kartvizit dosyaları.', price: 499 },
    { id: 'sosyal', icon: 'i-grid', title: 'Sosyal Medya Kiti', desc: 'Profil, kapak ve gönderi şablonları.', price: 799 },
    { id: 'dil', icon: 'i-globe', title: 'Ek Dil Desteği', desc: 'Sitenize ikinci bir dil seçeneği.', price: 1499 },
  ];

  /* ---------- Yardımcılar ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fmt = (n) => '₺' + new Intl.NumberFormat('tr-TR').format(Math.round(n));
  const hasGsap = !!window.gsap;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = hasGsap && !reduced;

  const STORE_KEY = 'montra-order-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } };
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* yok say */ } };

  /* ---------- Durum ---------- */
  const saved = load();
  const urlPkg = new URLSearchParams(location.search).get('paket');
  const state = {
    pkg: PACKAGES[urlPkg] ? urlPkg : (PACKAGES[saved.pkg] ? saved.pkg : 'baslangic'),
    name: saved.name || '',
    msg: saved.msg || '',
    addons: saved.addons && typeof saved.addons === 'object' ? saved.addons : {},
  };

  const els = {
    pkgs: $('#pkgs'), addons: $('#addons'),
    name: $('#oName'), msg: $('#oMsg'), err: $('#oMsgErr'), count: $('#oCount'),
    cartPkg: $('#cartPkg'), cartLines: $('#cartLines'), cartTotal: $('#cartTotal'), cartCount: $('#cartCount'),
    mbarTotal: $('#mbarTotal'),
  };

  /* ---------- Paket kartları ---------- */
  els.pkgs.innerHTML = Object.entries(PACKAGES).map(([id, p]) => `
    <button type="button" class="pkg" role="radio" aria-checked="false" data-pkg="${id}">
      ${p.popular ? '<span class="pkg__tag">En Popüler</span>' : ''}
      <span class="pkg__dot" aria-hidden="true"></span>
      <span class="pkg__name">${p.name}</span>
      <span class="pkg__price">${fmt(p.price)}</span>
    </button>`).join('');

  /* ---------- Ek hizmet kartları ---------- */
  els.addons.innerHTML = ADDONS.map((a) => {
    const price = `<span class="addon__price">${fmt(a.price)}${a.qty ? ' <small>/ adet</small>' : ''}</span>`;
    const control = a.qty
      ? `<span class="stepper" role="group" aria-label="${a.title} adedi">
           <button type="button" data-step="-1" aria-label="Azalt">−</button>
           <output aria-live="polite">0</output>
           <button type="button" data-step="1" aria-label="Artır">+</button>
         </span>`
      : `<span class="addon__check" aria-hidden="true"><svg><use href="#i-check"/></svg></span>`;
    const tag = a.qty ? 'div' : 'label';
    return `
      <${tag} class="addon" data-addon="${a.id}">
        ${a.qty ? '' : `<input type="checkbox" class="addon__input" aria-label="${a.title}">`}
        <span class="addon__icon" aria-hidden="true"><svg><use href="#${a.icon}"/></svg></span>
        <span class="addon__body"><span class="addon__title">${a.title}</span><span class="addon__desc">${a.desc}</span></span>
        <span class="addon__side">${price}${control}</span>
      </${tag}>`;
  }).join('');

  /* ---------- Hesap ---------- */
  const pkg = () => PACKAGES[state.pkg];
  const isIncluded = (id) => pkg().includes.includes(id);
  const selected = () => ADDONS
    .filter((a) => (state.addons[a.id] || 0) > 0 && !isIncluded(a.id))
    .map((a) => ({ ...a, n: state.addons[a.id], sum: a.price * state.addons[a.id] }));
  const total = () => pkg().price + selected().reduce((t, a) => t + a.sum, 0);

  /* ---------- Çizim ---------- */
  let shownTotal = 0;
  let prevLines = new Set();

  const renderPkgs = () => {
    $$('.pkg', els.pkgs).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.pkg === state.pkg)));
  };

  const renderAddons = () => {
    $$('.addon', els.addons).forEach((card) => {
      const a = ADDONS.find((x) => x.id === card.dataset.addon);
      const inc = isIncluded(a.id);
      const n = inc ? 0 : (state.addons[a.id] || 0);
      card.classList.toggle('is-included', inc);
      card.classList.toggle('is-on', n > 0);
      const side = $('.addon__side', card);
      let badge = $('.addon__badge', side);
      if (inc && !badge) side.insertAdjacentHTML('afterbegin', '<span class="addon__badge">Pakete dahil</span>');
      if (!inc && badge) badge.remove();
      $('.addon__price', side).hidden = inc;
      if (a.qty) {
        $('.stepper', card).hidden = inc;
        $('output', card).textContent = n;
        $('[data-step="-1"]', card).disabled = n <= 0;
        $('[data-step="1"]', card).disabled = n >= a.max;
      } else {
        const input = $('.addon__input', card);
        input.checked = n > 0;
        input.disabled = inc;
        $('.addon__check', card).hidden = inc;
      }
    });
  };

  const renderCart = () => {
    const p = pkg();
    els.cartPkg.innerHTML = `
      <div class="cart__pkgrow"><span class="cart__pkgname">${p.name}</span><span class="cart__pkgprice">${fmt(p.price)}</span></div>
      <ul class="cart__feats">${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>`;

    const list = selected();
    els.cartLines.innerHTML = list.map((a) => `
      <li class="cart__line" data-line="${a.id}">
        <span>${a.title}${a.qty ? ` × ${a.n}` : ''}</span>
        <span class="cart__lineR"><strong>${fmt(a.sum)}</strong>
          <button type="button" class="cart__remove" data-remove="${a.id}" aria-label="${a.title} hizmetini kaldır"><svg><use href="#i-trash"/></svg></button>
        </span>
      </li>`).join('');

    const now = new Set(list.map((a) => a.id));
    if (animate) {
      $$('.cart__line', els.cartLines)
        .filter((li) => !prevLines.has(li.dataset.line))
        .forEach((li) => gsap.fromTo(li, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }, { height: 'auto', opacity: 1, paddingTop: 9, paddingBottom: 9, duration: 0.45, ease: 'power3.out', clearProps: 'height,paddingTop,paddingBottom' }));
    }
    prevLines = now;

    const items = 1 + list.length;
    els.cartCount.textContent = `${items} kalem`;

    const t = total();
    if (animate && shownTotal) {
      const o = { v: shownTotal };
      gsap.to(o, {
        v: t, duration: 0.7, ease: 'power3.out', overwrite: true,
        onUpdate: () => { els.cartTotal.textContent = fmt(o.v); els.mbarTotal.textContent = fmt(o.v); },
      });
      gsap.fromTo([els.cartTotal, els.mbarTotal], { color: '#ff1f66' }, { color: '#f4f4f5', duration: 0.9, ease: 'power2.out' });
    } else {
      els.cartTotal.textContent = fmt(t);
      els.mbarTotal.textContent = fmt(t);
    }
    shownTotal = t;
  };

  const renderAll = () => { renderPkgs(); renderAddons(); renderCart(); save(); };

  /* ---------- Olaylar ---------- */
  els.pkgs.addEventListener('click', (e) => {
    const b = e.target.closest('.pkg');
    if (!b || b.dataset.pkg === state.pkg) return;
    state.pkg = b.dataset.pkg;
    history.replaceState(null, '', `?paket=${state.pkg}`);
    renderAll();
    if (animate) gsap.fromTo(b, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  });

  els.addons.addEventListener('change', (e) => {
    const input = e.target.closest('.addon__input');
    if (!input) return;
    const id = input.closest('.addon').dataset.addon;
    state.addons[id] = input.checked ? 1 : 0;
    renderAll();
  });

  els.addons.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-step]');
    if (!btn) return;
    const card = btn.closest('.addon');
    const a = ADDONS.find((x) => x.id === card.dataset.addon);
    const n = Math.min(a.max, Math.max(0, (state.addons[a.id] || 0) + Number(btn.dataset.step)));
    state.addons[a.id] = n;
    renderAll();
  });

  els.cartLines.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    state.addons[btn.dataset.remove] = 0;
    renderAll();
  });

  // Mesaj alanları
  els.name.value = state.name;
  els.msg.value = state.msg;
  const updateCount = () => { els.count.textContent = `${els.msg.value.length} / 1000`; };
  updateCount();
  els.name.addEventListener('input', () => { state.name = els.name.value; save(); });
  els.msg.addEventListener('input', () => {
    state.msg = els.msg.value;
    updateCount();
    if (els.msg.value.trim().length >= 10) setError('');
    updateSteps();
    save();
  });

  function setError(text) {
    els.err.textContent = text;
    els.msg.closest('.field').classList.toggle('has-error', !!text);
    els.msg.setAttribute('aria-invalid', String(!!text));
  }

  /* ---------- Adım göstergesi ---------- */
  const stepLis = $$('.steps li');
  let activeStep = 1;
  function updateSteps() {
    const msgOk = els.msg.value.trim().length >= 10;
    stepLis.forEach((li) => {
      const n = Number(li.dataset.step);
      li.classList.toggle('is-active', n === activeStep);
      li.classList.toggle('is-done', n < activeStep || (n === 1 && msgOk && activeStep !== 1));
    });
  }

  /* ---------- WhatsApp mesajı ---------- */
  const buildMessage = () => {
    const p = pkg();
    const lines = [
      'Merhaba Montra Studio, web sitesi siparişi vermek istiyorum.',
      '',
      `*Paket:* ${p.name} - ${fmt(p.price)}`,
      `Dahil olanlar: ${p.features.join(', ')}`,
    ];
    const list = selected();
    if (list.length) {
      lines.push('', '*Ek Hizmetler:*');
      list.forEach((a) => lines.push(`• ${a.title}${a.qty ? ` x${a.n}` : ''} - ${fmt(a.sum)}`));
    }
    lines.push('', `*Toplam:* ${fmt(total())}`, '');
    if (state.name.trim()) lines.push(`*Ad / Firma:* ${state.name.trim()}`);
    lines.push('*Mesajım:*', state.msg.trim());
    return lines.join('\n');
  };

  const send = () => {
    if (els.msg.value.trim().length < 10) {
      setError('Lütfen projenizi birkaç kelimeyle anlatın (en az 10 karakter).');
      const block = $('#mesaj');
      block.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => els.msg.focus({ preventScroll: true }), reduced ? 0 : 450);
      if (animate) gsap.fromTo(els.msg, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    activeStep = 3; updateSteps();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
    const win = window.open(url, '_blank');
    if (win) win.opener = null; else location.href = url;
  };
  $('#sendBtn').addEventListener('click', send);
  $('#mbarBtn').addEventListener('click', send);

  /* ---------- Header + mobil menü ---------- */
  const header = $('.header');
  const burger = $('.burger');
  const menu = $('#mobileMenu');
  let menuOpen = false;
  const setMenu = (open) => {
    menuOpen = open;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (hasGsap) {
      gsap.to(menu, { autoAlpha: open ? 1 : 0, duration: 0.35 });
      if (open && animate) gsap.fromTo($$('.mmenu__list li, .mmenu__cta, .mmenu__phone', menu), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
    } else {
      menu.style.visibility = open ? 'visible' : 'hidden';
      menu.style.opacity = open ? '1' : '0';
    }
  };
  burger.addEventListener('click', () => setMenu(!menuOpen));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  /* ---------- İlk çizim ---------- */
  renderAll();
  updateSteps();

  if (!hasGsap) { document.documentElement.classList.remove('js'); return; }
  gsap.registerPlugin(ScrollTrigger);

  // Hangi bölümdeyiz → adım göstergesi
  $$('[data-step-target]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 60%', end: 'bottom 40%',
      onToggle: (self) => { if (self.isActive) { activeStep = Number(el.dataset.stepTarget); updateSteps(); } },
    });
  });

  if (!animate) {
    gsap.set(['.header', '[data-o]'], { autoAlpha: 1 });
    return;
  }

  /* ---------- Animasyonlar ---------- */
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .fromTo('.header', { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0)
    .fromTo('[data-o]', { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.1)
    .fromTo('.steps li', { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }, 0.6);

  gsap.fromTo('.ohero__mono', { autoAlpha: 0, scale: 0.85, rotate: -6 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.6, ease: 'power3.out', delay: 0.2 });
  gsap.fromTo('.ohero__arc', { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' }, { autoAlpha: 0.9, clipPath: 'inset(0 0 0% 0)', duration: 1.8, ease: 'power3.inOut', delay: 0.4 });
  gsap.to('.ohero__mono', { y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 });
  gsap.fromTo('.oblock', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.35 });
  gsap.fromTo('.pkg', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.6 });
  gsap.fromTo('.cart__card', { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.5 });

  ScrollTrigger.batch('.addon', {
    start: 'top 92%', once: true,
    onEnter: (b) => gsap.fromTo(b, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }),
  });

  // WhatsApp butonunda hafif nabız
  gsap.to('.btn--wa', { boxShadow: '0 10px 40px -4px rgba(255,31,102,.75), inset 0 1px 0 rgba(255,255,255,.25)', duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  // Mobil alt bar girişi
  gsap.fromTo('.mbar', { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'power3.out', delay: 0.9 });
})();
