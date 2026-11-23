(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const tabs = $$('.tab');
  const panels = $$('.panel');
  const addr = $('#addrText');
  const btnBack = $('#btnBack');
  const btnFwd = $('#btnFwd');

  const labels = {
    home: 'Hubungi saya!',
    projects: 'Lihat proyek saya!',
    skills: 'Skill & teknologi',
    contact: 'Ayo kolaborasi!'
  };

  // ---------- Navigasi tab + history sendiri (back/forward) ----------
  let stack = ['home'];
  let idx = 0;

  function render(name) {
    tabs.forEach(t => {
      const on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
    });
    panels.forEach(p => p.classList.toggle('active', p.id === name));
    addr.textContent = labels[name] || '';
    btnBack.disabled = idx === 0;
    btnFwd.disabled = idx === stack.length - 1;
  }

  function go(name) {
    if (!labels[name] || stack[idx] === name) return;
    stack = stack.slice(0, idx + 1);
    stack.push(name);
    idx = stack.length - 1;
    render(name);
  }

  tabs.forEach(t => t.addEventListener('click', () => go(t.dataset.tab)));
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => go(b.dataset.goto)));
  btnBack.addEventListener('click', () => { if (idx > 0) render(stack[--idx]); });
  btnFwd.addEventListener('click', () => { if (idx < stack.length - 1) render(stack[++idx]); });
  $('#btnReset').addEventListener('click', () => { stack = ['home']; idx = 0; render('home'); });
  render('home');

  // ---------- Counter kunjungan (per-browser, hanya hiasan) ----------
  try {
    const n = (parseInt(localStorage.getItem('views') || '0', 10) || 0) + 1;
    localStorage.setItem('views', n);
    $('#views').textContent = n.toLocaleString('id-ID');
  } catch {
    $('#views').textContent = '1';
  }

  // ---------- Jam taskbar ----------
  const clock = $('#clock');
  const tick = () => {
    const d = new Date();
    clock.textContent =
      d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + '\n' +
      d.toLocaleDateString('id-ID');
    clock.style.whiteSpace = 'pre';
    clock.style.textAlign = 'right';
    clock.style.lineHeight = '1.1';
  };
  tick();
  setInterval(tick, 30000);

  // ---------- Kontrol window ----------
  const win = $('#window');
  $('#btnMin').addEventListener('click', () => win.classList.toggle('min'));
  $('#btnMax').addEventListener('click', () => win.classList.toggle('max'));

  // ---------- Dialog ala Internet Explorer ----------
  const overlay = $('#overlay');
  const dlgMsg = $('#dlgMsg');
  const dlgOk = $('#dlgOk');
  let lastFocus = null;

  function openDialog(msg) {
    lastFocus = document.activeElement;
    dlgMsg.textContent = msg;
    overlay.hidden = false;
    dlgOk.focus();
  }
  function closeDialog() {
    overlay.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  $('#btnClose').addEventListener('click', () =>
    openDialog('Jendela ini tidak bisa ditutup. Masih banyak yang bisa dilihat di portofolio ini! :)'));
  dlgOk.addEventListener('click', closeDialog);
  $('#dlgCancel').addEventListener('click', closeDialog);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeDialog(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) closeDialog(); });

  // ---------- Form kontak (mailto, tanpa backend) ----------
  const EMAIL = 'email@kamu.com'; // TODO: ganti dengan email aslimu
  const form = $('#contactForm');
  const hint = $('#formHint');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.msg.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    hint.classList.remove('ok');
    if (!name || !msg || !emailOk) {
      hint.textContent = 'Lengkapi nama, email yang valid, dan pesan dulu ya.';
      return;
    }
    const subject = encodeURIComponent('Pesan dari portofolio: ' + name);
    const body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
    hint.classList.add('ok');
    hint.textContent = 'Membuka aplikasi email kamu…';
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  });
})();
