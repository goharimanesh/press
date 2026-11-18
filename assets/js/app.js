/* =====================================================================
   ARCSLAB × SSSLAB showcase — landing page, gallery, details modal
   ===================================================================== */
(() => {
  const D = window.SHOWCASE, LABS = D.labs, MODELS = D.models;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const folder = m => 'models/' + m.id;
  const viewerURL = m => 'viewer.html?id=' + encodeURIComponent(m.id);
  const entryURL = m => folder(m) + '/' + (m.entry || 'index.html');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!window.gsap && !reduced;
  if (hasGSAP) { document.documentElement.classList.add('js-anim'); window.ScrollTrigger && gsap.registerPlugin(ScrollTrigger); }

  /* ---------------------------------------------------------- counts */
  const count = { all: MODELS.length, arcslab: 0, sss: 0 };
  MODELS.forEach(m => count[m.lab] = (count[m.lab] || 0) + 1);
  $$('[data-count]').forEach(el => el.textContent = count[el.dataset.count] ?? 0);
  $$('.portal-meta').forEach(el => { const n = count[el.closest('.portal').dataset.lab] || 0; el.innerHTML = `<b>${n}</b> interactive model${n === 1 ? '' : 's'}`; });
  $('#yr').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------- top bar */
  const tb = $('#topbar');
  const onScroll = () => tb.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------------------------------------------------------- gallery */
  const state = { lab: 'all', q: '' };
  const grid = $('#grid');
  let firstRender = true;

  function coverHTML(m) {
    return `<img src="${folder(m)}/${esc(m.cover || 'cover.svg')}" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/img/cover-fallback.svg'">`;
  }
  function cardHTML(m) {
    const lab = LABS[m.lab] || {};
    return `<article class="card" data-lab="${m.lab}" data-id="${esc(m.id)}" tabindex="0" aria-label="${esc(m.title)}">
      <div class="card-cover">${coverHTML(m)}<span class="shine"></span>
        <span class="chip ${m.lab}">${esc(lab.name)}</span>
        <span class="pod-badge">${Podcast.ICON.head}<span>Podcast</span></span>
      </div>
      <div class="card-body">
        <div class="card-kicker"><span>${esc(lab.full)}</span><span class="dot">•</span><span>${esc(m.language || '')}</span></div>
        <h3 class="card-title">${esc(m.title)}<span>${esc(m.subtitle || '')}</span></h3>
        <div class="card-authors">${esc((m.authors || []).join(' · '))}</div>
        <div class="tags">${(m.tags || []).slice(0, 4).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="card-actions">
          <a class="btn btn--primary" href="${viewerURL(m)}" data-launch>Launch
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
          <button class="btn" data-details>Details &amp; podcast</button>
        </div>
      </div>
    </article>`;
  }
  const ghostHTML = () => `<div class="card card--ghost">
      <div class="plus">+</div>
      <h3>Add the next model</h3>
      <ol>
        <li><span>Copy <code>models/_template</code> to <code>models/your-model-id</code></span></li>
        <li><span>Put the simulation in <code>index.html</code> and a <code>cover.svg</code> beside it</span></li>
        <li><span>Optional: drop in <code>podcast.mp3</code></span></li>
        <li><span>Add an entry to <code>models/registry.js</code></span></li>
      </ol>
    </div>`;

  function matches(m) {
    if (state.lab !== 'all' && m.lab !== state.lab) return false;
    if (!state.q) return true;
    const hay = [m.title, m.subtitle, m.abstract, m.venue, (m.authors || []).join(' '), (m.tags || []).join(' '), LABS[m.lab]?.name, LABS[m.lab]?.full].join(' ').toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
  }

  function render() {
    const list = MODELS.filter(matches);
    grid.innerHTML = list.map(cardHTML).join('') + (state.q ? '' : ghostHTML());
    $('#empty').hidden = list.length > 0;
    const labTxt = state.lab === 'all' ? 'both laboratories' : LABS[state.lab].name;
    $('#resultLine').textContent = `${list.length} model${list.length === 1 ? '' : 's'} · ${labTxt}${state.q ? ` · “${state.q}”` : ''}`;

    $$('.card[data-id]').forEach(card => {
      const m = MODELS.find(x => x.id === card.dataset.id);
      card.addEventListener('click', e => { if (!e.target.closest('[data-launch]')) openModal(m); });
      card.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target === card) openModal(m); });
      Podcast.find(m).then(r => {
        if (!r) return;
        const b = card.querySelector('.pod-badge');
        b.querySelector('span').textContent = 'Podcast · ' + Podcast.fmt(r.duration);
        b.classList.add('show');
      });
      tilt(card);
    });

    if (hasGSAP) {
      const cards = $$('#grid .card');
      const anim = () => gsap.fromTo(cards, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: .9, stagger: .08, ease: 'expo.out', clearProps: 'transform,opacity' });
      if (firstRender && window.ScrollTrigger) {
        gsap.set(cards, { opacity: 0 });
        ScrollTrigger.create({ trigger: grid, start: 'top 90%', once: true, onEnter: anim });
      } else anim();
    }
    firstRender = false;
  }

  function setLab(lab) {
    state.lab = lab;
    $$('.seg button').forEach(b => b.classList.toggle('on', b.dataset.filter === lab));
    render();
  }
  $$('.seg button').forEach(b => b.addEventListener('click', () => setLab(b.dataset.filter)));
  let qt; $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 120); });
  $$('.portal').forEach(p => p.addEventListener('click', () => setLab(p.dataset.lab)));

  /* card tilt + light */
  function tilt(card) {
    if (reduced || matchMedia('(hover: none)').matches) return;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 4}deg) rotateY(${(x - 0.5) * 5}deg) translateY(-4px)`;
      card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }

  /* ---------------------------------------------------------- labs */
  $('#labCards').innerHTML = Object.entries(LABS).map(([key, L]) => `
    <article class="lab ${key} reveal">
      <div class="lab-top"><img src="${L.mark}" alt="">
        <div><div class="lab-name">${esc(L.name)}</div><div class="lab-full">${esc(L.full)}</div></div></div>
      <p class="lab-tag">${esc(L.tagline)}</p>
      <p class="blurb">${esc(L.blurb)}</p>
      <h4>Research areas</h4>
      <div class="tags">${L.areas.map(a => `<span class="tag">${esc(a)}</span>`).join('')}</div>
      <h4>People</h4>
      <div class="lab-people">${L.people.map(([r, n]) => `<div><span>${esc(r)}</span>${esc(n)}</div>`).join('')}</div>
      <div class="lab-foot">
        <a class="btn btn--primary" href="#models" data-lab-go="${key}">${count[key] || 0} interactive model${count[key] === 1 ? '' : 's'} →</a>
        <a class="btn" href="${L.url}" target="_blank" rel="noopener">Lab website ↗</a>
      </div>
    </article>`).join('');
  $$('[data-lab-go]').forEach(a => a.addEventListener('click', () => setLab(a.dataset.labGo)));

  /* ---------------------------------------------------------- modal */
  const modal = $('#modal'), box = modal.querySelector('.modal-box');
  let player = null, lastFocus = null;
  function openModal(m) {
    const lab = LABS[m.lab] || {};
    lastFocus = document.activeElement;
    box.dataset.lab = m.lab;
    const img = $('#mCover'); img.onerror = () => { img.onerror = null; img.src = 'assets/img/cover-fallback.svg'; }; img.src = folder(m) + '/' + (m.cover || 'cover.svg');
    $('#mChip').className = 'chip ' + m.lab; $('#mChip').textContent = lab.name + ' · ' + lab.full;
    $('#mTitle').innerHTML = esc(m.title) + `<span>${esc(m.subtitle || '')}</span>`;
    $('#mAuthors').textContent = (m.authors || []).join(' · ');
    $('#mVenue').textContent = [m.venue, m.language ? 'Interface: ' + m.language : ''].filter(Boolean).join('  ·  ');
    $('#mAbstract').textContent = m.abstract || '';
    $('#mTags').innerHTML = (m.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    $('#mFeats').innerHTML = (m.features || []).map(f => `<li>${esc(f)}</li>`).join('');
    $('#mLaunch').href = viewerURL(m);
    $('#mStandalone').href = entryURL(m);
    player?.destroy(); player = new Podcast.Player($('#mPodcast'), m);
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    history.replaceState(null, '', '#m/' + m.id);
    setTimeout(() => $('#mClose').focus(), 50);
  }
  function closeModal() {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    player?.destroy(); player = null;
    history.replaceState(null, '', '#models');
    lastFocus?.focus?.();
  }
  $('#mClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---------------------------------------------------------- boot */
  render();
  const deep = location.hash.match(/^#m\/(.+)$/);
  if (deep) { const m = MODELS.find(x => x.id === decodeURIComponent(deep[1])); if (m) setTimeout(() => { $('#models').scrollIntoView(); openModal(m); }, 300); }
  const qLab = new URLSearchParams(location.search).get('lab');
  if (qLab && LABS[qLab]) setLab(qLab);

  /* ---------------------------------------------------------- intro animation */
  $$('.split').forEach(el => { el.innerHTML = [...el.textContent].map(c => `<span class="ch">${c}</span>`).join(''); });
  if (hasGSAP) {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.intro .a-fade', { opacity: 0, y: 16, duration: 1.2, stagger: .045 }, .15)
      .from('.portal-name .ch', { yPercent: 70, opacity: 0, filter: 'blur(10px)', duration: 1.4, stagger: .055 }, .25);
    if (window.ScrollTrigger) {
      gsap.utils.toArray('.reveal').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
      gsap.to('.portals', { yPercent: -8, opacity: .35, ease: 'none', scrollTrigger: { trigger: '.intro', start: 'top top', end: 'bottom top', scrub: true } });
    } else gsap.set('.reveal', { opacity: 1, y: 0 });
  }

  /* ---------------------------------------------------------- background canvas */
  const cv = $('#bg'), cx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, running = true, focus = 0, focusT = 0, mx = 0.5, my = 0.5, t0 = performance.now();
  const stars = [];
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 1.6);
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    stars.length = 0;
    const n = Math.round(W * H / 9000);
    for (let i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.1 + .2, p: Math.random() * 6.28, s: .4 + Math.random() * 1.4 });
  }
  addEventListener('resize', resize); resize();
  $$('.portal').forEach(p => {
    p.addEventListener('pointerenter', () => focusT = p.dataset.lab === 'arcslab' ? -1 : 1);
    p.addEventListener('pointerleave', () => focusT = 0);
  });
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; }, { passive: true });
  new IntersectionObserver(es => { running = es[0].isIntersecting; if (running) requestAnimationFrame(frame); }).observe(cv);

  const AMB = [255, 158, 74], CYA = [71, 211, 255], VIO = [164, 141, 255];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function tentacle(bx, by, len, t, ph, amp, alpha, width) {
    // three constant-curvature sections whose curvatures breathe in time
    const ks = [Math.sin(t * .55 + ph) * amp, Math.sin(t * .7 + ph * 1.7 + 1) * amp * 1.25, Math.sin(t * .9 + ph * .6 + 2) * amp * 1.5];
    let x = bx, y = by, th = -Math.PI / 2; const ds = len / 90, pts = [];
    for (let i = 0; i <= 90; i++) { const k = ks[Math.min(2, Math.floor(i / 30))] / len; pts.push([x, y, th]); th += k * ds * 6; x += Math.cos(th) * ds; y += Math.sin(th) * ds; }
    cx.lineCap = 'round';
    cx.strokeStyle = rgba(AMB, alpha); cx.lineWidth = width;
    cx.beginPath(); pts.forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1])); cx.stroke();
    cx.lineWidth = 1.2;
    for (let i = 3; i < pts.length; i += 6) {
      const [px, py, a] = pts[i], w = width * 2.4 * (1 - i / pts.length * .45), nx = -Math.sin(a), ny = Math.cos(a);
      cx.strokeStyle = rgba(AMB, alpha * .9);
      cx.beginPath(); cx.moveTo(px - nx * w, py - ny * w); cx.lineTo(px + nx * w, py + ny * w); cx.stroke();
    }
    const e = pts[pts.length - 1];
    cx.fillStyle = rgba([255, 214, 150], Math.min(1, alpha * 2.2));
    cx.beginPath(); cx.arc(e[0], e[1], width * .9, 0, 7); cx.fill();
    return e;
  }

  function drawArcs(cxp, cyp, S, t, a) {
    // figure-eight path + tentacles
    cx.setLineDash([3, 7]); cx.strokeStyle = rgba(AMB, .22 * a); cx.lineWidth = 1.2; cx.beginPath();
    for (let i = 0; i <= 120; i++) { const u = i / 120 * Math.PI * 2, x = cxp + Math.cos(u) * S * .42, y = cyp - S * .32 + Math.sin(2 * u) * S * .16; i ? cx.lineTo(x, y) : cx.moveTo(x, y); }
    cx.stroke(); cx.setLineDash([]);
    const u = t * .6, tx = cxp + Math.cos(u) * S * .42, ty = cyp - S * .32 + Math.sin(2 * u) * S * .16;
    const g = cx.createRadialGradient(tx, ty, 0, tx, ty, 18); g.addColorStop(0, rgba([255, 230, 190], .9 * a)); g.addColorStop(1, rgba(AMB, 0));
    cx.fillStyle = g; cx.beginPath(); cx.arc(tx, ty, 18, 0, 7); cx.fill();
    const base = cyp + S * .62;
    [[-.36, 0.0, .7, .28, 3.2], [-.12, 1.3, 1.0, .42, 4.2], [.14, 2.4, .85, .36, 3.6], [.38, 3.9, .65, .24, 2.8]]
      .forEach(([dx, ph, l, al, w]) => tentacle(cxp + dx * S, base, S * l, t, ph, 1.1, al * a, w));
  }

  function drawSSS(cxp, cyp, S, t, a) {
    // hexagonal lattice fading radially
    const sp = Math.max(18, S * .055);
    for (let j = -12; j <= 12; j++) for (let i = -14; i <= 14; i++) {
      const x = cxp + (i + (j & 1) * .5) * sp, y = cyp + j * sp * .866, d = Math.hypot(x - cxp, y - cyp) / (S * .78);
      if (d > 1) continue;
      const tw = .5 + .5 * Math.sin(t * 1.3 + i * .7 + j * .45);
      cx.fillStyle = rgba(CYA, (1 - d) * (.1 + .16 * tw) * a);
      cx.fillRect(x - .9, y - .9, 1.8, 1.8);
    }
    // two nanowires bending toward each other, with field arcs and charges
    const V = .5 + .5 * Math.sin(t * .5), L = S * 1.15, x0 = cxp - L / 2, gap = S * .3;
    const defl = s => gap * .32 * Math.pow(V, 1.6) * (s * s * (3 - s) / 2);
    for (const sg of [-1, 1]) {
      cx.strokeStyle = rgba(sg < 0 ? CYA : VIO, .55 * a); cx.lineWidth = 3; cx.lineCap = 'round';
      cx.beginPath();
      for (let i = 0; i <= 50; i++) { const s = i / 50, x = x0 + s * L, y = cyp + sg * (gap / 2 - defl(s)); i ? cx.lineTo(x, y) : cx.moveTo(x, y); }
      cx.stroke();
      cx.fillStyle = rgba([220, 245, 255], .9 * a); const ty = cyp + sg * (gap / 2 - defl(1));
      cx.beginPath(); cx.arc(x0 + L, ty, 3.4, 0, 7); cx.fill();
    }
    for (let k = 1; k <= 9; k++) {
      const s = k / 10, x = x0 + s * L, yT = cyp - (gap / 2 - defl(s)), yB = cyp + (gap / 2 - defl(s));
      for (const b of [-1, 0, 1]) {
        const bulge = b * (yB - yT) * .55;
        cx.strokeStyle = rgba(CYA, (.06 + .2 * V) * a * (b ? .6 : 1)); cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(x, yT); cx.quadraticCurveTo(x + bulge, (yT + yB) / 2, x, yB); cx.stroke();
        const ph = (t * (.25 + .6 * V) + k * .13 + b * .31) % 1, q = ph, mx_ = (1 - q) * (1 - q) * x + 2 * (1 - q) * q * (x + bulge) + q * q * x, my_ = (1 - q) * (1 - q) * yT + 2 * (1 - q) * q * ((yT + yB) / 2) + q * q * yB;
        cx.fillStyle = rgba([255, 200, 130], (.25 + .6 * V) * a); cx.beginPath(); cx.arc(mx_, my_, 1.4, 0, 7); cx.fill();
      }
    }
  }

  function frame(now) {
    if (!running) return;
    const t = reduced ? 12 : (now - t0) / 1000;
    focus += (focusT - focus) * .06;
    cx.clearRect(0, 0, W, H);
    for (const s of stars) { cx.fillStyle = `rgba(210,225,255,${.18 + .3 * (.5 + .5 * Math.sin(t * s.s + s.p))})`; cx.fillRect(s.x, s.y, s.r, s.r); }
    const px = (mx - .5) * 18, py = (my - .5) * 12, wide = W > 860;
    const S = wide ? Math.min(W * .32, H * .56) : Math.min(W * .7, H * .3);
    const aA = .55 + .45 * Math.max(0, -focus) - .3 * Math.max(0, focus);
    const aS = .55 + .45 * Math.max(0, focus) - .3 * Math.max(0, -focus);
    cx.save(); cx.translate(px, py);
    if (wide) { drawArcs(W * .25, H * .5, S, t, aA); drawSSS(W * .75, H * .52, S, t, aS); }
    else { drawArcs(W * .5, H * .3, S, t, aA); drawSSS(W * .5, H * .72, S, t, aS); }
    cx.restore();
    if (!reduced) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
