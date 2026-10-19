(function () {
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  function setMenu(open) {
    if (!burger || !mnav) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mnav.classList.toggle('open', open);
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1040) setMenu(false);
    });
  }

  var form = document.getElementById('mailform');
  if (!form) return;
  function mark(input, bad) {
    input.closest('.field').classList.toggle('bad', bad);
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }
  function validContact(v) {
    v = v.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return true;
    var digits = v.replace(/[^\d]/g, '');
    return /^[+\d][\d\s()\-+]*$/.test(v) && digits.length >= 7 && digits.length <= 15;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.elements.name, contact = form.elements.contact, msg = form.elements.msg;
    var okName = name.value.trim().length >= 2;
    var okContact = validContact(contact.value);
    var okMsg = msg.value.trim().length >= 3;
    mark(name, !okName); mark(contact, !okContact); mark(msg, !okMsg);
    if (!(okName && okContact && okMsg)) {
      var first = form.querySelector('.field.bad input, .field.bad textarea');
      if (first) first.focus();
      return;
    }
    var d = form.dataset;
    var body = d.bName + ': ' + name.value.trim() + '\n' +
               d.bContact + ': ' + contact.value.trim() + '\n\n' +
               msg.value.trim();
    var href = 'mailto:' + d.to + '?subject=' + encodeURIComponent(d.subject) + '&body=' + encodeURIComponent(body);
    window.location.href = href;
  });
  ['name', 'contact', 'msg'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () {
      if (this.closest('.field').classList.contains('bad')) mark(this, false);
    });
  });
})();
