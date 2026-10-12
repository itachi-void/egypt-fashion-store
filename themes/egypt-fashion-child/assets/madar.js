/* Madar storefront interactions. Progressive enhancement only: every feature
 * leaves the native WooCommerce markup working when this file does not run. */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('mdr-js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* Header: solid background after scrolling. */
    var header = document.querySelector('[data-mdr-header]');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* Mobile menu. */
    var menuBtn = document.querySelector('.mdr-menu-toggle');
    var nav = document.getElementById('mdr-nav');
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', function () {
        var open = menuBtn.getAttribute('aria-expanded') !== 'true';
        menuBtn.setAttribute('aria-expanded', String(open));
        nav.classList.toggle('is-open', open);
      });
    }

    /* Search panel. */
    var searchBtn = document.querySelector('[data-mdr-search-toggle]');
    var search = document.getElementById('mdr-search');
    if (searchBtn && search) {
      searchBtn.addEventListener('click', function () {
        var open = search.hidden;
        search.hidden = !open;
        searchBtn.setAttribute('aria-expanded', String(open));
        if (open) search.querySelector('input[type=search]').focus();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !search.hidden) {
          search.hidden = true;
          searchBtn.setAttribute('aria-expanded', 'false');
          searchBtn.focus();
        }
      });
    }

    /* Drawers (native <dialog>). */
    document.querySelectorAll('[data-mdr-open]').forEach(function (btn) {
      var dialog = document.getElementById(btn.getAttribute('data-mdr-open'));
      if (!dialog || typeof dialog.showModal !== 'function') return;
      btn.addEventListener('click', function () { dialog.showModal(); });
    });
    document.querySelectorAll('dialog.mdr-drawer').forEach(function (dialog) {
      dialog.addEventListener('click', function (e) {
        if (e.target === dialog || e.target.closest('[data-mdr-close]')) dialog.close();
      });
    });

    /* Grid density toggle, remembered per browser. */
    var densityBtns = document.querySelectorAll('[data-mdr-density]');
    if (densityBtns.length) {
      var setDensity = function (value) {
        document.body.classList.toggle('mdr-density-large', value === 'large');
        densityBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b.getAttribute('data-mdr-density') === value));
        });
        try { localStorage.setItem('mdr-density', value); } catch (e) {}
      };
      var saved = 'dense';
      try { saved = localStorage.getItem('mdr-density') || 'dense'; } catch (e) {}
      setDensity(saved);
      densityBtns.forEach(function (b) {
        b.addEventListener('click', function () { setDensity(b.getAttribute('data-mdr-density')); });
      });
    }

    /* Scroll reveal. */
    var revealTargets = document.querySelectorAll(
      '.mdr-reveal, ul.products > li.product, ul.wc-block-product-template > li'
    );
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealTargets.forEach(function (el, i) {
        el.classList.add('mdr-will-reveal');
        el.style.setProperty('--mdr-delay', (i % 4) * 70 + 'ms');
        io.observe(el);
      });
      // Never leave content hidden if the observer does not fire.
      window.setTimeout(function () {
        revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
      }, 2500);
    }

    /* Variation swatches: buttons mirror the native selects, which stay the
     * source of truth for WooCommerce's variation script. */
    document.querySelectorAll('form.variations_form').forEach(function (form) {
      var variations = [];
      try { variations = JSON.parse(form.getAttribute('data-product_variations')) || []; } catch (e) {}
      var selects = Array.prototype.slice.call(form.querySelectorAll('.variations select'));
      if (!selects.length) return;

      function soldOut(select, value) {
        if (!Array.isArray(variations) || !variations.length) return false;
        var name = select.getAttribute('data-attribute_name') || select.name;
        var matches = variations.filter(function (v) {
          var attrs = v.attributes || {};
          if (attrs[name] && attrs[name] !== value) return false;
          return selects.every(function (other) {
            if (other === select || !other.value) return true;
            var key = other.getAttribute('data-attribute_name') || other.name;
            return !attrs[key] || attrs[key] === other.value;
          });
        });
        return matches.length > 0 && matches.every(function (v) { return !v.is_in_stock; });
      }

      function build() {
        selects.forEach(function (select) {
          var group = select._mdrGroup;
          if (!group) {
            group = document.createElement('div');
            group.className = 'mdr-swatches';
            group.setAttribute('role', 'group');
            var label = form.querySelector('label[for="' + select.id + '"]');
            if (label) group.setAttribute('aria-label', label.textContent.trim());
            select.parentNode.insertBefore(group, select);
            select.classList.add('mdr-native-select');
            select.setAttribute('tabindex', '-1');
            select.setAttribute('aria-hidden', 'true');
            select._mdrGroup = group;
          }
          group.innerHTML = '';
          Array.prototype.forEach.call(select.options, function (opt) {
            if (!opt.value) return;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'mdr-swatch';
            btn.textContent = opt.textContent;
            btn.setAttribute('aria-pressed', String(select.value === opt.value));
            if (opt.disabled) btn.disabled = true;
            if (soldOut(select, opt.value)) {
              btn.classList.add('is-soldout');
              btn.setAttribute('aria-label', opt.textContent + ' — غير متوفر');
            }
            btn.addEventListener('click', function () {
              var next = select.value === opt.value ? '' : opt.value;
              if (window.jQuery) window.jQuery(select).val(next).trigger('change');
              else {
                select.value = next;
                select.dispatchEvent(new Event('change', { bubbles: true }));
              }
              build();
              var again = select._mdrGroup.querySelector('[aria-pressed="true"]');
              if (again) again.focus();
            });
            group.appendChild(btn);
          });
        });
      }

      build();
      if (window.jQuery) {
        window.jQuery(form).on('woocommerce_update_variation_values reset_data', function () {
          window.setTimeout(build, 0);
        });
      }
    });

    /* Cart count bump when something is added. */
    function bump() {
      var badge = document.querySelector('.wc-block-mini-cart__button');
      if (!badge || reduceMotion) return;
      badge.classList.remove('mdr-bump');
      void badge.offsetWidth;
      badge.classList.add('mdr-bump');
    }
    document.body.addEventListener('wc-blocks_added_to_cart', bump);
    if (window.jQuery) window.jQuery(document.body).on('added_to_cart', bump);

    /* Interactive Motion Scroll Stage */
    var scrollScene = document.getElementById('motion-scroll');
    if (scrollScene) {
      var updateScrollScene = function () {
        var bounds = scrollScene.getBoundingClientRect();
        var maxScroll = Math.max(1, bounds.height - window.innerHeight);
        var progress = Math.max(0, Math.min(1, -bounds.top / maxScroll));
        scrollScene.style.setProperty('--scene-progress', progress);
      };
      window.addEventListener('scroll', updateScrollScene, { passive: true });
      window.addEventListener('resize', updateScrollScene);
      updateScrollScene();
    }

    /* Interactive Motion Trail */
    var trailSection = document.getElementById('motion-trail');
    if (trailSection) {
      var lastX = 0, lastY = 0, lastTime = 0;
      var trailImages = ['coat-camel', 'kids-adventure', 'suit-navy', 'knit-cream'];
      var imgBase = trailSection.getAttribute('data-img-base') || '';
      trailSection.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || reduceMotion) return;
        var bounds = trailSection.getBoundingClientRect();
        var x = e.clientX - bounds.left;
        var y = e.clientY - bounds.top;
        var now = Date.now();
        if (now - lastTime < 100 || Math.hypot(x - lastX, y - lastY) < 65) return;
        lastX = x; lastY = y; lastTime = now;
        var imgName = trailImages[Math.floor(now / 100) % trailImages.length];
        var img = document.createElement('img');
        img.className = 'motion-trail-image';
        img.src = imgBase + imgName + '.jpg';
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.style.left = x + 'px';
        img.style.top = y + 'px';
        img.style.setProperty('--trail-turn', (now % 24 - 12) + 'deg');
        trailSection.appendChild(img);
        window.setTimeout(function () {
          if (img.parentNode) img.parentNode.removeChild(img);
        }, 1100);
      });
    }
  });
})();
