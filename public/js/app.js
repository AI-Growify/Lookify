/* ============================================================================
   Lookify — client controller
   ----------------------------------------------------------------------------
   Wires the server-rendered markup to its interactions. The views expose two
   kinds of hooks (added when the original design-tool bindings were converted
   to plain HTML):

     data-ref="key"      -> an element the controller needs a handle to
     data-action="name"  -> a click/submit that triggers a controller method

   Plus three declarative style attributes preserved from the source design:

     style-hover  / style-active / style-focus

   Everything here is vanilla JS — no framework, no build step.
   ============================================================================ */
(function () {
  'use strict';

  /* ---- 1. Resolve refs + actions ----------------------------------------- */
  var refs = {};
  document.querySelectorAll('[data-ref]').forEach(function (el) {
    refs[el.getAttribute('data-ref')] = el;
  });

  /* ---- 2. Declarative hover / active / focus styling --------------------- */
  // Reads the extra style-* attributes and applies them on the matching event,
  // restoring the base inline style afterwards. Mirrors the original runtime.
  function parseStyle(str) {
    var out = {};
    (str || '').split(';').forEach(function (rule) {
      var i = rule.indexOf(':');
      if (i > -1) out[rule.slice(0, i).trim()] = rule.slice(i + 1).trim();
    });
    return out;
  }
  document.querySelectorAll('[style-hover],[style-active],[style-focus]').forEach(function (el) {
    var hover = parseStyle(el.getAttribute('style-hover'));
    var active = parseStyle(el.getAttribute('style-active'));
    var focus = parseStyle(el.getAttribute('style-focus'));
    var base = el.getAttribute('style') || '';

    function apply(map) { for (var k in map) el.style.setProperty(k, map[k]); }
    function reset() { el.setAttribute('style', base); }

    if (Object.keys(hover).length) {
      el.addEventListener('pointerenter', function () { apply(hover); });
      el.addEventListener('pointerleave', reset);
    }
    if (Object.keys(active).length) {
      el.addEventListener('pointerdown', function () { apply(active); });
      el.addEventListener('pointerup', reset);
      el.addEventListener('pointercancel', reset);
    }
    if (Object.keys(focus).length) {
      el.addEventListener('focus', function () { apply(focus); });
      el.addEventListener('blur', reset);
    }
  });

  /* ---- 3. Nav: solid-on-scroll ------------------------------------------- */
  var nav = document.querySelector('nav');
  var navSolid = false;
  function onScroll() {
    var solid = (window.scrollY || 0) > 40;
    if (solid === navSolid || !nav) return;
    navSolid = solid;
    nav.style.background = solid ? 'rgba(250,248,245,0.82)' : 'rgba(250,248,245,0.5)';
    nav.style.borderBottom = solid
      ? '1px solid rgba(255,255,255,0.7)'
      : '1px solid rgba(255,255,255,0.5)';
    nav.style.boxShadow = solid
      ? '0 8px 30px rgba(86,64,110,0.1)'
      : '0 4px 20px rgba(86,64,110,0.05)';
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- 4. Before / after comparison sliders ------------------------------ */
  // Each [data-slider] holds a [data-clip] (before image) and [data-handle].
  function setSlider(el, v) {
    v = Math.max(2, Math.min(98, v));
    var clip = el.querySelector('[data-clip]');
    var handle = el.querySelector('[data-handle]');
    var inset = 'inset(0 ' + (100 - v).toFixed(2) + '% 0 0)';
    if (clip) { clip.style.clipPath = inset; clip.style.webkitClipPath = inset; }
    if (handle) handle.style.left = v.toFixed(2) + '%';
  }
  function initSlider(el) {
    var active = false, sx = 0, sy = 0, known = false, horiz = false, pid = -1;
    function fromEvent(e) {
      var r = el.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    }
    el.addEventListener('pointerdown', function (e) {
      active = true; known = false; horiz = false; sx = e.clientX; sy = e.clientY; pid = e.pointerId;
      if (e.pointerType === 'mouse') {
        known = true; horiz = true;
        try { el.setPointerCapture(pid); } catch (x) {}
        setSlider(el, fromEvent(e));
      }
    });
    el.addEventListener('pointermove', function (e) {
      if (!active) return;
      if (!known) {
        var dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
        if (dx < 5 && dy < 5) return;          // dead zone
        known = true; horiz = dx > dy;
        if (horiz) { try { el.setPointerCapture(pid); } catch (x) {} }
        else { active = false; return; }       // vertical -> let page scroll
      }
      if (!horiz) return;
      if (e.cancelable) e.preventDefault();
      setSlider(el, fromEvent(e));
    }, { passive: false });
    function up() { active = false; known = false; }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }
  document.querySelectorAll('[data-slider]').forEach(initSlider);

  /* ---- 5. Hero hover-reveal lens (desktop) ------------------------------- */
  var REVEAL_RADIUS = 150;
  (function initHero() {
    var hero = refs.hero, after = refs.after, lens = refs.lens, hint = refs.hint;
    if (after) after.style.setProperty('--lr', REVEAL_RADIUS + 'px');
    if (lens) {
      var d = Math.round(REVEAL_RADIUS * 1.24);
      lens.style.width = d + 'px'; lens.style.height = d + 'px';
      lens.style.marginLeft = (-d / 2) + 'px'; lens.style.marginTop = (-d / 2) + 'px';
    }
    function setHero(x, y, on) {
      if (after) {
        after.style.setProperty('--mx', x + 'px');
        after.style.setProperty('--my', y + 'px');
        after.style.opacity = on ? '1' : '0';
      }
      if (lens) { lens.style.transform = 'translate(' + x + 'px,' + y + 'px)'; lens.style.opacity = on ? '1' : '0'; }
      if (hint) hint.style.opacity = on ? '0' : '1';
    }
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var on = (x / r.width) > 0.40 && x > 0 && x < r.width && y > 0 && y < r.height;
        setHero(x, y, on);
      });
      hero.addEventListener('pointerleave', function () { setHero(0, 0, false); });
      // Auto-tease so visitors notice the effect.
      setTimeout(function () {
        var r = hero.getBoundingClientRect();
        var cx = r.width * 0.79, cy = r.height * 0.52;
        setHero(cx, cy, true);
        setTimeout(function () { setHero(cx, cy, false); }, 1900);
      }, 1300);
    }
  })();

  /* ---- 6. Mobile hero auto cross-fade ------------------------------------ */
  (function initMobileHero() {
    var mhero = refs.mhero, mafter = refs.mafter;
    if (!mafter) return;
    var on = false, t;
    function loop() {
      if (!on) return;
      mafter.style.transition = 'opacity 1.5s ease-in-out';
      mafter.style.opacity = '1';
      t = setTimeout(function () {
        mafter.style.opacity = '0';
        t = setTimeout(loop, 1500 + 1500);
      }, 1500 + 1900);
    }
    function play() { if (on) return; on = true; clearTimeout(t); t = setTimeout(loop, 1100); }
    function stop() { on = false; clearTimeout(t); }
    if (mhero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? play() : stop(); });
      }, { threshold: 0.3 }).observe(mhero);
    } else { play(); }
  })();

  /* ---- 7. "How it works" demo carousel ----------------------------------- */
  (function initDemo() {
    var captions = [
      'A shopper taps Virtual Try-On',
      'The try-on opens \u2014 add a photo',
      'Their photo is added',
      'AI fits the garment in seconds',
      'The look, on them \u2014 ready to buy'
    ];
    var durations = [2600, 2400, 2200, 3000, 3200];
    var idx = 0;

    function applyStage(st) {
      if (!st) return;
      var active = idx >= 1;
      var mobile = st.hasAttribute('data-mobile');
      var blur = st.querySelector('[data-blur]');
      if (blur) blur.style.opacity = active ? '1' : '0';
      var cur = st.querySelector('[data-cursor]');
      if (cur) cur.style.display = (idx === 0) ? 'block' : 'none';
      var w = st.querySelector('[data-widget]');
      if (w) {
        w.style.transform = active
          ? (mobile ? 'translateY(0)' : 'translateX(0)')
          : (mobile ? 'translateY(101%)' : 'translateX(112%)');
        w.style.opacity = active ? '1' : '0';
      }
      var steps = st.querySelectorAll('[data-wstep]');
      for (var k = 0; k < steps.length; k++) steps[k].style.display = (k === idx - 1) ? 'flex' : 'none';
    }
    function applyCapDots(cap, dc) {
      if (cap) cap.textContent = captions[idx];
      if (dc) {
        var dots = dc.querySelectorAll('[data-demo-dot]');
        for (var i = 0; i < dots.length; i++) {
          var hot = i === idx;
          dots[i].style.background = hot ? '#EA8E6E' : '#E4DED8';
          dots[i].style.width = hot ? '20px' : '7px';
        }
      }
    }
    function render() {
      applyStage(refs.stage); applyStage(refs.mstage);
      applyCapDots(refs.caption, refs.dots);
      applyCapDots(refs.mcaption, refs.mdots);
    }
    (function tick() {
      render();
      setTimeout(function () { idx = (idx + 1) % 5; tick(); }, durations[idx]);
    })();
  })();

  /* ---- 8. Mobile menu ---------------------------------------------------- */
  var menuOpen = false;
  function setMenu(open) {
    menuOpen = open;
    var m = refs.mmenu, p = refs.mpanel, b = refs.burger;
    if (m) { m.style.opacity = open ? '1' : '0'; m.style.visibility = open ? 'visible' : 'hidden'; }
    if (p) { p.style.transform = open ? 'translateY(0)' : 'translateY(-14px)'; p.style.opacity = open ? '1' : '0'; }
    if (b && b.children.length >= 3) {
      var s = b.children;
      if (open) {
        s[0].style.top = '6px'; s[0].style.transform = 'rotate(45deg)';
        s[1].style.opacity = '0';
        s[2].style.top = '6px'; s[2].style.transform = 'rotate(-45deg)';
      } else {
        s[0].style.top = '0'; s[0].style.transform = 'none';
        s[1].style.opacity = '1';
        s[2].style.top = '12px'; s[2].style.transform = 'none';
      }
    }
    document.body.style.overflow = open ? 'hidden' : '';
  }

  /* ---- 9. Modals (demo + contact) ---------------------------------------- */
  var demoOpen = false, contactOpen = false;

  function toggleModal(open, modalRef, panelRef, formRef, successRef, firstFieldRef, errRef) {
    var m = refs[modalRef], p = refs[panelRef];
    if (m) { m.style.opacity = open ? '1' : '0'; m.style.visibility = open ? 'visible' : 'hidden'; }
    if (p) {
      p.style.transform = open ? 'scale(1) translateY(0)' : 'scale(.94) translateY(10px)';
      p.style.opacity = open ? '1' : '0';
    }
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      if (refs[formRef]) refs[formRef].style.display = 'block';
      if (refs[successRef]) refs[successRef].style.display = 'none';
      if (errRef && refs[errRef]) refs[errRef].style.opacity = '0';
      // Clear all inputs/textareas inside the form panel and reset border states.
      if (refs[formRef]) {
        refs[formRef].querySelectorAll('input, textarea').forEach(function (el) {
          el.value = '';
          el.style.borderColor = '#E6DFD8';
          el.style.boxShadow = 'none';
        });
      }
      setTimeout(function () { if (refs[firstFieldRef]) refs[firstFieldRef].focus(); }, 400);
    }
  }
  function setDemoModal(open) {
    demoOpen = open;
    toggleModal(open, 'modal', 'modalPanel', 'formView', 'successView', 'fName', 'formErr');
  }
  function setContactModal(open) {
    contactOpen = open;
    toggleModal(open, 'cModal', 'cPanel', 'cfForm', 'cfSucc', 'cfName', 'cfErr');
  }

  /* ---- 10. Form validation + submission ---------------------------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

  function mark(el, bad) {
    if (!el) return;
    el.style.borderColor = bad ? '#D98A6E' : '#E6DFD8';
    el.style.boxShadow = bad ? '0 0 0 3px rgba(217,138,110,.18)' : 'none';
  }

  function submitDemo(e) {
    if (e && e.preventDefault) e.preventDefault();
    var allKeys = ['fName', 'fEmail', 'fCompany', 'fPhone', 'fMsg'];
    allKeys.forEach(function (k) { mark(refs[k], false); });
    var get = function (k) { return refs[k] ? refs[k].value.trim() : ''; };
    var bad = [];
    var msgs = [];

    if (!get('fName'))                        { bad.push('fName');    msgs.push('Full Name is required.'); }
    if (!EMAIL_RE.test(get('fEmail')))        { bad.push('fEmail');   msgs.push('Please enter a valid work email.'); }
    if (!get('fCompany'))                     { bad.push('fCompany'); msgs.push('Company / Brand Name is required.'); }
    if (!get('fPhone'))                       { bad.push('fPhone');   msgs.push('Phone Number is required.'); }
    else if (!PHONE_RE.test(get('fPhone')))   { bad.push('fPhone');   msgs.push('Please enter a valid phone number.'); }
    if (!get('fMsg'))                         { bad.push('fMsg');     msgs.push('Please tell us what you\'re looking for.'); }

    var err = refs.formErr;
    if (bad.length) {
      bad.forEach(function (k) { mark(refs[k], true); });
      if (err) { err.textContent = msgs[0]; err.style.opacity = '1'; }
      return;
    }
    if (err) err.style.opacity = '0';
    post('/api/demo', {
      name: get('fName'), email: get('fEmail'),
      company: get('fCompany'), phone: get('fPhone'), message: get('fMsg')
    }, function () {
      if (refs.formView) refs.formView.style.display = 'none';
      if (refs.successView) refs.successView.style.display = 'block';
    });
  }

  function submitContact(e) {
    if (e && e.preventDefault) e.preventDefault();
    var allKeys = ['cfName', 'cfCompany', 'cfEmail', 'cfPhone', 'cfMsg'];
    allKeys.forEach(function (k) { mark(refs[k], false); });
    var get = function (k) { return refs[k] ? refs[k].value.trim() : ''; };
    var bad = [];
    var msgs = [];

    if (!get('cfName'))                         { bad.push('cfName');    msgs.push('Name is required.'); }
    if (!get('cfCompany'))                      { bad.push('cfCompany'); msgs.push('Company / Brand Name is required.'); }
    if (!EMAIL_RE.test(get('cfEmail')))         { bad.push('cfEmail');   msgs.push('Please enter a valid email address.'); }
    if (!get('cfPhone'))                        { bad.push('cfPhone');   msgs.push('Phone Number is required.'); }
    else if (!PHONE_RE.test(get('cfPhone')))    { bad.push('cfPhone');   msgs.push('Please enter a valid phone number.'); }
    if (!get('cfMsg'))                          { bad.push('cfMsg');     msgs.push('Please enter a message.'); }

    var err = refs.cfErr;
    if (bad.length) {
      bad.forEach(function (k) { mark(refs[k], true); });
      if (err) { err.textContent = msgs[0]; err.style.opacity = '1'; }
      return;
    }
    if (err) err.style.opacity = '0';
    post('/api/contact', {
      name: get('cfName'), company: get('cfCompany'),
      email: get('cfEmail'), phone: get('cfPhone'), message: get('cfMsg')
    }, function () {
      if (refs.cfForm) refs.cfForm.style.display = 'none';
      if (refs.cfSucc) refs.cfSucc.style.display = 'block';
    });
  }

  // POST helper.
  function post(url, body, onDone) {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function () { onDone(); })
      .catch(function () { onDone(); });
  }

  /* ---- 11. Action dispatch ----------------------------------------------- */
  var actions = {
    toggleMenu: function () { setMenu(!menuOpen); },
    closeMenu: function () { setMenu(false); },
    openModal: function (e) { if (e) e.preventDefault(); setMenu(false); setDemoModal(true); },
    closeModal: function () { setDemoModal(false); },
    openContactModal: function (e) { if (e) e.preventDefault(); setMenu(false); setContactModal(true); },
    closeContactModal: function () { setContactModal(false); },
    submitForm: submitDemo,
    submitContactMsg: submitContact,
    onMain: function () {}, onA: function () {}, onB: function () {} // sliders use pointer init
  };

  // Single click delegation — submit buttons have data-action so they trigger here.
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var name = el.getAttribute('data-action');
    if (actions[name]) actions[name](e);
  });

  /* ---- 12. Escape closes the top-most overlay ---------------------------- */
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (contactOpen) setContactModal(false);
    else if (demoOpen) setDemoModal(false);
    else if (menuOpen) setMenu(false);
  });

  /* ---- 13. Smooth in-page anchor scrolling ------------------------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('data-action')) return;
    var id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    var target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      setMenu(false);
    }
  });

  // Set initial nav state in case the page loads already scrolled.
  onScroll();
})();
