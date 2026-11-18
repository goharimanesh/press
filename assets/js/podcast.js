/* =====================================================================
   Podcast player — finds the audio file inside a model folder by itself.
   Drop any of these into models/<id>/ and it plays:
     podcast.mp3 · podcast.m4a · podcast.aac · podcast.ogg · podcast.opus · podcast.wav · podcast.webm
   (or set  podcast: 'my-file.mp3'  in models/registry.js)
   Works on GitHub Pages and when index.html is opened from disk (file://).
   ===================================================================== */
(function () {
  const NAMES = ['podcast.mp3', 'podcast.m4a', 'podcast.aac', 'podcast.ogg', 'podcast.opus', 'podcast.wav', 'podcast.webm'];
  const cache = {};
  const players = new Set();

  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1.4"/><rect x="14" y="4" width="5" height="16" rx="1.4"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    head: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/></svg>'
  };

  function probe(url) {
    return new Promise(resolve => {
      const a = new Audio();
      let done = false;
      const finish = v => {
        if (done) return; done = true; clearTimeout(timer);
        a.onloadedmetadata = a.onerror = null;
        try { a.removeAttribute('src'); a.load(); } catch (e) {}
        resolve(v);
      };
      const timer = setTimeout(() => finish(null), 8000);
      a.preload = 'metadata';
      a.onloadedmetadata = () => finish({ src: url, duration: a.duration });
      a.onerror = () => finish(null);
      a.src = url;
    });
  }

  function folderOf(model) { return 'models/' + model.id; }

  /** Resolve the podcast of a model → {src, duration, file} or null. `base` prefixes the path (e.g. '' or '../'). */
  function find(model, base = '') {
    if (cache[model.id]) return cache[model.id];
    const list = model.podcast ? [model.podcast, ...NAMES.filter(n => n !== model.podcast)] : NAMES;
    cache[model.id] = (async () => {
      for (const n of list) {
        const r = await probe(base + folderOf(model) + '/' + n);
        if (r) { r.file = n; return r; }
      }
      return null;
    })();
    return cache[model.id];
  }

  function fmt(s) {
    if (!isFinite(s)) return '--:--';
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = String(s % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
  }

  // deterministic pseudo-waveform per model
  function bars(seed, n) {
    let x = 0; for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0;
    const rnd = () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296);
    const out = [];
    for (let i = 0; i < n; i++) {
      const env = 0.55 + 0.45 * Math.sin(Math.PI * (i + 0.5) / n);
      out.push(Math.round((18 + 82 * rnd() * env)));
    }
    return out;
  }

  const RATES = [1, 1.25, 1.5, 2, 0.75];

  class Player {
    constructor(el, model, opts = {}) {
      this.el = el; this.model = model; this.compact = !!opts.compact; this.base = opts.base || '';
      this.lab = model.lab;
      this.el.innerHTML = `<div class="pc pc--loading ${this.lab} ${this.compact ? 'pc--compact' : ''}"><span class="pc-ico">${ICON.head}</span><span>Looking for podcast…</span></div>`;
      find(model, this.base).then(r => r ? this.ready(r) : this.empty());
    }
    empty() {
      const path = `models/${this.model.id}/`;
      this.el.innerHTML = this.compact
        ? `<div class="pc pc--empty pc--compact ${this.lab}" title="Add podcast.mp3 to ${path} to enable the podcast"><span class="pc-ico">${ICON.mic}</span><span>No podcast yet</span></div>`
        : `<div class="pc pc--empty ${this.lab}"><span class="pc-ico">${ICON.mic}</span><div><b>No podcast yet</b>Put <code>podcast.mp3</code> in <code>${path}</code> and it will appear here automatically.</div></div>`;
    }
    ready(r) {
      this.audio = new Audio(r.src); this.audio.preload = 'metadata';
      const N = this.compact ? 28 : 64, hs = bars(this.model.id, N);
      const wave = `<div class="pc-wave">${hs.map(h => `<i style="--h:${h}%"></i>`).join('')}<input type="range" min="0" max="1000" value="0" aria-label="Seek"></div>`;
      const time = `<span class="pc-time"><span class="cur">0:00</span> / <span class="dur">${fmt(r.duration)}</span></span>`;
      this.el.innerHTML = this.compact
        ? `<div class="pc pc--ready pc--compact ${this.lab}"><button class="pc-play" aria-label="Play podcast">${ICON.play}</button>${wave}${time}<button class="pc-rate" title="Playback speed">1×</button></div>`
        : `<div class="pc pc--ready ${this.lab}">
             <button class="pc-play" aria-label="Play podcast">${ICON.play}</button>
             <div class="pc-main">
               <div class="pc-top"><span class="pc-title">Research podcast<small>${r.file.split('.').pop()}</small></span>${time}</div>
               ${wave}
               <div class="pc-row"><button data-skip="-15">−15 s</button><button data-skip="15">+15 s</button><button class="pc-rate" title="Playback speed">1×</button><span class="sp"></span><a href="${r.src}" download title="Download">⤓ Download</a></div>
             </div>
           </div>`;
      this.root = this.el.firstElementChild;
      this.btn = this.root.querySelector('.pc-play');
      this.bars = [...this.root.querySelectorAll('.pc-wave i')];
      this.seek = this.root.querySelector('.pc-wave input');
      this.cur = this.root.querySelector('.cur'); this.dur = this.root.querySelector('.dur');
      this.rateI = 0;
      this.btn.onclick = e => { e.stopPropagation(); this.toggle(); };
      this.root.addEventListener('click', e => e.stopPropagation());
      this.seek.oninput = () => { if (isFinite(this.audio.duration)) this.audio.currentTime = this.seek.value / 1000 * this.audio.duration; this.paint(); };
      this.root.querySelectorAll('[data-skip]').forEach(b => b.onclick = () => { this.audio.currentTime = Math.max(0, this.audio.currentTime + +b.dataset.skip); });
      const rb = this.root.querySelector('.pc-rate');
      rb.onclick = () => { this.rateI = (this.rateI + 1) % RATES.length; this.audio.playbackRate = RATES[this.rateI]; rb.textContent = RATES[this.rateI] + '×'; };
      this.audio.addEventListener('timeupdate', () => this.paint());
      this.audio.addEventListener('loadedmetadata', () => { this.dur.textContent = fmt(this.audio.duration); });
      this.audio.addEventListener('play', () => { this.root.classList.add('playing'); this.btn.innerHTML = ICON.pause; players.forEach(p => p !== this && p.pause()); });
      this.audio.addEventListener('pause', () => { this.root.classList.remove('playing'); this.btn.innerHTML = ICON.play; });
      this.audio.addEventListener('ended', () => { this.audio.currentTime = 0; this.paint(); });
      players.add(this);
    }
    paint() {
      const d = this.audio.duration, t = this.audio.currentTime, f = isFinite(d) && d > 0 ? t / d : 0;
      const k = Math.round(f * this.bars.length);
      this.bars.forEach((b, i) => b.classList.toggle('on', i < k));
      this.seek.value = Math.round(f * 1000);
      this.cur.textContent = fmt(t);
    }
    toggle() { if (!this.audio) return; this.audio.paused ? this.audio.play().catch(() => {}) : this.audio.pause(); }
    pause() { this.audio && !this.audio.paused && this.audio.pause(); }
    destroy() { this.pause(); players.delete(this); }
  }

  window.Podcast = { find, Player, fmt, ICON, pauseAll: () => players.forEach(p => p.pause()) };
})();
