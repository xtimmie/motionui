/* ═══════════════════════════════════════════════════════════
   MOTIONUI — JS
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const prefersReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────────────────
     PALETTE GENERATOR
     ───────────────────────────────────────────────────────── */
  const Palette = {
    currentHue: 250,
    currentSat: 50,   // 0–100, matches meowify theme_sat
    currentBri: 1.0,  // 0.5–2.0, matches meowify theme_bri

    chromaFor(tone, base) {
      if (tone <=  0) return 0;
      if (tone <= 10) return base * 0.20;
      if (tone <= 20) return base * 0.52;
      if (tone <= 30) return base * 0.78;
      if (tone <= 40) return base * 0.90;
      if (tone <= 60) return base * 1.00;
      if (tone <= 80) return base * 0.88;
      if (tone <= 90) return base * 0.52;
      if (tone <= 95) return base * 0.28;
      return base * 0.09;
    },

    oklch(tone, chroma, hue) {
      const H = ((hue % 360) + 360) % 360;
      return `oklch(${(tone).toFixed(1)}% ${this.chromaFor(tone / 100 * 100, chroma).toFixed(3)} ${H.toFixed(1)})`;
    },

    // sat: 0–100 (50 = normal). scales oklch chroma proportionally.
    // bri: 0.5–2.0 (1.0 = normal). scales oklch lightness and surface lightness.
    applyTokens(hue, sat, bri, anim) {
      const h   = ((hue % 360) + 360) % 360;
      const hs  = ((h + 60)  % 360);
      const ht  = ((h + 120) % 360);
      const sv  = (sat !== undefined && sat !== null) ? sat : this.currentSat;
      const bv  = (bri !== undefined && bri !== null) ? bri : this.currentBri;
      const cm  = sv / 50;   // chroma multiplier: 1.0 at sat=50, 0 at sat=0, 2.0 at sat=100
      // chroma scale: multiply base chroma by cm
      const oc  = c => +(c * cm).toFixed(4);
      // lightness scale: multiply base lightness % by bv, capped at 94
      const ol  = l => (l * bv).toFixed(1);
      // surface hsl saturation scaled by sat (base 50%)
      const ss  = base => Math.min(100, base * sv / 50).toFixed(2);
      // surface lightness scaled by bri
      const sl  = l => (l * bv).toFixed(2);

      const o   = (tone, c, hu) => `oklch(${ol(tone)}% ${oc(c)} ${hu.toFixed(1)})`;
      const r   = document.documentElement;
      const set = (k, v) => r.style.setProperty(k, v);

      set('--color-primary',                  o(78, 0.16, h));
      set('--color-on-primary',               `oklch(18% ${oc(0.08)} ${h.toFixed(1)})`);
      set('--color-primary-container',        `oklch(${Math.min(42, Math.max(16, 22 * bv)).toFixed(1)}% ${oc(0.05)} ${h.toFixed(1)})`);
      set('--color-on-primary-container',     o(88, 0.07, h));
      set('--color-secondary',                o(76, 0.07, hs));
      set('--color-on-secondary',             `oklch(18% ${oc(0.04)} ${hs.toFixed(1)})`);
      set('--color-secondary-container',      `oklch(${Math.min(42, Math.max(16, 21 * bv)).toFixed(1)}% ${oc(0.025)} ${hs.toFixed(1)})`);
      set('--color-on-secondary-container',   o(87, 0.04, hs));
      set('--color-tertiary',                 o(78, 0.09, ht));
      set('--color-on-tertiary',              `oklch(18% ${oc(0.05)} ${ht.toFixed(1)})`);
      set('--color-tertiary-container',       `oklch(${Math.min(42, Math.max(16, 21 * bv)).toFixed(1)}% ${oc(0.035)} ${ht.toFixed(1)})`);
      set('--color-on-tertiary-container',    o(87, 0.05, ht));
      set('--color-error',               `oklch(${ol(80)}% ${Math.min(0.23, Math.max(0.21, oc(0.22))).toFixed(4)} 25)`);
      set('--color-on-error',                 `oklch(16% ${Math.min(0.12, Math.max(0.11, oc(0.115))).toFixed(4)} 25)`);
      set('--color-error-container',          `oklch(32% ${Math.min(0.21, Math.max(0.19, oc(0.20))).toFixed(4)} 25)`);
      set('--color-on-error-container',       `oklch(92% ${Math.min(0.065, Math.max(0.060, oc(0.062))).toFixed(4)} 25)`);
      // surfaces: per-surface base saturation matching meowify exactly
      const hslb = (bs, bl) => `hsl(${h}, ${ss(bs)}%, ${sl(bl)}%)`;
      set('--color-surface-dim',               hslb(8,  5));
      set('--color-surface',                   hslb(6,  9));
      set('--color-surface-bright',            hslb(8,  18));
      set('--color-surface-container-lowest',  hslb(6,  6));
      set('--color-surface-container-low',     hslb(6,  10));
      set('--color-surface-container',         hslb(8,  13));
      set('--color-surface-container-high',    hslb(10, 17));
      set('--color-surface-container-highest', hslb(12, 22));
      set('--color-on-surface',         `hsl(${h}, ${ss(20)}%, 91%)`);
      set('--color-on-surface-variant', `hsl(${h}, ${ss(15)}%, 72%)`);
      set('--color-outline',            `hsl(${h}, ${ss(12)}%, 50%)`);
      set('--color-outline-variant',    `hsl(${h}, ${ss(10)}%, 26%)`);
      set('--color-inverse-surface',    `hsl(${h}, ${ss(20)}%, 91%)`);
      set('--color-inverse-on-surface', `hsl(${h}, ${ss(10)}%, 18%)`);
      set('--color-inverse-primary',    `oklch(38% ${oc(0.14)} ${h.toFixed(1)})`);
      set('--color-gradient-start',     o(78, 0.16, h));
      set('--color-gradient-end',       o(76, 0.09, hs));

      syncBlobScenes();
      document.dispatchEvent(new CustomEvent('mu:themechange', { detail: { hue: h, sat: sv, bri: bv, anim: !!anim } }));
    },

    _animRaf: null,
    // animated hue arc transition — sat/bri stay fixed during animation
    // toSat (optional): sat animates in the same loop as the hue, calling setSat mid-animation
    // would apply tokens with the old currentHue and flicker
    animateTo(toHue, dur = 700, toSat) {
      const satTo = (toSat === undefined || toSat === null) ? this.currentSat : toSat;
      if (prefersReduced()) { this.currentHue = ((toHue % 360) + 360) % 360; this.currentSat = satTo; this.applyTokens(this.currentHue); return; }
      // hidden/minimized: rAF is paused so the anim would freeze half way and the next one would start from a stale _shownHue. just snap
      if (document.hidden) {
        if (this._animRaf) { cancelAnimationFrame(this._animRaf); this._animRaf = null; }
        this.currentHue = ((toHue % 360) + 360) % 360; this.currentSat = satTo;
        this.applyTokens(this.currentHue, this.currentSat, this.currentBri);
        return;
      }
      const from  = this._animRaf ? this._shownHue : this.currentHue;
      const fromSat = this._animRaf ? (this._shownSat ?? this.currentSat) : this.currentSat;
      const _ref = hh => {
        const r = hh * Math.PI / 180, L = 0.78, C = 0.16, a = C * Math.cos(r), b = C * Math.sin(r);
        const l = Math.pow(L + 0.3963377774*a + 0.2158037573*b, 3), m = Math.pow(L - 0.1055613458*a - 0.0638541728*b, 3), s = Math.pow(L - 0.0894841775*a - 1.291485548*b, 3);
        return [4.0767416621*l - 3.3077115913*m + 0.2309699292*s, -1.2684380046*l + 2.6097574011*m - 0.3413193965*s, -0.0041960863*l - 0.7034186147*m + 1.707614701*s].map(v => Math.max(0, Math.min(1, v)));
      };
      const _lin2hc = c => {
        const l = Math.cbrt(0.4122214708*c[0] + 0.5363325363*c[1] + 0.0514459929*c[2]);
        const m = Math.cbrt(0.2119034982*c[0] + 0.6806995451*c[1] + 0.1073969566*c[2]);
        const s = Math.cbrt(0.0883024619*c[0] + 0.2817188376*c[1] + 0.6299787005*c[2]);
        const a = 1.9779984951*l - 2.428592205*m + 0.4505937099*s, b = 0.0259040371*l + 0.7827717662*m - 0.808675766*s;
        return [Math.atan2(b, a) * 180 / Math.PI, Math.hypot(a, b) / 0.16];
      };
      const _angD = (x, y) => ((x - y + 540) % 360) - 180;
      const _cA = _ref(from), _cB = _ref(toHue);
      const _enc = v => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
      const _dec = v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      const _gA = _cA.map(_enc), _gB = _cB.map(_enc);
      const [_h0, _f0] = _lin2hc(_cA), [_h1, _f1] = _lin2hc(_cB);
      const _e0 = _angD(_h0, from), _e1 = _angD(_h1, toHue);
      let _lastH = from;
      const start = performance.now();
      if (this._animRaf) cancelAnimationFrame(this._animRaf);
      this._lastStep = 0;
      // seed so an interrupt before the first frame never reads a stale/undefined _shownHue
      this._shownHue = from; this._shownSat = fromSat;
      // watchdog: if rAF gets paused without document.hidden (minimized, webview suspended) finish anyway
      const _tok = this._animTok = (this._animTok || 0) + 1;
      setTimeout(() => {
        if (this._animTok !== _tok || !this._animRaf) return;
        cancelAnimationFrame(this._animRaf); this._animRaf = null;
        this.currentHue = ((toHue % 360) + 360) % 360; this.currentSat = satTo;
        this.applyTokens(this.currentHue, this.currentSat, this.currentBri);
      }, dur + 150);
      const step = now => {
        const t    = Math.min((now - start) / dur, 1);
        if (t < 1 && now - this._lastStep < 33) { this._animRaf = requestAnimationFrame(step); return; }
        this._lastStep = now;
        // ease-in-out-quad
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const mix  = _gA.map((v, i) => _dec(v + (_gB[i] - v) * ease));
        const [mh, mf] = _lin2hc(mix);
        const corr = _e0 * (1 - ease) + _e1 * ease;
        const h    = mf > 1e-3 ? (((mh - corr) % 360) + 360) % 360 : _lastH;
        _lastH = h;
        const fac  = mf / Math.max(1e-3, _f0 * (1 - ease) + _f1 * ease);
        const sv   = (fromSat + (satTo - fromSat) * ease) * Math.min(1.3, fac);
        this._shownHue = h;
        this._shownSat = sv;
        this.applyTokens(h, sv, undefined, t < 1);
        if (t < 1) {
          this._animRaf = requestAnimationFrame(step);
        } else {
          this._animRaf = null;
          this.currentHue = ((toHue % 360) + 360) % 360;
          this.currentSat = satTo;
          this.applyTokens(this.currentHue);
        }
      };
      this._animRaf = requestAnimationFrame(step);
    },

    setPalette({ hue, sat, bri } = {}) {
      if ((hue === undefined || hue === null) && (sat === undefined || sat === null || sat === this.currentSat) && (bri === undefined || bri === null || bri === this.currentBri)) return;
      if (hue !== undefined && hue !== null) {
        if (this._animRaf) { cancelAnimationFrame(this._animRaf); this._animRaf = null; }
        this.currentHue = ((hue % 360) + 360) % 360;
      }
      if (sat !== undefined && sat !== null) this.currentSat = sat;
      if (bri !== undefined && bri !== null) this.currentBri = bri;
      const live = !!this._animRaf;
      this.applyTokens(live ? this._shownHue : this.currentHue, live ? (this._shownSat ?? this.currentSat) : this.currentSat, this.currentBri, live);
    },

    setHue(hue, animate = false, toSat) {
      const h = ((hue % 360) + 360) % 360;
      if (animate) {
        // currentHue stays the old hue until animateTo finishes, it needs it as the start point
        // animate can be true (700ms) or a number of ms
        this.animateTo(h, typeof animate === 'number' ? animate : 700, toSat);
      } else {
        if (this._animRaf) { cancelAnimationFrame(this._animRaf); this._animRaf = null; }
        this.currentHue = h;
        if (toSat !== undefined && toSat !== null) this.currentSat = toSat;
        this.applyTokens(h, this.currentSat, this.currentBri);
      }
    },

    setSat(sat) {
      this.currentSat = sat;
      this.applyTokens(this.currentHue, this.currentSat, this.currentBri);
    },

    setBri(bri) {
      this.currentBri = bri;
      this.applyTokens(this.currentHue, this.currentSat, this.currentBri);
    },

    init(hue = 250, sat = 50, bri = 1.0) {
      this.currentHue = ((hue % 360) + 360) % 360;
      this.currentSat = sat;
      this.currentBri = bri;
      this.applyTokens(this.currentHue, this.currentSat, this.currentBri);
    },
  };

  /* ─────────────────────────────────────────────────────────
     RIPPLE — attaches to all interactive elements including buttons
     ───────────────────────────────────────────────────────── */
  const RIPPLE_SEL = [
    'button', 'a[href]', '[role="button"]', '[role="tab"]',
    '[role="option"]', '[role="menuitem"]',
    '.btn', '.chip', '.card-interactive', '.list-item',
    '.nav-item', '.nav-drawer-item', '.tab',
    '.segmented-btn', '.accordion-trigger', '.menu-item',
    '.input', '.inp', 'input[type="text"]', 'input[type="email"]',

    'input[type="password"]', 'input[type="search"]',
    'input[type="number"]', 'textarea', 'select',

    '[data-ripple]'
  ].join(',');

  // void elements that can't have children - spawn ripple on parent wrapper instead

  const VOID_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);


  function rippleColor(el) {
    const cls = el.classList;
    if (cls.contains('btn-gradient-primary') || cls.contains('btn-gradient-secondary'))
      return 'rgba(255,255,255,0.22)';
    return null;
  }

  function wrapVoidEl(el) {
    if (el._muRippleWrap) return el._muRippleWrap;
    const cs = getComputedStyle(el);
    const target = document.createElement('div');
    target.className = 'mu-ripple';
    target.style.overflow = 'hidden';
    target.style.borderRadius = cs.borderRadius;
    const isNumber = el.tagName === 'INPUT' && el.type === 'number';
    if (isNumber) {
      target.style.display = 'inline-block';
    } else {
      target.style.display = 'flex';
      ['flexGrow','flexShrink','flexBasis','alignSelf',
       'justifySelf','order','gridColumn','gridRow','gridArea'
      ].forEach(p => { target.style[p] = cs[p]; });
    }
    const isSelect = el.tagName === 'SELECT';
    if (isSelect) target.style.overflow = 'visible';
    el.parentNode.insertBefore(target, el);
    target.appendChild(el);
    el._muRippleWrap = target;
    requestAnimationFrame(() => {
      const liveCs = getComputedStyle(el);
      const isTextarea = el.tagName === 'TEXTAREA';
      const hasExplicitWidth  = liveCs.width  !== 'auto';
      const hasExplicitHeight = liveCs.height !== 'auto';
      if (!isSelect || hasExplicitWidth) {
        target.style.width = el.offsetWidth + 'px';
        el.style.width     = '100%';
      }
      if (!isTextarea || hasExplicitHeight) {
        target.style.height    = el.offsetHeight + 'px';
        target.style.minHeight = liveCs.minHeight;
        el.style.height        = '100%';
      }
      target.style.borderRadius = liveCs.borderRadius;
      el.style.margin    = '0';
      el.style.boxSizing = 'border-box';
    });
    return target;
  }


  function spawnRipple(el, e) {
    if (el.dataset.rippleDisabled || prefersReduced()) return;
    let target;
    if (VOID_TAGS.has(el.tagName)) {
      target = el._muRippleWrap ?? wrapVoidEl(el);
    } else {
      target = el;
    }

    if (!target) return;
    // ensure target can host ripple
    target.classList.add('mu-ripple');
    const rect = target.getBoundingClientRect();
    const cx   = (e.clientX ?? rect.left + rect.width  / 2) - rect.left;
    const cy   = (e.clientY ?? rect.top  + rect.height / 2) - rect.top;
    const r    = Math.hypot(Math.max(cx, rect.width - cx), Math.max(cy, rect.height - cy));
    const wave = document.createElement('span');
    wave.className = 'mu-ripple-wave';
    wave.style.cssText = `width:${r*2}px;height:${r*2}px;left:${cx-r}px;top:${cy-r}px;`;
    const c = rippleColor(el);
    if (c) wave.style.background = c;
    target.appendChild(wave);

    wave.addEventListener('animationend', () => { observer.disconnect(); wave.remove(); }, { once: true });

    const waveStart = performance.now();
    // If the target is removed from DOM mid-animation, re-adopt the wave onto
    // whatever element re-renders in its place (matched by same onclick/data attrs)
    const observer = new MutationObserver(() => {
      if (!wave.isConnected) {
        observer.disconnect();
        // Grab elapsed time so animation continues from where it left off
        const elapsed = performance.now() - waveStart;
        wave.style.animationDelay = `-${elapsed}ms`;
        wave.style.pointerEvents = 'none';
        // Try to find a replacement element at the same screen position
        const hit = document.elementFromPoint(
          e.clientX ?? (rect.left + rect.width / 2),
          e.clientY ?? (rect.top + rect.height / 2)
        );
        const newTarget = hit?.closest('.mu-ripple') ?? hit;
        if (newTarget && newTarget !== wave) {
          // Recompute wave position relative to new target
          const nr = newTarget.getBoundingClientRect();
          const cx2 = (e.clientX ?? nr.left + nr.width / 2) - nr.left;
          const cy2 = (e.clientY ?? nr.top + nr.height / 2) - nr.top;
          const r2 = Math.hypot(Math.max(cx2, nr.width - cx2), Math.max(cy2, nr.height - cy2));
          wave.style.width  = `${r2 * 2}px`;
          wave.style.height = `${r2 * 2}px`;
          wave.style.left   = `${cx2 - r2}px`;
          wave.style.top    = `${cy2 - r2}px`;
          newTarget.appendChild(wave);
        }
      }
    });
    observer.observe(target.parentNode ?? document.body, { childList: true, subtree: true });
  }

  function attachRipple(el) {
    if (el._muRipple) return;
    if (!(el instanceof Element)) return;
    // attach if matches or is itself a button/chip etc
    if (!el.matches(RIPPLE_SEL)) return;
    el._muRipple = true;
    el.addEventListener('pointerdown', e => spawnRipple(el, e), { passive: true });
  }

  function attachRipples(root = document) {

    if (root instanceof Element) attachRipple(root);

    root.querySelectorAll(RIPPLE_SEL).forEach(el => {

      if (VOID_TAGS.has(el.tagName)) wrapVoidEl(el);

      attachRipple(el);

    });

  }

  /* ─────────────────────────────────────────────────────────
     SPIKY CIRCLE — material 3 style icon shape generator
     opts: cx, cy, outerR, innerR, spikes, smooth, holeR
       smooth: 0 = sharp zigzag, 1 = fully rounded tips (default)
       holeR:  if set, punches a counter-clockwise hole at center
     ───────────────────────────────────────────────────────── */
  // shared geometry: returns the smoothed outline as a list of drawing
  // segments, used by both the SVG path-string generator and the canvas
  // renderer so the two stay visually identical.
  // each segment is either:
  //   ['M'|'L', x, y]                  - straight move/line
  //   ['Q', cx, cy, x, y, mx, my]       - quad curve, mx/my = start point (move-to before curve)
  function _spikyOutline({
    cx = 12, cy = 12,
    outerR = 12, innerR = 6,
    outerRs = null,
    spikes = 8,
    smooth = 1.0,
    valleySmooth = null,
  } = {}) {
    const n  = spikes * 2;
    const vs = valleySmooth != null ? valleySmooth : smooth * 0.5;
    const getOuterR = outerRs ? (i) => outerRs[i % outerRs.length] : () => outerR;
    const pts = Array.from({ length: n }, (_, k) => {
      const isTip = k % 2 === 1;
      const angle = (k * Math.PI) / spikes - Math.PI / 2;
      const r     = isTip ? getOuterR(Math.floor(k / 2)) : innerR;
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle), isTip ? 1 : 0];
    });
    const cpLerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const segs = [];
    for (let i = 0; i < n; i++) {
      const prev  = pts[(i - 1 + n) % n];
      const curr  = pts[i];
      const next  = pts[(i + 1) % n];
      const isTip = curr[2] === 1;
      const t     = isTip ? smooth : vs;
      if (t === 0) {
        segs.push([i === 0 ? 'M' : 'L', curr[0], curr[1]]);
      } else {
        const p1 = cpLerp(curr, prev, t);
        const p2 = cpLerp(curr, next, t);
        if (i === 0) segs.push(['M', p1[0], p1[1]]);
        else segs.push(['L', p1[0], p1[1]]);
        segs.push(['Q', curr[0], curr[1], p2[0], p2[1]]);
      }
    }
    return segs;
  }

  function spikyCircle({
    cx = 12, cy = 12,
    outerR = 12, innerR = 6,
    outerRs = null,
    spikes = 8,
    smooth = 1.0,
    valleySmooth = null,
    holeR = 4,
  } = {}) {
    const segs = _spikyOutline({ cx, cy, outerR, innerR, outerRs, spikes, smooth, valleySmooth });
    let d = '';
    for (const s of segs) {
      if (s[0] === 'M') d += 'M' + s[1].toFixed(2) + ',' + s[2].toFixed(2);
      else if (s[0] === 'L') d += 'L' + s[1].toFixed(2) + ',' + s[2].toFixed(2);
      else d += 'Q' + s[1].toFixed(2) + ',' + s[2].toFixed(2) + ' ' + s[3].toFixed(2) + ',' + s[4].toFixed(2);
    }
    d += 'Z';
    if (holeR != null) {
      const hr = holeR;
      d += ' M' + (cx + hr).toFixed(2) + ',' + cy.toFixed(2)
        + ' A' + hr + ',' + hr + ',0,1,0,' + (cx - hr).toFixed(2) + ',' + cy.toFixed(2)
        + ' A' + hr + ',' + hr + ',0,1,0,' + (cx + hr).toFixed(2) + ',' + cy.toFixed(2) + 'Z';
    }
    return d;
  }

  /* ─────────────────────────────────────────────────────────
     SPIKY CIRCLE — canvas renderer
     Draws the same shape as spikyCircle() onto a 2D canvas context,
     with an optional cheap rim-highlight approximation in place of
     the #gs SVG filter (specular top edge + shadow bottom edge).

     ctx: CanvasRenderingContext2D, already translated/scaled as needed
     opts: same geometry opts as spikyCircle (cx, cy, outerR, innerR,
           outerRs, spikes, smooth, valleySmooth)
     drawOpts:
       fill        - fillStyle for the shape (default '#fff')
       rotation    - degrees, rotates the shape around (cx, cy)
       rim         - { lightColor, darkColor, blur, offset } or null/false
                      to skip the rim approximation entirely (cheapest)
       glow        - { color, blur } drop-shadow glow drawn under the
                      shape (approximates per-theme drop-shadow filters)
     ───────────────────────────────────────────────────────── */
  function spikyCircleToCanvas(ctx, opts = {}, drawOpts = {}) {
    const { cx = 12, cy = 12 } = opts;
    const segs = _spikyOutline(opts);

    const fill     = drawOpts.fill || '#fff';
    const rotation = drawOpts.rotation || 0;
    const rim      = drawOpts.rim || null;
    const glow     = drawOpts.glow || null;

    const buildPath = () => {
      const p = new Path2D();
      for (const s of segs) {
        if (s[0] === 'M') p.moveTo(s[1], s[2]);
        else if (s[0] === 'L') p.lineTo(s[1], s[2]);
        else p.quadraticCurveTo(s[1], s[2], s[3], s[4]);
      }
      p.closePath();
      return p;
    };

    ctx.save();
    if (rotation) {
      ctx.translate(cx, cy);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.translate(-cx, -cy);
    }
    const path = buildPath();

    // optional glow (cheap drop-shadow approximation for theme accents)
    if (glow && glow.color) {
      ctx.save();
      ctx.shadowColor = glow.color;
      ctx.shadowBlur  = glow.blur || 10;
      ctx.fillStyle   = fill;
      ctx.fill(path);
      ctx.restore();
    }

    ctx.fillStyle = fill;
    ctx.fill(path);

    // rim highlight approximation: a thin light stroke offset toward
    // the top, and a thin dark stroke offset toward the bottom, both
    // clipped to the shape - cheap stand-in for the #gs specular filter
    if (rim) {
      const blur   = rim.blur   != null ? rim.blur   : 1.5;
      const offset = rim.offset != null ? rim.offset : 2;
      ctx.save();
      ctx.clip(path);
      if (rim.lightColor) {
        ctx.save();
        ctx.shadowColor  = rim.lightColor;
        ctx.shadowBlur   = blur;
        ctx.shadowOffsetY = -offset;
        ctx.strokeStyle  = rim.lightColor;
        ctx.lineWidth    = 1;
        ctx.stroke(path);
        ctx.restore();
      }
      if (rim.darkColor) {
        ctx.save();
        ctx.shadowColor  = rim.darkColor;
        ctx.shadowBlur   = blur;
        ctx.shadowOffsetY = offset;
        ctx.strokeStyle  = rim.darkColor;
        ctx.lineWidth    = 1;
        ctx.stroke(path);
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  function stampGearIcons(root = document) {
    root.querySelectorAll('[id="gear-path"]').forEach(el => {
      if (!el.getAttribute('d'))
        el.setAttribute('d', spikyCircle());
    });
  }

  function animateSpikyCircle(el, toOpts, {
    duration = 400,
    easing = 'cubic-bezier(.2,0,.2,1)',
    rotation = null,       // degrees, null = no rotation
    rotationDuration = null, // defaults to duration
  } = {}) {
    if (!el) return;
    const fromD = el.getAttribute('d') || spikyCircle();
    const toD   = spikyCircle(toOpts);
    const start = performance.now();
    const rotDur = rotationDuration ?? duration;

    // derive current opts from element dataset for interpolation
    const from = {
      cx:          parseFloat(el.dataset.muCx      ?? 12),
      cy:          parseFloat(el.dataset.muCy      ?? 12),
      outerR:      parseFloat(el.dataset.muOuterR  ?? 12),
      innerR:      parseFloat(el.dataset.muInnerR  ?? 6),
      outerRs:     el.dataset.muOuterRs ? el.dataset.muOuterRs.split(',').map(Number) : null,
      spikes:      parseFloat(el.dataset.muSpikes  ?? 8),
      smooth:      parseFloat(el.dataset.muSmooth  ?? 1),
      valleySmooth: el.dataset.muValleySmooth != null ? parseFloat(el.dataset.muValleySmooth) : null,
      holeR:       el.dataset.muHoleR != null ? parseFloat(el.dataset.muHoleR) : null,
    };
    const to = {
      cx:          toOpts.cx          ?? from.cx,
      cy:          toOpts.cy          ?? from.cy,
      outerR:      toOpts.outerR      ?? from.outerR,
      innerR:      toOpts.innerR      ?? from.innerR,
      outerRs:     toOpts.outerRs     ?? null,
      spikes:      toOpts.spikes      ?? from.spikes,
      smooth:      toOpts.smooth      ?? from.smooth,
      valleySmooth: toOpts.valleySmooth ?? from.valleySmooth,
      holeR:       toOpts.holeR       ?? from.holeR,
    };

    // lerp helper
    const lerp = (a, b, t) => a + (b - a) * t;

    // css easing via a dummy element
    let cssEase = null;
    try {
      const dummy = document.createElement('div');
      dummy.style.transition = `opacity ${duration}ms ${easing}`;
      document.body.appendChild(dummy);
      getComputedStyle(dummy).opacity; // force style calc
      dummy.style.opacity = '1';
      cssEase = dummy;
    } catch(e) {}

    function easedT(raw) {
      // approximate css easing via Web Animations if available, else linear
      return raw;
    }

    // use WAAPI on the SVG parent for rotation if requested
    let rotAnim = null;
    const svgEl = el.closest('svg') || el.parentElement;
    if (rotation != null && svgEl && svgEl.animate) {
      const fromRot = parseFloat(svgEl.dataset.muRotation ?? 0);
      const toRot   = fromRot + rotation;
      svgEl.dataset.muRotation = toRot;
      const cx = to.cx, cy = to.cy;
      rotAnim = svgEl.animate([
        { transform: `rotate(${fromRot}deg, ${cx}, ${cy})` },
        { transform: `rotate(${toRot}deg, ${cx}, ${cy})` },
      ], { duration: rotDur, easing, fill: 'forwards' });
      rotAnim.onfinish = () => {
        svgEl.style.transform = `rotate(${toRot}deg)`;
        svgEl.style.transformOrigin = `${cx}px ${cy}px`;
        rotAnim.cancel();
      };
    }

    if (cssEase) { cssEase.remove(); cssEase = null; }

    if (el._muSpikyRaf) cancelAnimationFrame(el._muSpikyRaf);

    function frame(now) {
      const raw = Math.min((now - start) / duration, 1);
      // ease: ease-out quad as default approximation
      const t = raw < 1 ? 1 - (1 - raw) * (1 - raw) : 1;

      let curOuterRs = null;
      if (from.outerRs != null || to.outerRs != null) {
        const len    = Math.max(
          from.outerRs ? from.outerRs.length : 0,
          to.outerRs   ? to.outerRs.length   : 0,
          to.spikes
        );
        const fromRs = from.outerRs ?? [];
        const toRs   = to.outerRs   ?? [];
        const fromFill = from.outerR;
        const toFill   = to.outerR;
        curOuterRs = Array.from({ length: len }, (_, k) =>
          lerp(fromRs[k] ?? fromFill, toRs[k] ?? toFill, t)
        );
      }
      const cur = {
        cx:          lerp(from.cx,     to.cx,     t),
        cy:          lerp(from.cy,     to.cy,     t),
        outerR:      lerp(from.outerR, to.outerR, t),
        innerR:      lerp(from.innerR, to.innerR, t),
        outerRs:     curOuterRs,
        spikes:      Math.round(lerp(from.spikes, to.spikes, t)),
        smooth:      lerp(from.smooth, to.smooth, t),
        valleySmooth: (from.valleySmooth != null || to.valleySmooth != null)
                        ? lerp(from.valleySmooth ?? from.smooth * 0.5,
                               to.valleySmooth   ?? to.smooth   * 0.5, t)
                        : null,
        holeR:       (from.holeR != null || to.holeR != null)
                       ? lerp(from.holeR ?? 0, to.holeR ?? 0, t)
                       : null,
      };

      el.setAttribute('d', spikyCircle(cur));

      if (t < 1) {
        el._muSpikyRaf = requestAnimationFrame(frame);
      } else {
        el._muSpikyRaf = null;
        // store final opts for next animation's from-state
        el.dataset.muCx     = to.cx;
        el.dataset.muCy     = to.cy;
        el.dataset.muOuterR = to.outerR;
        el.dataset.muInnerR = to.innerR;
        el.dataset.muSpikes = to.spikes;
        el.dataset.muSmooth = to.smooth;
        if (to.outerRs != null) el.dataset.muOuterRs = to.outerRs.join(',');
        else delete el.dataset.muOuterRs;
        if (to.valleySmooth != null) el.dataset.muValleySmooth = to.valleySmooth;
        else delete el.dataset.muValleySmooth;
        if (to.holeR != null) el.dataset.muHoleR = to.holeR;
        else delete el.dataset.muHoleR;
      }
    }

    el._muSpikyRaf = requestAnimationFrame(frame);
    return { cancel: () => { if (el._muSpikyRaf) cancelAnimationFrame(el._muSpikyRaf); rotAnim?.cancel(); } };
  }

  /* ─────────────────────────────────────────────────────────
     BLOB SCENE BG SYNC (CSS loaders only)
     ───────────────────────────────────────────────────────── */
  function syncBlobScenes() {
    document.querySelectorAll('.blob-loader-scene, .blob-loader-3-scene').forEach(scene => {
      if (scene.dataset.blobBgManual) return;
      let node = scene.parentElement;
      let bg   = null;
      while (node && node !== document.body) {
        const cs = getComputedStyle(node);
        const b  = cs.backgroundColor;
        if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { bg = b; break; }
        node = node.parentElement;
      }
      if (!bg) bg = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
      scene.style.background = bg;
    });
  }
  document.addEventListener('mu:themechange', syncBlobScenes);

  /* ─────────────────────────────────────────────────────────
     WEBGL METABALL
     Renders metaballs on a <canvas> via a fragment shader SDF.
     No background sync needed — canvas is fully transparent.
     Multi-color: each blob contributes color weighted by field strength.

     MU.metaball(canvasEl, blobs, opts)

     blobs: array of blob descriptors:
       { x, y }          — position in canvas px (can be animated)
       r                 — radius px (default 60)
       color             — css color string or CSS var like 'var(--color-primary)'
       vx, vy            — velocity px/frame for auto-animation (default 0)

     opts:
       threshold         — isosurface threshold 0–1 (default 0.5)
       smooth            — edge softness px (default 1.5)
       animate           — auto-start rAF loop (default true)
       maxBlobs          — shader array size, must be >= blobs.length (default 16)
       alpha             — overall canvas opacity 0–1 (default 1)

     returns {
       update(blobs)     — replace blob list
       setBlob(i, desc)  — update single blob
       play() / pause()  — control animation loop
       destroy()         — cleanup GL context + rAF
       canvas            — the canvas element
     }
     ───────────────────────────────────────────────────────── */
  function metaball(canvasEl, blobs = [], opts = {}) {
    const threshold = opts.threshold ?? 0.5;
    const smooth    = opts.smooth    ?? 1.5;
    const maxBlobs  = opts.maxBlobs  ?? 16;
    let   animating = opts.animate   ?? true;
    let   destroyed = false;
    let   raf       = null;
    let   blobList  = blobs.map(b => ({ ...b }));

    // resolve CSS color → [r,g,b] 0–1
    const _colorCache = new Map();
    function resolveColor(c) {
      if (_colorCache.has(c)) return _colorCache.get(c);
      // use a hidden element to let the browser parse any CSS color
      const tmp = document.createElement('div');
      tmp.style.color = c;
      document.body.appendChild(tmp);
      const cs  = getComputedStyle(tmp).color; // always rgb(r,g,b)
      document.body.removeChild(tmp);
      const m = cs.match(/[\d.]+/g) || ['128','128','128'];
      const v = [+m[0]/255, +m[1]/255, +m[2]/255];
      _colorCache.set(c, v);
      return v;
    }

    // WebGL setup
    const gl = canvasEl.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl) { console.warn('MU.metaball: WebGL2 not available'); return null; }

    const VS = `#version 300 es
precision highp float;
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

    const FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform vec2  u_res;
uniform int   u_count;
uniform vec2  u_pos[${maxBlobs}];
uniform float u_rad[${maxBlobs}];
uniform vec3  u_col[${maxBlobs}];
uniform float u_threshold;
uniform float u_smooth;

void main() {
  vec2 px = v_uv * u_res;

  float field = 0.0;
  vec3  color = vec3(0.0);
  float wsum  = 0.0;

  for (int i = 0; i < ${maxBlobs}; i++) {
    if (i >= u_count) break;
    float d = length(px - u_pos[i]);
    // falloff: r^2 / d^2, clamped so it stays finite at center
    float r = u_rad[i];
    float f = (r * r) / max(d * d, 0.0001);
    field += f;
    // weight color by field contribution
    color += u_col[i] * f;
    wsum  += f;
  }

  // normalize color
  if (wsum > 0.0) color /= wsum;

  // smooth threshold
  float lo = u_threshold - u_smooth / u_res.y;
  float hi = u_threshold + u_smooth / u_res.y;
  float alpha = smoothstep(lo, hi, field);

  fragColor = vec4(color * alpha, alpha);
}`;

    function compileShader(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        console.error('MU.metaball shader error:', gl.getShaderInfoLog(sh));
      return sh;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // uniform locations
    const uRes       = gl.getUniformLocation(prog, 'u_res');
    const uCount     = gl.getUniformLocation(prog, 'u_count');
    const uThreshold = gl.getUniformLocation(prog, 'u_threshold');
    const uSmooth    = gl.getUniformLocation(prog, 'u_smooth');
    const uPos       = gl.getUniformLocation(prog, 'u_pos[0]');
    const uRad       = gl.getUniformLocation(prog, 'u_rad[0]');
    const uCol       = gl.getUniformLocation(prog, 'u_col[0]');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w   = canvasEl.clientWidth;
      const h   = canvasEl.clientHeight;
      canvasEl.width  = w * dpr;
      canvasEl.height = h * dpr;
      gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvasEl);
    resize();

    function render() {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const n   = Math.min(blobList.length, maxBlobs);
      const dpr = window.devicePixelRatio || 1;
      const w   = canvasEl.width;
      const h   = canvasEl.height;

      const posArr = new Float32Array(maxBlobs * 2);
      const radArr = new Float32Array(maxBlobs);
      const colArr = new Float32Array(maxBlobs * 3);

      for (let i = 0; i < n; i++) {
        const b = blobList[i];
        // convert from CSS px to canvas px (DPR)
        posArr[i*2]   = b.x * dpr;
        posArr[i*2+1] = h - b.y * dpr; // flip Y (WebGL origin = bottom-left)
        radArr[i]     = (b.r ?? 60) * dpr;
        const col     = resolveColor(b.color ?? 'var(--color-primary)');
        colArr[i*3]   = col[0];
        colArr[i*3+1] = col[1];
        colArr[i*3+2] = col[2];
      }

      gl.uniform2f(uRes, w, h);
      gl.uniform1i(uCount, n);
      gl.uniform1f(uThreshold, threshold);
      gl.uniform1f(uSmooth, smooth);
      gl.uniform2fv(uPos, posArr);
      gl.uniform1fv(uRad, radArr);
      gl.uniform3fv(uCol, colArr);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function loop() {
      if (destroyed) return;
      // auto-move blobs with velocity
      for (const b of blobList) {
        if (b.vx || b.vy) {
          b.x += b.vx ?? 0;
          b.y += b.vy ?? 0;
          const cw = canvasEl.clientWidth;
          const ch = canvasEl.clientHeight;
          const r  = b.r ?? 60;
          if (b.x - r < 0)  { b.x = r;       b.vx = Math.abs(b.vx ?? 0); }
          if (b.x + r > cw) { b.x = cw - r;  b.vx = -Math.abs(b.vx ?? 0); }
          if (b.y - r < 0)  { b.y = r;        b.vy = Math.abs(b.vy ?? 0); }
          if (b.y + r > ch) { b.y = ch - r;   b.vy = -Math.abs(b.vy ?? 0); }
        }
      }
      render();
      if (animating) raf = requestAnimationFrame(loop);
    }

    function play()  { if (!animating) { animating = true;  raf = requestAnimationFrame(loop); } }
    function pause() { animating = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }

    function update(newBlobs) {
      blobList = newBlobs.map(b => ({ ...b }));
      _colorCache.clear();
      if (!animating) render();
    }

    function setBlob(i, desc) {
      if (!blobList[i]) return;
      Object.assign(blobList[i], desc);
      if (!animating) render();
    }

    function destroy() {
      destroyed = true;
      pause();
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    }

    // invalidate color cache on theme/design change so CSS vars re-resolve;
    // also re-render for static (non-animating) scenes since they won't repaint otherwise
    const themeListener = () => {
      _colorCache.clear();
      if (!animating) render();
    };
    document.addEventListener('mu:themechange',  themeListener);
    document.addEventListener('mu:designchange', themeListener);
    const origDestroy = destroy;
    // wrap to also remove listeners
    function destroyFull() {
      origDestroy();
      document.removeEventListener('mu:themechange',  themeListener);
      document.removeEventListener('mu:designchange', themeListener);
    }

    if (animating) raf = requestAnimationFrame(loop);
    else render();

    return { update, setBlob, play, pause, destroy: destroyFull, canvas: canvasEl };
  }

  /* ─────────────────────────────────────────────────────────
     LIST / MENU — proportional height redistribute on press
     Clicked item grows; siblings above AND below shrink
     proportionally (closer = more shrink), sum = growth exactly
     ───────────────────────────────────────────────────────── */
  function initListExpand(root = document) {
    const SEL = '.list .list-item, .menu .menu-item';
    const GROW = 3;            // px added to each side (top+bottom) of pressed item
    const DEFAULT_PAD = 12;     // var(--space-3) = 12px
    const DEFAULT_MIN = 56;     // min-height on list-item
    const EASING = 'var(--dur-4) cubic-bezier(.2,0,.2,1)';

    root.querySelectorAll(SEL).forEach(item => {
      if (item._muListExpand) return;
      item._muListExpand = true;

      const getSiblings = () => {
        const parent = item.parentElement;
        return [...parent.children].filter(el =>
          (el.classList.contains('list-item') || el.classList.contains('menu-item')) && el !== item
        );
      };

      const getAllItems = () => {
        const parent = item.parentElement;
        return [...parent.children].filter(el =>
          el.classList.contains('list-item') || el.classList.contains('menu-item')
        );
      };

      item.addEventListener('pointerdown', () => {
        const siblings = getSiblings();
        if (!siblings.length) return;
        const allItems  = getAllItems();
        const myIdx     = allItems.indexOf(item);
        const totalGrow = GROW * 2; // total px the list needs to absorb

        // weight by inverse distance — closer siblings shrink more
        const dists  = siblings.map(s => Math.abs(allItems.indexOf(s) - myIdx));
        const invSum = dists.reduce((a, d) => a + 1 / d, 0);
        const shrinks = dists.map(d => (1 / d / invSum) * totalGrow);

        const tr = `padding ${EASING}, min-height ${EASING}`;

        item.style.transition  = tr;
        item.style.paddingTop  = (DEFAULT_PAD + GROW) + 'px';
        item.style.paddingBottom = (DEFAULT_PAD + GROW) + 'px';

        siblings.forEach((sib, i) => {
          const half   = shrinks[i] / 2;
          const newPad = Math.max(3, DEFAULT_PAD - half);
          const newMin = Math.max(28, DEFAULT_MIN - shrinks[i]);
          sib.style.transition    = tr;
          sib.style.paddingTop    = newPad + 'px';
          sib.style.paddingBottom = newPad + 'px';
          sib.style.minHeight     = newMin + 'px';
        });
      });

      const reset = () => {
        const tr = `padding ${EASING}, min-height ${EASING}`;
        item.style.transition    = tr;
        item.style.paddingTop    = '';
        item.style.paddingBottom = '';
        getSiblings().forEach(sib => {
          sib.style.transition    = tr;
          sib.style.paddingTop    = '';
          sib.style.paddingBottom = '';
          sib.style.minHeight     = '';
        });
      };

      item.addEventListener('pointerup',     reset);
      item.addEventListener('pointerleave',  reset);
      item.addEventListener('pointercancel', reset);
    });
  }


  function initAccordions(root = document) {
    root.querySelectorAll('.accordion-trigger').forEach(trigger => {
      if (trigger._muInit) return;
      trigger._muInit = true;
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');
        item.closest('.accordion')?.querySelectorAll('.accordion-item.open').forEach(o => o.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     TABS — sliding indicator that moves between tabs
     ───────────────────────────────────────────────────────── */
  function initTabs(root = document) {
    root.querySelectorAll('.tabs').forEach(tabs => {
      if (tabs._muInit) return;
      tabs._muInit = true;

      // inject sliding indicator
      const ind = document.createElement('div');
      ind.className = 'tab-indicator';
      tabs.appendChild(ind);

      function moveIndicator(tab) {
        const tabsRect = tabs.getBoundingClientRect();
        const tabRect  = tab.getBoundingClientRect();
        // no transition on first paint
        ind.style.left  = (tabRect.left - tabsRect.left) + 'px';
        ind.style.width = tabRect.width + 'px';
      }

      // first render — no transition
      const firstActive = tabs.querySelector('.tab.active');
      if (firstActive) {
        ind.style.transition = 'none';
        requestAnimationFrame(() => {
          moveIndicator(firstActive);
          requestAnimationFrame(() => { ind.style.transition = ''; });
        });
      }

      tabs.querySelectorAll('.tab').forEach((tab, i) => {
        tab.addEventListener('click', () => {
          tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          moveIndicator(tab);
          const panelId = tab.dataset.panel;
          if (panelId) {
            document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);
            const panel = document.getElementById(panelId);
            if (panel) panel.hidden = false;
          }
          tabs.dispatchEvent(new CustomEvent('mu:tabchange', { detail: { index: i, tab } }));
        });
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     SEGMENTED
     ───────────────────────────────────────────────────────── */
  function initSegmented(root = document) {
    root.querySelectorAll('.segmented').forEach(seg => {
      if (seg._muInit) return;
      seg._muInit = true;
      seg.querySelectorAll('.segmented-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          seg.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     NAV BAR — sliding pill
     ───────────────────────────────────────────────────────── */
  function initNavBar(root = document) {
    root.querySelectorAll('.nav-bar').forEach(nav => {
      if (nav._muInit) return;
      nav._muInit = true;
      const pill = document.createElement('div');
      pill.className = 'nav-pill';
      nav.appendChild(pill);

      function movePill(item) {
        const nr = nav.getBoundingClientRect();
        const ir = item.getBoundingClientRect();
        const w  = 64;
        pill.style.left = Math.round(ir.left - nr.left + (ir.width - w) / 2) + 'px';
      }

      const active = nav.querySelector('.nav-item.active');
      if (active) {
        pill.style.transition = 'none';
        requestAnimationFrame(() => {
          movePill(active);
          requestAnimationFrame(() => { pill.style.transition = ''; });
        });
      }

      nav.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          nav.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          movePill(item);
        });
    });
  });
}

  /* ─────────────────────────────────────────────────────────
     GLASS DOCK — floating pill nav, auto-injects indicator
     ───────────────────────────────────────────────────────── */
  function initDock(root = document) {
    root.querySelectorAll('.nav-dock').forEach(dock => {
      if (dock._muInit) return;
      dock._muInit = true;

      // inject indicator if not in markup
      let ind = dock.querySelector(':scope > .dock-indicator');
      if (!ind) {
        ind = document.createElement('div');
        ind.className = 'dock-indicator';
        dock.insertBefore(ind, dock.firstChild);
      }

      function posInd(item) {
        const dr = dock.getBoundingClientRect();
        const ir = item.getBoundingClientRect();
        ind.style.left   = (ir.left - dr.left - 2) + 'px';
        ind.style.top    = (ir.top  - dr.top  - 2) + 'px';
        ind.style.width  = (ir.width  + 4) + 'px';
        ind.style.height = (ir.height + 4) + 'px';
      }

      const active = dock.querySelector('.dock-item.active');
      if (active) {
        ind.style.transition = 'none';
        requestAnimationFrame(() => {
          posInd(active);
          requestAnimationFrame(() => { ind.style.transition = ''; });
        });
      }

      dock.querySelectorAll('.dock-item').forEach(item => {
        item.addEventListener('click', () => {
          dock.querySelectorAll('.dock-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          posInd(item);
          dock.dispatchEvent(new CustomEvent('mu:dockchange', { detail: { item }, bubbles: true }));
        });
      });

      window.addEventListener('resize', () => {
        const a = dock.querySelector('.dock-item.active');
        if (a) posInd(a);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     CHIPS
     ───────────────────────────────────────────────────────── */
  function initChips(root = document) {
    root.querySelectorAll('.chip-filter, .chip-suggestion').forEach(chip => {
      if (chip._muInit) return;
      chip._muInit = true;
      chip.addEventListener('click', () => chip.classList.toggle('chip-selected'));
    });
  }

  /* ─────────────────────────────────────────────────────────
     SLIDER — fills track, updates value display
     Gets computed primary color so inline styles resolve
     ───────────────────────────────────────────────────────── */
  function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function updateSlider(slider) {
    const min  = +slider.min  || 0;
    const max  = +slider.max  || 100;
    const val  = Math.min(max, Math.max(min, +slider.value));
    const isVert = slider.classList.contains('slider-vert');
    const fraction = (val - min) / (max - min);

    const THUMB_W = 4;
    const GAP     = parseFloat(slider.style.getPropertyValue('--_gap')) || 8;

    const elW     = isVert ? slider.offsetHeight : slider.offsetWidth;
    const usable  = elW - THUMB_W;
    const thumbCx = fraction * usable + THUMB_W / 2;

    const zeroAttr = slider.dataset.zero;
    if (zeroAttr != null) {
      // bidirectional fill: fill runs between zero-point and thumb
      const zero     = +zeroAttr;
      const zeroFrac = Math.min(1, Math.max(0, (zero - min) / (max - min)));
      const zeroCx   = zeroFrac * usable + THUMB_W / 2;
      const lo = Math.min(thumbCx, zeroCx);
      const hi = Math.max(thumbCx, zeroCx);
      // fill = segment between lo and hi; split into bottom-anchor + top-anchor gaps
      const fillStart  = Math.max(0, (lo - GAP / 2) / elW * 100).toFixed(4);
      const fillEnd    = Math.max(0, (elW - hi - GAP / 2) / elW * 100).toFixed(4);
      slider.style.setProperty('--_fill-pct',  fillStart + '%');
      slider.style.setProperty('--_empty-pct', fillEnd   + '%');
    } else {
      const fillPct  = Math.max(0, (thumbCx - GAP / 2) / elW * 100).toFixed(4);
      const emptyPct = Math.max(0, (elW - thumbCx - GAP / 2) / elW * 100).toFixed(4);
      slider.style.setProperty('--_fill-pct',  fillPct  + '%');
      slider.style.setProperty('--_empty-pct', emptyPct + '%');
    }

    const warnAttr = slider.dataset.warnFrom;
    if (warnAttr != null && warnAttr !== '') {
      const warnFrac = Math.min(1, Math.max(0, (+warnAttr - min) / (max - min)));
      const warnCx   = warnFrac * usable + THUMB_W / 2;
      slider.style.setProperty('--_warn-w', Math.max(0, (elW - warnCx) / elW * 100).toFixed(4) + '%');
    } else if (slider.style.getPropertyValue('--_warn-w')) {
      slider.style.removeProperty('--_warn-w');
    }

    // horizontal only: nudge thumb so it stays visually centered on the fill
    // vertical sliders must not translateX — writing-mode rotates the axis
    if (!isVert) {
      const thumbDim = parseFloat(slider.style.getPropertyValue('--_thumb-w')) || THUMB_W;
      const offset = (THUMB_W - thumbDim) / 2 * (1 - 2 * fraction);
      slider.style.setProperty('--_thumb-offset', offset + 'px');
    } else {
      slider.style.setProperty('--_thumb-offset', '0px');
    }

    const wrap  = slider.closest('.slider-wrap');
    const valEl = wrap?.querySelector('.slider-value');
    if (valEl) valEl.textContent = slider.value;
  }

  function animateSliderPress(slider, pressing) {
    if (slider._muPressRaf) cancelAnimationFrame(slider._muPressRaf);

    const fromH  = parseFloat(slider.style.getPropertyValue('--_track-h'))  || 6;
    const fromW  = parseFloat(slider.style.getPropertyValue('--_thumb-w'))  || 4;
    const fromTH = parseFloat(slider.style.getPropertyValue('--_thumb-h'))  || 20;
    const toH    = pressing ? 10 : 6;
    const toW    = pressing ? 2  : 4;
    const toTH   = pressing ? 28 : 20;

    const dur = 100;
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);

    function frame(now) {
      const t  = Math.min((now - start) / dur, 1);
      const et = ease(t);

      const h  = fromH  + (toH  - fromH)  * et;
      const w  = fromW  + (toW  - fromW)   * et;
      const th = fromTH + (toTH - fromTH)  * et;

      const gap = pressing ? 4 + (8 - 4) * (1 - et) : 4 + (8 - 4) * et;
      slider.style.setProperty('--_track-h', h    + 'px');
      slider.style.setProperty('--_thumb-w', w    + 'px');
      slider.style.setProperty('--_thumb-h', th   + 'px');
      slider.style.setProperty('--_gap',     gap  + 'px');
      updateSlider(slider);

      if (t < 1) {
        slider._muPressRaf = requestAnimationFrame(frame);
      } else {
        slider._muPressRaf = null;
      }
    }
    slider._muPressRaf = requestAnimationFrame(frame);
  }

  function initSliders(root = document) {
    root.querySelectorAll('input[type="range"].slider').forEach(slider => {
      if (slider._muInit) return;
      slider._muInit = true;
      slider.addEventListener('input', () => updateSlider(slider));
      slider.addEventListener('pointerdown', () => animateSliderPress(slider, true));
      slider.addEventListener('pointerup',   () => animateSliderPress(slider, false));
      slider.addEventListener('pointercancel', () => animateSliderPress(slider, false));
      const ro = new ResizeObserver(() => updateSlider(slider));
      // observe parent too — vertical sliders use height:100% so their own
      // offsetHeight is derived from the parent's flex layout; RO on self
      // won't fire until something resizes the slider's own box, which never
      // happens if the parent is what's changing (e.g. eq-slider-wrap flex:1)
      ro.observe(slider);
      if (slider.parentElement) ro.observe(slider.parentElement);
      slider._muRO = ro;
      updateSlider(slider);
      // double-rAF: first frame commits layout, second reads correct offsetHeight
      // single rAF is not enough when the slider is inside a freshly injected DOM subtree
      requestAnimationFrame(() => requestAnimationFrame(() => updateSlider(slider)));
    });
  }

  document.addEventListener('mu:themechange', (e) => {
    if (e.detail && e.detail.anim) return;
    document.querySelectorAll('input[type="range"].slider').forEach(updateSlider);
  });

  /* ─────────────────────────────────────────────────────────
     WAVY LINE GENERATOR
     Generates an SVG <path> d-string for a sine wave that can
     be used as a straight wavy line OR wrapped around a circle.

     opts (linear):
       width       — total width px (default 200)
       height      — svg height px (default 24)
       amplitude   — wave amplitude px (default 6)
       frequency   — cycles across width (default 2.5)
       phase       — phase offset radians (default 0)
       strokeWidth — stroke width px (default 3)
       steps       — path resolution (default 120)
       cap         — 'round'|'square'|'butt' (default 'round')
       progress    — 0–1, clips wave to this fraction (default 1)
       tail        — if progress < 1, fade tail length 0–1 (default 0.18)

     opts (circular):
       mode        — 'circular'
       radius      — circle radius px (default 40)
       amplitude   — radial wave amplitude px (default 5)
       frequency   — wave cycles around full circle (default 8)
       phase       — phase offset radians (default 0)
       strokeWidth — stroke width px (default 3)
       steps       — path resolution (default 200)
       progress    — 0–1, arc fraction (default 1)
       cap         — 'round'|'butt' (default 'round')

     Returns: { d, viewBox, totalLength }  (no side effects)
     ───────────────────────────────────────────────────────── */
  function wavyLinePath({
    mode        = 'linear',
    // linear
    width       = 200,
    height      = 24,
    // circular
    radius      = 40,
    // shared
    amplitude   = 6,
    frequency   = 2.5,
    phase       = 0,
    strokeWidth = 3,
    steps       = 0,  // auto
    cap         = 'round',
    progress    = 1,
    tail        = 0.18,
  } = {}) {
    const prog = Math.min(1, Math.max(0, progress));

    if (mode === 'circular') {
      const res   = steps || 220;
      const total = Math.PI * 2 * prog;
      const cx    = radius + amplitude + strokeWidth;
      const cy    = cx;
      const size  = cx * 2;

      const pts = [];
      for (let i = 0; i <= res; i++) {
        const t     = i / res;
        const angle = -Math.PI / 2 + total * t;  // start at top
        const wave  = amplitude * Math.sin(frequency * Math.PI * 2 * t + phase);
        const r     = radius + wave;
        pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
      }

      let d = '';
      pts.forEach(([x, y], i) => {
        d += i === 0 ? `M${x.toFixed(2)},${y.toFixed(2)}` : `L${x.toFixed(2)},${y.toFixed(2)}`;
      });

      return { d, viewBox: `0 0 ${size} ${size}`, size };

    } else {
      // linear
      const res   = steps || 140;
      const mid   = height / 2;
      const endX  = width * prog;

      const pts = [];
      for (let i = 0; i <= res; i++) {
        const t = i / res;
        const x = t * width;
        if (x > endX + strokeWidth) break;
        const wave = amplitude * Math.sin(frequency * Math.PI * 2 * t + phase);
        pts.push([x, mid + wave]);
      }

      let d = '';
      pts.forEach(([x, y], i) => {
        d += i === 0 ? `M${x.toFixed(2)},${y.toFixed(2)}` : `L${x.toFixed(2)},${y.toFixed(2)}`;
      });

      return { d, viewBox: `0 0 ${width} ${height}`, width, height };
    }
  }

  /* ─────────────────────────────────────────────────────────
     WAVE PROGRESS — full component builder
     el        — container element
     opts:
       mode        — 'linear' | 'circular'
       value       — 0–100 or null for indeterminate
       color       — css color or 'primary' (default)
       trackColor  — css color or 'surface' (default)
       amplitude   — wave px (linear: default 5, circular: default 4)
       frequency   — wave cycles (linear: default 3, circular: default 9)
       strokeWidth — line width px (default 3)
       width       — for linear (default: fills container)
       height      — for linear (default 28)
       radius      — for circular (default 40)
       animateWave — boolean, animate phase (default true)
       animSpeed   — phase radians/sec (default 3)
       easing      — CSS easing for value transitions
     returns { setValue(v), setAmplitude(a), setFrequency(f), destroy() }
     ───────────────────────────────────────────────────────── */
  function waveProgress(el, opts = {}) {
    const mode        = opts.mode        ?? 'linear';
    const strokeWidth = opts.strokeWidth ?? 3;
    const animateWave = opts.animateWave ?? !prefersReduced();
    const animSpeed   = opts.animSpeed   ?? 3;

    let amplitude  = opts.amplitude  ?? (mode === 'circular' ? 4 : 5);
    let frequency  = opts.frequency  ?? (mode === 'circular' ? 9 : 3);
    let currentVal = opts.value      != null ? Math.min(100, Math.max(0, opts.value)) : null;
    let phase      = 0;
    let raf        = null;
    let destroyed  = false;
    let lastTime   = null;

    // resolve colors via CSS vars
    function resolveColor(c) {
      if (!c || c === 'primary') return 'var(--color-primary)';
      if (c === 'secondary')     return 'var(--color-secondary)';
      if (c === 'tertiary')      return 'var(--color-tertiary)';
      if (c === 'error')         return 'var(--color-error)';
      if (c === 'surface')       return 'var(--color-surface-container-highest)';
      return c;
    }

    const fillColor  = resolveColor(opts.color);
    const trackColor = resolveColor(opts.trackColor ?? 'surface');
    const cap        = opts.cap ?? 'round';

    // build SVG skeleton
    el.classList.add('mu-wave-progress');
    el.style.display = 'inline-flex';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.overflow = 'visible';

    // track path (always full)
    const trackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    trackPath.setAttribute('fill', 'none');
    trackPath.setAttribute('stroke', trackColor);
    trackPath.setAttribute('stroke-width', strokeWidth);
    trackPath.setAttribute('stroke-linecap', cap);
    trackPath.style.opacity = '0.28';

    // fill path (progress)
    const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fillPath.setAttribute('fill', 'none');
    fillPath.setAttribute('stroke', fillColor);
    fillPath.setAttribute('stroke-width', strokeWidth);
    fillPath.setAttribute('stroke-linecap', cap);

    // head glow dot (linear only)
    let headDot = null;
    if (mode === 'linear') {
      headDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      headDot.setAttribute('fill', fillColor);
      headDot.setAttribute('r', (strokeWidth * 1.5).toFixed(1));
    }

    svg.appendChild(trackPath);
    svg.appendChild(fillPath);
    if (headDot) svg.appendChild(headDot);
    el.appendChild(svg);

    // sizing
    function getLinearWidth() {
      if (opts.width) return opts.width;
      const pw = el.parentElement?.clientWidth;
      return pw && pw > 0 ? pw : 200;
    }

    function buildGeometry() {
      const prog = currentVal != null ? currentVal / 100 : 1;

      if (mode === 'circular') {
        const r    = opts.radius ?? 40;
        const size = (r + amplitude + strokeWidth) * 2;
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.setAttribute('width',  size);
        svg.setAttribute('height', size);

        // track: full circle
        const { d: dTrack } = wavyLinePath({ mode: 'circular', radius: r, amplitude, frequency, phase, strokeWidth, progress: 1 });
        trackPath.setAttribute('d', dTrack);

        // fill: progress arc
        const { d: dFill } = wavyLinePath({ mode: 'circular', radius: r, amplitude, frequency, phase, strokeWidth, progress: prog });
        fillPath.setAttribute('d', dFill);

      } else {
        const w   = getLinearWidth();
        const h   = opts.height ?? Math.max(28, amplitude * 3 + strokeWidth * 2);
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('width',  w);
        svg.setAttribute('height', h);

        // track: full line, dimmed
        const { d: dTrack } = wavyLinePath({ mode: 'linear', width: w, height: h, amplitude, frequency, phase, strokeWidth, progress: 1 });
        trackPath.setAttribute('d', dTrack);

        // fill: up to progress
        const { d: dFill, width: _w, height: _h } = wavyLinePath({ mode: 'linear', width: w, height: h, amplitude, frequency, phase, strokeWidth, progress: prog });
        fillPath.setAttribute('d', dFill);

        // head dot position
        if (headDot && prog > 0.01) {
          const endX  = w * prog;
          const endY  = h / 2 + amplitude * Math.sin(frequency * Math.PI * 2 * prog + phase);
          headDot.setAttribute('cx', endX.toFixed(2));
          headDot.setAttribute('cy', endY.toFixed(2));
          headDot.style.opacity = '1';
        } else if (headDot) {
          headDot.style.opacity = '0';
        }
      }
    }

    // indeterminate: flow phase, no defined progress
    function loop(now) {
      if (destroyed) return;
      if (lastTime) {
        const dt = (now - lastTime) / 1000;
        phase += animSpeed * dt;
        if (phase > Math.PI * 2) phase -= Math.PI * 2;
      }
      lastTime = now;
      buildGeometry();
      raf = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (raf) return;
      lastTime = null;
      raf = requestAnimationFrame(loop);
    }

    function stopLoop() {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    // value transition
    let transRaf = null;
    let fromVal  = currentVal ?? 0;

    function setValue(v) {
      const indeterminate = v == null;

      if (indeterminate) {
        currentVal = null;
        el.classList.add('mu-wave-indeterminate');
        if (animateWave) startLoop();
        else buildGeometry();
        return;
      }

      el.classList.remove('mu-wave-indeterminate');
      const toVal = Math.min(100, Math.max(0, v));

      if (!animateWave) {
        // still animate the value fill even if wave is static
        const start = performance.now();
        const dur   = 400;
        const from  = currentVal ?? 0;
        currentVal  = toVal;
        if (transRaf) cancelAnimationFrame(transRaf);
        const step = now => {
          const t  = Math.min((now - start) / dur, 1);
          const et = 1 - Math.pow(1 - t, 3);
          currentVal = from + (toVal - from) * et;
          buildGeometry();
          if (t < 1) transRaf = requestAnimationFrame(step);
          else { transRaf = null; currentVal = toVal; buildGeometry(); }
        };
        transRaf = requestAnimationFrame(step);
      } else {
        // animate value + keep wave phase going
        const start = performance.now();
        const dur   = 400;
        const from  = currentVal ?? 0;
        stopLoop();
        lastTime = null;
        if (transRaf) cancelAnimationFrame(transRaf);
        const step = now => {
          const t  = Math.min((now - start) / dur, 1);
          const et = 1 - Math.pow(1 - t, 3);
          if (lastTime) {
            const dt = (now - lastTime) / 1000;
            phase += animSpeed * dt;
            if (phase > Math.PI * 2) phase -= Math.PI * 2;
          }
          lastTime = now;
          currentVal = from + (toVal - from) * et;
          buildGeometry();
          if (t < 1) { transRaf = requestAnimationFrame(step); }
          else { transRaf = null; currentVal = toVal; buildGeometry(); startLoop(); }
        };
        transRaf = requestAnimationFrame(step);
      }
    }

    function setAmplitude(a) {
      amplitude = a;
      if (!raf) buildGeometry();
    }

    function setFrequency(f) {
      frequency = f;
      if (!raf) buildGeometry();
    }

    function destroy() {
      destroyed = true;
      stopLoop();
      if (transRaf) cancelAnimationFrame(transRaf);
      el.innerHTML = '';
      el.classList.remove('mu-wave-progress', 'mu-wave-indeterminate');
    }

    // ResizeObserver for linear auto-width
    let ro = null;
    if (mode === 'linear' && !opts.width) {
      ro = new ResizeObserver(() => { if (!destroyed) buildGeometry(); });
      if (el.parentElement) ro.observe(el.parentElement);
    }

    // initial render
    setValue(opts.value != null ? opts.value : null);

    return { setValue, setAmplitude, setFrequency, destroy };
  }

  /* ─────────────────────────────────────────────────────────
     CIRCULAR PROGRESS
     Indeterminate: fixed arc that rotates — no snap
     ───────────────────────────────────────────────────────── */
  function circularProgress(el, opts = {}) {
    const size   = opts.size   ?? 48;
    const stroke = opts.stroke ?? 4;
    const r      = (size - stroke) / 2;
    const circ   = 2 * Math.PI * r;

    el.classList.add('progress-circular');
    el.style.width = el.style.height = size + 'px';

    el.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <circle class="track" cx="${size/2}" cy="${size/2}" r="${r}"
          stroke-width="${stroke}"
          stroke-dasharray="${circ.toFixed(2)}"
          stroke-dashoffset="0"/>
        <circle class="fill" cx="${size/2}" cy="${size/2}" r="${r}"
          stroke-width="${stroke}"
          stroke-dasharray="${circ.toFixed(2)}"
          stroke-dashoffset="${circ.toFixed(2)}"/>
      </svg>`;

    const svgEl  = el.querySelector('svg');
    const fillEl = el.querySelector('.fill');

    function setIndeterminate() {
      el.classList.add('indeterminate');
      // Fixed arc of 25% — SVG just rotates, no dashoffset animation = no snap
      const arc = circ * 0.25;
      fillEl.style.strokeDasharray  = `${arc.toFixed(2)} ${(circ - arc).toFixed(2)}`;
      fillEl.style.strokeDashoffset = '0';
      // Start the -90deg base offset via transform on the svg
      svgEl.style.transform = 'rotate(-90deg)';
      svgEl.style.transformOrigin = 'center';
    }

    function setValue(v) {
      if (v == null) {
        setIndeterminate();
      } else {
        el.classList.remove('indeterminate');
        svgEl.style.animation = 'none';
        svgEl.style.transform = 'rotate(-90deg)';
        svgEl.style.transformOrigin = 'center';
        const clamped = Math.min(100, Math.max(0, v));
        fillEl.style.strokeDasharray  = circ.toFixed(2);
        fillEl.style.strokeDashoffset = (circ - (clamped / 100) * circ).toFixed(2);
      }
    }

    setValue(opts.value ?? null);
    return { setValue };
  }

  /* ─────────────────────────────────────────────────────────
     SNACKBAR — instant replace, no flash/stacking
     ───────────────────────────────────────────────────────── */
  let _activeSnackbar = null;

  function getSnackbarContainer() {
    let c = document.querySelector('.snackbar-container');
    if (!c) { c = document.createElement('div'); c.className = 'snackbar-container'; document.body.appendChild(c); }
    return c;
  }

  function snackbar(message, opts = {}) {
    const container = getSnackbarContainer();

    // instant remove old — no dismiss animation on replace to avoid flash/stacking
    if (_activeSnackbar) {
      clearTimeout(_activeSnackbar._timer);
      if (_activeSnackbar._el?.parentNode) {
        _activeSnackbar._el.style.transition = 'none';
        _activeSnackbar._el.remove();
      }
      _activeSnackbar = null;
    }

    const el = document.createElement('div');
    el.className = 'snackbar';
    el.textContent = message;

    if (opts.action) {
      const btn = document.createElement('button');
      btn.className = 'snackbar-action';
      btn.textContent = opts.action;
      btn.addEventListener('click', () => { opts.onAction?.(); obj.dismiss(); });
      el.appendChild(btn);
    }

    container.appendChild(el);
    const timer = setTimeout(() => obj.dismiss(), opts.duration ?? 4000);

    const obj = {
      _timer: timer,
      _el: el,
      dismiss() {
        clearTimeout(timer);
        if (_activeSnackbar === obj) _activeSnackbar = null;
        el.style.cssText += ';opacity:0;transform:translateY(8px) scale(0.95);transition:opacity 200ms ease,transform 240ms var(--ease-spring-soft)';
        setTimeout(() => { if (el.parentNode) el.remove(); }, 260);
      }
    };

    _activeSnackbar = obj;
    return obj;
  }

  /* ─────────────────────────────────────────────────────────
     DIALOG
     ───────────────────────────────────────────────────────── */
  function dialog(opts = {}) {
    const backdrop = document.createElement('div');
    backdrop.className = 'dialog-backdrop';
    const dlg = document.createElement('div');
    dlg.className = 'dialog';

    if (opts.icon) {
      const icon = document.createElement('div');
      icon.className = 'dialog-icon';
      icon.textContent = opts.icon; // text/emoji, no bounce anim
      dlg.appendChild(icon);
    }
    if (opts.title) {
      const t = document.createElement('div');
      t.className = 'dialog-title';
      t.textContent = opts.title;
      dlg.appendChild(t);
    }
    if (opts.body) {
      const b = document.createElement('div');
      b.className = 'dialog-body';
      b.textContent = opts.body;
      dlg.appendChild(b);
    }

    const actions = document.createElement('div');
    actions.className = 'dialog-actions';

    const close = () => {
      backdrop.style.cssText += ';opacity:0;transition:opacity 200ms ease';
      dlg.style.cssText += ';opacity:0;transform:scale(0.92);transition:opacity 200ms ease,transform 240ms var(--ease-spring-soft)';
      setTimeout(() => backdrop.remove(), 240);
    };

    (opts.actions || [{ label: 'OK', variant: 'btn-text' }]).forEach(a => {
      const btn = document.createElement('button');
      btn.className = `btn ${a.variant || 'btn-text'}`;
      btn.textContent = a.label;
      btn.addEventListener('click', () => { a.fn?.(); close(); });
      actions.appendChild(btn);
    });
    attachRipples(actions);

    dlg.appendChild(actions);
    backdrop.appendChild(dlg);
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
    return { close };
  }

  /* ─────────────────────────────────────────────────────────
     DRAWER STACK — generic manager for natively stackable
     drawers/sheets/menus. Each push() gets its own dedicated
     backdrop layered directly beneath it, so opening drawer #2
     on top of drawer #1 dims drawer #1 (and everything below it)
     instead of fighting over one shared backdrop.

     Usage:
       const handle = MU.drawerStack.push(el, {
         baseZ: 1500,        // z-index of the first ("floor") drawer
         step: 10,           // z-index gap reserved per stacked drawer
         backdropClass: 'mob-sheet-backdrop',
         dismissOnBackdrop: true,   // tap backdrop -> onDismiss
         onDismiss: () => { ... }
       });
       // el.style.zIndex is now set; handle.backdrop is the element
       // directly under el. handle.depth is this drawer's 1-based
       // position in the stack.
       handle.pop();   // on close: removes el's backdrop, restores
                        // pointer-events/visibility to the drawer
                        // (if any) now left on top.
     ───────────────────────────────────────────────────────── */
  const DrawerStack = (() => {
    const stack = []; // ordered bottom -> top, each: {el, backdrop, opts, z}

    function ensureBackdropFor(entry, container) {
      const bd = document.createElement('div');
      bd.className = entry.opts.backdropClass || 'mob-sheet-backdrop';
      bd.dataset.muDrawerBackdrop = '1';
      bd.style.pointerEvents = 'none';
      bd.style.zIndex = String(entry.z - 1);
      container.insertBefore(bd, entry.el);
      entry.backdrop = bd;
      return bd;
    }

    function show(entry) {
      entry.backdrop.style.opacity = '';
      entry.backdrop.classList.add('on');
      requestAnimationFrame(() => {
        entry.backdrop.classList.add('visible');
        entry.backdrop.style.pointerEvents = 'auto';
      });
    }

    function hideAndRemove(entry, immediate) {
      const bd = entry.backdrop;
      if (!bd) return;
      bd.style.pointerEvents = 'none';
      bd.classList.remove('visible');
      const finish = () => bd.remove();
      if (immediate || prefersReduced()) { finish(); return; }
      setTimeout(finish, 260);
    }

    function push(el, opts = {}) {
      const baseZ = opts.baseZ ?? 1500;
      const step  = opts.step  ?? 10;
      const depth = stack.length + 1;
      const z     = baseZ + (depth - 1) * step;

      const entry = { el, opts, z, backdrop: null };
      const container = el.parentElement || document.body;

      el.style.zIndex = String(z);
      el.dataset.muDrawerDepth = String(depth);

      ensureBackdropFor(entry, container);
      show(entry);

      if (opts.dismissOnBackdrop !== false) {
        entry.backdrop.addEventListener('pointerdown', e => {
          if (e.target !== entry.backdrop) return;
          opts.onDismiss?.();
        });
      }

      stack.push(entry);

      return {
        depth,
        backdrop: entry.backdrop,
        pop(immediate) {
          const idx = stack.indexOf(entry);
          if (idx === -1) return;
          stack.splice(idx, 1);
          hideAndRemove(entry, immediate);
          delete el.dataset.muDrawerDepth;
        }
      };
    }

    function isTop(el) {
      const top = stack[stack.length - 1];
      return !!top && top.el === el;
    }

    function depthOf(el) {
      const e = stack.find(s => s.el === el);
      return e ? stack.indexOf(e) + 1 : 0;
    }

    function backdropFor(el) {
      const e = stack.find(s => s.el === el);
      return e ? e.backdrop : null;
    }

    function size() { return stack.length; }

    return { push, isTop, depthOf, backdropFor, size };
  })();

  /* ─────────────────────────────────────────────────────────
     SHEET DRAG — universal drag-to-dismiss for bottom-sheet
     drawers. Works with touch and pointer (mouse/stylus).
     el            — the sheet element
     onDismiss     — called when drag-dismiss threshold reached
     getScrollable — unused, kept so signal stays the 4th arg
                     (scroll conflicts are auto detected from the touch target)
     signal        — optional AbortSignal to remove listeners

     Backdrop resolution: if el was registered via
     MU.drawerStack.push(), its own dedicated backdrop is faded —
     this is what makes drag work correctly when drawers are
     stacked. Otherwise falls back to the legacy single shared
     .mob-sheet-backdrop lookup for backwards compatibility.
     ───────────────────────────────────────────────────────── */
  function resolveBackdrop(el) {
    return DrawerStack.backdropFor(el) ??
           el.parentElement?.querySelector('.mob-sheet-backdrop') ??
           document.querySelector('.mob-sheet-backdrop');
  }

  function initSheetDrag(el, onDismiss, _getScrollable, signal) {
    const BODY_THRESHOLD = 12;
    // nearest ancestor (up to el) that scrolls vertically, null if none
    const scrollerOf = t => {
      for (let n = t; n; n = n.parentElement) {
        if (n.scrollHeight > n.clientHeight + 1 && /(auto|scroll|overlay)/.test(getComputedStyle(n).overflowY)) return n;
        if (n === el) break;
      }
      return null;
    };

    let dragging = false, startY = 0, lastY = 0, rafPending = false;
    let dismissing = false; // slide-out in flight: ignore new drags and cancels until it settles
    let prevY = 0, prevT = 0, lastT = 0, velocity = 0, zk = 1, elH = 1;

    function applyDrag() {
      rafPending = false;
      if (!dragging) return;
      const dy = lastY - startY;
      if (dy < 0) {
        const scale = 1 + Math.abs(dy) * 0.0004;
        el.style.transformOrigin = 'bottom';
        el.style.transform = `scaleY(${Math.min(scale, 1.05)})`;
      } else {
        el.style.transformOrigin = '';
        el.style.transform = `translateY(${dy / zk}px)`;
      }
      // fade this drawer's own backdrop (stacked-aware)
      const bd = resolveBackdrop(el);
      if (bd) bd.style.opacity = dy > 0 ? String(Math.max(0, 1 - dy / (elH * 0.6))) : '1';
    }

    function scheduleApply(y) {
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) { velocity = (y - lastY) / dt; }
      prevY = lastY; prevT = lastT;
      lastY = y; lastT = now;
      if (!rafPending) { rafPending = true; requestAnimationFrame(applyDrag); }
    }

    function beginDrag(y) {
      if (dismissing) return;
      dragging = true; startY = y; lastY = y; rafPending = false;
      velocity = 0; prevY = y; prevT = 0; lastT = performance.now();
      const _h = el.offsetHeight;
      const _r = _h ? el.getBoundingClientRect().height / _h : 1;
      const _zkOld = (_r > 0.25 && _r < 4) ? _r : 1;
      el.style.setProperty('transition', 'none', 'important');
      const _prevT = el.style.transform;
      el.style.transform = 'translateY(0px)';
      const _t0 = el.getBoundingClientRect().top;
      el.style.transform = 'translateY(100px)';
      const _t1 = el.getBoundingClientRect().top;
      el.style.transform = _prevT;
      const _p = (_t1 - _t0) / 100;
      zk = (_p > 0.25 && _p < 4) ? _p : 1;
      elH = _h;
      const bd = resolveBackdrop(el);
      if (bd) bd.style.transition = 'none'; // css opacity transition would trail the finger
    }

    function endDrag(y) {
      if (!dragging) return;
      dragging = false; rafPending = false;
      const dy = y - startY;
      const dismissThreshold = Math.max(60, el.offsetHeight * 0.4) * zk;
      // flick: fast downward velocity (px/ms) even with small distance
      const isFlick = velocity > 1 && dy > 10;
      if (dy > dismissThreshold || isFlick) {
        // animate slide-out then dismiss
        const remaining = el.offsetHeight - Math.max(dy, 0);
        const dur = isFlick ? Math.min(220, Math.max(80, remaining / (velocity * 1.5))) : 200;
        el.style.transition = `transform ${dur}ms cubic-bezier(0.4,0,1,1)`;
        el.style.transformOrigin = '';
        el.style.transform = `translateY(${el.offsetHeight}px)`;
        const bd = resolveBackdrop(el);
        if (bd) { bd.style.transition = `opacity ${dur}ms`; bd.style.opacity = '0'; }
        dismissing = true;
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          el.removeEventListener('transitionend', onEnd);
          // land on the hidden state with transitions off, so no frame can show the sheet
          // between the inline slide-out and the sheet's own hidden styles
          el.style.setProperty('transition', 'none', 'important');
          onDismiss();
          void el.offsetHeight;
          el.style.transition = ''; el.style.transform = ''; el.style.transformOrigin = '';
          if (bd) bd.style.transition = '';
          dismissing = false;
        };
        const onEnd = ev => { if (ev.target === el && ev.propertyName === 'transform') settle(); };
        el.addEventListener('transitionend', onEnd);
        setTimeout(settle, dur + 150); // fallback if transitionend never fires (interrupted, reduced motion)
      } else {
        // the host may take over the snap back with its own spring: el._sheetRelease(dy px, speed px/ms) returns true when it did
        if (dy > 0 && typeof el._sheetRelease === 'function' && el._sheetRelease(dy / zk, (performance.now() - lastT > 100 ? 0 : velocity) / zk)) {
          const bd0 = resolveBackdrop(el);
          if (bd0) { bd0.style.transition = ''; bd0.style.opacity = ''; } // backdrop fades back in while the sheet springs
          return;
        }
        el.style.transition = '';
        el.style.transformOrigin = 'bottom';
        el.style.transform = '';
        const bd = resolveBackdrop(el);
        if (bd) { bd.style.transition = ''; bd.style.opacity = ''; }
        const cleanup = () => { el.style.transformOrigin = ''; el.removeEventListener('transitionend', cleanup); };
        el.addEventListener('transitionend', cleanup);
      }
    }

    function cancelDrag() {
      if (dismissing) return;
      dragging = false; rafPending = false;
      el.style.transition = ''; el.style.transform = ''; el.style.transformOrigin = '';
      const bd = resolveBackdrop(el);
      if (bd) { bd.style.transition = ''; bd.style.opacity = ''; }
    }

    const opt   = signal ? { passive: true,  signal } : { passive: true };
    const optNP = signal ? { passive: false, signal } : { passive: false };
    const optS  = signal ? { signal } : {};

    // ── touch ──────────────────────────────────────────────
    let bodyTouchStartY = 0, touchScroller = null;
    el.addEventListener('touchstart', e => {
      bodyTouchStartY = e.touches[0].clientY;
      touchScroller = scrollerOf(e.target);
    }, opt);

    el.addEventListener('touchmove', e => {
      const y = e.touches[0].clientY;
      if (!dragging) {
        // inside a scroller the drag may only start from a gesture the browser has not claimed: while the list is scrolled or the finger moves up the
        // start point keeps following the finger, so reaching the top mid scroll never turns into a sheet drag on top of the scroll
        if (touchScroller && (touchScroller.scrollTop > 0 || y <= bodyTouchStartY)) { bodyTouchStartY = y; return; }
        const dy = y - bodyTouchStartY;
        if (Math.abs(dy) < BODY_THRESHOLD) return;
        if (touchScroller && !e.cancelable) { bodyTouchStartY = y; return; } // the browser already owns this scroll
        beginDrag(y);
      }
      if (e.cancelable) e.preventDefault();
      scheduleApply(y);
    }, optNP);

    el.addEventListener('touchend',    e => endDrag(e.changedTouches[0].clientY), opt);
    el.addEventListener('touchcancel', cancelDrag, opt);

    // ── pointer (mouse/stylus) ──────────────────────────────
    let mousePendingY = null;

    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') return;
      if (scrollerOf(e.target)?.scrollTop > 4) return;
      mousePendingY = e.clientY;
    }, optS);

    el.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      if (mousePendingY !== null) {
        if (Math.abs(e.clientY - mousePendingY) < BODY_THRESHOLD) return;
        beginDrag(e.clientY);
        el.setPointerCapture(e.pointerId);
        mousePendingY = null;
      }
      if (!dragging) return;
      scheduleApply(e.clientY);
    }, optS);

    el.addEventListener('pointerup', e => {
      if (e.pointerType === 'touch') return;
      mousePendingY = null;
      endDrag(e.clientY);
    }, optS);

    el.addEventListener('pointercancel', e => {
      if (e.pointerType === 'touch') return;
      mousePendingY = null;
      cancelDrag();
    }, optS);
  }

  /* ─────────────────────────────────────────────────────────
     CONTEXT MENU — floating desktop + bottom sheet mobile
     items: { icon, label, fn }
             { sep: true }
             { header: 'string' }
             { icon, label, items: [...] }  ← submenu
             { icon, label, fn, destructive: true }
     Usage: MU.contextMenu(pointerEvent, items, opts?)
            opts.zoom — ui zoom scale (default 1)
     ───────────────────────────────────────────────────────── */
  function contextMenu(e, items, opts = {}) {
    const mobile = window.innerWidth <= 767;
    let _openSubmenu = null; // currently open submenu panel
    let _joinHandle  = null; // active joinSurfaces handle for panel+sub

    let _subCloseTimer = null;

    function closeSubmenu() {
      clearTimeout(_subCloseTimer);
      if (_joinHandle) { _joinHandle.destroy(); _joinHandle = null; }
      if (_openSubmenu) { _openSubmenu.remove(); _openSubmenu = null; }
    }

    function scheduleCloseSub() {
      clearTimeout(_subCloseTimer);
      _subCloseTimer = setTimeout(closeSubmenu, 80);
    }

    function cancelCloseSub() {
      clearTimeout(_subCloseTimer);
    }

    function buildPanel(itemList) {
      const panel = document.createElement('div');
      panel.className = 'mu-ctx';

      itemList.forEach(it => {
        if (it.sep) {
          const d = document.createElement('div');
          d.className = 'mu-ctx-sep';
          panel.appendChild(d);
          return;
        }
        if (it.header != null) {
          const d = document.createElement('div');
          d.className = 'mu-ctx-header';
          d.textContent = it.header;
          panel.appendChild(d);
          return;
        }

        const row = document.createElement('div');
        const hasSubmenu = Array.isArray(it.items) && it.items.length > 0;
        row.className = 'mu-ctx-item' + (it.destructive ? ' destructive' : '') + (hasSubmenu ? ' has-sub' : '');
        if (!mobile) row.classList.add('mu-ripple');

        const iconEl = document.createElement('span');
        iconEl.className = 'mu-ctx-icon';
        iconEl.innerHTML = it.icon || '';
        row.appendChild(iconEl);

        const labelEl = document.createElement('span');
        labelEl.className = 'mu-ctx-label';
        labelEl.textContent = it.label || '';
        row.appendChild(labelEl);

        if (hasSubmenu) {
          const arrow = document.createElement('span');
          arrow.className = 'mu-ctx-sub-arrow';
          arrow.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
          row.appendChild(arrow);

          const openSub = () => {
            cancelCloseSub();
            // already open for this row — keep it
            if (_openSubmenu && _openSubmenu._srcRow === row) return;
            closeSubmenu();

            const sub = buildPanel(it.items);
            sub.classList.add('mu-ctx-submenu');
            sub._srcRow = row;
            document.body.appendChild(sub);
            _openSubmenu = sub;

            // position flush to panel right edge, vertically aligned to row top
            const pr = panel.getBoundingClientRect();
            const rr = row.getBoundingClientRect();
            const sw = sub.offsetWidth;
            const sh = sub.offsetHeight;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            const flipped = pr.right + sw > vw - 8;
            sub.classList.toggle('mu-ctx-submenu-left', flipped);

            // sub left = panel right (flush, overlap border by 1px to ensure adjacency check passes)
            const subLeft = flipped ? pr.left - sw + 1 : pr.right - 1;
            // sub top aligned to row top, clamped to viewport
            let subTop = rr.top;
            if (subTop + sh > vh - 8) subTop = vh - sh - 8;
            sub.style.left = subLeft + 'px';
            sub.style.top  = Math.max(8, subTop) + 'px';

            // highlight the source row while sub is open
            row.classList.add('sub-open');
            const unHighlight = () => row.classList.remove('sub-open');

            // joinSurfaces draws the seamless combined silhouette over both panels
            _joinHandle = joinSurfaces([panel, sub], {
              styleFrom:   0,
              borderWidth: 1,
            });

            sub.addEventListener('mouseenter', cancelCloseSub);
            sub.addEventListener('mouseleave', scheduleCloseSub);
            const thisJoinHandle = _joinHandle;
            const observer = new MutationObserver(() => {
              if (!document.body.contains(sub)) {
                thisJoinHandle.destroy();
                if (_joinHandle === thisJoinHandle) _joinHandle = null;
                unHighlight();
                observer.disconnect();
              }
            });
            observer.observe(document.body, { childList: true });
          };

          row.addEventListener('mouseenter', openSub);
          row.addEventListener('mouseleave', scheduleCloseSub);
          row.addEventListener('click', e => { e.stopPropagation(); openSub(); });
        } else {
          row.addEventListener('click', () => {
            close();
            it.fn?.();
          });
          row.addEventListener('mouseenter', () => { scheduleCloseSub(); });
        }

        panel.appendChild(row);
      });

      return panel;
    }

    // ── mobile: bottom sheet ──────────────────────────────────
    if (mobile) {
      const backdrop = document.createElement('div');
      backdrop.className = 'mob-sheet-backdrop';
      const sh = document.createElement('div');
      sh.className = 'mu-ctx mu-ctx-sheet';

      const handleZone = document.createElement('div');
      handleZone.className = 'mob-sheet-handle-zone';
      const pip = document.createElement('div');
      pip.className = 'mob-sheet-handle';
      handleZone.appendChild(pip);
      sh.appendChild(handleZone);

      items.forEach(it => {
        if (it.sep) {
          const d = document.createElement('div'); d.className = 'mu-ctx-sep'; sh.appendChild(d); return;
        }
        if (it.header != null) {
          const d = document.createElement('div'); d.className = 'mu-ctx-header'; d.textContent = it.header; sh.appendChild(d); return;
        }
        const row = document.createElement('div');
        const hasSubmenu = Array.isArray(it.items) && it.items.length > 0;
        row.className = 'mu-ctx-item mu-ripple' + (it.destructive ? ' destructive' : '');
        row.innerHTML = `<span class="mu-ctx-icon">${it.icon || ''}</span><span class="mu-ctx-label">${it.label || ''}</span>${hasSubmenu ? '<span class="mu-ctx-sub-arrow"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>' : ''}`;
        row.addEventListener('click', () => {
          if (hasSubmenu) {
            // on mobile, submenus open as a new sheet replacing current
            close();
            contextMenu(e, it.items, opts);
          } else {
            close();
            it.fn?.();
          }
        });
        sh.appendChild(row);
      });

      document.body.appendChild(backdrop);
      document.body.appendChild(sh);
      initAll(sh);

      const handle = DrawerStack.push(sh, {
        backdropClass: 'mob-sheet-backdrop',
        dismissOnBackdrop: true,
        onDismiss: close,
      });
      backdrop.remove(); // DrawerStack provides its own

      requestAnimationFrame(() => requestAnimationFrame(() => {
        sh.classList.add('mu-ctx-sheet-open');
      }));

      initSheetDrag(sh, close, null);
      backdrop.addEventListener('click', close);

      function close() {
        sh.classList.remove('mu-ctx-sheet-open');
        setTimeout(() => { sh.remove(); backdrop.remove(); handle.pop(); }, 320);
      }

      return { close };
    }

    // ── desktop: floating popup ───────────────────────────────
    const panel = buildPanel(items);
    document.body.appendChild(panel);

    const z = opts.zoom || 1;
    const mx = e.clientX / z;
    const my = e.clientY / z;
    const vw = window.innerWidth / z;
    const vh = window.innerHeight / z;

    panel.style.visibility = 'hidden';
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    const left = Math.min(mx, vw - pw - 8);
    const top  = Math.min(my, vh - ph - 8);
    panel.style.left = left + 'px';
    panel.style.top  = top  + 'px';
    panel.style.transformOrigin = (mx - left) + 'px ' + (my - top) + 'px';
    panel.style.visibility = '';

    function close() {
      if (_joinHandle) { _joinHandle.destroy(); _joinHandle = null; }
      closeSubmenu();
      panel.remove();
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('contextmenu', onDocCtx, true);
      document.removeEventListener('keydown', onKey);
    }

    function onDocClick(ev) {
      if (!panel.contains(ev.target) && !_openSubmenu?.contains(ev.target)) close();
    }
    function onDocCtx(ev) {
      if (!panel.contains(ev.target) && !_openSubmenu?.contains(ev.target)) { ev.preventDefault(); close(); }
    }
    function onKey(ev) {
      if (ev.key === 'Escape') close();
    }

    setTimeout(() => {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('contextmenu', onDocCtx, true);
      document.addEventListener('keydown', onKey);
    }, 0);

    return { close };
  }

  /* ─────────────────────────────────────────────────────────
     JOIN SURFACES — SVG silhouette that merges multiple DOM elements
     into one continuous visual surface with proper inward corner curves,
     shared border stroke, and drop shadow applied to the combined shape.

     Architecture:
       • Each element gets clip-path: path(...) clipping it to its portion
         of the combined shape (so panel backgrounds are correctly shaped)
       • SVG sits ABOVE elements (z+2) with fill=none, stroke for border,
         feDropShadow for elevation — visible through transparent fill
       • Elements' own border/shadow/border-radius are suppressed (mu-joined)

     Usage:
       const join = MU.joinSurfaces(elements, opts)
       join.refresh()   // manual invalidate
       join.destroy()   // teardown

     elements: Array of DOM elements to merge
     opts:
       styleFrom     — index or element to inherit border/shadow from (default 0)
       cornerRadius  — override corner radius in px; null = read from element (default null)
       borderWidth   — px (default 1)
       watchScroll   — selector or element whose scroll triggers refresh (default null)
       zIndex        — SVG layer z-index (default: srcEl z-index + 2)
     ───────────────────────────────────────────────────────── */
  function joinSurfaces(elements, opts = {}) {
    const {
      styleFrom    = 0,
      cornerRadius = null,   // null = read from element
      borderWidth  = 1,
      watchScroll  = null,
      zIndex       = null,
    } = opts;

    const srcEl = typeof styleFrom === 'number' ? elements[styleFrom] : styleFrom;

    // ── global SVG layer (one per document) ──────────────────
    let svgRoot = document.getElementById('mu-join-svg-root');
    if (!svgRoot) {
      svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgRoot.id = 'mu-join-svg-root';
      Object.assign(svgRoot.style, {
        position: 'fixed', inset: '0', width: '100%', height: '100%',
        pointerEvents: 'none', overflow: 'visible',
      });
      svgRoot.setAttribute('aria-hidden', 'true');
      document.body.appendChild(svgRoot);
    }

    const id = 'mj' + Math.random().toString(36).slice(2, 8);

    // ── defs: drop-shadow filter ──────────────────────────────
    let defs = svgRoot.querySelector('defs');
    if (!defs) { defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs'); svgRoot.prepend(defs); }

    const shadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    shadowFilter.id = id + '-shadow';
    shadowFilter.setAttribute('x', '-20%'); shadowFilter.setAttribute('y', '-20%');
    shadowFilter.setAttribute('width', '140%'); shadowFilter.setAttribute('height', '140%');
    const feDs = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    feDs.setAttribute('dx', '0'); feDs.setAttribute('dy', '4');
    feDs.setAttribute('stdDeviation', '8');
    feDs.setAttribute('flood-color', 'rgba(0,0,0,0.45)');
    shadowFilter.appendChild(feDs);
    defs.appendChild(shadowFilter);

    // ── SVG: two groups at different z-levels ─────────────────
    // group (shadow+fill) sits BELOW panels at svgRoot z-1
    // borderGroup sits ABOVE panels at svgRoot z+2 (separate svg element)
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.id = id;
    group.setAttribute('filter', `url(#${id}-shadow)`);

    const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fillPath.setAttribute('stroke', 'none');
    group.appendChild(fillPath);
    svgRoot.appendChild(group);

    // separate SVG for border — must sit above panels
    let borderSvg = document.getElementById('mu-join-border-svg');
    if (!borderSvg) {
      borderSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      borderSvg.id = 'mu-join-border-svg';
      Object.assign(borderSvg.style, {
        position: 'fixed', inset: '0', width: '100%', height: '100%',
        pointerEvents: 'none', overflow: 'visible',
      });
      borderSvg.setAttribute('aria-hidden', 'true');
      document.body.appendChild(borderSvg);
    }
    const borderPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    borderPath.id = id + '-border';
    borderPath.setAttribute('fill', 'none');
    borderPath.setAttribute('stroke-width', String(borderWidth));
    borderPath.setAttribute('stroke-linejoin', 'round');
    borderSvg.appendChild(borderPath);

    // ── style / corner-radius reader ──────────────────────────
    function getCr() {
      if (cornerRadius != null) return cornerRadius;
      // temporarily remove mu-joined so border-radius:0 override doesn't mask the real value
      const wasJoined = srcEl.classList.contains('mu-joined');
      if (wasJoined) srcEl.classList.remove('mu-joined');
      const raw = getComputedStyle(srcEl).borderTopLeftRadius;
      if (wasJoined) srcEl.classList.add('mu-joined');
      const px = parseFloat(raw);
      return isNaN(px) ? 12 : px;
    }

    function parseShadowForSvg(cs) {
      // parse box-shadow to feDropShadow params
      // typical: "0px 4px 8px rgba(0,0,0,0.45)"
      const s = cs.boxShadow;
      if (!s || s === 'none') return;
      const m = s.match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px(?:\s+([-\d.]+)px)?\s+(rgba?\([^)]+\)|#[0-9a-f]+)/i);
      if (!m) return;
      const dx = parseFloat(m[1]) || 0;
      const dy = parseFloat(m[2]) || 4;
      const blur = parseFloat(m[3]) || 8;
      const color = m[5] || 'rgba(0,0,0,0.4)';
      feDs.setAttribute('dx', String(dx));
      feDs.setAttribute('dy', String(dy));
      feDs.setAttribute('stdDeviation', String(blur / 2));
      feDs.setAttribute('flood-color', color);
    }

    function readStyle() {
      // temporarily remove mu-joined so border-color/box-shadow aren't overridden
      const wasJoined = srcEl.classList.contains('mu-joined');
      if (wasJoined) srcEl.classList.remove('mu-joined');
      const cs = getComputedStyle(srcEl);
      // snapshot values while mu-joined is still absent (getComputedStyle is live)
      const bg     = cs.backgroundColor || 'rgba(30,30,40,0.85)';
      const border = cs.borderColor     || 'rgba(255,255,255,0.12)';
      const shadow = cs.boxShadow;
      if (wasJoined) srcEl.classList.add('mu-joined');
      fillPath.setAttribute('fill', bg);
      borderPath.setAttribute('stroke', border);
      parseShadowForSvg({ boxShadow: shadow });
    }

    // ── geometry helpers ──────────────────────────────────────

    // CSS spec radius clamping: scale = min(1, W/(2r), H/(2r))
    function clampCr(cr, l, t, r, b) {
      if (cr <= 0) return 0;
      return cr * Math.min(1, (r - l) / (2 * cr), (b - t) / (2 * cr));
    }

    // detect squircle on srcEl (corner-shape: squircle, Chrome 139+)
    function isSquircle() {
      if (!CSS.supports('corner-shape', 'squircle')) return false;
      const wasJoined = srcEl.classList.contains('mu-joined');
      if (wasJoined) srcEl.classList.remove('mu-joined');
      const cs = getComputedStyle(srcEl).getPropertyValue('corner-shape').trim();
      if (wasJoined) srcEl.classList.add('mu-joined');
      return cs === 'squircle';
    }

    // chrome k=4 squircle formula constants (CSS superellipse(2) → formula k=4, s=log2(4)=2)
    const _sqP0=1.2430920942724248,_sqP1=2.010479023614843,_sqP2=0.32922901179443753;
    const _sqP3=0.2823023142212073,_sqP4=1.3473704261055421,_sqP5=2.9149468637949814,_sqP6=0.9106507102917086;
    const _sqS=2; // log2(4)
    const _sqSlope=_sqP0+(_sqP6-_sqP0)*0.5*(1+Math.tanh(_sqP5*(_sqS-_sqP1)));
    const _sqBase=1/(1+Math.exp(_sqSlope*_sqP1));
    const _sqLogi=1/(1+Math.exp(_sqSlope*(_sqP1-_sqS)));
    const SQ_A=(_sqLogi-_sqBase)/(1-_sqBase);
    const SQ_B=_sqP2*Math.exp(-_sqP3*Math.pow(_sqS,_sqP4));
    const SQ_HC=Math.pow(0.5,0.25); // ≈ 0.8409

    // one squircle corner as two cubic bezier segments (chrome two-cubic formula)
    // ox,oy = corner vertex; rx,ry = radii along each arm
    // dx = +1 if corner faces right, -1 if left
    // dy = +1 if corner faces down,  -1 if up
    // returns 7 pixel points [P0=xtangent, c1a, c2a, pm, c1b, c2b, P3=ytangent]
    function _sqCorner(ox, oy, rx, ry, dx, dy) {
      function pt(nx, ny) {
        return [ox - dx * rx * (1 - nx), oy - dy * ry * (1 - ny)];
      }
      const a = SQ_A, bv = SQ_B, hc = SQ_HC;
      return [
        pt(0,      1     ),
        pt(a,      1     ),
        pt(hc - bv, hc + bv),
        pt(hc,     hc    ),
        pt(hc + bv, hc - bv),
        pt(1,      a     ),
        pt(1,      0     ),
      ];
    }

    function _sqXY(p) { return `${p[0].toFixed(3)},${p[1].toFixed(3)}`; }

    // two-cubic forward traversal string (P0→P3)
    function _sqFwd(pts) {
      return `C${_sqXY(pts[1])} ${_sqXY(pts[2])} ${_sqXY(pts[3])} C${_sqXY(pts[4])} ${_sqXY(pts[5])} ${_sqXY(pts[6])}`;
    }
    // two-cubic reversed traversal string (P6→P0)
    function _sqRev(pts) {
      return `C${_sqXY(pts[5])} ${_sqXY(pts[4])} ${_sqXY(pts[3])} C${_sqXY(pts[2])} ${_sqXY(pts[1])} ${_sqXY(pts[0])}`;
    }

    // full rounded rect — arc A (exact) or squircle two-cubic
    function roundedRect(l, t, r, b, cr) {
      const rx = clampCr(cr, l, t, r, b);
      if (rx <= 0) return `M${l},${t} L${r},${t} L${r},${b} L${l},${b} Z`;
      if (isSquircle()) {
        // squircle: four corners using chrome k=4 formula
        // CW: TL reversed, TR forward, BR reversed, BL forward
        const TL = _sqCorner(l, t, rx, rx, -1, -1);
        const TR = _sqCorner(r, t, rx, rx, +1, -1);
        const BR = _sqCorner(r, b, rx, rx, +1, +1);
        const BL = _sqCorner(l, b, rx, rx, -1, +1);
        return [
          `M${_sqXY(TL[0])}`,   // top-left x-tangent
          `L${_sqXY(TR[0])}`,   // top edge
          _sqFwd(TR),             // top-right corner
          `L${_sqXY(BR[6])}`,   // right edge
          _sqRev(BR),             // bottom-right corner (reversed)
          `L${_sqXY(BL[0])}`,   // bottom edge
          _sqFwd(BL),             // bottom-left corner
          `L${_sqXY(TL[6])}`,   // left edge
          _sqRev(TL),             // top-left corner (reversed)
          'Z'
        ].join(' ');
      }
      // border-radius: SVG arc A (exact match to CSS spec ellipse arc)
      return `M${l+rx},${t} L${r-rx},${t} A${rx},${rx} 0 0 1 ${r},${t+rx} L${r},${b-rx} A${rx},${rx} 0 0 1 ${r-rx},${b} L${l+rx},${b} A${rx},${rx} 0 0 1 ${l},${b-rx} L${l},${t+rx} A${rx},${rx} 0 0 1 ${l+rx},${t} Z`;
    }

    // compute the combined outer silhouette path for SVG border+shadow
    function computeOutlinePath(rects, cr) {
      const snap = v => Math.round(v * 2) / 2;
      rects = rects.map(r => ({ l: snap(r.left), t: snap(r.top), r: snap(r.right), b: snap(r.bottom) }));

      if (rects.length === 1) return roundedRect(rects[0].l, rects[0].t, rects[0].r, rects[0].b, cr);
      if (rects.length === 2) return twoRectOutline(rects[0], rects[1], cr);

      const l = Math.min(...rects.map(r => r.l)), t = Math.min(...rects.map(r => r.t));
      const r = Math.max(...rects.map(r => r.r)), b = Math.max(...rects.map(r => r.b));
      return roundedRect(l, t, r, b, cr);
    }

    function twoRectOutline(a, b, cr) {
      const ADJ = 2; // adjacency threshold px
      const rightAdj  = Math.abs(a.r - b.l) < ADJ;
      const leftAdj   = Math.abs(a.l - b.r) < ADJ;
      const bottomAdj = Math.abs(a.b - b.t) < ADJ;
      const topAdj    = Math.abs(a.t - b.b) < ADJ;

      if (leftAdj)   return twoRectOutline(b, a, cr);
      if (topAdj)    return twoRectOutline(b, a, cr);
      console.log('[joinSurfaces] twoRectOutline', {a, b, cr, rightAdj, leftAdj, bottomAdj, topAdj, bt_lt_at: b.t < a.t});

      if (!rightAdj && !bottomAdj) {
        const l = Math.min(a.l,b.l), t = Math.min(a.t,b.t), r = Math.max(a.r,b.r), bo = Math.max(a.b,b.b);
        return roundedRect(l, t, r, bo, cr);
      }

      // arc A helper: convex (outward) quarter-arc, sweep clockwise
      // path arrives at the tangent start, this emits the arc to the tangent end
      const oa = (cx, cy, ex, ey) => `A${cr},${cr} 0 0 1 ${cx+ex*cr},${cy+ey*cr}`;
      // Q helper: concave (inward) arc — stays as Q (geometrically correct for inward joins)
      const ia = (px, py, ex, ey) => `Q${px},${py} ${px+ex*cr},${py+ey*cr}`;

      if (rightAdj) {
        // A left, B right — B is a notch on A's right side
        const yt = Math.max(a.t, b.t);
        const yb = Math.min(a.b, b.b);
        if (yb <= yt) return roundedRect(Math.min(a.l,b.l),Math.min(a.t,b.t),Math.max(a.r,b.r),Math.max(a.b,b.b),cr);

        // handle case where B top is above A top
        if (b.t < a.t) return roundedRect(Math.min(a.l,b.l),Math.min(a.t,b.t),Math.max(a.r,b.r),Math.max(a.b,b.b),cr);

        // clockwise from top-left of A:
        let d = `M${a.l+cr},${a.t} L${a.r-cr},${a.t} ${oa(a.r,a.t,0,1)}`;  // top edge + top-right corner
        d += ` L${a.r},${yt-cr} ${ia(a.r,yt,1,0)}`;                          // down to junction, concave top-in
        d += ` L${b.r-cr},${yt} ${oa(b.r,yt,0,1)}`;                          // top of B + top-right of B
        d += ` L${b.r},${b.b-cr} ${oa(b.r,b.b,-1,0)}`;                       // right edge of B + bottom-right of B
        d += ` L${a.r+cr},${b.b} ${ia(a.r,b.b,0,1)}`;                        // bottom of B back + concave bot-in
        d += ` L${a.r},${a.b-cr} ${oa(a.r,a.b,-1,0)}`;                       // down A right + bottom-right of A
        d += ` L${a.l+cr},${a.b} ${oa(a.l,a.b,0,-1)}`;                       // bottom of A + bottom-left
        d += ` L${a.l},${a.t+cr} ${oa(a.l,a.t,1,0)} Z`;                      // left edge + top-left
        return d;
      }

      if (bottomAdj) {
        // A top, B bottom
        const xl = Math.max(a.l, b.l), xr = Math.min(a.r, b.r);
        if (xr <= xl) return roundedRect(Math.min(a.l,b.l),Math.min(a.t,b.t),Math.max(a.r,b.r),Math.max(a.b,b.b),cr);

        let d = `M${a.l+cr},${a.t} L${a.r-cr},${a.t} ${oa(a.r,a.t,0,1)}`;
        d += ` L${a.r},${a.b-cr} ${ia(a.r,a.b,-1,0)}`;
        d += ` L${b.r-cr},${a.b} ${oa(b.r,a.b,0,1)}`;
        d += ` L${b.r},${b.b-cr} ${oa(b.r,b.b,-1,0)}`;
        d += ` L${b.l+cr},${b.b} ${oa(b.l,b.b,0,-1)}`;
        d += ` L${b.l},${a.b+cr} ${ia(b.l,a.b,1,0)}`;
        d += ` L${a.l+cr},${a.b} ${oa(a.l,a.b,0,-1)}`;
        d += ` L${a.l},${a.t+cr} ${oa(a.l,a.t,1,0)} Z`;
        return d;
      }

      return roundedRect(Math.min(a.l,b.l),Math.min(a.t,b.t),Math.max(a.r,b.r),Math.max(a.b,b.b),cr);
    }

    // compute per-element clip path so each panel bg clips to its portion of the shape
    function computeClipPaths(rects, cr) {
      if (rects.length !== 2) return rects.map(r => roundedRect(r.l, r.t, r.r, r.b, cr));
      const snap = v => Math.round(v * 2) / 2;
      const a = { l:snap(rects[0].left), t:snap(rects[0].top), r:snap(rects[0].right), b:snap(rects[0].bottom) };
      const b = { l:snap(rects[1].left), t:snap(rects[1].top), r:snap(rects[1].right), b:snap(rects[1].bottom) };

      const ADJ = 2;
      const rightAdj = Math.abs(a.r - b.l) < ADJ;
      const leftAdj  = Math.abs(a.l - b.r) < ADJ;

      if (!rightAdj && !leftAdj) {
        // non-horizontal adjacency: just round each rect normally
        return [roundedRect(a.l,a.t,a.r,a.b,cr), roundedRect(b.l,b.t,b.r,b.b,cr)];
      }

      // swap so A is always left, B is right
      const [pa, pb] = rightAdj ? [a, b] : [b, a];
      const [ia0, ib0] = rightAdj ? [0, 1] : [1, 0];

      const yt = Math.max(pa.t, pb.t);
      const yb = Math.min(pa.b, pb.b);

      // Panel A clip: full rounded rect EXCEPT right side gets concave cuts at junction
      // We draw A's shape replacing the two inner corners with concave arcs
      const ia = (px, py, ex, ey) => `Q${px},${py} ${px+ex*cr},${py+ey*cr}`;
      const oa = (cx, cy, ex, ey) => `A${cr},${cr} 0 0 1 ${cx+ex*cr},${cy+ey*cr}`;

      let clipA;
      if (yb > yt) {
        // A has notch on its right where B attaches
        let d = `M${pa.l+cr},${pa.t} L${pa.r-cr},${pa.t} ${oa(pa.r,pa.t,0,1)}`;
        d += ` L${pa.r},${yt-cr} ${ia(pa.r,yt,1,0)}`;          // concave top-in: curls right then up
        d += ` L${pa.r},${yt} L${pa.r},${yb}`                   // skip along junction (not drawn, B covers it)
        d += ` L${pa.r},${yb} ${ia(pa.r,yb,0,1)}`;              // concave bot-in: curls down
        d += ` L${pa.r},${pa.b-cr} ${oa(pa.r,pa.b,-1,0)}`;
        d += ` L${pa.l+cr},${pa.b} ${oa(pa.l,pa.b,0,-1)}`;
        d += ` L${pa.l},${pa.t+cr} ${oa(pa.l,pa.t,1,0)} Z`;
        clipA = d;
      } else {
        clipA = roundedRect(pa.l, pa.t, pa.r, pa.b, cr);
      }

      // Panel B clip: normal rounded rect (it's fully convex)
      const clipB = roundedRect(pb.l, pb.t, pb.r, pb.b, cr);

      const clips = [null, null];
      clips[ia0] = clipA;
      clips[ib0] = clipB;
      return clips;
    }

    // ── main redraw ───────────────────────────────────────────
    function redraw() {
      const cr = getCr();
      readStyle();
      const rects = elements.map(el => el.getBoundingClientRect());

      // outline path for SVG fill+border+shadow (absolute coords, SVG is fixed)
      const outlineD = computeOutlinePath(rects, cr);
      fillPath.setAttribute('d', outlineD);
      borderPath.setAttribute('d', outlineD);

      // suppress elements' own border+shadow; SVG handles those on the combined shape
      elements.forEach(el => el.classList.add('mu-joined'));

      // fill SVG below panels, border SVG above panels
      const srcZ = parseInt(getComputedStyle(srcEl).zIndex) || 2000;
      const baseZ = zIndex != null ? zIndex : srcZ;
      svgRoot.style.zIndex   = String(baseZ - 1);  // below panels
      borderSvg.style.zIndex = String(baseZ + 2);  // above panels
    }

    // ── observers ─────────────────────────────────────────────
    const ro = new ResizeObserver(redraw);
    elements.forEach(el => ro.observe(el));

    let scrollEl = null, scrollTimer = null;
    if (watchScroll) {
      scrollEl = typeof watchScroll === 'string' ? document.querySelector(watchScroll) : watchScroll;
      if (scrollEl) {
        scrollEl.addEventListener('scroll', () => {
          clearTimeout(scrollTimer); scrollTimer = setTimeout(redraw, 150);
        }, { passive: true });
      }
    }

    const onTheme = () => { readStyle(); };
    document.addEventListener('mu:themechange', onTheme);
    document.addEventListener('mu:designchange', onTheme);

    redraw();

    return {
      refresh() { redraw(); },
      destroy() {
        elements.forEach(el => el.classList.remove('mu-joined'));
        ro.disconnect();
        group.remove();
        borderPath.remove();
        shadowFilter.remove();
        document.removeEventListener('mu:themechange', onTheme);
        document.removeEventListener('mu:designchange', onTheme);
        if (scrollEl) scrollEl.removeEventListener('scroll', redraw);
      },
    };
  }

  /* ─────────────────────────────────────────────────────────
     BOTTOM SHEET — draggable via pointer events
     ───────────────────────────────────────────────────────── */
  function sheet(opts = {}) {
    const backdrop = document.createElement('div');
    backdrop.className = 'bottom-sheet-backdrop';
    const sh = document.createElement('div');
    sh.className = 'bottom-sheet';

    const handle = document.createElement('div');
    handle.className = 'sheet-handle';
    sh.appendChild(handle);

    if (typeof opts.content === 'string') sh.insertAdjacentHTML('beforeend', opts.content);
    else if (opts.content instanceof HTMLElement) sh.appendChild(opts.content);

    document.body.appendChild(backdrop);
    document.body.appendChild(sh);
    initAll(sh);

    const close = () => {
      backdrop.style.cssText += ';opacity:0;transition:opacity 260ms ease';
      sh.style.cssText += ';transform:translateY(100%);transition:transform 320ms var(--ease-spring-soft)';
      setTimeout(() => { backdrop.remove(); sh.remove(); }, 340);
    };
    backdrop.addEventListener('click', close);

    /* Drag to dismiss */
    let startY = 0, startTranslate = 0, dragging = false;

    function getTranslate() {
      const m = new DOMMatrix(getComputedStyle(sh).transform);
      return m.m42;
    }

    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragging    = true;
      startY      = e.clientY;
      startTranslate = Math.max(0, getTranslate());
      sh.style.transition = 'none';
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      const t  = Math.max(0, startTranslate + dy);
      sh.style.transform = `translateY(${t}px)`;
    });

    handle.addEventListener('pointerup', e => {
      if (!dragging) return;
      dragging = false;
      const dy = e.clientY - startY;
      sh.style.transition = '';
      if (dy > 120) {
        close();
      } else {
        sh.style.transform = '';
        sh.style.transition = 'transform 350ms var(--ease-spring-soft)';
      }
    });

    return { close };
  }

  /* ─────────────────────────────────────────────────────────
     TOOLTIP
     ───────────────────────────────────────────────────────── */
  function tooltip(el, text) {
    const wrap = document.createElement('span');
    wrap.className = 'tooltip-wrap';
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
    const tip = document.createElement('span');
    tip.className = 'tooltip';
    tip.textContent = text;
    wrap.appendChild(tip);
  }

  /* ─────────────────────────────────────────────────────────
     SPRING UTIL
     ───────────────────────────────────────────────────────── */
  function spring({ from = 0, to = 1, stiffness = 280, damping = 22, onUpdate, onComplete } = {}) {
    let pos = from, vel = 0, lastTime;
    let raf;
    const step = now => {
      if (!lastTime) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.016);
      lastTime = now;
      const f = -stiffness * (pos - to) - damping * vel;
      vel += f * dt; pos += vel * dt;
      onUpdate?.(pos);
      if (Math.abs(pos - to) < 0.001 && Math.abs(vel) < 0.001) { onUpdate?.(to); onComplete?.(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return { cancel: () => cancelAnimationFrame(raf) };
  }

  /* ─────────────────────────────────────────────────────────
     BLUR
     ───────────────────────────────────────────────────────── */
  function setBlur(enabled) {
    document.documentElement.classList.toggle('blur-enabled', !!enabled);
    syncBlobScenes();
  }

  /* ─────────────────────────────────────────────────────────
     INIT ALL
     ───────────────────────────────────────────────────────── */
  function initAll(root = document) {
    attachRipples(root);
    initListExpand(root);
    initAccordions(root);
    initTabs(root);
    initSegmented(root);
    initNavBar(root);
    initDock(root);
    initChips(root);
    initSliders(root);
    syncBlobScenes();
    stampGearIcons(root);
  }

  /* MutationObserver for dynamically added elements */
  const observer = new MutationObserver(muts => {
    for (const m of muts)
      for (const n of m.addedNodes)
        if (n.nodeType === 1) initAll(n);
  });

  /* ─────────────────────────────────────────────────────────
     DESIGN SYSTEM
     ───────────────────────────────────────────────────────── */
  const Design = {
    current: 'material',

    _modes: {
      material: {
        label: 'Material',
        bodySetup()    {},
        teardown()     {},
        applyTokens()  {},
      },
      glassy: {
        label: 'Glassy',
        bodySetup() {},
        teardown()  {},
        applyTokens() {
          const r = document.documentElement;
          r.style.setProperty('--glass-bg',        'color-mix(in oklch, var(--color-surface-container) calc(100% * var(--glass-s,0)), rgb(255 255 255 / calc(.04 * var(--glass-a,1))))');
          r.style.setProperty('--glass-bg-mid',    'rgb(50 50 50 / max(calc(.40 * var(--glass-a,1)), var(--glass-s,0)))');
          r.style.setProperty('--glass-bg-hi',     'rgb(50 50 50 / max(calc(.75 * var(--glass-a,1)), var(--glass-s,0)))');
          r.style.setProperty('--glass-border',    'rgba(255,255,255,0.13)');
          r.style.setProperty('--glass-border-hi', 'rgba(255,255,255,0.22)');
          r.style.setProperty('--glass-blur',      'blur(calc(12px * var(--glass-b,1))) saturate(var(--glass-sat,1.4)) var(--glass-fx,)');
          r.style.setProperty('--glass-spec-panel','0 0 0 1px rgba(255,255,255,.09) inset,0 1px 0 rgba(255,255,255,.22) inset,inset 0 1px 8px -2px rgba(255,255,255,.14),0 -1px 0 rgba(0,0,0,.14) inset');
          r.style.setProperty('--glass-spec-hover','0 0 0 1px rgba(255,255,255,.12) inset,0 1px 0 rgba(255,255,255,.28) inset,inset 0 1px 10px -2px rgba(255,255,255,.18),0 -1px 0 rgba(0,0,0,.14) inset');
          r.style.setProperty('--glass-spec-checked','0 0 0 1px rgba(255,255,255,.14) inset,0 1px 0 rgba(255,255,255,.30) inset,inset 0 1px 10px -2px rgba(255,255,255,.22),0 -1px 0 rgba(0,0,0,.18) inset');
          r.style.setProperty('--glass-spec-focused','0 0 0 1px color-mix(in oklch,var(--color-primary) 42%,transparent) inset,0 1px 0 color-mix(in oklch,var(--color-primary) 90%,transparent) inset,inset 0 1px 10px -2px color-mix(in oklch,var(--color-primary) 66%,transparent),0 -1px 0 rgba(0,0,0,.18) inset');
        },
      },
      paper: {
        label: 'Paper',
        bodySetup()   { Design._injectInkFilters(); },
        teardown()    {},
        // paper tokens depend on hue/sat/bri — recomputed on mu:themechange
        applyTokens(hue, sat, bri) {
          const h   = hue ?? Palette.currentHue;
          const sv  = sat ?? Palette.currentSat;
          const bv  = bri ?? Palette.currentBri;
          const pss = l  => Math.min(100, l * sv / 50).toFixed(1);
          const psl = l  => Math.min(99,  l * bv).toFixed(1);
          const psc = c  => (Math.round(c * (sv / 50) * 1e4) / 1e4).toFixed(4);
          const r = document.documentElement;
          r.style.setProperty('--paper-bg',        `hsl(${h},${pss(4)}%,${psl(4.5)}%)`);
          r.style.setProperty('--paper-surface',   `hsl(${h},${pss(5)}%,${psl(7)}%)`);
          r.style.setProperty('--paper-surface2',  `hsl(${h},${pss(6)}%,${psl(9.5)}%)`);
          r.style.setProperty('--paper-surface3',  `hsl(${h},${pss(8)}%,${psl(12)}%)`);
          r.style.setProperty('--paper-ink',       `hsl(${h},${pss(15)}%,${Math.min(92,72*bv).toFixed(1)}%)`);
          r.style.setProperty('--paper-ink-dim',   `hsl(${h},${pss(12)}%,${Math.min(64,44*bv).toFixed(1)}%)`);
          r.style.setProperty('--paper-ink-ghost', `hsl(${h},${pss(8)}%,${Math.min(38,25*bv).toFixed(1)}%)`);
          r.style.setProperty('--paper-accent',    `oklch(${Math.min(92,70*bv).toFixed(1)}% ${psc(0.16)} ${h})`);
          r.style.setProperty('--paper-shadow',    'rgba(0,0,0,0.65)');
          r.style.setProperty('--paper-tx',        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='t'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72 0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23t)' opacity='0.055'/%3E%3C/svg%3E\")");
        },
      },
      bloom: {
        label: 'Bloom',
        bodySetup()   {},
        teardown()    {},
        // bloom tokens — hue flows through --color-primary/secondary which already track it
        applyTokens(hueArg, satArg) {
          const r = document.documentElement;
          r.style.setProperty('--bloom-bg',        'oklch(2% 0 0)');
          r.style.setProperty('--bloom-surface',   'oklch(6% 0 0)');
          r.style.setProperty('--bloom-surface-hi','oklch(10% 0 0)');
          r.style.setProperty('--bloom-text',      'oklch(88% 0.02 0)');
          r.style.setProperty('--bloom-text-dim',  'oklch(52% 0.01 0)');
          r.style.setProperty('--bloom-glow',      'var(--color-primary)');
          r.style.setProperty('--bloom-glow-2',    'var(--color-secondary)');
          const sat = satArg ?? Palette.currentSat ?? 60;
          // radius scales with sat — more sat = wider bloom
          const glowR = Math.round(20 + (sat / 100) * 28);
          r.style.setProperty('--bloom-radius',    `${glowR}px`);
        },
      },
      terminal: {
        label: 'Terminal',
        bodySetup() {
          if (!document.getElementById('mu-terminal-font')) {
            const l = document.createElement('link');
            l.id   = 'mu-terminal-font';
            l.rel  = 'stylesheet';
            l.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap';
            document.head.appendChild(l);
          }
        },
        teardown() {
          const l = document.getElementById('mu-terminal-font');
          if (l) l.remove();
        },
        applyTokens(hueArg, satArg, briArg) {
          const r   = document.documentElement;
          const hue = +(hueArg ?? Palette.currentHue).toFixed(1);
          const sat = satArg ?? Palette.currentSat;
          const bv  = briArg ?? Palette.currentBri;
          const cm  = sat / 50;
          const oc  = c => +(c * cm).toFixed(4);
          // phosphor glow color — vivid primary at current hue
          const glowL  = Math.min(0.88, 0.72 + (sat / 100) * 0.16);
          const glowC  = Math.min(0.30, 0.18 + (sat / 100) * 0.10);
          const glow   = `oklch(${(glowL * 100).toFixed(1)}% ${glowC.toFixed(3)} ${hue})`;
          const glowDim= `oklch(${(glowL * 0.72 * 100).toFixed(1)}% ${(glowC * 0.8).toFixed(3)} ${hue})`;
          // bg/surface: near-black tinted at current hue
          const bg  = `hsl(${hue}, ${Math.min(100, 6 * cm).toFixed(1)}%, ${Math.min(8, 5 * bv).toFixed(1)}%)`;
          const sf  = `hsl(${hue}, ${Math.min(100, 7 * cm).toFixed(1)}%, ${Math.min(11, 7 * bv).toFixed(1)}%)`;
          // text: desaturated glow tint
          const text    = `oklch(${Math.min(94, 86 * bv).toFixed(1)}% ${oc(0.04)} ${hue})`;
          const textDim = `oklch(${Math.min(60, 45 * bv).toFixed(1)}% ${oc(0.02)} ${hue} / 0.55)`;
          // borders: glow color at low alpha
          const border   = `oklch(${(glowL * 100).toFixed(1)}% ${glowC.toFixed(3)} ${hue} / 0.20)`;
          const borderHi = `oklch(${(glowL * 100).toFixed(1)}% ${glowC.toFixed(3)} ${hue} / 0.40)`;
          const faint    = `oklch(${(glowL * 100).toFixed(1)}% ${glowC.toFixed(3)} ${hue} / 0.08)`;
          r.style.setProperty('--trm-bg',          bg);
          r.style.setProperty('--trm-surface',     sf);
          r.style.setProperty('--trm-green',       glow);
          r.style.setProperty('--trm-green-dim',   glowDim);
          r.style.setProperty('--trm-green-faint', faint);
          r.style.setProperty('--trm-text',        text);
          r.style.setProperty('--trm-text-dim',    textDim);
          r.style.setProperty('--trm-border',      border);
          r.style.setProperty('--trm-border-hi',   borderHi);
          r.style.setProperty('--trm-green-ghost', `oklch(${(glowL * 100).toFixed(1)}% ${glowC.toFixed(3)} ${hue} / 0.15)`);
          r.style.setProperty('--trm-red',         '#ff3333');
        },
      },
    },

    // called on mu:themechange so design tokens stay in sync with palette
    _onThemeChange(e) {
      const mode = this._modes[this.current];
      if (mode) mode.applyTokens(e?.detail?.hue, e?.detail?.sat, e?.detail?.bri);
    },

    setDesign(name) {
      const key  = this._modes[name] ? name : 'material';
      const next = this._modes[key];
      const prev = this._modes[this.current];

      // teardown previous
      if (prev && prev.teardown) prev.teardown();

      this.current = key;
      document.documentElement.setAttribute('data-mu-design', key);

      // setup next
      if (next.bodySetup) next.bodySetup();
      if (next.applyTokens) next.applyTokens();

      document.dispatchEvent(new CustomEvent('mu:designchange', { detail: { design: this.current } }));
    },

    getDesign() { return this.current; },
    getDesigns() {
      return Object.entries(this._modes).map(([id, mode]) => ({ id, label: mode.label ?? id }));
    },

    _injectInkFilters() {
      if (document.getElementById('mu-ink-filters')) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'mu-ink-filters';
      svg.setAttribute('style', 'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none;z-index:-1');
      svg.innerHTML = `<defs>
  <filter id="mu-ink-rough" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="linearRGB">
    <feTurbulence type="turbulence" baseFrequency="0.04 0.03" numOctaves="2" seed="8" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="mu-ink-rough-heavy" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="linearRGB">
    <feTurbulence type="turbulence" baseFrequency="0.028 0.022" numOctaves="4" seed="12" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="5.5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="mu-ink-bleed" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="linearRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.055 0.040" numOctaves="3" seed="5" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
    <feGaussianBlur in="displaced" stdDeviation="0.6" result="blurred"/>
    <feComposite in="blurred" in2="displaced" operator="over"/>
  </filter>
  <filter id="mu-ink-text" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="linearRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.09 0.07" numOctaves="2" seed="3" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>`;
      document.body.appendChild(svg);
    },
  };

  // keep paper tokens in sync with palette
  document.addEventListener('mu:themechange', e => Design._onThemeChange(e));

  /* ─────────────────────────────────────────────────────────
     PUBLIC API
     ───────────────────────────────────────────────────────── */
  // ── Pull-to-refresh ──────────────────────────────────────────────────────
  // Creates a sync bar above scrollEl that pushes content down on pull.
  // Bar has 3 layers: faint bg, mid-tone fills growing inward from sides (pull phase),
  // then accent sweep left-to-right (sync phase).
  // Physics: linear drag 0→BAR_H, asymptotic rubber zone BAR_H→MAX_H,
  // CSS cubic-bezier bounce back on release.
  function pullToRefresh(scrollEl, onRefresh, {
    barHeight        = 40,     // settled bar height px
    triggerThreshold = barHeight, // drag distance needed to trigger (default = barHeight)
    canPull          = null,   // () => bool — extra gate (e.g. scrollTop check)
    label            = 'syncing…',
    doneLabel        = null,   // shown after sync; null = hide immediately
    indeterminate    = false,  // start as chase animation; setProgress() switches to determinate
    mount            = null,   // element/selector to append the bar into (default: inserted before scrollEl)
  } = {}) {
    const el     = typeof scrollEl === 'string' ? document.querySelector(scrollEl) : scrollEl;
    const MAX_H  = barHeight * 1.5;
    const EXTRA  = MAX_H - barHeight;
    const BOUNCE = `height .4s cubic-bezier(.25,1.4,.4,1)`;
    const EASE   = `height .3s cubic-bezier(.22,1,.36,1)`;

    // inject bar before scrollEl in DOM flow — no position:absolute needed
    const bar = document.createElement('div');
    bar.className = 'mu-ptr-bar';
    bar.innerHTML = `
      <div class="mu-ptr-bg"></div>
      <div class="mu-ptr-fl"></div>
      <div class="mu-ptr-fr"></div>
      <div class="mu-ptr-fp"></div>
      <div class="mu-ptr-txt">pull to sync</div>`;
    const host = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (host) host.appendChild(bar); else el.parentNode.insertBefore(bar, el);

    const fl  = bar.querySelector('.mu-ptr-fl');
    const fr  = bar.querySelector('.mu-ptr-fr');
    const fp  = bar.querySelector('.mu-ptr-fp');
    const txt = bar.querySelector('.mu-ptr-txt');

    let startY = 0, curDrag = 0, active = false, syncing = false, pid = null, raf = null, pulling = false;

    function dragToH(dy) {
      if (dy <= barHeight) return (dy / barHeight) * barHeight;
      return barHeight + EXTRA * (1 - 1 / (1 + (dy - barHeight) / EXTRA));
    }
    function fillProg(dy) { return Math.min(dy / triggerThreshold, 1); }

    function paintDrag(dy) {
      bar.style.transition = 'none';
      bar.style.height = dragToH(dy) + 'px';
      fl.style.transition = fr.style.transition = 'none';
      const half = Math.min(fillProg(dy) * 50, 50);
      fl.style.width = half + '%';
      fr.style.width = half + '%';
      txt.textContent = fillProg(dy) < 1 ? 'pull to sync' : 'release to sync';
    }

    function dragLoop() {
      if (!active) return;
      paintDrag(curDrag);
      raf = requestAnimationFrame(dragLoop);
    }

    function release(triggered) {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      if (!triggered) {
        fl.style.transition = fr.style.transition = BOUNCE;
        fl.style.width = '0%'; fr.style.width = '0%';
        bar.style.transition = BOUNCE; bar.style.height = '0';
        txt.textContent = 'pull to sync';
        return;
      }
      // triggered: bounce bar to settled height, lock fills, run sync
      fl.style.transition = fr.style.transition = BOUNCE;
      fl.style.width = '50%'; fr.style.width = '50%';
      bar.style.transition = BOUNCE; bar.style.height = barHeight + 'px';
      txt.textContent = label;
      syncing = true;

      const cleanup = () => {
        syncing = false;
        bar.style.transition = EASE; bar.style.height = '0';
        fl.style.transition = fr.style.transition = EASE;
        fl.style.width = '0%'; fr.style.width = '0%';
        setTimeout(() => {
          fp.style.transition = 'none'; fp.style.width = '0%';
          txt.textContent = 'pull to sync';
        }, 320);
      };

      (async () => {
        // small delay so bounce settles before sweep
        await new Promise(r => setTimeout(r, 200));
        fp.style.transition = 'none'; fp.style.width = '0%';
        if (indeterminate) {
          fp.style.width = '28%';
          fp.style.animation = 'mu-ptr-chase .9s cubic-bezier(.4,0,.2,1) infinite alternate';
        } else {
          requestAnimationFrame(() => {
            fp.style.transition = 'width 2.3s cubic-bezier(.4,0,.2,1)';
            fp.style.width = '100%';
          });
        }
        try { await onRefresh(); } catch(_) {}
        fp.style.animation = '';
        if (doneLabel) {
          txt.textContent = doneLabel;
          fp.style.transition = 'none'; fp.style.width = '0%';
          requestAnimationFrame(() => {
            fp.style.transition = 'width .4s cubic-bezier(.4,0,.2,1)';
            fp.style.width = '100%';
          });
          await new Promise(r => setTimeout(r, 1800));
        }
        cleanup();
      })();
    }

    function canStart() {
      if (syncing) return false;
      if (canPull && !canPull()) return false;
      return el.scrollTop <= 2;
    }

    // ── touch ──────────────────────────────────────────────────────────────
    // use raw touch events for touch — setPointerCapture on touch kills scroll
    // detection and browsers often skip pointerdown entirely on scroll elements
    el.addEventListener('touchstart', e => {
      if (!canStart()) return;
      startY = e.touches[0].clientY; curDrag = 0; active = true; pulling = false;
      raf = requestAnimationFrame(dragLoop);
    }, { passive: true });
    el.addEventListener('touchmove', e => {
      if (!active) return;
      const y = e.touches[0].clientY;
      if (!pulling) {
        // not pulling yet: the list may have scrolled since touchstart, so only take over once it is back at the top and the finger moves down from there
        if (el.scrollTop > 2 || y <= startY) { startY = y; curDrag = 0; return; }
        if (!e.cancelable) { active = false; release(false); curDrag = 0; return; } // the browser already owns this scroll, never fight it
        pulling = true;
      }
      e.preventDefault();               // we own the gesture until release, so the list never scrolls under a pull
      curDrag = Math.max(0, y - startY);
    }, { passive: false });
    el.addEventListener('touchend', e => {
      if (!active) return;
      active = false;
      release(fillProg(curDrag) >= 1);
      curDrag = 0;
    });
    el.addEventListener('touchcancel', () => { active = false; release(false); curDrag = 0; });

    // ── pointer (mouse / stylus only) ──────────────────────────────────────
    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch' || e.button !== 0 || !canStart()) return;
      startY = e.clientY; curDrag = 0; active = true; pid = e.pointerId;
      raf = requestAnimationFrame(dragLoop);
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch' || !active || e.pointerId !== pid) return;
      curDrag = Math.max(0, e.clientY - startY);
      if (curDrag > 4 && !el.hasPointerCapture(pid)) el.setPointerCapture(pid);
    });
    el.addEventListener('pointerup', e => {
      if (e.pointerType === 'touch' || !active || e.pointerId !== pid) return;
      active = false;
      release(fillProg(curDrag) >= 1);
      curDrag = 0;
    });
    el.addEventListener('pointercancel', e => {
      if (e.pointerType === 'touch') return;
      active = false; release(false); curDrag = 0;
    });

    return {
      destroy() { bar.remove(); },
      trigger() { if (!syncing) release(true); },
      setProgress(pct) {
        if (!syncing) return;
        fp.style.animation = '';
        fp.style.transition = 'width .6s cubic-bezier(.4,0,.2,1)';
        fp.style.width = Math.round(Math.min(Math.max(pct, 0), 1) * 100) + '%';
      },
      setLabel(s) { if (syncing) txt.textContent = s; },
    };
  }

  /* ─────────────────────────────────────────────────────────
     LIQUID GLASS — displacement refraction for backdrop-filter panels
     opt-in (MU.liquidGlass.enable). appends url(#filter) to whatever backdrop-filter an
     element already has, so css blur/saturate/brightness stay as they are.
     MU.liquidGlass: enable(on) · configure({params, quality}) · group(key,{selector,enabled})
       attach(el,{params}) · mountPreviews(root) · refresh() · stats() · looks · defaults
     ───────────────────────────────────────────────────────── */
  const GlassFx = { b: 1, c: 1 };
  const LiquidGlass = (() => {
    const NS = 'http://www.w3.org/2000/svg';
    const supported = !!(window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'url(#a)')) && typeof ResizeObserver !== 'undefined';
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // bevel/scale are % of the panel's half size when relBevel/relScale (capped by maxBevel/maxScale px), else px
    const DEF = {
      profile: 'squircle', ior: 1.5, thick: 1.5, edgePow: 1, invert: false,
      bevel: 92, relBevel: true, maxBevel: 100,
      scale: 89, relScale: true, maxScale: 80,
      mapRes: 1, maxMapPx: 160000, maxArea: 0, soft: .25,
    };
    const LOOKS = {
      panel:     {},
      soft:      { thick: .9, bevel: 70, scale: 35 },
      dome:      { profile: 'convex', ior: 1.6, thick: 2.2, bevel: 100, scale: 100 },
      lip:       { profile: 'lip', thick: 1.8, bevel: 45, scale: 60 },
      concave:   { profile: 'concave', thick: 1.2, bevel: 70, scale: 50 },
      reference: { relBevel: false, bevel: 83, relScale: false, scale: 80 },
    };
    const S = { on: false, params: {}, q: 0, groups: new Map(), merges: new Map(), items: new Set(), host: null, uid: 0, mo: null, raf: 0, rp: 0, sq: 0, gt: 0, lastMs: 0 };
    const byEl = new WeakMap(), mcache = new Map(), lcache = new Map();

    function lut(v) {
      const key = v.profile + '|' + v.ior + '|' + v.thick;
      if (lcache.has(key)) return lcache.get(key);
      const ior = Math.max(1.01, v.ior);
      const H = t => { const c = Math.sqrt(1 - (1 - t) ** 2); return v.profile === 'convex' ? c : v.profile === 'squircle' ? (1 - (1 - t) ** 4) ** .25 : v.profile === 'concave' ? 1 - c : c * (1 - t) + (1 - c) * t; };
      const L = [], e = .01; let mx = 1e-6;
      for (let i = 0; i < 128; i++) {
        const t = Math.min(.99, Math.max(.01, i / 127)), dh = (H(Math.min(1, t + e)) - H(Math.max(0, t - e))) / (2 * e), s = Math.max(-8, Math.min(8, v.thick * dh)), a1 = Math.atan(s), a2 = Math.asin(Math.sin(a1) / ior), val = Math.tan(a1) - Math.tan(a2);
        L.push(val); if (t >= .03) mx = Math.max(mx, Math.abs(val));
      }
      const out = L.map(x => Math.max(-1, Math.min(1, x / mx)));
      lcache.set(key, out); if (lcache.size > 16) lcache.delete(lcache.keys().next().value);
      return out;
    }

    // p.bevel/p.scale are already px here. R = [tl, tr, br, bl] corner radii
    function buildMap(p, w, h, R) {
      let k = clamp(p.mapRes, .1, 1);
      if (p.maxMapPx > 0) k = Math.min(k, Math.sqrt(p.maxMapPx / (w * h)));
      const mw = Math.max(2, Math.ceil(w * k)), mh = Math.max(2, Math.ceil(h * k));
      const K = Math.max(1, R.k || 2);
      // seam smoothing: the unit normal field gets blurred (radius rad in map px) so creases fade out softly, 0 = hard
      let tau = Math.max(0, +p.soft || 0) * (R.mh || Math.min(w, h) / 2); if (tau < .5) tau = 0;
      const rad = tau ? Math.max(1, Math.round(tau * .75 * mw / w)) : 0;
      const key = [w, h, R.join(','), R.uk || '', K, p.profile, p.ior, p.thick, p.bevel.toFixed(2), p.edgePow, p.invert ? 1 : 0, tau.toFixed(1), mw, mh].join('|');
      let m = p.keepCv ? null : mcache.get(key);
      if (m) { mcache.delete(key); mcache.set(key, m); return m; }
      const t0 = performance.now();
      const cv = document.createElement('canvas'); cv.width = mw; cv.height = mh;
      const cx = cv.getContext('2d'), im = cx.createImageData(mw, mh), D = im.data;
      const hw = w / 2, hh = h / 2, bw = Math.max(1e-3, p.bevel), L = lut(p), inv = p.invert ? -1 : 1, ep = p.edgePow || 1;
      // signed distance (px, positive inside) of the rounded rect with superellipse corners, also leaves the outward edge normal in _nx/_ny
      let _nx = 0, _ny = 0;
      const sdf = (px, py) => {
        const r = px < 0 ? (py < 0 ? R[0] : R[3]) : (py < 0 ? R[1] : R[2]);
        const qx = Math.abs(px) - (hw - r), qy = Math.abs(py) - (hh - r), sx = px < 0 ? -1 : 1, sy = py < 0 ? -1 : 1;
        if (qx > 0 && qy > 0) {
          // superellipse corner |x|^K + |y|^K = r^K (K=2 round, K=4 squircle), gradient normal
          const ax = Math.max(qx, 1e-6), ay = Math.max(qy, 1e-6), ex = ax ** (K - 1), ey = ay ** (K - 1), gl = Math.hypot(ex, ey) || 1;
          const nm = (ax * ex + ay * ey) ** (1 / K);
          _nx = sx * ex / gl; _ny = sy * ey / gl;
          // first order distance is only right on the surface, it fades to plain (r - nm) towards the inner corner point so the field has no jump there
          const g = gl / (nm ** (K - 1) || 1), u = r > 0 ? Math.min(1.5, nm / r) : 1;
          return (r - nm) / (1 + (g - 1) * u * u);
        }
        if (qx > qy) { _nx = sx; _ny = 0; } else { _nx = 0; _ny = sy; }
        return r - Math.max(qx, qy);
      };
      // smoothing: the unit normal field gets blurred (not the distance), so where normals disagree (creases, inner corner points)
      // the push fades to 0 smoothly. straight edges stay at full strength. distance stays sharp and only drives the strength lut
      const spx = w / mw, spy = h / mh; // css px per map px
      // merged shape: distance + normal come from the precomputed union field instead of the rounded rect formula
      const usdf = R.u ? (px, py) => { const q = R.u(px + hw, py + hh); _nx = q[1]; _ny = q[2]; return q[0]; } : null;
      const pad = rad ? 2 * rad + 2 : 0, gw = mw + 2 * pad, gh = mh + 2 * pad;
      const NX = new Float32Array(gw * gh), NY = new Float32Array(gw * gh), DD = new Float32Array(mw * mh);
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
        const d = (usdf || sdf)((x - pad + .5) * spx - hw, (y - pad + .5) * spy - hh), gi = y * gw + x;
        NX[gi] = _nx; NY[gi] = _ny;
        if (x >= pad && y >= pad && x < pad + mw && y < pad + mh) DD[(y - pad) * mw + x - pad] = d;
      }
      if (rad) {
        const tmp = new Float32Array(NX.length);
        const box = (src, dst, n, stride, lines, lstride, r) => {
          const win = 2 * r + 1;
          for (let l = 0; l < lines; l++) {
            const b = l * lstride; let acc = 0;
            for (let i = -r; i <= r; i++) acc += src[b + Math.min(n - 1, Math.max(0, i)) * stride];
            for (let i = 0; i < n; i++) {
              dst[b + i * stride] = acc / win;
              acc += src[b + Math.min(n - 1, i + r + 1) * stride] - src[b + Math.max(0, i - r) * stride];
            }
          }
        };
        for (const g of [NX, NY]) for (let pass = 0; pass < 2; pass++) { box(g, tmp, gw, 1, gh, gw, rad); box(tmp, g, gh, gw, gw, 1, rad); }
      }
      for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
        const gi = (y + pad) * gw + x + pad, dist = DD[y * mw + x], nx = NX[gi], ny = NY[gi];
        let t = Math.min(1, Math.max(0, dist / bw)); if (ep !== 1) t = t ** ep;
        const mg = L[Math.min(127, t * 127 | 0)], i = (y * mw + x) * 4;
        let dx = clamp(-nx * mg * inv, -1, 1), dy = clamp(-ny * mg * inv, -1, 1);
        if (R.j && R.j.length && p.scale > 0) {
          const qx = (x + .5) * spx, qy = (y + .5) * spy;
          for (const j of R.j) {
            const gx = j.v ? Math.abs(qx - j.pos) : Math.max(0, j.lo - qx, qx - j.hi), gy = j.v ? Math.max(0, j.lo - qy, qy - j.hi) : Math.abs(qy - j.pos), g = Math.hypot(gx, gy) / p.scale;
            if (j.v) { if (Math.abs(dx) > g) dx = dx < 0 ? -g : g; } else if (Math.abs(dy) > g) dy = dy < 0 ? -g : g;
          }
        }
        D[i] = 127.5 + 127.5 * dx; D[i + 1] = 127.5 + 127.5 * dy; D[i + 2] = 128; D[i + 3] = 255;
      }
      cx.putImageData(im, 0, 0);
      m = { url: p.keepCv ? '' : cv.toDataURL(), mw, mh, key };
      if (p.keepCv) m.cv = cv; // sliceMap composes from the canvas directly, no png round trip
      S.lastMs = performance.now() - t0;
      if (!p.draft) { mcache.set(key, m); if (mcache.size > 24) mcache.delete(mcache.keys().next().value); } // live drafts are one shot, they must not evict the real maps
      return m;
    }

    // fast (q<0) <-> pretty (q>0). q=0 leaves everything exactly as picked. values inside their comfort band barely move,
    // radical values move the most. fast also skips huge panels (gpu cost grows with area), pretty pulls odd values to sane ones
    function tune(p, q, w, h) {
      if (!q) return p;
      const o = { ...p }, a = Math.abs(q), mh = Math.min(w, h) / 2 || 1;
      const pull = (v, lo, hi, tg, mn, mx, base) => {
        const r = v < lo ? (lo - v) / Math.max(1e-6, lo - mn) : v > hi ? (v - hi) / Math.max(1e-6, mx - hi) : 0;
        return v + (tg - v) * clamp(a * (base + (1 - base) * clamp(r, 0, 1)), 0, 1);
      };
      if (q < 0) {
        o.mapRes = pull(p.mapRes, .5, 1, .3, .2, 1, .85);
        o.maxMapPx = p.maxMapPx * (1 - .6 * a);
        const cap = 120000 + 900000 * (1 + q) ** 2;
        o.maxArea = p.maxArea > 0 ? Math.min(p.maxArea, cap) : cap;
      } else {
        o.mapRes = p.mapRes + (1 - p.mapRes) * a;
        o.maxMapPx = p.maxMapPx * (1 + a);
        o.scale = pull(p.scale, .05 * mh, mh, .6 * mh, 0, 1.5 * mh, 0);
        o.bevel = pull(p.bevel, .3 * mh, mh, .8 * mh, 0, 1.5 * mh, 0);
        o.thick = pull(p.thick, .8, 2.5, 1.5, .2, 4, 0);
        o.ior = pull(p.ior, 1.2, 1.9, 1.5, 1.05, 2.5, 0);
      }
      return o;
    }

    function host() {
      if (!S.host || !S.host.isConnected) {
        S.host = document.createElementNS(NS, 'svg');
        S.host.setAttribute('width', '0'); S.host.setAttribute('height', '0');
        S.host.style.cssText = 'position:absolute;pointer-events:none';
        (document.body || document.documentElement).appendChild(S.host);
      }
      return S.host;
    }
    function radii(el, w, h) {
      const cs = getComputedStyle(el), m = Math.min(w, h) / 2;
      const R = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(c => {
        const s = cs['border' + c + 'Radius'] || ''; let r = parseFloat(s) || 0;
        if (s.includes('%')) r = r / 100 * Math.min(w, h);
        return Math.min(r, m);
      });
      // corner-shape: round = 2, squircle = superellipse(2) = 4, superellipse(n) = 2^n, bevel = 1
      const cn = (cs.getPropertyValue('corner-shape') || '').trim(), se = cn.match(/superellipse\(\s*(-?[\d.]+)/);
      R.k = /squircle/.test(cn) ? 4 : se ? 2 ** +se[1] : /bevel/.test(cn) ? 1 : 2;
      return R;
    }
    function resolve(it, w, h) {
      const vh = h - (it.pb || 0), p = { ...DEF, ...S.params, ...((it.group && S.groups.get(it.group) || {}).params || {}), ...(it.own || {}) }, mh = Math.min(w, vh) / 2;
      if (p.relBevel) p.bevel = Math.min(p.bevel / 100 * mh, p.maxBevel);
      if (p.relScale) p.scale = Math.min(p.scale / 100 * mh, p.maxScale);
      return tune(p, S.q, w, vh);
    }
    function clear(it) {
      it.el.style.removeProperty('backdrop-filter'); it.el.style.removeProperty('-webkit-backdrop-filter');
      if (it.f) { it.f.remove(); it.f = null; it.fk = null; }
    }
    function drop(it) { clear(it); it.ro.disconnect(); clearTimeout(it.t); S.items.delete(it); byEl.delete(it.el); const mg = mergeOf(it); if (mg) mergeKick(mg); }

    // exact squared euclidean distance (felzenszwalb) to the nearest site (sites[i] = 1), grid gw x gh
    function edt(sites, gw, gh) {
      const INF = 1e12, out = new Float32Array(gw * gh), n = Math.max(gw, gh), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
      const run = len => {
        let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
        for (let q = 1; q < len; q++) {
          let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
          while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
          k++; v[k] = q; z[k] = s; z[k + 1] = INF;
        }
        k = 0;
        for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; }
      };
      for (let x = 0; x < gw; x++) { for (let y = 0; y < gh; y++) f[y] = sites[y * gw + x] ? 0 : INF; run(gh); for (let y = 0; y < gh; y++) out[y * gw + x] = d[y]; }
      for (let y = 0; y < gh; y++) { for (let x = 0; x < gw; x++) f[x] = out[y * gw + x]; run(gw); for (let x = 0; x < gw; x++) out[y * gw + x] = d[x]; }
      return out;
    }
    // signed distance field (css px, positive inside) of the union of mem = [{x,y,w,h,R}] after a morphological closing of radius r:
    // dilate by r, erode by r, so concave joints turn into fillets of radius r and gaps under 2r get bridged. returns a sampler (px,py) -> [dist, outwardNx, outwardNy]
    function unionField(mem, W, H, r, cap, raster, extra) {
      const ku = Math.min(1, Math.sqrt(cap / (W * H))), rp = r * ku, pd = Math.ceil(rp) + 3;
      const gw = Math.ceil(W * ku) + 2 * pd, gh = Math.ceil(H * ku) + 2 * pd, N = gw * gh, M = new Uint8Array(N);
      if (raster) raster(M, gw, gh, ku, pd);
      else {
        const cv = document.createElement('canvas'); cv.width = gw; cv.height = gh;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        const E = (pd + 3) / ku;
        for (const m of mem) {
          let x = m.x, y = m.y, w = m.w, h = m.h; const q = [m.R[0], m.R[1], m.R[2], m.R[3]], e = m.ex || [0, 0, 0, 0];
          if (e[0]) { x -= E; w += E; q[0] = q[3] = 0; }
          if (e[1]) { y -= E; h += E; q[0] = q[1] = 0; }
          if (e[2]) { w += E; q[1] = q[2] = 0; }
          if (e[3]) { h += E; q[2] = q[3] = 0; }
          cx.beginPath(); sePath(cx, pd + x * ku, pd + y * ku, w * ku, h * ku, q.map(v => v * ku), m.R.k); cx.fill();
        }
        if (extra) extra(cx, ku, pd, sePath);
        const px = cx.getImageData(0, 0, gw, gh).data;
        for (let i = 0; i < N; i++) M[i] = px[i * 4 + 3] > 127 ? 1 : 0;
      }
      let D = M;
      if (rp > 0) { const d1 = edt(M, gw, gh), lim = (rp + .5) ** 2; D = new Uint8Array(N); for (let i = 0; i < N; i++) D[i] = d1[i] <= lim ? 1 : 0; }
      const nD = new Uint8Array(N); for (let i = 0; i < N; i++) nD[i] = D[i] ? 0 : 1;
      const d2 = edt(nD, gw, gh), C = new Uint8Array(N), F = new Float32Array(N);
      for (let i = 0; i < N; i++) if (D[i]) { const dd = Math.sqrt(d2[i]) - .5 - rp; F[i] = dd; C[i] = dd >= 0 ? 1 : 0; }
      const d3 = edt(C, gw, gh);
      for (let i = 0; i < N; i++) if (!C[i]) F[i] = -(Math.sqrt(d3[i]) - .5);
      // outward normal = -grad(dist). the central difference of a unit gradient field is 2 long, it shrinks towards the medial axis where the push is ~0 anyway
      const GX = new Float32Array(N), GY = new Float32Array(N);
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
        const i = y * gw + x, gx = F[y * gw + Math.min(gw - 1, x + 1)] - F[y * gw + Math.max(0, x - 1)], gy = F[Math.min(gh - 1, y + 1) * gw + x] - F[Math.max(0, y - 1) * gw + x], l = Math.max(2, Math.hypot(gx, gy));
        GX[i] = -gx / l; GY[i] = -gy / l;
      }
      const cw = gw - 1, ch = gh - 1, o = [0, 0, 0];
      return (px, py) => {
        const fx = clamp(px * ku + pd - .5, 0, cw), fy = clamp(py * ku + pd - .5, 0, ch), x0 = fx | 0, y0 = fy | 0, x1 = Math.min(cw, x0 + 1), y1 = Math.min(ch, y0 + 1), tx = fx - x0, ty = fy - y0;
        const b = A => (A[y0 * gw + x0] * (1 - tx) + A[y0 * gw + x1] * tx) * (1 - ty) + (A[y1 * gw + x0] * (1 - tx) + A[y1 * gw + x1] * tx) * ty;
        o[0] = b(F) / ku; o[1] = b(GX); o[2] = b(GY);
        return o;
      };
    }
    // merged shapes. merge(key, { groups: [group keys], radius: px | '--css-var' | fn(el), when: () => bool })
    // the visible members of those groups that touch each other become ONE shape: one map from the closed union
    // (concave joints get a fillet of `radius`), every member's filter shows its own slice of that map
    function mergeOf(it) {
      if (!S.merges.size || !it.group) return null;
      for (const g of S.merges.values()) if (g.enabled !== false && grp(g).includes(it.group) && (!g.when || g.when())) return g;
      return null;
    }
    // merge.groups can be an array or a function returning one (so a single merge can change its members, e.g. frame with or without the right sidebars)
    const grp = g => typeof g.groups === 'function' ? g.groups() : g.groups;
    // live mode: draft resolution follows how long the last rebuild took, so a draft costs about budget ms whatever the panel size
    function liveAdapt(ms) { S.dpx = clamp((S.dpx || 40000) * clamp(S.live.budget / Math.max(.5, ms), .7, 1.2), 3000, 160000); }
    function mergeKick(mg) {
      const now = performance.now(), gap = now - mg.lastEv;
      mg.lastEv = now; clearTimeout(mg.t);
      if (S.live && mg.built) {
        // one draft per frame, built right inside the resize callback (before paint), full res once it settles
        if (now - (mg.draftEnd || 0) > 2) { const t0 = performance.now(); mg.draftAt = t0; applyMerge(mg, true); mg.draftEnd = performance.now(); liveAdapt(mg.draftEnd - t0); }
        mg.t = setTimeout(() => applyMerge(mg), S.live.settle);
        return;
      }
      // changes arriving back to back (window drag, sidebar animating): cheap low res draft now and then, full res once it settles
      if (mg.built && gap < 120 && now - mg.draftAt > 90) { mg.draftAt = now; applyMerge(mg, true); }
      mg.t = setTimeout(() => applyMerge(mg), mg.built ? (gap < 120 ? 140 : 40) : 0);
    }
    // subpath of a rect with superellipse corners (k=2 round, 4 squircle, same shape css corner-shape draws), R = [tl, tr, br, bl]
    function sePath(cx, x, y, w, h, R, k) {
      const ex = 2 / Math.max(.5, k || 2), n = 20, P = Math.PI / 2;
      const cs = [[x + R[0], y + R[0], -1, -1, 1], [x + w - R[1], y + R[1], 1, -1, 0], [x + w - R[2], y + h - R[2], 1, 1, 1], [x + R[3], y + h - R[3], -1, 1, 0]];
      cs.forEach(([ccx, ccy, sx, sy, cosx], i) => {
        const r = R[i];
        for (let j = 0; j <= n; j++) {
          const a = j / n * P, c = Math.cos(a) ** ex, s = Math.sin(a) ** ex, ox = r * (cosx ? c : s), oy = r * (cosx ? s : c);
          if (i === 0 && j === 0) cx.moveTo(ccx + sx * ox, ccy + sy * oy); else cx.lineTo(ccx + sx * ox, ccy + sy * oy);
        }
      });
      cx.closePath();
    }
    // per member copy of the shared map where the push is shortened so the sampled point never leaves that member's own box
    function memberMap(m, q, W, H, p) {
      const key = q.x + ',' + q.y + ',' + q.ow + 'x' + q.oh + ',' + p.scale.toFixed(2);
      if (!m.sub) m.sub = new Map();
      let u = m.sub.get(key); if (u) return u;
      const kx = m.mw / W, ky = m.mh / H;
      const sx = clamp(Math.round(q.x * kx), 0, m.mw - 2), sy = clamp(Math.round(q.y * ky), 0, m.mh - 2);
      const cw = clamp(Math.round(q.w * kx), 2, m.mw - sx), ch = clamp(Math.round(q.h * ky), 2, m.mh - sy);
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      const cx = cv.getContext('2d'), im = cx.createImageData(cw, ch), D = im.data, S0 = p.scale, src = m.px;
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
        const si = ((sy + y) * m.mw + sx + x) * 4, i = (y * cw + x) * 4;
        let dx = (src[si] - 127.5) / 127.5, dy = (src[si + 1] - 127.5) / 127.5;
        const ux = (x + .5) / cw * q.ow, uy = (y + .5) / ch * q.oh, vx = dx * S0, vy = dy * S0;
        let t = 1;
        if (vx > 1e-6) t = Math.min(t, (q.ow - ux) / vx); else if (vx < -1e-6) t = Math.min(t, ux / -vx);
        if (vy > 1e-6) t = Math.min(t, (q.oh - uy) / vy); else if (vy < -1e-6) t = Math.min(t, uy / -vy);
        if (t < 1) { t = Math.max(0, t); dx *= t; dy *= t; }
        D[i] = 127.5 + 127.5 * dx; D[i + 1] = 127.5 + 127.5 * dy; D[i + 2] = 128; D[i + 3] = 255;
      }
      cx.putImageData(im, 0, 0); u = cv.toDataURL();
      m.sub.set(key, u);
      return u;
    }
    // the rounded gap of one cutout corner as a css polygon (px, patch units), sharp corner + the superellipse arc
    function sliverPoly(i, rr, k, ext, u) {
      const ex = 2 / Math.max(.5, k || 2), n = 20, P = Math.PI / 2;
      const C = [[rr, rr, -1, -1, 1], [0, rr, 1, -1, 0], [0, 0, 1, 1, 1], [rr, 0, -1, 1, 0]][i], S0 = [[0, 0], [rr, 0], [rr, rr], [0, rr]][i], pts = [S0];
      for (let j = 0; j <= n; j++) { const a = j / n * P, c = Math.cos(a) ** ex, s = Math.sin(a) ** ex, ox = rr * (C[4] ? c : s), oy = rr * (C[4] ? s : c); pts.push([C[0] + C[2] * ox, C[1] + C[3] * oy]); }
      return 'polygon(' + pts.map(([x, y]) => ((x + ext) * u).toFixed(2) + 'px ' + ((y + ext) * u).toFixed(2) + 'px').join(',') + ')';
    }
    function trimOverlays(mg) { if (!mg.ovs) return; while (mg.ovs.length > (mg.oi || 0)) { const o = mg.ovs.pop(); o.el.remove(); if (o.f) o.f.remove(); if (o.c) o.c.remove(); } }
    function clearPatches(mg) {
      if (mg.pt) { for (const q of mg.pt) { q.el.remove(); q.f.remove(); } mg.pt = null; }
      mg.oi = 0; trimOverlays(mg);
    }
    // closed svg subpath of a rect with superellipse corners (k=2 round, 4 squircle), normalized to 0..1 by W,H for a clipPath in objectBoundingBox units
    function seD(x, y, w, h, R, k, W, H) {
      const ex = 2 / Math.max(.5, k || 2), n = 20, P = Math.PI / 2, out = [];
      const cs = [[x + R[0], y + R[0], -1, -1, 1], [x + w - R[1], y + R[1], 1, -1, 0], [x + w - R[2], y + h - R[2], 1, 1, 1], [x + R[3], y + h - R[3], -1, 1, 0]];
      cs.forEach(([ccx, ccy, sx, sy, cosx], i) => {
        for (let j = 0; j <= n; j++) {
          const a = j / n * P, c = Math.cos(a) ** ex, s = Math.sin(a) ** ex, r = R[i];
          out.push(((ccx + sx * r * (cosx ? c : s)) / W).toFixed(5) + ' ' + ((ccy + sy * r * (cosx ? s : c)) / H).toFixed(5));
        }
      });
      return 'M' + out.join('L') + 'Z';
    }
    // the rounded gap of one cutout corner (sharp corner + the arc), grown by e px into its neighbours so no hairline is left between them
    function sliverD(px, py, sx, sy, cosx, rr, k, e, W, H) {
      const ex = 2 / Math.max(.5, k || 2), n = 20, P = Math.PI / 2, ccx = px - sx * rr, ccy = py - sy * rr, pts = [[px + sx * e, py + sy * e]];
      for (let j = 0; j <= n; j++) {
        const a = j / n * P, c = Math.cos(a) ** ex, s = Math.sin(a) ** ex, q = [ccx + sx * rr * (cosx ? c : s), ccy + sy * rr * (cosx ? s : c)];
        if (j === 0) { if (cosx) q[0] += sx * e; else q[1] += sy * e; }
        if (j === n) { if (cosx) q[1] += sy * e; else q[0] += sx * e; }
        pts.push(q);
      }
      pts.reverse();
      return 'M' + pts.map(([x, y]) => (x / W).toFixed(5) + ' ' + (y / H).toFixed(5)).join('L') + 'Z';
    }
    // the glass of a merged shape is drawn ONCE, on a layer behind the members (z -1 inside mg.layer), clipped to the shape. members only keep their css background on top
    function overlay(mg, mem, m, p, cut, z, W, H, ox, oy, joints) {
      const lay = mg.layer ? (typeof mg.layer === 'function' ? mg.layer() : typeof mg.layer === 'string' ? document.querySelector(mg.layer) : mg.layer) : mem[0].it.el.parentElement;
      if (!lay) return false;
      let base = mg.base == null ? '' : mg.base;
      for (const q of mem) {
        const el = q.it.el;
        clear(q.it);
        if (mg.base == null && !base) { const b = getComputedStyle(el).backdropFilter; if (b && b !== 'none') base = b; }
        el.style.setProperty('backdrop-filter', 'none', 'important'); el.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
      }
      const pr = document.createElement('div');
      pr.style.cssText = 'position:fixed;left:0;top:0;width:100px;height:1px;visibility:hidden;pointer-events:none';
      lay.appendChild(pr); const zp = pr.getBoundingClientRect().width / 100 || 1; pr.remove();
      const u = z / zp, fw = (W * u).toFixed(2), fh = (H * u).toFixed(2), e = 1;
      const ex = mem.map(() => [0, 0, 0, 0]);
      for (const j of joints) { const a = mem.indexOf(j.a), b = mem.indexOf(j.b); if (a < 0 || b < 0) continue; if (j.v) { ex[a][2] = e; ex[b][0] = e; } else { ex[a][3] = e; ex[b][1] = e; } }
      const parts = mem.map((q, i) => seD(q.x - ex[i][0], q.y - ex[i][1], q.w + ex[i][0] + ex[i][2], q.h + ex[i][1] + ex[i][3], q.R, q.R.k, W, H));
      if (cut && cut.on) cut.cs.forEach(([px, py, sx, sy], i) => { if (cut.on[i]) parts.push(sliverD(px, py, sx, sy, i % 2 ? 0 : 1, cut.R[i], cut.k, e, W, H)); });
      const d = parts.join(' ');
      const ovs = mg.ovs || (mg.ovs = []), oi = mg.oi || 0; let ov = ovs[oi];
      if (!ov || ov.el.parentElement !== lay) {
        if (ov) { ov.el.remove(); if (ov.f) ov.f.remove(); if (ov.c) ov.c.remove(); }
        ov = ovs[oi] = { el: document.createElement('div'), f: null, c: null, key: '' };
        ov.el.className = 'mu-lg-frame'; lay.insertBefore(ov.el, lay.firstChild);
      }
      mg.oi = oi + 1;
      const key = [m.key, p.scale.toFixed(2), u.toFixed(4), fw, fh, ox.toFixed(1), oy.toFixed(1), zp.toFixed(4), base, d].join('|');
      if (ov.key !== key) {
        ov.key = key;
        const id = 'mulgo' + (++S.uid), cid = id + 'c', f = document.createElementNS(NS, 'filter'), c = document.createElementNS(NS, 'clipPath');
        f.id = id; f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('x', 0); f.setAttribute('y', 0); f.setAttribute('width', fw); f.setAttribute('height', fh);
        f.setAttribute('color-interpolation-filters', 'sRGB');
        f.innerHTML = `<feImage href="${m.url}" x="0" y="0" width="${fw}" height="${fh}" preserveAspectRatio="none" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${(p.scale * 2 * u).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/>`;
        c.id = cid; c.setAttribute('clipPathUnits', 'objectBoundingBox'); c.innerHTML = '<path d="' + d + '"/>';
        const h = host(); h.appendChild(f); h.appendChild(c);
        if (ov.f) ov.f.remove(); if (ov.c) ov.c.remove(); ov.f = f; ov.c = c;
        const v = (base ? base + ' ' : '') + 'url(#' + id + ')', st = ov.el.style;
        st.cssText = 'position:fixed;pointer-events:none;z-index:' + (mg.layerZ ?? -1) + ';left:' + (ox / zp).toFixed(2) + 'px;top:' + (oy / zp).toFixed(2) + 'px;width:' + fw + 'px;height:' + fh + 'px;clip-path:url(#' + cid + ');-webkit-clip-path:url(#' + cid + ')';
        st.setProperty('backdrop-filter', v, 'important'); st.setProperty('-webkit-backdrop-filter', v, 'important');
      }
      return true;
    }
    // glass for the corner gaps: no member covers them, so each one gets a small overlay with the same shared map, clipped to the arc.
    // the overlay box is grown by the push distance so its samples come from the neighbouring panels instead of from nothing
    function patches(mg, mem, m, p, cut, z, W, H, ox, oy) {
      clearPatches(mg);
      if (!cut || !cut.on || !cut.on.some(Boolean) || !m.url) return;
      const pr = document.createElement('div');
      pr.style.cssText = 'position:fixed;left:0;top:0;width:100px;height:1px;visibility:hidden;pointer-events:none';
      document.body.appendChild(pr); const zp = pr.getBoundingClientRect().width / 100 || 1; pr.remove();
      let base = '';
      for (const q of mem) { const s = q.it.el.style.getPropertyValue('backdrop-filter').replace(/\s*url\(#mulg\d+\)\s*$/, '').trim(); if (s) { base = s; break; } }
      const u = z / zp, ext = Math.ceil(p.scale) + 2; mg.pt = [];
      cut.cs.forEach(([px, py, sx, sy], i) => {
        if (!cut.on[i]) return;
        const rr = cut.R[i], gx = (sx < 0 ? px : px - rr) - ext, gy = (sy < 0 ? py : py - rr) - ext, gs = (rr + 2 * ext) * u, id = 'mulgp' + (++S.uid);
        const f = document.createElementNS(NS, 'filter'), el = document.createElement('div');
        f.id = id; f.setAttribute('filterUnits', 'userSpaceOnUse');
        f.setAttribute('x', 0); f.setAttribute('y', 0); f.setAttribute('width', gs.toFixed(2)); f.setAttribute('height', gs.toFixed(2));
        f.setAttribute('color-interpolation-filters', 'sRGB');
        f.innerHTML = `<feImage href="${m.url}" x="${(-gx * u).toFixed(2)}" y="${(-gy * u).toFixed(2)}" width="${(W * u).toFixed(2)}" height="${(H * u).toFixed(2)}" preserveAspectRatio="none" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${(p.scale * 2 * u).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/>`;
        host().appendChild(f);
        const v = (base ? base + ' ' : '') + 'url(#' + id + ')';
        el.style.cssText = 'position:fixed;pointer-events:none;z-index:' + (mg.patch && mg.patch.z != null ? mg.patch.z : 2) + ';left:' + ((ox + gx * z) / zp).toFixed(2) + 'px;top:' + ((oy + gy * z) / zp).toFixed(2) + 'px;width:' + gs.toFixed(2) + 'px;height:' + gs.toFixed(2) + 'px;clip-path:' + sliverPoly(i, rr, cut.k, ext, u);
        el.style.setProperty('backdrop-filter', v, 'important'); el.style.setProperty('-webkit-backdrop-filter', v, 'important');
        const pp = mg.patch && mg.patch.parent; (pp ? (typeof pp === 'string' ? document.querySelector(pp) : pp) : null || document.body).appendChild(el); mg.pt.push({ el, f });
      });
    }
    function applyMerge(mg, draft) {
      const mgs = grp(mg);
      for (const g of S.merges.values()) if (g !== mg && (g.pt || (g.ovs && g.ovs.length)) && grp(g).some(x => mgs.includes(x))) clearPatches(g);
      const items = [...S.items].filter(i => i.group && mgs.includes(i.group) && i.el.isConnected), vis = [], rect = new Map();
      for (const i of items) if (i.el.offsetWidth && i.el.offsetHeight) { vis.push(i); rect.set(i, i.el.getBoundingClientRect()); }
      // members that touch (3px slack) form one component, every component of 2+ becomes a merged shape, the rest stays solo
      const par = vis.map((_, n) => n), root = n => par[n] === n ? n : (par[n] = root(par[n])), tol = mg.tol ?? 3;
      for (let a = 0; a < vis.length; a++) for (let b = a + 1; b < vis.length; b++) {
        const A = rect.get(vis[a]), B = rect.get(vis[b]);
        if (A.left <= B.right + tol && B.left <= A.right + tol && A.top <= B.bottom + tol && B.top <= A.bottom + tol) par[root(a)] = root(b);
      }
      const comps = new Map(), done = new Set();
      vis.forEach((i, n) => { const k = root(n); if (!comps.has(k)) comps.set(k, []); comps.get(k).push(i); });
      let built = false; mg.oi = 0;
      for (const c of comps.values()) if (c.length > 1 && buildMerged(mg, c, rect, draft)) { c.forEach(i => done.add(i)); built = true; }
      for (const i of items) if (!done.has(i)) applySolo(i);
      trimOverlays(mg);
    }
    function buildMerged(mg, c, rect, draft) {
      // css zoom: rects are visual px, filters live in layout px. measured off the biggest side of any member (or mg.zoom())
      let z = 1, best = 0;
      for (const i of c) { const r = rect.get(i); if (i.el.offsetWidth > best) { best = i.el.offsetWidth; z = r.width / best; } if (i.el.offsetHeight > best) { best = i.el.offsetHeight; z = r.height / best; } }
      z = mg.zoom ? (+mg.zoom() || 1) : Math.round(z * 1000) / 1000;
      if (!(z > .05) || Math.abs(z - 1) < .004) z = 1;
      const ox = Math.min(...c.map(i => rect.get(i).left)), oy = Math.min(...c.map(i => rect.get(i).top)), f1 = v => Math.round(v * 10) / 10;
      const vb = mg.openEdges === 'none' ? null : typeof mg.openEdges === 'function' ? mg.openEdges() : { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
      const mem = c.map(it => {
        const el = it.el, r = rect.get(it), w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
        it.pb = Math.max(0, Math.min(h - 2, parseFloat(getComputedStyle(el).getPropertyValue('--lg-pad')) || 0));
        const L0 = f1((r.left - ox) / z), T0 = f1((r.top - oy) / z), W0 = f1(r.width / z), H0 = f1(r.height / z), tl = (mg.edgeTol ?? 2) / z;
        // sides that sit on the open edge (window by default): the map treats them as open so no rim is drawn there
        return { it, w: W0, h: H0, x: L0, y: T0, ow: w, oh: h, R: radii(el, w, h), ex: vb ? [L0 <= (vb.left - ox) / z + tl ? 1 : 0, T0 <= (vb.top - oy) / z + tl ? 1 : 0, L0 + W0 >= (vb.right - ox) / z - tl ? 1 : 0, T0 + H0 >= (vb.bottom - oy) / z - tl ? 1 : 0] : [0, 0, 0, 0] };
      });
      const W = Math.max(...mem.map(m => m.x + m.w)), H = Math.max(...mem.map(m => m.y + m.h));
      // the real cutout (content area): its rounded corners are what the joints hug, so the gap at each concave corner is filled with exactly that corner
      let cut = null, extra = null, cuk = '';
      if (mg.cut) {
        const ce = typeof mg.cut === 'function' ? mg.cut() : mg.cut instanceof Element ? mg.cut : document.querySelector(mg.cut);
        if (ce && ce.offsetWidth && ce.offsetHeight) {
          const cr = ce.getBoundingClientRect(), cR = radii(ce, Math.round(ce.offsetWidth), Math.round(ce.offsetHeight));
          cut = { x: f1((cr.left - ox) / z), y: f1((cr.top - oy) / z), w: f1(cr.width / z), h: f1(cr.height / z), R: cR, k: cR.k };
        }
      }
      if (cut) {
        const inM = (x, y) => mem.some(m => x >= m.x - 1 && x <= m.x + m.w + 1 && y >= m.y - 1 && y <= m.y + m.h + 1);
        const cs = [[cut.x, cut.y, -1, -1], [cut.x + cut.w, cut.y, 1, -1], [cut.x + cut.w, cut.y + cut.h, 1, 1], [cut.x, cut.y + cut.h, -1, 1]];
        const on = cs.map(([px, py, sx, sy], i) => cut.R[i] > .5 && inM(px + sx * 3, py - sy * 3) && inM(px - sx * 3, py + sy * 3));
        cut.cs = cs; cut.on = on;
        cuk = [cut.x, cut.y, cut.w, cut.h, ...cut.R, cut.k, ...on.map(Number)].join(',');
        extra = (cx, ku, pd, path) => {
          cs.forEach(([px, py, sx, sy], i) => {
            if (!on[i]) return;
            const rr = cut.R[i], bx = pd + (sx < 0 ? px : px - rr) * ku, by = pd + (sy < 0 ? py : py - rr) * ku;
            cx.save(); cx.beginPath(); cx.rect(bx - 1, by - 1, rr * ku + 2, rr * ku + 2); cx.clip();
            cx.beginPath(); cx.rect(pd + cut.x * ku, pd + cut.y * ku, cut.w * ku, cut.h * ku);
            path(cx, pd + cut.x * ku, pd + cut.y * ku, cut.w * ku, cut.h * ku, cut.R.map(v => v * ku), cut.k);
            cx.fill('evenodd'); cx.restore();
          });
        };
      }
      const rv = typeof mg.radius === 'function' ? mg.radius(c[0].el) : typeof mg.radius === 'string' ? parseFloat(getComputedStyle(c[0].el).getPropertyValue(mg.radius)) : +mg.radius;
      const r = clamp(rv || 0, 0, 300), d = Math.max(2, Math.min(...mem.map(m => Math.min(m.w, m.h - m.it.pb))));
      // one set of params for the whole shape, sized off its thinnest member so the rim has the same width all the way around
      const p = resolve({ pb: 0, own: null }, d, d);
      if (p.maxArea > 0 && mem.reduce((s, m) => s + m.w * m.h, 0) > p.maxArea) return false;
      const fcap = (p.maxMapPx || 160000) * 2;
      p.maxMapPx = draft ? (S.live ? Math.min(fcap, Math.max(S.dpx || 45000, fcap * S.live.floor)) : Math.min(p.maxMapPx || 45000, 45000)) : fcap;
      p.draft = !!(draft && S.live);
      let field = null;
      const rEff = cut ? Math.min(mg.close ?? 2, r) : r;
      const R = [0, 0, 0, 0]; R.k = 2; R.mh = Math.min(d / 2, (r || d) * .8);
      // joints = places where two members touch. the push is shrunk towards them in buildMap so both sides stay continuous across the joint
      const joints = [], over = [], jt = mg.tol ?? 3;
      for (let a = 0; a < mem.length; a++) for (let b = a + 1; b < mem.length; b++) {
        const A = mem[a], B = mem[b], x0 = Math.max(A.x, B.x), x1 = Math.min(A.x + A.w, B.x + B.w), y0 = Math.max(A.y, B.y), y1 = Math.min(A.y + A.h, B.y + B.h);
        if (x1 - x0 > 2 && y1 - y0 > 2) over.push([A.it.group, B.it.group]);
        if (y1 - y0 > 2) for (const [lf, rt] of [[A, B], [B, A]]) if (Math.abs(lf.x + lf.w - rt.x) <= jt) joints.push({ v: 1, pos: (lf.x + lf.w + rt.x) / 2, lo: y0, hi: y1, a: lf, b: rt });
        if (x1 - x0 > 2) for (const [tp, bt] of [[A, B], [B, A]]) if (Math.abs(tp.y + tp.h - bt.y) <= jt) joints.push({ v: 0, pos: (tp.y + tp.h + bt.y) / 2, lo: x0, hi: x1, a: tp, b: bt });
      }
      R.j = null;
      if (mg.debug) console.log('[lg merge]', mg.key, { z, scale: p.scale, members: mem.map(m => ({ g: m.it.group, x: m.x, y: m.y, w: m.w, h: m.h, ex: m.ex })), cut: cut && { x: cut.x, y: cut.y, w: cut.w, h: cut.h, on: cut.on }, joints, overlaps: over });
      R.uk = 'U' + mem.map(m => [m.x, m.y, m.w, m.h, ...m.R, m.R.k, ...m.ex].join(',')).join(';') + '@' + rEff.toFixed(1) + '|' + cuk + '|' + p.scale.toFixed(1) + '|' + joints.length;
      R.u = (px, py) => (field || (field = unionField(mem, W, H, rEff, p.maxMapPx, null, extra)))(px, py);
      const m = buildMap(p, W, H, R);
      if (!overlay(mg, mem, m, p, cut, z, W, H, ox, oy, joints)) return false;
      mg.built = true;
      return true;
    }
    // same tail as applySolo, but the feImage is the shared map shifted back by where this member sits inside the shape
    function place(it, m, p, fk, q, W, H) {
      const el = it.el;
      el.style.removeProperty('backdrop-filter'); el.style.removeProperty('-webkit-backdrop-filter');
      let base = getComputedStyle(el).backdropFilter; if (!base || base === 'none') base = '';
      if (it.fk !== fk) {
        const id = 'mulg' + (++S.uid), f = document.createElementNS(NS, 'filter');
        f.id = id; f.setAttribute('filterUnits', 'userSpaceOnUse');
        f.setAttribute('x', 0); f.setAttribute('y', 0); f.setAttribute('width', q.ow); f.setAttribute('height', q.oh);
        f.setAttribute('color-interpolation-filters', 'sRGB');
        f.innerHTML = `<feImage href="${memberMap(m, q, W, H, p)}" x="0" y="0" width="${q.ow}" height="${q.oh}" preserveAspectRatio="none" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${(p.scale * 2).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/>`;
        host().appendChild(f); if (it.f) it.f.remove(); it.f = f; it.fk = fk;
      }
      const v = (base ? base + ' ' : '') + 'url(#' + it.f.id + ')';
      el.style.setProperty('backdrop-filter', v, 'important'); el.style.setProperty('-webkit-backdrop-filter', v, 'important');
    }
    // merged members go through one pass for the whole shape (refresh() calls this once per member, the microtask collapses them)
    function apply(it) {
      const mg = it.el.isConnected ? mergeOf(it) : null;
      if (!mg) { for (const g of S.merges.values()) if ((g.pt || (g.ovs && g.ovs.length)) && it.group && grp(g).includes(it.group)) clearPatches(g); applySolo(it); return; }
      if (!mg.pend) { mg.pend = true; queueMicrotask(() => { mg.pend = false; applyMerge(mg); }); }
    }

    // live drafts of a plain rounded rect: the map is constant along every straight edge, so the 4 corners are built once on a small stand in
    // panel (same params, same smoothing) and 1px strips are stretched between them. same pixels as buildMap at the same resolution, but the cost
    // follows the corner size instead of the panel size. returns null when it doesnt apply (merged shape, tiny panel, very coarse map)
    function sliceMap(p, w, h, R) {
      if (R.u || R.j) return null;
      let k = clamp(p.mapRes, .1, 1);
      if (p.maxMapPx > 0) k = Math.min(k, Math.sqrt(p.maxMapPx / (w * h)));
      if (k < .2) return null;
      const mw = Math.max(2, Math.ceil(w * k)), mh = Math.max(2, Math.ceil(h * k));
      const mhh = R.mh || Math.min(w, h) / 2, tau = Math.max(0, +p.soft || 0) * mhh;
      const c = Math.max(Math.max(...R) + 1.6 * tau, p.bevel) + 6, rw = 2 * c + 16; // corner tile (css px), stand in panel size
      if (w <= rw || h <= rw) return null;
      const R2 = R.slice(); R2.k = R.k; R2.mh = mhh;
      const rm = buildMap({ ...p, mapRes: k, maxMapPx: 0, draft: true, keepCv: true }, rw, rw, R2), sc = rm.cv, sw = rm.mw, sh = rm.mh, L = Math.round(c * k);
      if (!sc || 2 * L + 2 > sw || 2 * L + 2 > sh || 2 * L + 2 > mw || 2 * L + 2 > mh) return null;
      const mx = sw >> 1, my = sh >> 1, cv = document.createElement('canvas'); cv.width = mw; cv.height = mh;
      const cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false;
      cx.drawImage(sc, 0, 0, L, L, 0, 0, L, L);
      cx.drawImage(sc, sw - L, 0, L, L, mw - L, 0, L, L);
      cx.drawImage(sc, 0, sh - L, L, L, 0, mh - L, L, L);
      cx.drawImage(sc, sw - L, sh - L, L, L, mw - L, mh - L, L, L);
      cx.drawImage(sc, mx, 0, 1, L, L, 0, mw - 2 * L, L);
      cx.drawImage(sc, mx, sh - L, 1, L, L, mh - L, mw - 2 * L, L);
      cx.drawImage(sc, 0, my, L, 1, 0, L, L, mh - 2 * L);
      cx.drawImage(sc, sw - L, my, L, 1, mw - L, L, L, mh - 2 * L);
      cx.drawImage(sc, mx, my, 1, 1, L, L, mw - 2 * L, mh - 2 * L);
      return { url: cv.toDataURL(), mw, mh, key: ['S', w, h, R.join(','), R.k || '', p.profile, p.ior, p.thick, p.bevel.toFixed(2), p.edgePow, p.invert ? 1 : 0, mw, mh].join('|') };
    }
    function soloLive(it) {
      const t0 = performance.now(); applySolo(it, true); liveAdapt(performance.now() - t0);
      clearTimeout(it.t); it.t = setTimeout(() => apply(it), S.live.settle);
    }
    function applySolo(it, draft) {
      const el = it.el;
      if (!el.isConnected) { drop(it); return; }
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h) { clear(it); return; }
      // --lg-pad = px of the element's height that sit offscreen at the bottom, the glass math only uses the visible part
      it.pb = Math.max(0, Math.min(h - 2, parseFloat(getComputedStyle(el).getPropertyValue('--lg-pad')) || 0));
      const p = resolve(it, w, h);
      const R0 = radii(el, w, h);
      let fast = null;
      if (draft) { fast = sliceMap(p, w, h, R0); const F = p.maxMapPx || 160000; p.maxMapPx = Math.min(F, Math.max(S.dpx || 40000, F * S.live.floor)); p.draft = true; }
      if (p.maxArea > 0 && w * h > p.maxArea) { clear(it); return; }
      const m = fast || buildMap(p, w, h, R0), fk = m.key + '|' + p.scale.toFixed(2);
      // read what the stylesheet wants first (blur/saturate/brightness...), then put url() behind it. important so it also survives mu-noblur
      el.style.removeProperty('backdrop-filter'); el.style.removeProperty('-webkit-backdrop-filter');
      let base = getComputedStyle(el).backdropFilter; if (!base || base === 'none') base = '';
      if (it.fk !== fk) {
        const id = 'mulg' + (++S.uid), f = document.createElementNS(NS, 'filter');
        f.id = id; f.setAttribute('filterUnits', 'userSpaceOnUse');
        f.setAttribute('x', 0); f.setAttribute('y', 0); f.setAttribute('width', w); f.setAttribute('height', h);
        f.setAttribute('color-interpolation-filters', 'sRGB');
        f.innerHTML = `<feImage href="${m.url}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${(p.scale * 2).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/>`;
        host().appendChild(f); if (it.f) it.f.remove(); it.f = f; it.fk = fk;
      }
      const v = (base ? base + ' ' : '') + 'url(#' + it.f.id + ')';
      el.style.setProperty('backdrop-filter', v, 'important'); el.style.setProperty('-webkit-backdrop-filter', v, 'important');
    }

    function track(el, o = {}) {
      let it = byEl.get(el);
      if (it) { if (o.own !== undefined) { it.own = o.own; refreshPreviews(); } return it; }
      it = { el, group: o.group || null, own: o.own || null, f: null, fk: null, t: 0 };
      it.ro = new ResizeObserver(() => { const mg = mergeOf(it); if (mg) { mergeKick(mg); return; } if (S.live && it.fk) { soloLive(it); return; } clearTimeout(it.t); it.t = setTimeout(() => apply(it), it.fk ? 90 : 0); });
      it.ro.observe(el); S.items.add(it); byEl.set(el, it);
      return it;
    }
    // light refresh: re-reads css and rewrites inline filters, maps come from cache unless the params changed
    function refresh() { if (S.raf) return; S.raf = requestAnimationFrame(() => { S.raf = 0; const l = [...S.items]; for (const it of l) { it.el.style.removeProperty('backdrop-filter'); it.el.style.removeProperty('-webkit-backdrop-filter'); } for (const it of l) apply(it); }); }
    function refreshPreviews() { if (S.rp) return; S.rp = requestAnimationFrame(() => { S.rp = 0; for (const it of [...S.items]) if (!it.group) apply(it); }); }

    function scan() {
      for (const g of S.groups.values()) if (g.enabled && g.selector) document.querySelectorAll(g.selector).forEach(el => { if (!byEl.has(el)) track(el, { group: g.key }); });
      for (const it of [...S.items]) if (!it.el.isConnected) drop(it);
    }
    function watch(on) {
      if (!on) { if (S.mo) { S.mo.disconnect(); S.mo = null; } if (S.sc) cancelAnimationFrame(S.sc); S.sc = 0; return; }
      if (S.mo) return;
      S.mo = new MutationObserver(() => { if (!S.sc) S.sc = requestAnimationFrame(() => { S.sc = 0; scan(); }); });
      S.mo.observe(document.body, { childList: true, subtree: true });
    }
    function doSync() {
      const active = S.on && supported;
      for (const it of [...S.items]) if (it.group) { const g = S.groups.get(it.group); if (!active || !g || !g.enabled || (g.selector && !it.el.matches(g.selector))) drop(it); }
      if (active) for (const g of S.groups.values()) if (g.enabled && g.selector) document.querySelectorAll(g.selector).forEach(el => track(el, { group: g.key }));
      watch(active && [...S.groups.values()].some(g => g.enabled && g.selector));
    }
    function sync() { if (S.sq) return; S.sq = requestAnimationFrame(() => { S.sq = 0; doSync(); }); }

    if (supported) {
      document.addEventListener('mu:designchange', () => setTimeout(refresh, 60));
      // a member sliding into place (transform) doesnt resize, so no ResizeObserver tick. rebuild the shape once it lands
      const landed = e => {
        if (!S.merges.size) return;
        const it = byEl.get(e.target), mg = it && mergeOf(it);
        if (mg) { mergeKick(mg); return; }
        for (const g of S.merges.values()) if (typeof g.cut === 'string' && g.built && e.target.matches && e.target.matches(g.cut)) mergeKick(g);
      };
      document.addEventListener('transitionend', landed, true); document.addEventListener('animationend', landed, true);
      let ht = 0;
      new MutationObserver(() => { clearTimeout(ht); ht = setTimeout(refresh, 120); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-mu-design'] });
    }

    return {
      supported, defaults: { ...DEF }, looks: LOOKS,
      get enabled() { return S.on; },
      get params() { return { ...DEF, ...S.params }; },
      get quality() { return S.q; },
      enable(on = true) { S.on = !!on; sync(); },
      configure({ params, quality, live } = {}) {
        // live: opt in, { budget: ms one draft rebuild may take (draft resolution adapts to it), settle: ms after the last resize until the full res map is built }. null/false = off
        if (live !== undefined) { const l = live === true ? {} : live; S.live = l ? { budget: clamp(+l.budget || 6, 1, 50), settle: clamp(l.settle ?? 60, 0, 1000), floor: clamp(l.floor ?? .5, 0, 1) } : null; } // floor: draft maps never drop below this fraction of the final map px
        let ch = false;
        if (params && !same(params, S.params)) { S.params = { ...params }; ch = true; }
        if (quality != null && +quality !== S.q) { S.q = clamp(+quality || 0, -1, 1); ch = true; }
        if (ch) { refreshPreviews(); clearTimeout(S.gt); S.gt = setTimeout(refresh, 160); }
      },
      group(key, o = {}) {
        const g = S.groups.get(key) || { key, selector: '', enabled: true }, prev = g.selector + '|' + g.enabled;
        Object.assign(g, o); g.key = key; S.groups.set(key, g);
        if (prev !== g.selector + '|' + g.enabled) sync();
        return g;
      },
      removeGroup(key) { S.groups.delete(key); sync(); },
      merge(key, o = {}) {
        const g = S.merges.get(key) || { key, groups: [], radius: 0, t: 0, lastEv: 0, draftAt: 0, built: false, sig: '' };
        Object.assign(g, o); S.merges.set(key, g);
        const sig = JSON.stringify([grp(g), typeof g.radius === 'function' ? 'fn' : g.radius, g.cut || '', g.enabled !== false]);
        if (g.sig !== sig) { g.sig = sig; refresh(); }
        return g;
      },
      removeMerge(key) { S.merges.delete(key); refresh(); },
      attach(el, o = {}) {
        if (!supported) return { update() {}, detach() {} };
        const it = track(el, { own: o.params || null });
        return { update(np) { it.own = np || null; refreshPreviews(); }, detach() { drop(it); } };
      },
      mountPreviews(root = document) {
        for (const it of [...S.items]) if (!it.el.isConnected) drop(it);
        if (supported) root.querySelectorAll('[data-lg-preview]').forEach(el => track(el));
      },
      refresh,
      stats() { return { supported, enabled: S.on, items: S.items.size, maps: mcache.size, lastMapMs: +S.lastMs.toFixed(1) }; },
    };
  })();

  /* ─────────────────────────────────────────────────────────
     GLASS — one material for every glassy surface
     a tier is a named set of surfaces: { sel, bg, bgOff, border, spec, hover, blur, refract, fx, important, owns }
       sel       selector string or array
       bg/bgOff  background with the backdrop bundle live / without it (bgOff falls back to bg, use it to make panels more solid)
       border    border-color        spec/hover  box-shadow (always applied, never touched by the slider)
       blur      backdrop-filter used when live, default var(--glass-blur) (blur + saturate + brightness/contrast)
       refract   true or a params object for liquidGlass, only runs while the tier is live
       fx:false  spec only tier, never gets the backdrop bundle (song rows)
       important add !important to the generated bg/border/spec rules     owns:false  dont write backdrop-filter at all
     the bundle (blur + sat/bright/contrast + refraction) is all or nothing per tier. configure({level}) decides which tiers have it:
     order = tiers that keep it longest first, level n = the first n tiers of order, 0 = spec only. edit the order in one place.
     nothing nested inside an element with a live bundle gets its own (a backdrop filter is a backdrop root, so a child could only
     see its parents paint). the css and the refraction groups both skip those, that part is free.
     MU.glass: define(name|map, def) · add(selector, tier) · remove(selector) · configure({on, level, order})
       active(tier) · tier(name) · level · levels · order · stats() · refresh()
     ───────────────────────────────────────────────────────── */
  const Glass = (() => {
    const L = LiquidGlass, S = { on: true, level: Infinity, order: [], tiers: new Map(), el: null, q: 0, sig: '' };
    const lst = v => v == null || v === '' ? [] : Array.isArray(v) ? v.filter(Boolean) : [String(v)];
    const glassy = () => document.documentElement.dataset.muDesign === 'glassy';
    const lvl = () => Math.max(0, Math.min(S.level, S.order.length));
    const inLevel = n => { const i = S.order.indexOf(n); return S.on && i > -1 && i < lvl(); };
    const live = n => { const t = S.tiers.get(n); return !!t && t.sel.length > 0 && t.fx !== false && inLevel(n); };
    const sl = t => t.sel.join(',');

    function css() {
      const R = 'html[data-mu-design="glassy"]', tiers = S.order.map(n => S.tiers.get(n)).filter(t => t && t.sel.length), o = [];
      const all = tiers.map(sl), lv = tiers.filter(t => live(t.name)).map(sl);
      for (const t of tiers) {
        const on = live(t.name), s = R + ' :is(' + sl(t) + ')', imp = t.important ? ' !important' : '', d = [];
        const bg = on ? t.bg : (t.bgOff || t.bg);
        if (bg) d.push('background:' + bg + imp);
        if (t.border) d.push('border-color:' + t.border + imp);
        if (t.spec) d.push('box-shadow:' + t.spec + imp);
        if (t.owns !== false) {
          if (on) { const f = t.blur || 'var(--glass-blur)'; d.push('backdrop-filter:' + f, '-webkit-backdrop-filter:' + f); }
          else d.push('backdrop-filter:none !important', '-webkit-backdrop-filter:none !important');
        }
        if (d.length) o.push(s + '{' + d.join(';') + '}');
        if (t.hover) o.push(s + ':hover{box-shadow:' + t.hover + imp + '}');
      }
      if (lv.length) o.push(R + ' :is(' + lv.join(',') + ') :is(' + all.join(',') + '){backdrop-filter:none !important;-webkit-backdrop-filter:none !important}');
      return o.join('\n');
    }
    // refraction groups follow the same rules as the css: only live tiers, never inside another live tier
    function sync() {
      const gl = glassy(), lv = S.order.filter(live);
      const nest = lv.length ? ':not(:is(' + lv.map(n => sl(S.tiers.get(n))).join(',') + ') *)' : '';
      let sig = '';
      for (const n of S.order) {
        const t = S.tiers.get(n), key = 'glass:' + n;
        if (t && t.refract && gl && lv.includes(n)) {
          const params = typeof t.refract === 'object' ? t.refract : null;
          sig += key + JSON.stringify(params);
          L.group(key, { selector: ':is(' + sl(t) + ')' + nest, enabled: true, params }); t._g = true;
        } else if (t && t._g) { L.group(key, { enabled: false }); t._g = false; sig += key + 'off'; }
      }
      if (sig !== S.sig) { S.sig = sig; L.refresh(); }
    }
    function apply() {
      if (!S.el || !S.el.isConnected) { S.el = document.createElement('style'); S.el.id = 'mu-glass'; (document.head || document.documentElement).appendChild(S.el); }
      const c = css(); if (S.el.textContent !== c) S.el.textContent = c;
      sync();
    }
    function kick() { if (S.q) return; S.q = 1; queueMicrotask(() => { S.q = 0; apply(); }); }
    document.addEventListener('mu:designchange', kick);

    return {
      define(a, b) {
        const m = typeof a === 'string' ? { [a]: b || {} } : a || {};
        for (const k of Object.keys(m)) {
          const d = m[k] || {}, o = S.tiers.get(k) || { sel: [] };
          S.tiers.set(k, Object.assign(o, d, { name: k, sel: d.sel !== undefined ? lst(d.sel) : o.sel }));
          if (!S.order.includes(k)) S.order.push(k);
        }
        kick(); return this;
      },
      add(selector, tier) {
        const t = S.tiers.get(tier); if (!t) return this;
        for (const x of lst(selector)) if (!t.sel.includes(x)) t.sel.push(x);
        kick(); return this;
      },
      remove(selector) { const r = lst(selector); for (const t of S.tiers.values()) t.sel = t.sel.filter(x => !r.includes(x)); kick(); return this; },
      configure({ on, level, order } = {}) {
        if (on != null) S.on = !!on;
        if (level != null) S.level = level === Infinity ? Infinity : Math.max(0, Math.round(+level) || 0);
        if (order) { const od = lst(order).filter(n => S.tiers.has(n)); S.order = od.concat(S.order.filter(n => !od.includes(n))); }
        kick(); return this;
      },
      // true while the tier actually has the backdrop bundle (blur + refraction), meowify uses it to gate its own engine groups
      active: live,
      tier(n) { const t = S.tiers.get(n); return t ? { ...t, sel: [...t.sel], active: live(n) } : null; },
      get enabled() { return S.on; },
      get level() { return lvl(); },
      get levels() { return S.order.length; },
      get order() { return [...S.order]; },
      refresh: kick,
      stats() {
        return {
          level: lvl(), levels: S.order.length,
          tiers: S.order.map(n => { const t = S.tiers.get(n); return { tier: n, active: live(n), els: t.sel.length ? document.querySelectorAll(sl(t)).length : 0 }; }),
          lg: L.stats(),
        };
      },
    };
  })();

  window.MU = {
    _initialized: false,
    init(opts = {}) {
    if (this._initialized) return;
    this._initialized = true;
    Palette.init(opts.hue ?? 250, opts.sat ?? 50, opts.bri ?? 1.0);
      initAll(document);
      observer.observe(document.body, { childList: true, subtree: true });
        if (opts.blur)   setBlur(true);
      if (opts.design) Design.setDesign(opts.design);
    },
    setDesign(name)  { Design.setDesign(name); },
    getDesign()      { return Design.getDesign(); },
    designs()        { return Design.getDesigns(); },
    get currentDesign() { return Design.current; },
    setHue(hue, animate = true, sat) { Palette.setHue(hue, animate, sat); },
    setSat(sat) { Palette.setSat(sat); },
    setBri(bri) { Palette.setBri(bri); },
    setPalette(opts) { Palette.setPalette(opts); },
    setBlur,
    setGlass({ alpha, blur, sat, bright, contrast } = {}) {
      const r = document.documentElement;
      if (sat != null) r.style.setProperty('--glass-sat', sat);
      if (bright != null) GlassFx.b = bright;
      if (contrast != null) GlassFx.c = contrast;
      if (bright != null || contrast != null) {
        const fx = [GlassFx.b !== 1 ? `brightness(${GlassFx.b})` : '', GlassFx.c !== 1 ? `contrast(${GlassFx.c})` : ''].filter(Boolean).join(' ');
        if (fx) r.style.setProperty('--glass-fx', fx); else r.style.removeProperty('--glass-fx');
      }
      // LiquidGlass re-reads root class/style on its own (debounced)
      if (alpha != null) {
        r.style.setProperty('--glass-a', Math.min(1, alpha));
        r.style.setProperty('--glass-s', Math.max(0, Math.min(1, alpha - 1)));
      }
      if (blur  != null) {
        r.style.setProperty('--glass-b', blur);
        r.classList.toggle('mu-noblur', Number(blur) <= 0);
      }
    },
    snackbar,
    dialog,
    sheet,
    contextMenu,
    joinSurfaces,
    spring,
    initSheetDrag,
    drawerStack: DrawerStack,
    circularProgress,
    tooltip,
    ripple: spawnRipple,
    spikyCircle,
    spikyCircleToCanvas,
    stampGearIcons,
    animateSpikyCircle,
    palette: Palette,
    liquidGlass: LiquidGlass,
    glass: Glass,
    get currentHue() { return Palette.currentHue; },
    get currentSat() { return Palette.currentSat; },
    get currentBri() { return Palette.currentBri; },
    syncBlobScenes,
    metaball,
    wavyLinePath,
    waveProgress,
    updateSlider,
    pullToRefresh,
  };

  /* Auto-init */
  const autoInit = () => {
    if (window.MU._initialized) return;
    const ds  = document.documentElement.dataset;
    const h   = ds.muHue;
    const sat = ds.muSat;
    const bri = ds.muBri;
    const b   = ds.muBlur;
    const d = ds.muDesign;
    window.MU.init({ hue: h != null ? +h : 250, sat: sat != null ? +sat : 50, bri: bri != null ? +bri : 1.0, blur: b != null, design: d ?? null });
  };
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  else autoInit();
})();