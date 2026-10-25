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
    animateTo(toHue, dur = 700) {
      if (prefersReduced()) { this.currentHue = ((toHue % 360) + 360) % 360; this.applyTokens(this.currentHue); return; }
      const from  = this._animRaf ? this._shownHue : this.currentHue;
      const delta = ((toHue - from + 540) % 360) - 180;
      const start = performance.now();
      if (this._animRaf) cancelAnimationFrame(this._animRaf);
      this._lastStep = 0;
      const step = now => {
        const t    = Math.min((now - start) / dur, 1);
        if (t < 1 && now - this._lastStep < 33) { this._animRaf = requestAnimationFrame(step); return; }
        this._lastStep = now;
        // ease-in-out-quad
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const h    = ((from + delta * ease) % 360 + 360) % 360;
        this._shownHue = h;
        this.applyTokens(h, undefined, undefined, t < 1);
        if (t < 1) {
          this._animRaf = requestAnimationFrame(step);
        } else {
          this._animRaf = null;
          this.currentHue = ((toHue % 360) + 360) % 360;
          this.applyTokens(this.currentHue);
        }
      };
      this._animRaf = requestAnimationFrame(step);
    },

    setPalette({ hue, sat, bri } = {}) {
      if ((hue === undefined || hue === null) && (sat === undefined || sat === null || sat === this.currentSat) && (bri === undefined || bri === null || bri === this.currentBri)) return;
      if (hue !== undefined && hue !== null) this.currentHue = ((hue % 360) + 360) % 360;
      if (sat !== undefined && sat !== null) this.currentSat = sat;
      if (bri !== undefined && bri !== null) this.currentBri = bri;
      this.applyTokens(this.currentHue, this.currentSat, this.currentBri);
    },

    setHue(hue, animate = false) {
      const h = ((hue % 360) + 360) % 360;
      if (animate) {
        // currentHue stays the old hue until animateTo finishes, it needs it as the start point
        // animate can be true (700ms) or a number of ms
        this.animateTo(h, typeof animate === 'number' ? animate : 700);
      } else {
        if (this._animRaf) { cancelAnimationFrame(this._animRaf); this._animRaf = null; }
        this.currentHue = h;
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
        setTimeout(() => {
          el.style.transition = ''; el.style.transform = ''; el.style.transformOrigin = '';
          if (bd) bd.style.transition = '';
          onDismiss();
        }, dur);
      } else {
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
        const dy = y - bodyTouchStartY;
        if (Math.abs(dy) < BODY_THRESHOLD) return;
        // inside a scroller: pulling down only takes over at the very top, pulling up never does
        if (touchScroller && (dy < 0 || touchScroller.scrollTop > 0)) return;
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
          r.style.setProperty('--glass-blur',      'blur(calc(12px * var(--glass-b,1))) saturate(1.4)');
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
        applyTokens() {
          const r = document.documentElement;
          r.style.setProperty('--bloom-bg',        'oklch(2% 0 0)');
          r.style.setProperty('--bloom-surface',   'oklch(6% 0 0)');
          r.style.setProperty('--bloom-surface-hi','oklch(10% 0 0)');
          r.style.setProperty('--bloom-text',      'oklch(88% 0.02 0)');
          r.style.setProperty('--bloom-text-dim',  'oklch(52% 0.01 0)');
          r.style.setProperty('--bloom-glow',      'var(--color-primary)');
          r.style.setProperty('--bloom-glow-2',    'var(--color-secondary)');
          const sat = Palette.currentSat ?? 60;
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
        applyTokens() {
          const r   = document.documentElement;
          const hue = Palette.currentHue;
          const sat = Palette.currentSat;
          const bv  = Palette.currentBri;
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

    let startY = 0, curDrag = 0, active = false, syncing = false, pid = null, raf = null;

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
      startY = e.touches[0].clientY; curDrag = 0; active = true;
      raf = requestAnimationFrame(dragLoop);
    }, { passive: true });
    el.addEventListener('touchmove', e => {
      if (!active) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) e.preventDefault();   // block scroll only while pulling down
      curDrag = Math.max(0, dy);
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
      el.setPointerCapture(e.pointerId);
      raf = requestAnimationFrame(dragLoop);
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch' || !active || e.pointerId !== pid) return;
      curDrag = Math.max(0, e.clientY - startY);
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
    setHue(hue, animate = true) { Palette.setHue(hue, animate); },
    setSat(sat) { Palette.setSat(sat); },
    setBri(bri) { Palette.setBri(bri); },
    setPalette(opts) { Palette.setPalette(opts); },
    setBlur,
    setGlass({ alpha, blur } = {}) {
      const r = document.documentElement;
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