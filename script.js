(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  var ru = root.lang === 'ru';

  /* 404: one page for both languages */
  if (doc.body.classList.contains('p-404')) {
    var isRu = /\/ru(\/|$)/.test(location.pathname);
    [].forEach.call(doc.querySelectorAll('.nf-lang'), function (el) { el.classList.toggle('off', el.getAttribute('data-l') !== (isRu ? 'ru' : 'lv')); });
  }

  /* header: solid after the hero top, mobile menu */
  var hdr = doc.getElementById('hdr'), burger = hdr.querySelector('.burger'), mnav = doc.getElementById('mnav');
  function solid() { hdr.classList.toggle('solid', window.scrollY > 30); }
  solid(); window.addEventListener('scroll', solid, { passive: true });
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? (ru ? 'Закрыть' : 'Aizvērt') : (ru ? 'Меню' : 'Izvēlne'));
  }
  burger.addEventListener('click', function () { setMenu(!hdr.classList.contains('open')); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hdr.classList.contains('open')) { setMenu(false); burger.focus(); } });
  doc.addEventListener('click', function (e) { if (hdr.classList.contains('open') && !hdr.contains(e.target)) setMenu(false); });

  /* mobile menu: services sub-list */
  var mt = doc.querySelector('.m-t'), msub = doc.getElementById('m-svc');
  if (mt && msub) mt.addEventListener('click', function () {
    var open = mt.getAttribute('aria-expanded') !== 'true';
    mt.setAttribute('aria-expanded', open ? 'true' : 'false'); msub.hidden = !open;
  });

  /* desktop: services dropdown (hover opens it by CSS, the arrow button opens it for click, touch and keyboard) */
  var dd = doc.querySelector('.nav-dd'), ddt = dd && dd.querySelector('.dd-t');
  if (ddt) {
    var setDD = function (open) { dd.classList.toggle('open', open); ddt.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    ddt.addEventListener('click', function (e) { e.stopPropagation(); setDD(!dd.classList.contains('open')); });
    doc.addEventListener('click', function (e) { if (!dd.contains(e.target)) setDD(false); });
    dd.addEventListener('focusout', function (e) { if (e.relatedTarget && !dd.contains(e.relatedTarget)) setDD(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dd.classList.contains('open')) { setDD(false); ddt.focus(); } });
  }

  /* reveal on scroll */
  var items = [].slice.call(doc.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  /* form -> mail program (window.__noNav lets the page test read the address without opening a mail program) */
  var form = doc.getElementById('cform');
  if (form) {
    var err = form.querySelector('.f-err'), sel = form.elements.svc;
    var q = location.search.match(/[?&]pakalpojums=([\w-]+)/);
    if (q && sel && sel.querySelector('option[value="' + q[1] + '"]')) sel.value = q[1];
    var M = ru ? { name: 'Напишите своё имя.', contact: 'Укажите телефон или e-mail.', msg: 'Коротко напишите, что нужно сделать.', subj: 'Вопрос с сайта', n: 'Имя: ', c: 'Телефон или e-mail: ', s: 'Услуга: ' }
               : { name: 'Lūdzu, ierakstiet savu vārdu.', contact: 'Lūdzu, norādiet tālruni vai e-pastu.', msg: 'Lūdzu, īsi uzrakstiet, kas jādara.', subj: 'Jautājums no mājaslapas', n: 'Vārds: ', c: 'Tālrunis vai e-pasts: ', s: 'Pakalpojums: ' };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, name = f.name.value.trim(), contact = f.contact.value.trim(), msg = f.msg.value.trim();
      [f.name, f.contact, f.msg].forEach(function (x) { x.removeAttribute('aria-invalid'); });
      var okContact = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact) || contact.replace(/\D/g, '').length >= 7;
      var bad = name.length < 2 ? [f.name, M.name] : (!okContact ? [f.contact, M.contact] : (msg.length < 5 ? [f.msg, M.msg] : null));
      if (bad) { bad[0].setAttribute('aria-invalid', 'true'); err.textContent = bad[1]; err.hidden = false; bad[0].focus(); return; }
      err.hidden = true;
      var svc = sel && sel.value ? sel.options[sel.selectedIndex].text : '';
      var body = M.n + name + '\n' + M.c + contact + (svc ? '\n' + M.s + svc : '') + '\n\n' + msg;
      var url = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + encodeURIComponent(M.subj) + '&body=' + encodeURIComponent(body);
      window.__mailto = url;
      if (!window.__noNav) window.location.href = url;
    });
  }

  /* copy company details */
  [].forEach.call(doc.querySelectorAll('.copy'), function (b) {
    b.addEventListener('click', function () {
      var txt = b.getAttribute('data-copy'), lab = b.querySelector('span'), orig = lab.textContent;
      function done() { lab.textContent = b.getAttribute('data-done'); b.classList.add('ok'); setTimeout(function () { lab.textContent = orig; b.classList.remove('ok'); }, 2200); }
      function fallback() {
        var ta = doc.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        doc.body.appendChild(ta); ta.select();
        try { if (doc.execCommand('copy')) done(); } catch (x) { /* nothing to copy into */ }
        doc.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
    });
  });

  /* projects: filter + lightbox */
  var grid = doc.querySelector('.pgrid'), lb = doc.getElementById('lb');
  if (grid && lb) {
    var chips = [].slice.call(doc.querySelectorAll('.chip')), cards = [].slice.call(grid.querySelectorAll('.pitem'));
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-f');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        cards.forEach(function (it) { it.hidden = !(f === '*' || it.getAttribute('data-cat') === f); });
      });
    });
    var img = lb.querySelector('.lb-img'), ttl = lb.querySelector('.lb-title'), cnt = lb.querySelector('.lb-count'),
        prev = lb.querySelector('.lb-prev'), next = lb.querySelector('.lb-next'), set = [], idx = 0, opener = null, swiped = 0;
    var show = function (i) {
      idx = (i + set.length) % set.length; var p = set[idx];
      img.removeAttribute('srcset'); img.src = p.src; img.setAttribute('srcset', p.srcset); img.sizes = '100vw';
      img.width = p.w; img.height = p.h; img.alt = ttl.textContent + ', ' + (idx + 1) + ' / ' + set.length;
      cnt.textContent = (idx + 1) + ' / ' + set.length;
      prev.hidden = next.hidden = set.length < 2;
    };
    var open = function (btn) {
      opener = btn; set = JSON.parse(btn.getAttribute('data-photos')); ttl.textContent = btn.getAttribute('data-title'); show(0);
      root.classList.add('lb-open');
      if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    };
    var close = function () { if (typeof lb.close === 'function') lb.close(); else { lb.removeAttribute('open'); onClose(); } };
    var onClose = function () { root.classList.remove('lb-open'); if (opener) opener.focus(); };
    lb.addEventListener('close', onClose);
    grid.addEventListener('click', function (e) { var b = e.target.closest('.pcard'); if (b) open(b); });
    prev.addEventListener('click', function () { show(idx - 1); });
    next.addEventListener('click', function () { show(idx + 1); });
    lb.querySelector('.lb-x').addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (Date.now() - swiped < 400) return; if (e.target === lb || e.target.classList.contains('lb-fig')) close(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); else if (e.key === 'ArrowRight') show(idx + 1); });
    var x0 = null;
    lb.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    lb.addEventListener('pointerup', function (e) {
      if (x0 === null) return; var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50 && set.length > 1) { swiped = Date.now(); show(idx + (dx < 0 ? 1 : -1)); }
    });
    if (location.hash.indexOf('#p-') === 0) {
      var target = doc.getElementById(location.hash.slice(1));
      if (target) setTimeout(function () { target.scrollIntoView({ block: 'center' }); open(target.querySelector('.pcard')); }, 250);
    }
  }
})();
