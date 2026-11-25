/* Çerez izni + Google Analytics 4
   Ölçüm kimliğini aşağıya yazın (ör. 'G-XXXXXXXXXX').
   Boşken veya izin verilmeden Analytics hiç yüklenmez. */
(() => {
  const GA_ID = '';
  const KEY = 'montra-cerez-v1';
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const set = (v) => { try { localStorage.setItem(KEY, v); } catch { /* yok say */ } };
  let loaded = false;

  const start = () => {
    if (!GA_ID || loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { allow_google_signals: false });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  };
  const clear = () => {
    document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((n) => n.startsWith('_ga')).forEach((n) => {
      ['', '; domain=' + location.hostname].forEach((d) => { document.cookie = n + '=; Max-Age=0; path=/' + d; });
    });
  };

  const box = document.createElement('section');
  box.className = 'ck';
  box.hidden = true;
  box.setAttribute('aria-label', 'Çerez tercihi');
  box.innerHTML = `<strong>Ziyaret istatistiği tutalım mı?</strong>
    <p>İzin verirseniz siteyi geliştirmek için Google Analytics çerezleri kullanırız. Reddederseniz site aynı şekilde çalışır. <a href="cerez-politikasi.html">Çerez politikası</a></p>
    <div class="ck__btns"><button type="button" class="btn btn--ghost" data-ck="red">Reddet</button><button type="button" class="btn btn--ghost" data-ck="kabul">Kabul et</button></div>`;
  document.body.appendChild(box);

  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ck]');
    if (!b) return;
    const before = get();
    set(b.dataset.ck);
    box.hidden = true;
    if (b.dataset.ck === 'kabul') start();
    else { clear(); if (before === 'kabul' && loaded) location.reload(); }
  });
  document.querySelectorAll('.ck-open').forEach((b) => b.addEventListener('click', () => {
    box.hidden = false;
    box.querySelector('button').focus();
  }));

  const choice = get();
  if (choice === 'kabul') start();
  else if (choice !== 'red') box.hidden = false;
})();
