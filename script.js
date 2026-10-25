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

  /* viewer (one dialog per page): the galleries "our work" on the Objects page (cards with data-photos) and every picture of an object page
     (links with data-gi = index into #gal data-photos; without JS the link simply opens the large JPEG). Arrows, keys, swipe, Esc, counter, caption, label. */
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
    var srcA = lb.querySelector('.lb-pic source[type="image/avif"]'), srcW = lb.querySelector('.lb-pic source[type="image/webp"]');
    /* which format the browser takes, so the neighbours are preloaded in the same one (a 1 px AVIF test picture) */
    var fmt = 'webp', probe = new Image();
    probe.onload = function () { if (probe.width > 0) fmt = 'avif'; };
    probe.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAJgAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAALm1kYXQSAAoIGAAGiAhoNCAyGBlHh4Yhh5555oAAAJBAyRxgjjLsT0ONgg==';
    var setSrc = function (el, v) { if (!el) return; if (v) el.setAttribute('srcset', v); else el.removeAttribute('srcset'); };
    var warm = function (p) { if (!p) return; var im = new Image(); im.sizes = '100vw'; im.srcset = (fmt === 'avif' && p.avif) || p.webp || p.srcset || p.jpg || ''; if (!im.srcset) im.src = p.src; };
    var show = function (i) {
      idx = (i + set.length) % set.length; var p = set[idx];
      /* the <source> elements first, then the img: the browser picks again from the new candidates */
      setSrc(srcA, p.avif); setSrc(srcW, p.webp || p.srcset);
      img.removeAttribute('srcset'); img.src = p.src; if (p.jpg) img.setAttribute('srcset', p.jpg);
      img.sizes = '100vw'; img.width = p.w; img.height = p.h;
      img.style.maxWidth = 'min(100%, ' + Math.round(p.w * 1.6) + 'px)';     /* a 566 px booklet photo is shown at most 1.6 times its size, not stretched over a wide screen */
      img.alt = p.cap || (ttl.textContent + ', ' + (idx + 1) + ' / ' + set.length);
      cnt.textContent = (idx + 1) + ' / ' + set.length;
      tag.textContent = p.tag || ''; tag.hidden = !p.tag;
      pcap.textContent = p.cap || ''; pcap.hidden = !p.cap;
      prev.hidden = next.hidden = set.length < 2;
      if (set.length > 1) { warm(set[(idx + 1) % set.length]); warm(set[(idx - 1 + set.length) % set.length]); }
    };
    var start = function (photos, title, rows, i, from) {
      opener = from; set = photos; ttl.textContent = title;
      meta.textContent = ''; note.textContent = ''; note.hidden = true;
      (rows || []).forEach(function (r) {
        if (!r[0]) { note.textContent = r[1]; note.hidden = false; return; }
        var d = doc.createElement('div'), dt = doc.createElement('dt'), dd = doc.createElement('dd');
        dt.textContent = r[0]; dd.textContent = r[1]; d.appendChild(dt); d.appendChild(dd); meta.appendChild(d);
      });
      meta.hidden = !meta.children.length; show(i || 0);
      root.classList.add('lb-open');
      if (typeof lb.showModal === 'function') { if (!lb.open) lb.showModal(); } else lb.setAttribute('open', '');
    };
    var open = function (btn) {
      var m = btn.getAttribute('data-meta');
      start(JSON.parse(btn.getAttribute('data-photos')), btn.getAttribute('data-title'), m ? JSON.parse(m) : [], 0, btn);
    };
    var gal = doc.getElementById('gal'), galSet = null;
    var openGal = function (i, from) {
      if (!gal) return;
      if (!galSet) galSet = JSON.parse(gal.getAttribute('data-photos'));
      start(galSet, gal.getAttribute('data-title'), [], i, from);
    };
    var close = function () { if (typeof lb.close === 'function') lb.close(); else { lb.removeAttribute('open'); onClose(); } };
    var onClose = function () { root.classList.remove('lb-open'); if (opener) opener.focus(); };
    lb.addEventListener('close', onClose);
    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button) return;
      var b = e.target.closest('.pgrid .pcard'); if (b) { open(b); return; }
      var g = e.target.closest('[data-gi]');
      if (g && gal && !e.ctrlKey && !e.metaKey && !e.shiftKey) { e.preventDefault(); openGal(+g.getAttribute('data-gi'), g); }
    });
    prev.addEventListener('click', function () { show(idx - 1); });
    next.addEventListener('click', function () { show(idx + 1); });
    lb.querySelector('.lb-x').addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (Date.now() - swiped < 400) return; if (e.target === lb || e.target.classList.contains('lb-fig')) close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1); else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Home') { e.preventDefault(); show(0); } else if (e.key === 'End') { e.preventDefault(); show(set.length - 1); }
    });
    var x0 = null, y0 = null;
    lb.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    lb.addEventListener('pointercancel', function () { x0 = null; });
    lb.addEventListener('pointerup', function (e) {
      if (x0 === null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && set.length > 1) { swiped = Date.now(); show(idx + (dx < 0 ? 1 : -1)); }
    });
    /* old links projekti/#c-<group> open that gallery; projekti/#p-<object> now lands on the object's row in the list */
    if (/^#c-/.test(location.hash)) {
      var target = doc.getElementById(location.hash.slice(1));
      if (target && target.querySelector('.pcard')) setTimeout(function () { target.scrollIntoView({ block: 'center' }); open(target.querySelector('.pcard')); }, 250);
    }
  }

  /* tabs (every role="tablist" of the page): the map areas of the Objects page (Rīga, Jūrmala, Germany) and the three directions band (home, Pakalpojumi).
     Click, Arrow keys, Home / End; the panels are hidden in the HTML except the first, so nothing jumps while the page loads */
  [].forEach.call(doc.querySelectorAll('[role="tablist"]'), function (list) {
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    var pick = function (tab, focus) {
      tabs.forEach(function (x) {
        var on = x === tab; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
        var pnl = doc.getElementById(x.getAttribute('aria-controls')); if (pnl) pnl.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (x, i) {
      x.addEventListener('click', function () { pick(x); });
      x.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (j === null) return; e.preventDefault(); pick(tabs[(j + tabs.length) % tabs.length], true);
      });
    });
    pick(tabs.filter(function (x) { return x.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
  });

  /* Objects page: a list row and its map pin light up together (hover or focus) */
  var hot = function (slug, on) { [].forEach.call(doc.querySelectorAll('[data-pin="' + slug + '"]'), function (el) { el.classList.toggle('hot', on); }); };
  [].forEach.call(doc.querySelectorAll('[data-pin]'), function (el) {
    var sl = el.getAttribute('data-pin');
    el.addEventListener('mouseenter', function () { hot(sl, true); });
    el.addEventListener('mouseleave', function () { hot(sl, false); });
    el.addEventListener('focusin', function () { hot(sl, true); });
    el.addEventListener('focusout', function () { hot(sl, false); });
  });

  /* Objects page: filter by type of work (chips; projekti/?veids=rekonstrukcija|jaunbuve|renovacija from the directions band). Empty years disappear,
     the year counts follow, the pins of other types fade; the address bar keeps the filter, so the page can be shared or reloaded as it is */
  var ol = doc.querySelector('.ol-list');
  if (ol) {
    var fch = [].slice.call(ol.querySelectorAll('.ofilters .chip')), orows = [].slice.call(ol.querySelectorAll('.orow')),
        oyears = [].slice.call(ol.querySelectorAll('.oyear')), opins = [].slice.call(doc.querySelectorAll('.mpin')),
        w1 = ol.getAttribute('data-obj1'), wn = ol.getAttribute('data-objs');
    var applyF = function (f, keep) {
      fch.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-f') === f ? 'true' : 'false'); });
      orows.forEach(function (r) { r.hidden = !(f === '*' || r.getAttribute('data-work') === f); });
      oyears.forEach(function (y) {
        var n = y.querySelectorAll('.orow:not([hidden])').length, sp = y.querySelector('.oyear-h span');
        y.hidden = !n; if (sp) sp.textContent = n + ' ' + (n === 1 ? w1 : wn);
      });
      opins.forEach(function (p) { p.classList.toggle('off', !(f === '*' || p.getAttribute('data-work') === f)); });
      if (keep && window.history && history.replaceState) {
        var q = f === '*' ? '' : '?veids=' + f;
        history.replaceState(null, '', location.pathname + q + location.hash);
      }
    };
    fch.forEach(function (c) { c.addEventListener('click', function () { applyF(c.getAttribute('data-f'), true); }); });
    var q0 = location.search.match(/[?&]veids=([\w-]+)/);
    if (q0 && fch.some(function (c) { return c.getAttribute('data-f') === q0[1]; })) applyF(q0[1], false);
  }
})();
