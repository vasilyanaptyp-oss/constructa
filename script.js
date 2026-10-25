(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  /* all visible words come from the page itself (data-* attributes written by build.py from content.py), so this file has no language of its own */

  /* header: solid after the hero top, mobile menu */
  var hdr = doc.getElementById('hdr'), burger = hdr.querySelector('.burger'), mnav = doc.getElementById('mnav');
  var ld = doc.querySelector('.lang-dd'), ldt = ld && ld.querySelector('.lang-t');
  function solid() { hdr.classList.toggle('solid', window.scrollY > 30); }
  solid(); window.addEventListener('scroll', solid, { passive: true });
  function setLang(open) {
    if (!ld) return;
    ld.classList.toggle('open', open); ldt.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function setMenu(open) {
    if (open) setLang(false);
    hdr.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? burger.getAttribute('data-l-close') : burger.getAttribute('data-l-open'));
  }
  burger.addEventListener('click', function () { setMenu(!hdr.classList.contains('open')); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hdr.classList.contains('open')) { setMenu(false); burger.focus(); } });
  doc.addEventListener('click', function (e) { if (hdr.classList.contains('open') && !hdr.contains(e.target)) setMenu(false); });

  /* phones: language button in the header opens a short list (desktop shows LV EN DE inline instead; the mobile menu has its own row) */
  if (ldt) {
    ldt.addEventListener('click', function (e) { e.stopPropagation(); if (!ld.classList.contains('open')) setMenu(false); setLang(!ld.classList.contains('open')); });
    doc.addEventListener('click', function (e) { if (!ld.contains(e.target)) setLang(false); });
    ld.addEventListener('focusout', function (e) { if (e.relatedTarget && !ld.contains(e.relatedTarget)) setLang(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ld.classList.contains('open')) { setLang(false); ldt.focus(); } });
  }

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
    var err = form.querySelector('.f-err'), ok = form.querySelector('.f-ok'), sel = form.elements.svc;
    var q = location.search.match(/[?&]pakalpojums=([\w-]+)/);
    if (q && sel && sel.querySelector('option[value="' + q[1] + '"]')) sel.value = q[1];
    var g = function (k) { return form.getAttribute('data-' + k); };
    var M = { name: g('e-name'), contact: g('e-contact'), msg: g('e-msg'), subj: g('subj'), n: g('ln'), c: g('lc'), s: g('ls') };   /* texts: content.py e_name, e_contact, e_msg, subj, lab_n, lab_c, lab_s */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, name = f.name.value.trim(), contact = f.contact.value.trim(), msg = f.msg.value.trim();
      [f.name, f.contact, f.msg].forEach(function (x) { x.removeAttribute('aria-invalid'); });
      var okContact = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact) || contact.replace(/\D/g, '').length >= 7;
      var bad = name.length < 2 ? [f.name, M.name] : (!okContact ? [f.contact, M.contact] : (msg.length < 5 ? [f.msg, M.msg] : null));
      if (bad) { bad[0].setAttribute('aria-invalid', 'true'); err.textContent = bad[1]; err.hidden = false; if (ok) ok.hidden = true; bad[0].focus(); return; }
      err.hidden = true;
      var svc = sel && sel.value ? sel.options[sel.selectedIndex].text : '';
      var body = M.n + name + '\n' + M.c + contact + (svc ? '\n' + M.s + svc : '') + '\n\n' + msg;
      var url = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + encodeURIComponent(M.subj) + '&body=' + encodeURIComponent(body);
      window.__mailto = url;
      /* the mail program may be missing (webmail users): say so, with the fallback address and phone */
      if (ok) { ok.textContent = ok.getAttribute('data-t'); ok.hidden = false; }
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

  /* projects: filter (the team's objects only) + lightbox (every card of the page: our work and the objects) */
  var lb = doc.getElementById('lb');
  if (lb) {
    var chips = [].slice.call(doc.querySelectorAll('.filters .chip')), cards = [].slice.call(doc.querySelectorAll('.pgrid-p .pitem'));
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-f');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        cards.forEach(function (it) { it.hidden = !(f === '*' || it.getAttribute('data-cat') === f); });
      });
    });
    var img = lb.querySelector('.lb-img'), ttl = lb.querySelector('.lb-title'), cnt = lb.querySelector('.lb-count'),
        prev = lb.querySelector('.lb-prev'), next = lb.querySelector('.lb-next'), tag = lb.querySelector('.lb-tag'),
        pcap = lb.querySelector('.lb-pcap'), meta = lb.querySelector('.lb-meta'), note = lb.querySelector('.lb-note'), set = [], idx = 0, opener = null, swiped = 0;
    var show = function (i) {
      idx = (i + set.length) % set.length; var p = set[idx];
      img.removeAttribute('srcset'); img.src = p.src; img.setAttribute('srcset', p.srcset); img.sizes = '100vw';
      img.width = p.w; img.height = p.h; img.alt = p.cap || (ttl.textContent + ', ' + (idx + 1) + ' / ' + set.length);
      cnt.textContent = (idx + 1) + ' / ' + set.length;
      tag.textContent = p.tag || ''; tag.hidden = !p.tag;
      pcap.textContent = p.cap || ''; pcap.hidden = !p.cap;
      prev.hidden = next.hidden = set.length < 2;
    };
    var open = function (btn) {
      opener = btn; set = JSON.parse(btn.getAttribute('data-photos')); ttl.textContent = btn.getAttribute('data-title');
      var m = btn.getAttribute('data-meta'), rows = m ? JSON.parse(m) : []; meta.textContent = ''; note.textContent = ''; note.hidden = true;
      rows.forEach(function (r) {
        if (!r[0]) { note.textContent = r[1]; note.hidden = false; return; }
        var d = doc.createElement('div'), dt = doc.createElement('dt'), dd = doc.createElement('dd');
        dt.textContent = r[0]; dd.textContent = r[1]; d.appendChild(dt); d.appendChild(dd); meta.appendChild(d);
      });
      meta.hidden = !meta.children.length; show(0);
      root.classList.add('lb-open');
      if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    };
    var close = function () { if (typeof lb.close === 'function') lb.close(); else { lb.removeAttribute('open'); onClose(); } };
    var onClose = function () { root.classList.remove('lb-open'); if (opener) opener.focus(); };
    lb.addEventListener('close', onClose);
    doc.addEventListener('click', function (e) { var b = e.target.closest('.pgrid .pcard'); if (b) open(b); });
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
    /* links from the home page: projekti/#p-<object> and projekti/#c-<group> open that card */
    if (/^#[pc]-/.test(location.hash)) {
      var target = doc.getElementById(location.hash.slice(1));
      if (target && target.querySelector('.pcard')) setTimeout(function () { target.scrollIntoView({ block: 'center' }); open(target.querySelector('.pcard')); }, 250);
    }
  }
})();
