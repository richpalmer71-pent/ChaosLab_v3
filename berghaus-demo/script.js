/* ============================================================================
   BERGHAUS — Explore
   No dependencies. Every behaviour is an isolated init() so you can add to the
   hero motion later without touching anything else.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- header */
  function initHeader() {
    var hdr = $('.hdr');
    var burger = $('[data-burger]');
    if (!hdr || !burger) return;

    burger.addEventListener('click', function () {
      var open = hdr.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });

    $$('.hdr__nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        hdr.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hdr.classList.contains('is-open')) {
        hdr.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* --------------------------------------------------- optional image layers
     The cut-out figure layers are optional: if the PNG has not been dropped in
     yet the layer removes itself rather than showing a broken image.          */
  function initOptionalImages() {
    $$('img[data-optional]').forEach(function (img) {
      var fail = function () { img.hidden = true; };
      if (img.complete && img.naturalWidth === 0) fail();
      img.addEventListener('error', fail);
    });

    /* product shots fall back to a pack we do have until the render lands.
       The script is deferred, so a missing file may already have failed by
       the time we get here — check for that as well as listening.           */
    $$('.pack__img, .card__media img').forEach(function (img) {
      var fallback = img.dataset.fallback || 'assets/pack-mtn-black.png';
      var swap = function () {
        if (img.src.indexOf(fallback) !== -1) return;
        img.src = fallback;
      };
      if (img.complete && img.naturalWidth === 0) swap();
      img.addEventListener('error', swap);
      window.addEventListener('load', function () {
        if (img.complete && img.naturalWidth === 0) swap();
      });
    });
  }

  /* ------------------------------------------------------ small interactions */
  function initToggles() {
    $$('[data-wishlist]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.classList.toggle('is-on');
        btn.setAttribute('aria-pressed', String(btn.classList.contains('is-on')));
      });
    });

    $$('.swatches').forEach(function (list) {
      list.addEventListener('click', function (e) {
        var li = e.target.closest('li');
        if (!li || li.classList.contains('is-oos')) return;
        $$('li', list).forEach(function (n) { n.classList.remove('is-active'); });
        li.classList.add('is-active');
      });
    });

    var year = $('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------ colourway switch
     The pack section is one product; the arrows cross-fade the main shot
     between its colourways and relabel the meta row. Add another <img
     class="pack__img" data-colourway="…"> and it joins the rotation.        */
  function initColourways() {
    var stage = $('[data-colourways]');
    if (!stage) return;

    var shots = $$('.pack__img', stage);
    var prev  = $('[data-prev]');
    var next  = $('[data-next]');
    var label = $('[data-colourway-label]');
    if (shots.length < 2) {
      [prev, next].forEach(function (n) { if (n) n.hidden = true; });
      return;
    }

    var index = Math.max(0, shots.findIndex(function (s) { return s.classList.contains('is-active'); }));

    function show(i) {
      index = (i + shots.length) % shots.length;
      shots.forEach(function (s, n) {
        s.classList.toggle('is-active', n === index);
        s.setAttribute('aria-hidden', String(n !== index));
      });
      if (label) label.textContent = shots[index].dataset.colourway || label.textContent;
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); });
    if (next) next.addEventListener('click', function () { show(index + 1); });

    stage.closest('.packs').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
    });

    show(index);
  }

  /* --------------------------------------------------------------- parallax
     Every layer inside a [data-parallax] scene can carry:
       data-depth="0.3"        drift, as a fraction of the section height
       data-pin="0.46"         hold still at this fraction of the viewport
                               while the scene scrolls past behind it
       data-fade="0.05,0.62"   fade 1→0 between these two progress values
     progress runs -1 (scene below the fold) → 0 (centred) → 1 (scene above).  */
  function initParallax() {
    if (reduceMotion) return;

    var scenes = $$('[data-parallax]').map(function (scene) {
      return { el: scene, layers: $$('[data-depth],[data-pin],[data-fade]', scene) };
    });
    if (!scenes.length) return;

    var ticking = false;

    function frame() {
      ticking = false;
      var vh = window.innerHeight;

      scenes.forEach(function (scene) {
        var r = scene.el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) return;

        var progress = (vh / 2 - (r.top + r.height / 2)) / ((vh + r.height) / 2);
        progress = Math.max(-1, Math.min(1, progress));

        scene.layers.forEach(function (layer) {
          var shift = 0;

          if (layer.dataset.pin !== undefined) {
            /* hold the layer at a fixed point in the viewport, but never let
               it wander more than half a section away from where it belongs */
            var anchor  = parseFloat(layer.dataset.pin) || 0.46;
            var natural = r.top + layer.offsetTop + layer.offsetHeight / 2;
            var limit   = r.height * 0.5;
            shift = Math.max(-limit, Math.min(limit, anchor * vh - natural));
          } else {
            var depth = parseFloat(layer.dataset.depth) || 0;
            shift = progress * depth * r.height * 0.5;
          }

          if (layer.dataset.fade !== undefined) {
            var f  = (layer.dataset.fade || '0.1,0.8').split(',').map(parseFloat);
            var t  = (progress - f[0]) / Math.max(0.001, f[1] - f[0]);
            t = Math.max(0, Math.min(1, t));
            layer.style.opacity = String(1 - t * t * (3 - 2 * t));   /* smoothstep */
          }

          var base = layer.classList.contains('scene__word') ? 'translateX(-50%) ' : '';
          layer.style.transform = base + 'translate3d(0,' + shift.toFixed(2) + 'px,0)';
        });
      });
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  }

  /* ----------------------------------------------------------- reveal on scroll */
  function initReveal() {
    var targets = $$('.essentials, .cats, .packs, .featured');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      targets.forEach(function (t) { t.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* -------------------------------------------------------------------- go */
  function boot() {
    initHeader();
    initOptionalImages();
    initToggles();
    initColourways();
    initParallax();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
