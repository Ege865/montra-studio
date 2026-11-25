/* Yasal sayfalar: mobil menü */
(() => {
  const b = document.querySelector('.burger'), m = document.getElementById('mobileMenu');
  const set = (o) => {
    b.classList.toggle('is-open', o); m.classList.toggle('is-open', o);
    b.setAttribute('aria-expanded', String(o)); b.setAttribute('aria-label', o ? 'Menüyü kapat' : 'Menüyü aç');
    m.setAttribute('aria-hidden', String(!o)); document.body.style.overflow = o ? 'hidden' : '';
  };
  b.addEventListener('click', () => set(!b.classList.contains('is-open')));
  m.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
})();
