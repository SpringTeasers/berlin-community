/* ==========================================================================
   Berlin Community Site — main.js
   Owner: Frontend Developer · project slug: berlin-community-site

   Deliberately tiny (~2 KB, no dependencies, no build step). Vanilla JS only.

   It does exactly three things, and the site is fully readable without any of
   them (the IA's "JS disabled" edge case, design/ia.md §9):

     1. Mobile drawer  — open / close, focus trap, Esc, focus returns to toggle
     2. Header state   — Home only: transparent over the hero, solid at 100px
     3. Active pill    — highlights the jump pill for the section in view

   Nothing animates on its own. Prefers-reduced-motion is honoured via CSS.
   ========================================================================== */

(function () {
  'use strict';

  /* Mark that JS is available so any future .no-js fallback can switch off. */
  document.documentElement.classList.remove('no-js');

  /* ---------------------------------------------------------------------
     1. Mobile drawer (C2)
     --------------------------------------------------------------------- */
  var toggle = document.getElementById('drawer-toggle');
  var drawer = document.getElementById('mobile-drawer');
  var closeBtn = document.getElementById('drawer-close');

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusableIn(el) {
    return Array.prototype.slice.call(el.querySelectorAll(FOCUSABLE))
      .filter(function (node) {
        return node.offsetParent !== null || node === document.activeElement;
      });
  }

  function openDrawer() {
    if (!drawer || !toggle) { return; }
    drawer.setAttribute('data-open', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = focusableIn(drawer)[0];
    if (first) { first.focus(); }
  }

  function closeDrawer(returnFocus) {
    if (!drawer || !toggle) { return; }
    drawer.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (returnFocus !== false) { toggle.focus(); }
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      if (drawer.getAttribute('data-open') === 'true') {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () { closeDrawer(); });
  }

  /* Any link inside the drawer closes it and hands focus back to the toggle. */
  if (drawer) {
    drawer.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a') : null;
      if (link) { closeDrawer(false); }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (!drawer || drawer.getAttribute('data-open') !== 'true') { return; }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
      return;
    }

    /* Focus trap: keep Tab inside the drawer while it is open. */
    if (event.key === 'Tab') {
      var items = focusableIn(drawer);
      if (items.length === 0) { return; }
      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------------------------------------------------------------------
     2. Header state on Home (transparent over the hero → solid at 100px)
        Inner pages ship the header solid from the start, so this only ever
        matches the element that carries .header--transparent.
     --------------------------------------------------------------------- */
  var header = document.getElementById('site-header');
  var transparentHeader = header && header.classList.contains('header--transparent');

  if (transparentHeader) {
    var SCROLL_AT = 100;
    var pillRow = document.querySelector('.jump-pills');

    var syncHeader = function () {
      if (window.scrollY > SCROLL_AT) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    };

    var onScroll = function () {
      syncHeader();
      syncPills();
    };

    /* -----------------------------------------------------------------
       3. Active jump pill — the section currently in view.
          Anchors work with no JS; this is the progressive enhancement only.
       ----------------------------------------------------------------- */
    function syncPills() {
      if (!pillRow) { return; }
      var pills = Array.prototype.slice.call(pillRow.querySelectorAll('.jump-pill'));
      if (!pills.length) { return; }

      var offset = (parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10
      ) || 64) + 24;

      var current = null;
      pills.forEach(function (pill) {
        var id = (pill.getAttribute('href') || '').replace('#', '');
        var section = id ? document.getElementById(id) : null;
        if (!section) { return; }
        if (section.getBoundingClientRect().top - offset <= 0) { current = pill; }
      });

      pills.forEach(function (pill) {
        if (pill === current) {
          pill.setAttribute('aria-current', 'true');
        } else {
          pill.removeAttribute('aria-current');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncPills);
    syncHeader();
    syncPills();
  } else if (document.querySelector('.jump-pills')) {
    /* Inner pages: no transparent header, but still highlight the pill. */
    var pillsRow = document.querySelector('.jump-pills');
    var updatePills = function () {
      var pills = Array.prototype.slice.call(pillsRow.querySelectorAll('.jump-pill'));
      if (!pills.length) { return; }
      var offset = (parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10
      ) || 64) + 24;
      var current = null;
      pills.forEach(function (pill) {
        var id = (pill.getAttribute('href') || '').replace('#', '');
        var section = id ? document.getElementById(id) : null;
        if (!section) { return; }
        if (section.getBoundingClientRect().top - offset <= 0) { current = pill; }
      });
      pills.forEach(function (pill) {
        if (pill === current) {
          pill.setAttribute('aria-current', 'true');
        } else {
          pill.removeAttribute('aria-current');
        }
      });
    };
    window.addEventListener('scroll', updatePills, { passive: true });
    window.addEventListener('resize', updatePills);
    updatePills();
  }

  /* ---------------------------------------------------------------------
     Footer year — kept honest rather than hard-coded.
     --------------------------------------------------------------------- */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
})();
