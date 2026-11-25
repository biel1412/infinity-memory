/* =========================================================
   Infinity Memory — app
   ========================================================= */
(() => {
  'use strict';

  // ---------- utilidades ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  const DAY = 864e5, MIN = 6e4;
  const dayStart = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const endOfToday = () => dayStart() + DAY - 1;
  const plural = (n, s, p) => `${n} ${n === 1 ? s : p || s + 's'}`;

  const ICON = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="m18 15-6-6-6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6" y="4.5" width="4.2" height="15" rx="1"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1"/></svg>',
    speak: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    undo: '<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>',
  };
  const infinity = (w = 44, h = 26, id = 'gi') => `<svg viewBox="0 0 100 50" width="${w}" height="${h}" fill="none">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8B5CF6"/><stop offset=".5" stop-color="#6366F1"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs>
    <path d="M50 25C40 10 18 6 12 20s8 24 20 16 18-20 18-11 6 18 18 16 22-12 18-24S60 10 50 25z" stroke="url(#${id})" stroke-width="7" stroke-linecap="round" opacity=".35"/>
    <path class="inf-path" d="M50 25C40 10 18 6 12 20s8 24 20 16 18-20 18-11 6 18 18 16 22-12 18-24S60 10 50 25z" stroke="url(#${id})" stroke-width="7" stroke-linecap="round"/></svg>`;

  const EMOJIS = ['🧠', '📚', '💻', '🌎', '🗣️', '🧪', '🧬', '➗', '🎵', '🎨', '⚖️', '🩺', '🏛️', '🚀', '🔤', '🇺🇸', '🇪🇸', '🇫🇷', '🇯🇵', '🇩🇪', '🐍', '☕', '⚛️', '🗄️', '📈', '🧾', '🪐', '🧩', '✍️', '🎯', '💡', '🔥'];
  const COLORS = [['#8B5CF6', '#6366F1'], ['#22D3EE', '#3B82F6'], ['#F472B6', '#E11D48'], ['#34D399', '#059669'], ['#FBBF24', '#F97316'], ['#A78BFA', '#EC4899'], ['#60A5FA', '#22D3EE'], ['#FB7185', '#F59E0B']];
  const grad = (i) => { const c = COLORS[i % COLORS.length]; return `linear-gradient(135deg, ${c[0]}, ${c[1]})`; };
  const TTS_LANGS = { 'pt-BR': 'Português', 'en-US': 'Inglês', 'es-ES': 'Espanhol', 'fr-FR': 'Francês', 'de-DE': 'Alemão', 'it-IT': 'Italiano', 'ja-JP': 'Japonês', 'zh-CN': 'Chinês', 'ko-KR': 'Coreano' };

  // ---------- estado ----------
  const state = {
    decks: [], cards: [], logs: [], sections: [],
    settings: { theme: 'dark', newPerDay: 20, autoplay: true, tts: true },
    draft: null, side: 'front',
    session: null,
    filter: { q: '', deck: 'all' },
  };
  const mediaUrls = new Map();

  // ---------- UI helpers ----------
  let toastT;
  function toast(m, ms = 2400) { const el = $('#toast'); el.textContent = m; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), ms); }
  function sheet(html, onMount) {
    const root = $('#sheet-root');
    root.innerHTML = `<div class="sheet-backdrop"></div><div class="sheet"><div class="grab"></div>${html}</div>`;
    const close = () => { root.innerHTML = ''; };
    $('.sheet-backdrop', root).onclick = close;
    onMount && onMount($('.sheet', root), close);
    return close;
  }
  function confirmSheet(title, text, ok = 'Confirmar', danger = true) {
    return new Promise((res) => sheet(`<h3>${esc(title)}</h3><p>${esc(text)}</p><button class="btn btn-block ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${esc(ok)}</button><button class="btn btn-block btn-ghost" data-no>Cancelar</button>`, (el, close) => {
      $('[data-ok]', el).onclick = () => { close(); res(true); }; $('[data-no]', el).onclick = () => { close(); res(false); };
      $('.sheet-backdrop').onclick = () => { close(); res(false); };
    }));
  }
  function confetti() {
    const colors = ['#8B5CF6', '#22D3EE', '#F472B6', '#34D399', '#FBBF24'];
    const el = document.createElement('div'); el.className = 'confetti';
    for (let i = 0; i < 44; i++) {
      const a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 240, s = document.createElement('i');
      s.style.background = colors[i % 5]; s.style.setProperty('--x', Math.cos(a) * r + 'px'); s.style.setProperty('--y', Math.sin(a) * r + 160 + 'px'); s.style.setProperty('--r', Math.random() * 720 + 'deg');
      el.appendChild(s);
    }
    document.body.appendChild(el); setTimeout(() => el.remove(), 1500);
  }
  function applyTheme() {
    const t = state.settings.theme === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : state.settings.theme;
    document.documentElement.dataset.theme = t;
    $('meta[name="theme-color"]').content = t === 'light' ? '#F6F5FF' : '#08080F';
  }
  const deckOf = (id) => state.decks.find((d) => d.id === id);
  const secOf = (id) => state.sections.find((x) => x.id === id);
  const sortedSections = () => [...state.sections].sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt));
  const decksIn = (secId) => state.decks.filter((d) => (secId ? d.sectionId === secId : !d.sectionId || !secOf(d.sectionId)));
  // alvo de estudo/contagem: undefined = tudo, 'sec_…' = seção, 'd_…' = baralho
  const targetDecks = (t) => (!t ? state.decks : String(t).startsWith('sec_') ? decksIn(t) : [deckOf(t)].filter(Boolean));
  const targetHref = (t) => (!t ? '#/' : String(t).startsWith('sec_') ? '#/' : '#/baralho/' + t);
  const saveSections = () => DB.setMeta('sections', state.sections);

  // =========================================================
  // MÍDIA
  // =========================================================
  async function sniffType(blob) {
    try {
      const b = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
      const str = (i, n) => String.fromCharCode(...b.slice(i, i + n));
      if (str(4, 4) === 'ftyp') return 'audio/mp4';
      if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'audio/webm';
      if (str(0, 4) === 'OggS') return 'audio/ogg';
      if (str(0, 4) === 'RIFF') return 'audio/wav';
      if (str(0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return 'audio/mpeg';
      if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
      if (str(1, 3) === 'PNG') return 'image/png';
    } catch {}
    return '';
  }
  async function withType(blob, hint) {
    const t = blob.type && blob.type !== 'application/octet-stream' ? blob.type : (hint || await sniffType(blob));
    return t && t !== blob.type ? new Blob([blob], { type: t }) : blob;
  }
  async function saveMedia(blob) {
    blob = await withType(blob);
    const id = 'm_' + uid();
    await DB.put('media', { id, blob, type: blob.type, size: blob.size, ts: Date.now() });
    mediaUrls.set(id, URL.createObjectURL(blob));
    return id;
  }
  async function mediaUrl(id) {
    if (mediaUrls.has(id)) return mediaUrls.get(id);
    const m = await DB.get('media', id);
    if (!m) return '';
    const blob = await withType(m.blob, m.type);
    const u = URL.createObjectURL(blob); mediaUrls.set(id, u); return u;
  }
  async function cleanupMedia() {
    const used = new Set();
    state.cards.forEach((c) => [...(c.front || []), ...(c.back || [])].forEach((b) => b.mediaId && used.add(b.mediaId)));
    const all = await DB.all('media');
    const orphan = all.filter((m) => !used.has(m.id) && Date.now() - m.ts > 60 * MIN).map((m) => m.id);
    if (orphan.length) await DB.delMany('media', orphan);
  }
  function compressImage(file, max = 1600, q = 0.86) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        cv.toBlob((b) => (b ? resolve(b) : reject(new Error('falha'))), 'image/jpeg', q);
      };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  // =========================================================
  // RENDERIZAÇÃO DE CONTEÚDO
  // =========================================================
  function md(text) {
    let h = esc(text);
    h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>')
      .replace(/==([^=\n]+)==/g, '<mark>$1</mark>')
      .replace(/\n/g, '<br>');
    return h;
  }
  const blockText = (b) => (b.type === 'text' ? b.text : b.type === 'code' ? b.code : b.type === 'image' ? '🖼️ imagem' : b.type === 'audio' ? '🔊 áudio' : '');
  const summary = (blocks) => (blocks || []).map((b) => (b.type === 'text' ? b.text : b.type === 'code' ? b.code.split('\n')[0] : '')).filter(Boolean).join(' · ').replace(/\s+/g, ' ').slice(0, 120) || (blocks || []).map(blockText).join(' ');
  const typeIcons = (c) => { const t = new Set([...(c.front || []), ...(c.back || [])].map((b) => b.type)); return ['image', 'audio', 'code'].filter((x) => t.has(x)).map((x) => ({ image: '🖼️', audio: '🔊', code: '⌨️' }[x])); };

  function renderBlocks(blocks, { lang } = {}) {
    const onlyShort = blocks.length === 1 && blocks[0].type === 'text' && blocks[0].text.length <= 60 && !blocks[0].text.includes('\n');
    return `<div class="content">${blocks.map((b) => {
      if (b.type === 'text') {
        const canSpeak = state.settings.tts && 'speechSynthesis' in window && b.text.trim();
        return `<div class="c-text ${onlyShort ? 'big' : ''}">${md(b.text)}${canSpeak ? `<button class="speak" data-speak="${esc(b.text)}" data-lang="${lang || 'pt-BR'}" aria-label="Ouvir">${ICON.speak}</button>` : ''}</div>`;
      }
      if (b.type === 'image') return `<img class="c-img" data-media="${b.mediaId}" alt="" />`;
      if (b.type === 'audio') return `<div class="c-audio" data-audio="${b.mediaId}"><button class="play" aria-label="Tocar">${ICON.play}</button><div class="track"><i></i></div><span class="time">0:00</span></div>`;
      if (b.type === 'code') {
        const L = Highlight.LANGS[b.lang] || Highlight.LANGS.text;
        const lines = Highlight.highlight(b.code || '', b.lang).split('\n').map((l) => `<span class="ln">${l || ' '}</span>`).join('');
        return `<div class="c-code"><div class="cc-top"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i><span class="sp"></span>${esc(L.name)}<button data-copy-code>Copiar</button></div><pre><code>${lines}</code></pre></div>`;
      }
      return '';
    }).join('')}</div>`;
  }

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  // Um único elemento <audio>, desbloqueado no primeiro toque: assim o iPhone
  // permite tocar depois (inclusive o áudio automático ao virar o card).
  const SILENT = 'data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const player = new Audio();
  player.setAttribute('playsinline', ''); player.preload = 'auto';
  let owner = null, unlocked = false;
  function unlockAudio() {
    if (unlocked) return;
    unlocked = true;
    if (!owner) { player.src = SILENT; player.play().then(() => { if (player.src === SILENT) player.pause(); }).catch(() => { unlocked = false; }); }
    if ('speechSynthesis' in window) { try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch {} }
  }
  document.addEventListener('pointerdown', unlockAudio, { capture: true });
  document.addEventListener('touchend', unlockAudio, { capture: true });
  const ui = (box) => box && { btn: $('.play', box), bar: $('.track i', box), time: $('.time', box) };
  function resetUI(box) { const u = ui(box); if (!u || !u.btn) return; u.btn.innerHTML = ICON.play; u.bar.style.width = '0%'; if (box._dur) u.time.textContent = fmtTime(box._dur); }
  player.addEventListener('timeupdate', () => { const u = ui(owner); if (!u || !player.duration) return; u.bar.style.width = (player.currentTime / player.duration) * 100 + '%'; u.time.textContent = fmtTime(player.currentTime); });
  player.addEventListener('loadedmetadata', () => { if (owner && isFinite(player.duration)) owner._dur = player.duration; });
  player.addEventListener('ended', () => { const b = owner; owner = null; resetUI(b); });
  player.addEventListener('pause', () => { const u = ui(owner); if (u && u.btn) u.btn.innerHTML = ICON.play; });
  player.addEventListener('play', () => { const u = ui(owner); if (u && u.btn) u.btn.innerHTML = ICON.pause; });
  player.addEventListener('error', () => {
    if (!owner || player.src === SILENT) return;
    const b = owner; owner = null; resetUI(b);
    toast('Este áudio não pode ser tocado neste aparelho (formato ' + (b._type || 'desconhecido') + '). Grave de novo por aqui.', 4500);
  });
  function playBox(box) {
    if (!box || !box._url) return;
    if (owner === box && !player.paused) { player.pause(); return; }
    const prev = owner; owner = box; if (prev && prev !== box) resetUI(prev);
    if (player.src !== box._url) player.src = box._url;
    if (owner === box && player.ended) player.currentTime = 0;
    const p = player.play();
    if (p) p.catch((e) => {
      if (e.name === 'NotAllowedError') toast('Toque no ▶ para ouvir o áudio');
      else if (e.name !== 'AbortError') toast('Não foi possível tocar este áudio');
      const u = ui(box); if (u && u.btn) u.btn.innerHTML = ICON.play;
    });
  }
  function stopAudio() { if (owner) { const b = owner; owner = null; player.pause(); resetUI(b); } }
  async function hydrate(root) {
    for (const img of $$('img[data-media]', root)) {
      img.src = await mediaUrl(img.dataset.media);
      img.onclick = (e) => { e.stopPropagation(); const z = document.createElement('div'); z.className = 'zoom'; z.innerHTML = `<img src="${img.src}" alt="">`; z.onclick = () => z.remove(); document.body.appendChild(z); };
    }
    for (const box of $$('[data-audio]', root)) {
      box._url = await mediaUrl(box.dataset.audio);
      const rec = await DB.get('media', box.dataset.audio);
      box._type = rec ? (rec.type || rec.blob.type) : '';
      if (!box._url) { $('.time', box).textContent = 'ausente'; continue; }
      // duração sem tocar (onde o navegador permitir)
      const probe = new Audio(); probe.preload = 'metadata';
      probe.onloadedmetadata = () => { if (isFinite(probe.duration)) { box._dur = probe.duration; if (owner !== box) $('.time', box).textContent = fmtTime(probe.duration); } probe.src = ''; };
      probe.src = box._url;
      const btn = $('.play', box);
      btn.onclick = (e) => { e.stopPropagation(); playBox(box); };
      $('.track', box).onclick = (e) => {
        e.stopPropagation();
        if (owner !== box) { playBox(box); return; }
        const r = e.currentTarget.getBoundingClientRect(); if (player.duration) player.currentTime = ((e.clientX - r.left) / r.width) * player.duration;
      };
      box._play = () => playBox(box);
    }
    $$('[data-copy-code]', root).forEach((b) => b.onclick = async (e) => {
      e.stopPropagation();
      const code = $$('.ln', b.closest('.c-code')).map((l) => l.textContent).join('\n');
      try { await navigator.clipboard.writeText(code); b.textContent = 'Copiado ✓'; setTimeout(() => { b.textContent = 'Copiar'; }, 1500); } catch { toast('Não foi possível copiar'); }
    });
    $$('[data-speak]', root).forEach((b) => b.onclick = (e) => { e.stopPropagation(); speak(b.dataset.speak, b.dataset.lang); });
  }
  function speak(text, lang) {
    if (!('speechSynthesis' in window)) { toast('Leitura em voz alta não disponível neste navegador'); return; }
    stopAudio();
    speechSynthesis.cancel(); speechSynthesis.resume();
    const u = new SpeechSynthesisUtterance(text.replace(/[*=`]/g, ''));
    u.lang = lang || 'pt-BR'; u.rate = 0.95; u.volume = 1;
    const voices = speechSynthesis.getVoices();
    const v = voices.find((x) => x.lang.replace('_', '-') === u.lang) || voices.find((x) => x.lang.replace('_', '-').startsWith(u.lang.slice(0, 2)));
    if (v) u.voice = v;
    else if (voices.length) toast('Sem voz instalada para este idioma; usando a voz padrão do aparelho', 3000);
    u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') toast('Não foi possível ler em voz alta (' + e.error + ')'); };
    setTimeout(() => speechSynthesis.speak(u), 60);
  }

  // =========================================================
  // FILAS E CONTAGENS
  // =========================================================
  function introducedToday(deckId) {
    const s = dayStart();
    return state.logs.filter((l) => l.ts >= s && l.prevState === 'new' && (!deckId || l.deckId === deckId)).length;
  }
  function deckLimit(d) { return d.newPerDay ?? state.settings.newPerDay; }
  function dueCounts(target) {
    const now = Date.now(), eod = endOfToday(), ahead = now + SRS.cfg.learnAheadMin * MIN;
    const decks = targetDecks(target);
    let n = 0, l = 0, r = 0;
    decks.forEach((d) => {
      const cs = state.cards.filter((c) => c.deckId === d.id && !c.suspended);
      const newAvail = cs.filter((c) => c.state === 'new').length;
      n += Math.max(0, Math.min(newAvail, deckLimit(d) - introducedToday(d.id)));
      l += cs.filter((c) => (c.state === 'learning' || c.state === 'relearning') && c.due <= Math.max(ahead, eod)).length;
      r += cs.filter((c) => c.state === 'review' && c.due <= eod).length;
    });
    return { n, l, r, total: n + l + r };
  }

  function buildSession(deckId) {
    const now = Date.now(), eod = endOfToday();
    const decks = targetDecks(deckId);
    const ids = new Set(decks.map((d) => d.id));
    const cs = state.cards.filter((c) => ids.has(c.deckId) && !c.suspended);
    const learn = cs.filter((c) => (c.state === 'learning' || c.state === 'relearning') && c.due <= eod).sort((a, b) => a.due - b.due).map((c) => c.id);
    const review = cs.filter((c) => c.state === 'review' && c.due <= eod).sort(() => Math.random() - 0.5).map((c) => c.id);
    const fresh = [];
    decks.forEach((d) => {
      const left = Math.max(0, deckLimit(d) - introducedToday(d.id));
      cs.filter((c) => c.deckId === d.id && c.state === 'new').sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt)).slice(0, left).forEach((c) => fresh.push(c.id));
    });
    return { deckId, learn, review, fresh, current: null, kind: null, revealed: false, started: now, shownAt: now, done: 0, correct: 0, total: learn.length + review.length + fresh.length, history: [] };
  }
  const cardById = (id) => state.cards.find((c) => c.id === id);
  function pickNext(S) {
    const now = Date.now(), ahead = now + SRS.cfg.learnAheadMin * MIN;
    S.learn.sort((a, b) => cardById(a).due - cardById(b).due);
    if (S.learn.length && cardById(S.learn[0]).due <= now) return { id: S.learn[0], kind: 'l' };
    if (S.review.length || S.fresh.length) {
      const useNew = S.fresh.length && (!S.review.length || Math.random() < S.fresh.length / (S.fresh.length + S.review.length));
      return useNew ? { id: S.fresh[0], kind: 'n' } : { id: S.review[0], kind: 'r' };
    }
    if (S.learn.length && cardById(S.learn[0]).due <= ahead) return { id: S.learn[0], kind: 'l' };
    return null;
  }

  // =========================================================
  // TELAS
  // =========================================================

  // ---------- início ----------
  function heatmap(weeks = 16) {
    const counts = {};
    state.logs.forEach((l) => { const k = dayKey(l.ts); counts[k] = (counts[k] || 0) + 1; });
    const today = dayStart();
    const startDow = new Date(today).getDay();
    const totalDays = weeks * 7 - (6 - startDow);
    let cells = '';
    for (let i = totalDays - 1; i >= 0; i--) {
      const t = today - i * DAY; const n = counts[dayKey(t)] || 0;
      const lv = n === 0 ? '' : n < 10 ? 'l1' : n < 30 ? 'l2' : n < 60 ? 'l3' : 'l4';
      cells += `<i class="${lv} ${i === 0 ? 'today' : ''}" title="${new Date(t).toLocaleDateString('pt-BR')}: ${n}"></i>`;
    }
    return `<div class="heat" style="grid-template-columns:repeat(${weeks},1fr)">${cells}</div>`;
  }
  function streak() {
    const days = new Set(state.logs.map((l) => dayKey(l.ts)));
    let s = 0, t = dayStart();
    if (!days.has(dayKey(t))) t -= DAY;
    while (days.has(dayKey(t))) { s++; t -= DAY; }
    return s;
  }

  function viewHome() {
    const c = dueCounts();
    const st = streak();
    const studiedToday = state.logs.filter((l) => l.ts >= dayStart()).length;
    const goal = studiedToday + c.total;
    const pct = goal ? studiedToday / goal : 1;
    const R = 50, C = 2 * Math.PI * R;
    const h = new Date().getHours();
    const hi = h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    return `
      <header class="topbar">
        <div class="brand">${infinity()}<b>Infinity <span>Memory</span></b></div>
        <button class="icon-btn" id="theme" aria-label="Tema">${document.documentElement.dataset.theme === 'light' ? ICON.moon : ICON.sun}</button>
      </header>
      ${!state.decks.length ? `
        <div class="empty" style="padding-top:6vh">
          <div style="width:160px;margin:0 auto">${infinity(160, 80, 'gh')}</div>
          <h3 class="display" style="font-size:26px">Memória infinita começa aqui</h3>
          <p>Crie baralhos com texto, imagens, áudios e código. O app mostra cada card na hora certa para você não esquecer.</p>
          <button class="btn btn-primary btn-block" id="new-deck">${ICON.plus} Criar meu primeiro baralho</button>
          <button class="btn btn-ghost btn-block" id="demo">✨ Explorar com baralhos de exemplo</button>
        </div>` : `
      <section class="hero">
        <div class="hero-row">
          <div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${R}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="11"/>
            <circle cx="60" cy="60" r="${R}" fill="none" stroke="url(#rg)" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" style="transition:stroke-dashoffset 1s"/>
            <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22D3EE"/><stop offset="1" stop-color="#F472B6"/></linearGradient></defs></svg>
            <div class="center"><b>${c.total}</b><small>${c.total === 1 ? 'card hoje' : 'cards hoje'}</small></div></div>
          <div style="min-width:0">
            <h2>${c.total ? `${hi}! Bora revisar?` : 'Tudo em dia ✨'}</h2>
            <p>${c.total ? `Cerca de ${Math.max(1, Math.round(c.total * 0.15))} min de estudo.` : studiedToday ? `Você revisou ${plural(studiedToday, 'card')} hoje. Volte amanhã!` : 'Nenhum card para hoje. Que tal criar novos?'}</p>
          </div>
        </div>
        <div class="hero-stats">
          <span class="chip-s"><i style="background:#60A5FA"></i>${c.n} novos</span>
          <span class="chip-s"><i style="background:#FB7185"></i>${c.l} aprendendo</span>
          <span class="chip-s"><i style="background:#34D399"></i>${c.r} revisão</span>
          ${st ? `<span class="chip-s">🔥 ${plural(st, 'dia')}</span>` : ''}
        </div>
        ${c.total ? `<a class="btn btn-white btn-block" href="#/estudar">Estudar agora</a>` : ''}
      </section>

      <div class="section-head"><h2>Seções</h2><div class="sh-btns"><button id="new-sec">+ Seção</button><button id="new-deck">+ Baralho</button></div></div>
      ${!state.sections.length ? `<button class="sec-tip" id="new-sec2"><span>🗂️</span><div><b>Organize em seções</b>Agrupe baralhos por assunto: Idiomas, Faculdade, Trabalho…</div><span class="chev">›</span></button>` : ''}
      <div class="secs">${sortedSections().map((x) => sectionBlock(x)).join('')}
        ${decksIn(null).length ? sectionBlock(null) : ''}</div>

      <div class="section-head"><h2>Constância</h2><a href="#/stats">Ver progresso</a></div>
      <div class="panel">${heatmap()}
        <div class="heat-foot"><span class="streak">🔥 ${plural(st, 'dia')} seguidos</span><span>${studiedToday} hoje</span></div></div>`}`;
  }
  function deckRow(d) {
    const dc = dueCounts(d.id);
    const cs = state.cards.filter((x) => x.deckId === d.id);
    const mature = cs.filter((x) => x.state === 'review' && x.interval >= 21).length;
    return `<a class="deck" href="#/baralho/${d.id}">
      <div class="deck-ico" style="background:${grad(d.color)}">${d.emoji}</div>
      <div class="meta"><b>${esc(d.name)}</b><small>${plural(cs.length, 'card')}${mature ? ` · ${mature} dominados` : ''}</small>
        <div class="bar"><i style="width:${cs.length ? Math.round((cs.filter((x) => x.state === 'review').length / cs.length) * 100) : 0}%"></i></div></div>
      <div class="counts"><span class="cnt n ${dc.n ? '' : 'zero'}">${dc.n}</span><span class="cnt l ${dc.l ? '' : 'zero'}">${dc.l}</span><span class="cnt r ${dc.r ? '' : 'zero'}">${dc.r}</span></div>
    </a>`;
  }
  function sectionBlock(x) {
    const decks = decksIn(x ? x.id : null).sort((a, b) => a.createdAt - b.createdAt);
    const dc = x ? dueCounts(x.id) : decks.reduce((a, d) => { const c = dueCounts(d.id); a.total += c.total; return a; }, { total: 0 });
    const cards = state.cards.filter((c) => decks.some((d) => d.id === c.deckId)).length;
    const collapsed = x && x.collapsed;
    return `<section class="sec ${collapsed ? 'collapsed' : ''} ${x ? '' : 'loose'}">
      <div class="sec-head" ${x ? `data-toggle="${x.id}"` : ''}>
        <span class="sec-ico" style="background:${x ? grad(x.color) : 'var(--surface-2)'}">${x ? x.emoji : '📂'}</span>
        <div class="meta"><b>${x ? esc(x.name) : 'Sem seção'}</b><small>${plural(decks.length, 'baralho')} · ${plural(cards, 'card')}${dc.total ? ` · <span class="due">${dc.total} para hoje</span>` : ''}</small></div>
        ${x && dc.total ? `<a class="sec-play" href="#/estudar/${x.id}" aria-label="Estudar seção">${ICON.play}</a>` : ''}
        ${x ? `<button class="sec-more" data-secmenu="${x.id}" aria-label="Opções">${ICON.dots}</button><span class="caret">${ICON.down}</span>` : ''}
      </div>
      <div class="sec-body"><div class="decks">${decks.map(deckRow).join('') || '<div class="sec-empty">Nenhum baralho nesta seção ainda.</div>'}</div>
        ${x ? `<button class="sec-add" data-newdeck="${x.id}">${ICON.plus} Novo baralho em ${esc(x.name)}</button>` : ''}</div>
    </section>`;
  }
  function sectionForm(sec) {
    const x = sec ? { ...sec } : { name: '', emoji: '🗂️', color: Math.floor(Math.random() * COLORS.length) };
    const SEC_EMOJIS = ['🗂️', '📚', '🎓', '💼', '🌍', '🗣️', '💻', '🧪', '🩺', '⚖️', '🎵', '🎨', '🧠', '🏛️', '📈', '✈️', '🏋️', '🍳', '🙏', '⭐', '🔥', '🚀', '📝', '🎯'];
    sheet(`<h3>${sec ? 'Editar seção' : 'Nova seção'}</h3><p>Seções agrupam baralhos do mesmo assunto, e você pode estudar a seção inteira de uma vez.</p>
      <div class="field"><label>Nome</label><input class="input" id="x-name" maxlength="40" placeholder="Ex.: Idiomas, Faculdade, Trabalho" value="${esc(x.name)}"/></div>
      <div class="field"><label>Ícone</label><div class="emoji-grid">${SEC_EMOJIS.map((e) => `<button data-e="${e}" class="${e === x.emoji ? 'active' : ''}">${e}</button>`).join('')}</div></div>
      <div class="field"><label>Cor</label><div class="color-grid">${COLORS.map((c, i) => `<button data-c="${i}" class="${i === x.color ? 'active' : ''}" style="background:${grad(i)}"></button>`).join('')}</div></div>
      ${!sec && decksIn(null).length ? `<div class="field"><label>Mover baralhos para esta seção</label><div class="pick-decks">${decksIn(null).map((d) => `<label class="pd"><input type="checkbox" value="${d.id}"><span>${d.emoji} ${esc(d.name)}</span></label>`).join('')}</div></div>` : ''}
      <button class="btn btn-primary btn-block" id="x-save">${sec ? 'Salvar' : 'Criar seção'}</button>`, (el, close) => {
      $$('[data-e]', el).forEach((b) => b.onclick = () => { x.emoji = b.dataset.e; $$('[data-e]', el).forEach((y) => y.classList.toggle('active', y === b)); });
      $$('[data-c]', el).forEach((b) => b.onclick = () => { x.color = +b.dataset.c; $$('[data-c]', el).forEach((y) => y.classList.toggle('active', y === b)); });
      $('#x-save', el).onclick = async () => {
        x.name = $('#x-name', el).value.trim();
        if (!x.name) return toast('Dê um nome à seção');
        if (sec) Object.assign(secOf(sec.id), x);
        else { x.id = 'sec_' + uid(); x.createdAt = Date.now(); x.order = Date.now(); x.collapsed = false; state.sections.push(x); }
        const moved = $$('.pick-decks input:checked', el).map((i) => deckOf(i.value));
        moved.forEach((d) => { d.sectionId = x.id; });
        if (moved.length) await DB.putMany('decks', moved);
        await saveSections();
        close(); toast(sec ? 'Seção salva ✓' : 'Seção criada ✓'); render(true);
      };
      if (!sec) setTimeout(() => $('#x-name', el).focus(), 300);
    });
  }
  function sectionMenu(id) {
    const x = secOf(id); if (!x) return;
    const list = sortedSections(); const i = list.findIndex((y) => y.id === id);
    sheet(`<h3>${x.emoji} ${esc(x.name)}</h3><div class="menu" style="margin-top:10px">
      ${dueCounts(id).total ? `<a href="#/estudar/${id}" data-a="go"><span class="mi">▶️</span><span class="mt">Estudar seção inteira<small>${dueCounts(id).total} cards de ${plural(decksIn(id).length, 'baralho')}</small></span></a>` : ''}
      <button data-a="deck"><span class="mi">➕</span><span class="mt">Novo baralho nesta seção</span></button>
      <button data-a="edit"><span class="mi">✏️</span><span class="mt">Editar seção<small>Nome, ícone e cor</small></span></button>
      ${i > 0 ? `<button data-a="up"><span class="mi">⬆️</span><span class="mt">Mover para cima</span></button>` : ''}
      ${i < list.length - 1 ? `<button data-a="down"><span class="mi">⬇️</span><span class="mt">Mover para baixo</span></button>` : ''}
      <button data-a="del" style="color:var(--red)"><span class="mi">🗑️</span><span class="mt">Excluir seção<small>Os baralhos não são apagados: vão para “Sem seção”</small></span></button></div>`, (el, close) => {
      $$('[data-a]', el).forEach((b) => b.onclick = async () => {
        close();
        const a = b.dataset.a;
        if (a === 'deck') deckForm(null, id);
        if (a === 'edit') sectionForm(x);
        if (a === 'up' || a === 'down') {
          const j = a === 'up' ? i - 1 : i + 1;
          list.forEach((y, k) => { y.order = k; });
          [list[i].order, list[j].order] = [list[j].order, list[i].order];
          await saveSections(); render(true);
        }
        if (a === 'del' && await confirmSheet('Excluir seção?', `A seção “${x.name}” será removida. Os ${plural(decksIn(id).length, 'baralho')} dela continuam, em “Sem seção”.`, 'Excluir seção')) {
          const ds = decksIn(id); ds.forEach((d) => { delete d.sectionId; });
          if (ds.length) await DB.putMany('decks', ds);
          state.sections = state.sections.filter((y) => y.id !== id); await saveSections();
          toast('Seção excluída'); render(true);
        }
      });
    });
  }

  function bindHome() {
    $$('#new-sec, #new-sec2').forEach((b) => b.onclick = () => sectionForm());
    $$('[data-newdeck]').forEach((b) => b.onclick = () => deckForm(null, b.dataset.newdeck));
    $$('[data-secmenu]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); sectionMenu(b.dataset.secmenu); });
    $$('.sec-play').forEach((a) => a.addEventListener('click', (e) => e.stopPropagation()));
    $$('[data-toggle]').forEach((h) => h.onclick = async () => {
      const x = secOf(h.dataset.toggle); if (!x) return;
      x.collapsed = !x.collapsed; h.closest('.sec').classList.toggle('collapsed', x.collapsed); await saveSections();
    });
    $('#theme').onclick = () => { state.settings.theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; saveSettings(); applyTheme(); render(); };
    $$('#new-deck').forEach((b) => b.onclick = () => deckForm());
    const demo = $('#demo'); if (demo) demo.onclick = loadDemo;
  }

  // ---------- baralho ----------
  function deckForm(deck, presetSection) {
    const d = deck ? { ...deck } : { name: '', emoji: EMOJIS[Math.floor(Math.random() * 8)], color: Math.floor(Math.random() * COLORS.length), ttsLang: 'pt-BR', newPerDay: null, sectionId: presetSection || null };
    sheet(`<h3>${deck ? 'Editar baralho' : 'Novo baralho'}</h3>
      <div class="field" style="margin-top:12px"><label>Nome</label><input class="input" id="d-name" maxlength="60" placeholder="Ex.: Inglês — Verbos" value="${esc(d.name)}"/></div>
      <div class="field"><label>Seção</label><select class="input" id="d-sec"><option value="">📂 Sem seção</option>${sortedSections().map((x) => `<option value="${x.id}" ${x.id === d.sectionId ? 'selected' : ''}>${x.emoji} ${esc(x.name)}</option>`).join('')}<option value="__new">➕ Nova seção…</option></select></div>
      <div class="field"><label>Ícone</label><div class="emoji-grid">${EMOJIS.map((e) => `<button data-e="${e}" class="${e === d.emoji ? 'active' : ''}">${e}</button>`).join('')}</div></div>
      <div class="field"><label>Cor</label><div class="color-grid">${COLORS.map((c, i) => `<button data-c="${i}" class="${i === d.color ? 'active' : ''}" style="background:${grad(i)}"></button>`).join('')}</div></div>
      <div class="field"><label>Idioma da leitura em voz alta</label><select class="input" id="d-lang">${Object.entries(TTS_LANGS).map(([k, v]) => `<option value="${k}" ${k === d.ttsLang ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
      <div class="field"><label>Cards novos por dia</label><select class="input" id="d-new"><option value="">Padrão (${state.settings.newPerDay})</option>${[5, 10, 15, 20, 30, 50, 100, 9999].map((n) => `<option value="${n}" ${d.newPerDay === n ? 'selected' : ''}>${n === 9999 ? 'Sem limite' : n}</option>`).join('')}</select></div>
      <button class="btn btn-primary btn-block" id="d-save">${deck ? 'Salvar' : 'Criar baralho'}</button>`, (el, close) => {
      $$('[data-e]', el).forEach((b) => b.onclick = () => { d.emoji = b.dataset.e; $$('[data-e]', el).forEach((x) => x.classList.toggle('active', x === b)); });
      $$('[data-c]', el).forEach((b) => b.onclick = () => { d.color = +b.dataset.c; $$('[data-c]', el).forEach((x) => x.classList.toggle('active', x === b)); });
      $('#d-sec', el).onchange = (e) => {
        const ex = $('#d-newsec', el);
        if (e.target.value === '__new' && !ex) { e.target.closest('.field').insertAdjacentHTML('beforeend', '<input class="input" id="d-newsec" maxlength="40" placeholder="Nome da nova seção" style="margin-top:8px"/>'); $('#d-newsec', el).focus(); }
        else if (e.target.value !== '__new' && ex) ex.remove();
      };
      $('#d-save', el).onclick = async () => {
        d.name = $('#d-name', el).value.trim();
        if (!d.name) return toast('Dê um nome ao baralho');
        d.ttsLang = $('#d-lang', el).value; d.newPerDay = $('#d-new', el).value ? +$('#d-new', el).value : null;
        let sv = $('#d-sec', el).value;
        if (sv === '__new') {
          const nm = ($('#d-newsec', el) && $('#d-newsec', el).value.trim()) || '';
          if (!nm) return toast('Dê um nome à nova seção');
          const x = { id: 'sec_' + uid(), name: nm, emoji: '🗂️', color: d.color, createdAt: Date.now(), order: Date.now(), collapsed: false };
          state.sections.push(x); await saveSections(); sv = x.id;
        }
        d.sectionId = sv || null;
        if (!deck) { d.id = 'd_' + uid(); d.createdAt = Date.now(); state.decks.push(d); }
        else Object.assign(deckOf(deck.id), d);
        await DB.put('decks', deck ? deckOf(deck.id) : d);
        close(); toast(deck ? 'Baralho salvo ✓' : 'Baralho criado ✓');
        if (!deck) location.hash = '#/baralho/' + d.id; else render(true);
      };
      if (!deck) setTimeout(() => $('#d-name', el).focus(), 300);
    });
  }

  function viewDeck(id) {
    const d = deckOf(id); if (!d) return notFound();
    const cs = state.cards.filter((c) => c.deckId === id);
    const dc = dueCounts(id);
    const q = state.filter.q.toLowerCase();
    const list = cs.filter((c) => !q || (summary(c.front) + ' ' + summary(c.back)).toLowerCase().includes(q)).sort((a, b) => b.createdAt - a.createdAt);
    return `
      <div class="topbar"><a class="back" href="#/">${ICON.back} Início</a>
        <button class="icon-btn" id="deck-menu" aria-label="Opções">${ICON.dots}</button></div>
      <section class="deck-hero" style="background:${grad(d.color)}">
        <div class="dh-top"><div class="deck-ico">${d.emoji}</div><div style="min-width:0"><h1>${esc(d.name)}</h1><p>${secOf(d.sectionId) ? `${secOf(d.sectionId).emoji} ${esc(secOf(d.sectionId).name)} · ` : ''}${plural(cs.length, 'card')} · 🔊 ${TTS_LANGS[d.ttsLang] || 'Português'}</p></div></div>
        <div class="dh-stats"><div><b>${dc.n}</b><small>Novos</small></div><div><b>${dc.l}</b><small>Aprendendo</small></div><div><b>${dc.r}</b><small>Revisão</small></div></div>
        <div class="row-btns" style="margin-top:14px">
          <a class="btn btn-white" href="#/estudar/${d.id}" ${dc.total ? '' : 'style="opacity:.55;pointer-events:none"'}>${dc.total ? 'Estudar' : 'Em dia ✓'}</a>
          <a class="btn btn-ghost" style="background:rgba(255,255,255,.18);color:#fff;border:0" href="#/novo/${d.id}">${ICON.plus} Card</a>
        </div>
      </section>
      ${cs.length ? `<label class="search">${ICON.search}<input id="q" type="search" placeholder="Buscar neste baralho…" value="${esc(state.filter.q)}"/></label>
      <div class="clist" id="clist">${cardRows(list)}</div>` : `
      <div class="empty"><div class="big">🃏</div><h3>Baralho vazio</h3><p>Adicione cards com texto, imagem, áudio ou código — ou importe uma lista.</p>
        <a class="btn btn-primary btn-block" href="#/novo/${d.id}">${ICON.plus} Criar primeiro card</a>
        <button class="btn btn-ghost btn-block" id="imp-txt">📋 Importar lista de texto</button></div>`}`;
  }
  function cardRows(list, showDeck) {
    if (!list.length) return '<div class="empty" style="padding:16px">Nenhum card encontrado.</div>';
    return list.slice(0, 300).map((c) => {
      const d = deckOf(c.deckId);
      const due = c.state === 'new' ? 'novo' : c.due <= Date.now() ? 'para hoje' : 'em ' + SRS.fmt(c.due - Date.now());
      return `<a class="citem" href="#/editar/${c.id}"><span class="st-dot st-${c.state}"></span>
        <div class="ci-main"><div class="ci-q">${esc(summary(c.front)) || '—'}</div><div class="ci-a">${showDeck && d ? d.emoji + ' ' : ''}${esc(summary(c.back)) || '—'} · ${due}</div></div>
        <div class="types">${typeIcons(c).map((t) => `<span>${t}</span>`).join('')}</div></a>`;
    }).join('');
  }
  function bindDeck(id) {
    const d = deckOf(id); if (!d) return;
    const q = $('#q');
    if (q) q.oninput = () => { state.filter.q = q.value; const cs = state.cards.filter((c) => c.deckId === id); const s = q.value.toLowerCase(); $('#clist').innerHTML = cardRows(cs.filter((c) => !s || (summary(c.front) + ' ' + summary(c.back)).toLowerCase().includes(s)).sort((a, b) => b.createdAt - a.createdAt)); };
    const it = $('#imp-txt'); if (it) it.onclick = () => importTextSheet(id);
    $('#deck-menu').onclick = () => sheet(`<h3>${d.emoji} ${esc(d.name)}</h3><div class="menu" style="margin-top:10px">
        <button data-a="edit"><span class="mi">✏️</span><span class="mt">Editar baralho<small>Nome, seção, ícone, cor, idioma, limite diário</small></span></button>
        <button data-a="import"><span class="mi">📋</span><span class="mt">Importar lista<small>Cole “frente ; verso” por linha</small></span></button>
        <button data-a="reset"><span class="mi">↺</span><span class="mt">Recomeçar progresso<small>Todos os cards voltam a ser novos</small></span></button>
        <button data-a="del" style="color:var(--red)"><span class="mi">🗑️</span><span class="mt">Excluir baralho</span></button></div>`, (el, close) => {
      $$('[data-a]', el).forEach((b) => b.onclick = async () => {
        close();
        const a = b.dataset.a;
        if (a === 'edit') deckForm(d);
        if (a === 'import') importTextSheet(id);
        if (a === 'reset' && await confirmSheet('Recomeçar progresso?', 'O histórico de revisões continua, mas todos os cards deste baralho voltam a ser novos.', 'Recomeçar')) {
          const cs = state.cards.filter((c) => c.deckId === id).map((c) => Object.assign(c, { state: 'new', due: 0, interval: 0, ease: SRS.cfg.startingEase, step: 0, reps: 0, lapses: 0 }));
          await DB.putMany('cards', cs); toast('Progresso reiniciado'); render(true);
        }
        if (a === 'del' && await confirmSheet('Excluir baralho?', `“${d.name}” e seus ${state.cards.filter((c) => c.deckId === id).length} cards serão apagados. Isso não pode ser desfeito.`, 'Excluir')) {
          const ids = state.cards.filter((c) => c.deckId === id).map((c) => c.id);
          await DB.delMany('cards', ids); await DB.del('decks', id);
          state.cards = state.cards.filter((c) => c.deckId !== id); state.decks = state.decks.filter((x) => x.id !== id);
          cleanupMedia(); toast('Baralho excluído'); location.hash = '#/';
        }
      });
    });
  }

  function importTextSheet(deckId) {
    sheet(`<h3>Importar lista</h3><p>Uma linha por card: <b>frente ; verso</b>. Também aceita tabulação (copiado do Excel/Planilhas) ou “frente - verso”.</p>
      <textarea class="input" id="imp" rows="8" style="min-height:180px;font-family:var(--mono);font-size:14px" placeholder="dog ; cachorro&#10;cat ; gato&#10;house ; casa"></textarea>
      <div class="toggle"><span class="tt">Criar também o card invertido<small>verso → frente</small></span><label class="switch"><input type="checkbox" id="imp-rev"><span></span></label></div>
      <button class="btn btn-primary btn-block" id="imp-go" style="margin-top:14px">Importar</button>`, (el, close) => {
      $('#imp-go', el).onclick = async () => {
        const rows = parseList($('#imp', el).value);
        if (!rows.length) return toast('Nenhuma linha válida');
        const n = await createTextCards(deckId, rows, $('#imp-rev', el).checked);
        close(); toast(`${plural(n, 'card importado', 'cards importados')} ✓`); render(true);
      };
    });
  }
  function parseList(text) {
    return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
      let p = l.split('\t'); if (p.length < 2) p = l.split(';'); if (p.length < 2) p = l.split(' - ');
      if (p.length < 2) return null;
      return [p[0].trim(), p.slice(1).join(' ; ').trim()];
    }).filter((x) => x && x[0] && x[1]);
  }
  async function createTextCards(deckId, rows, reverse) {
    const now = Date.now(); const out = [];
    rows.forEach(([f, b], i) => {
      out.push(newCard(deckId, [{ type: 'text', text: f }], [{ type: 'text', text: b }], now + i));
      if (reverse) out.push(newCard(deckId, [{ type: 'text', text: b }], [{ type: 'text', text: f }], now + i + 0.5));
    });
    await DB.putMany('cards', out); state.cards.push(...out);
    return out.length;
  }
  function newCard(deckId, front, back, t = Date.now()) {
    return { id: 'c_' + uid(), deckId, front, back, createdAt: t, updatedAt: t, order: t, state: 'new', due: 0, interval: 0, ease: SRS.cfg.startingEase, step: 0, reps: 0, lapses: 0 };
  }

  // ---------- editor ----------
  function viewEditor(mode, id) {
    if (!state.draft || state.draft._key !== mode + id) {
      if (mode === 'edit') {
        const c = cardById(id); if (!c) return notFound();
        state.draft = { _key: mode + id, id: c.id, deckId: c.deckId, front: JSON.parse(JSON.stringify(c.front)), back: JSON.parse(JSON.stringify(c.back)), reverse: false };
      } else {
        const deckId = deckOf(id) ? id : (state.decks[0] && state.decks[0].id);
        if (!deckId) { location.hash = '#/'; return ''; }
        state.draft = { _key: mode + id, deckId, front: [{ type: 'text', text: '' }], back: [{ type: 'text', text: '' }], reverse: false };
      }
      state.side = 'front';
    }
    const D = state.draft, editing = mode === 'edit';
    const blocks = D[state.side];
    return `
      <div class="ed-head"><a class="icon-btn" href="${editing ? '#/baralho/' + D.deckId : '#/baralho/' + D.deckId}" data-leave aria-label="Voltar">${ICON.back}</a>
        <h1>${editing ? 'Editar card' : 'Novo card'}</h1>
        ${editing ? `<button class="icon-btn" id="del-card" style="color:var(--red)" aria-label="Excluir">${ICON.trash}</button>` : ''}</div>
      <div class="field"><label>Baralho</label><select class="input" id="e-deck">${[...sortedSections(), null].map((x) => { const ds = decksIn(x ? x.id : null); if (!ds.length) return ''; const opts = ds.map((d) => `<option value="${d.id}" ${d.id === D.deckId ? 'selected' : ''}>${d.emoji} ${esc(d.name)}</option>`).join(''); return state.sections.length ? `<optgroup label="${x ? esc(x.emoji + ' ' + x.name) : 'Sem seção'}">${opts}</optgroup>` : opts; }).join('')}</select></div>
      <div class="side-tabs">
        <button data-side="front" class="${state.side === 'front' ? 'active' : ''}">Frente <em>${D.front.length}</em></button>
        <button data-side="back" class="${state.side === 'back' ? 'active' : ''}">Verso <em>${D.back.length}</em></button>
      </div>
      <div class="blocks" id="blocks">${blocks.map((b, i) => blockEditor(b, i, blocks.length)).join('')}</div>
      <div class="add-row">
        <button data-add="text"><span class="ai">📝</span>Texto</button>
        <button data-add="image"><span class="ai">🖼️</span>Imagem</button>
        <button data-add="audio"><span class="ai">🎙️</span>Áudio</button>
        <button data-add="code"><span class="ai">⌨️</span>Código</button>
      </div>
      <p class="md-hint">Formatação: <code>**negrito**</code> <code>*itálico*</code> <code>==destaque==</code> <code>\`código\`</code>. No computador, cole imagens com Ctrl+V.</p>
      ${!editing ? `<div class="toggle"><span class="tt">Criar também o invertido<small>Gera outro card com verso → frente</small></span><label class="switch"><input type="checkbox" id="e-rev" ${D.reverse ? 'checked' : ''}><span></span></label></div>` : ''}
      <button class="btn btn-ghost btn-block" id="preview" style="margin-top:14px">👁️ Pré-visualizar card</button>
      <div class="save-bar">
        ${editing ? `<button class="btn btn-primary" id="save">Salvar</button>` : `<button class="btn btn-ghost" id="save-next">Salvar e +1</button><button class="btn btn-primary" id="save">Salvar</button>`}
      </div>`;
  }
  function blockEditor(b, i, n) {
    const tools = `<span class="sp"></span>${i > 0 ? `<button data-mv="${i}:-1" aria-label="Subir">${ICON.up}</button>` : ''}${i < n - 1 ? `<button data-mv="${i}:1" aria-label="Descer">${ICON.down}</button>` : ''}<button data-rm="${i}" aria-label="Remover">${ICON.x}</button>`;
    if (b.type === 'text') return `<div class="blk"><div class="blk-head">📝 Texto${tools}</div><textarea class="input" data-text="${i}" rows="1" placeholder="${state.side === 'front' ? 'Pergunta, palavra, conceito…' : 'Resposta…'}">${esc(b.text)}</textarea></div>`;
    if (b.type === 'code') return `<div class="blk"><div class="blk-head">⌨️ Código <select class="input lang" data-lang="${i}">${Object.entries(Highlight.LANGS).map(([k, v]) => `<option value="${k}" ${k === b.lang ? 'selected' : ''}>${v.name}</option>`).join('')}</select>${tools}</div>
      <textarea class="input code-ta" data-code="${i}" spellcheck="false" autocapitalize="off" autocorrect="off" placeholder="// cole ou escreva seu código">${esc(b.code)}</textarea></div>`;
    if (b.type === 'image') return `<div class="blk"><div class="blk-head">🖼️ Imagem${tools}</div><img data-media="${b.mediaId}" alt=""/></div>`;
    if (b.type === 'audio') return `<div class="blk"><div class="blk-head">🔊 Áudio${tools}</div><div class="c-audio" data-audio="${b.mediaId}"><button class="play">${ICON.play}</button><div class="track"><i></i></div><span class="time">0:00</span></div></div>`;
    return '';
  }
  function autosize(t) { t.style.height = 'auto'; t.style.height = Math.max(t.classList.contains('code-ta') ? 120 : 44, t.scrollHeight) + 'px'; }
  function bindEditor(mode, id) {
    const D = state.draft; if (!D) return;
    const blocks = () => D[state.side];
    hydrate($('#blocks'));
    $$('textarea', $('#blocks')).forEach(autosize);
    $('#e-deck').onchange = (e) => { D.deckId = e.target.value; };
    $$('[data-side]').forEach((b) => b.onclick = () => { state.side = b.dataset.side; render(true); });
    $$('[data-text]').forEach((t) => t.oninput = () => { blocks()[+t.dataset.text].text = t.value; autosize(t); });
    $$('[data-code]').forEach((t) => {
      t.oninput = () => { blocks()[+t.dataset.code].code = t.value; autosize(t); };
      t.onkeydown = (e) => { if (e.key === 'Tab') { e.preventDefault(); const s = t.selectionStart; t.setRangeText('  ', s, t.selectionEnd, 'end'); t.oninput(); } };
    });
    $$('[data-lang]').forEach((s) => s.onchange = () => { blocks()[+s.dataset.lang].lang = s.value; LS_set('lastLang', s.value); });
    $$('[data-rm]').forEach((b) => b.onclick = () => { blocks().splice(+b.dataset.rm, 1); render(true); });
    $$('[data-mv]').forEach((b) => b.onclick = () => { const [i, dlt] = b.dataset.mv.split(':').map(Number); const arr = blocks(); [arr[i], arr[i + dlt]] = [arr[i + dlt], arr[i]]; render(true); });
    $$('[data-add]').forEach((b) => b.onclick = () => addBlock(b.dataset.add));
    const rev = $('#e-rev'); if (rev) rev.onchange = () => { D.reverse = rev.checked; };
    $$('[data-leave]').forEach((a) => a.addEventListener('click', () => { state.draft = null; }));
    $('#preview').onclick = () => {
      const deck = deckOf(D.deckId);
      sheet(`<h3>Pré-visualização</h3><div class="face" style="position:relative;inset:auto;transform:none;min-height:200px;margin-bottom:12px">${renderBlocks(clean(D.front), { lang: deck?.ttsLang })}</div>
        <div class="face" style="position:relative;inset:auto;transform:none;min-height:160px">${renderBlocks(clean(D.back), { lang: deck?.ttsLang })}</div>
        <button class="btn btn-ghost btn-block" data-c style="margin-top:14px">Fechar</button>`, (el, close) => { hydrate(el); $('[data-c]', el).onclick = close; });
    };
    const save = async (next) => {
      const front = clean(D.front), back = clean(D.back);
      if (!front.length) { toast('A frente do card está vazia'); state.side = 'front'; render(true); return; }
      if (mode === 'edit') {
        const c = cardById(D.id); Object.assign(c, { deckId: D.deckId, front, back, updatedAt: Date.now() });
        await DB.put('cards', c); state.draft = null; toast('Card salvo ✓'); location.hash = '#/baralho/' + c.deckId; return;
      }
      const list = [newCard(D.deckId, front, back)];
      if (D.reverse && back.length) list.push(newCard(D.deckId, back, front, Date.now() + 1));
      await DB.putMany('cards', list); state.cards.push(...list);
      toast(list.length > 1 ? '2 cards criados ✓' : 'Card criado ✓');
      if (next) { state.draft = null; LS_set('lastDeck', D.deckId); render(); setTimeout(() => { const t = $('[data-text="0"]'); if (t) t.focus(); }, 100); }
      else { state.draft = null; location.hash = '#/baralho/' + D.deckId; }
    };
    $('#save').onclick = () => save(false);
    const sn = $('#save-next'); if (sn) sn.onclick = () => save(true);
    const del = $('#del-card');
    if (del) del.onclick = async () => {
      if (!(await confirmSheet('Excluir card?', 'Essa ação não pode ser desfeita.', 'Excluir'))) return;
      await DB.del('cards', D.id); state.cards = state.cards.filter((c) => c.id !== D.id);
      cleanupMedia(); const dk = D.deckId; state.draft = null; toast('Card excluído'); location.hash = '#/baralho/' + dk;
    };
  }
  const clean = (blocks) => blocks.filter((b) => (b.type === 'text' ? b.text.trim() : b.type === 'code' ? b.code.trim() : !!b.mediaId)).map((b) => (b.type === 'text' ? { ...b, text: b.text.trim() } : b));
  function LS_set(k, v) { try { localStorage.setItem('im_' + k, v); } catch {} }
  function LS_get(k) { try { return localStorage.getItem('im_' + k); } catch { return null; } }

  function addBlock(type) {
    const D = state.draft; const arr = D[state.side];
    if (type === 'text') { arr.push({ type: 'text', text: '' }); render(true); setTimeout(() => { const t = $$('[data-text]').pop(); t && t.focus(); }, 50); return; }
    if (type === 'code') { arr.push({ type: 'code', lang: LS_get('lastLang') || 'javascript', code: '' }); render(true); setTimeout(() => { const t = $$('[data-code]').pop(); t && t.focus(); }, 50); return; }
    if (type === 'image') {
      sheet(`<h3>Adicionar imagem</h3><div class="pick-list">
        <button class="btn btn-ghost btn-block" data-src="camera">📷 Tirar foto</button>
        <button class="btn btn-ghost btn-block" data-src="gallery">🖼️ Escolher da galeria</button>
        ${navigator.clipboard && navigator.clipboard.read ? '<button class="btn btn-ghost btn-block" data-src="paste">📋 Colar imagem copiada</button>' : ''}</div>`, (el, close) => {
        $$('[data-src]', el).forEach((b) => b.onclick = async () => {
          close();
          if (b.dataset.src === 'paste') {
            try {
              const items = await navigator.clipboard.read();
              for (const it of items) { const t = it.types.find((x) => x.startsWith('image/')); if (t) { await addImageBlob(await it.getType(t)); return; } }
              toast('Nenhuma imagem na área de transferência');
            } catch { toast('Não foi possível colar'); }
            return;
          }
          const inp = $(b.dataset.src === 'camera' ? '#file-camera' : '#file-image'); inp.value = ''; inp.click();
        });
      });
      return;
    }
    if (type === 'audio') {
      const canRec = navigator.mediaDevices && window.MediaRecorder;
      sheet(`<h3>Adicionar áudio</h3><p>Grave a pronúncia, um trecho de música, uma explicação…</p>
        ${canRec ? `<div class="rec" id="rec"><button class="rec-btn" id="rec-btn" aria-label="Gravar"><span></span></button>
          <div class="rec-t"><b id="rec-time">0:00</b><span id="rec-msg">Toque para gravar</span></div><div class="wave" id="wave">${'<i></i>'.repeat(14)}</div></div>` : '<p>Gravação não disponível neste navegador.</p>'}
        <button class="btn btn-ghost btn-block" id="aud-file" style="margin-top:16px">📁 Escolher arquivo de áudio</button>`, (el, close) => {
        $('#aud-file', el).onclick = () => { close(); const i = $('#file-audio'); i.value = ''; i.click(); };
        if (canRec) recorder(el, close);
      });
    }
  }
  async function addImageBlob(blob) {
    try {
      const small = await compressImage(blob);
      const id = await saveMedia(small);
      state.draft[state.side].push({ type: 'image', mediaId: id }); render(true);
    } catch { toast('Não foi possível usar essa imagem'); }
  }
  async function addAudioBlob(blob) {
    if (blob.size > 25 * 1024 * 1024) return toast('Áudio muito grande (máx. 25 MB)');
    const id = await saveMedia(blob);
    state.draft[state.side].push({ type: 'audio', mediaId: id }); render(true);
  }
  function recorder(el, close) {
    let rec, chunks = [], stream, t0, timer, raf, ctx, analyser;
    const btn = $('#rec-btn', el), box = $('#rec', el), bars = $$('#wave i', el);
    const stopAll = () => { clearInterval(timer); cancelAnimationFrame(raf); stream && stream.getTracks().forEach((t) => t.stop()); ctx && ctx.close().catch(() => {}); };
    $('.sheet-backdrop').onclick = () => { if (rec && rec.state === 'recording') { rec.onstop = null; rec.stop(); } stopAll(); close(); };
    btn.onclick = async () => {
      if (rec && rec.state === 'recording') { rec.stop(); return; }
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch { toast('Permita o uso do microfone para gravar', 3500); return; }
      const mime = ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/aac', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
      rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = async () => {
        stopAll();
        const blob = new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' });
        close();
        if (blob.size) await addAudioBlob(blob);
      };
      rec.start(250); t0 = Date.now(); box.classList.add('on'); $('#rec-msg', el).textContent = 'Gravando… toque para parar';
      timer = setInterval(() => { const s = (Date.now() - t0) / 1000; $('#rec-time', el).textContent = fmtTime(s); if (s > 300) rec.stop(); }, 200);
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)(); analyser = ctx.createAnalyser(); analyser.fftSize = 64;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => { analyser.getByteFrequencyData(data); bars.forEach((b, i) => { b.style.height = Math.max(12, (data[i + 2] / 255) * 100) + '%'; }); raf = requestAnimationFrame(loop); };
        loop();
      } catch {}
    };
  }

  // ---------- estudo ----------
  function viewStudy() {
    const S = state.session; if (!S) return '';
    if (!S.current) return viewDone();
    const c = cardById(S.current.id); const d = deckOf(c.deckId);
    const left = S.learn.length + S.review.length + S.fresh.length;
    const prog = S.total ? Math.min(1, S.done / (S.done + left)) : 1;
    const pv = SRS.preview(c);
    return `<div class="study">
      <div class="st-top"><a class="icon-btn" href="${targetHref(S.deckId)}" id="quit" aria-label="Sair">${ICON.x}</a>
        <div class="st-progress"><i style="width:${prog * 100}%"></i></div>
        <button class="icon-btn" id="undo" aria-label="Desfazer" ${S.history.length ? '' : 'style="opacity:.35"'}>${ICON.undo}</button></div>
      <div class="st-counts"><span class="n ${S.current.kind === 'n' ? 'cur' : ''}">${S.fresh.length}</span><span class="l ${S.current.kind === 'l' ? 'cur' : ''}">${S.learn.length}</span><span class="r ${S.current.kind === 'r' ? 'cur' : ''}">${S.review.length}</span></div>
      <div class="stage">
        <span class="swipe-badge l">ERREI</span><span class="swipe-badge r">BOM</span>
        <div class="flip ${S.revealed ? 'flipped' : ''}" id="flip">
          <div class="face face-front"><span class="deck-tag">${d.emoji} ${esc(d.name)}</span>${renderBlocks(c.front, { lang: d.ttsLang })}<div class="tap-hint">Toque para ver a resposta</div></div>
          <div class="face face-back"><span class="deck-tag">${d.emoji} ${esc(d.name)}</span><div class="q-dim">${renderBlocks(c.front, { lang: d.ttsLang })}</div><div class="divider"></div>${renderBlocks(c.back.length ? c.back : [{ type: 'text', text: '(sem verso)' }], { lang: d.ttsLang })}
            <div class="tap-hint">Deslize ← errei · bom →</div></div>
        </div>
      </div>
      ${S.revealed ? answersHTML(pv) : `<button class="btn btn-primary btn-block reveal-btn" id="reveal">Mostrar resposta <span class="kbd">␣</span></button>`}
    </div>`;
  }
  function answersHTML(pv) {
    return `<div class="answers">
        <button class="a1" data-r="1">Errei<small>${SRS.fmt(pv[0])}</small><span class="kbd">1</span></button>
        <button class="a2" data-r="2">Difícil<small>${SRS.fmt(pv[1])}</small><span class="kbd">2</span></button>
        <button class="a3" data-r="3">Bom<small>${SRS.fmt(pv[2])}</small><span class="kbd">3</span></button>
        <button class="a4" data-r="4">Fácil<small>${SRS.fmt(pv[3])}</small><span class="kbd">4</span></button></div>`;
  }
  function viewDone() {
    const S = state.session;
    const mins = Math.max(1, Math.round((Date.now() - S.started) / MIN));
    const acc = S.done ? Math.round((S.correct / S.done) * 100) : 0;
    const waiting = S.learn.length ? cardById(S.learn[0]) : null;
    return `<div class="done">
      <div class="inf">${infinity(140, 70, 'gd')}</div>
      <h1>${waiting ? 'Pausa rápida' : S.done ? 'Sessão concluída!' : 'Nada para revisar'}</h1>
      <p>${waiting ? `Há ${plural(S.learn.length, 'card')} em aprendizado. O próximo volta em ${SRS.fmt(waiting.due - Date.now())}.` : S.done ? 'Sua memória agradece. Os cards voltam no momento certo para fixar de vez.' : 'Você está em dia com este baralho.'}</p>
      ${S.done ? `<div class="done-stats"><div><b>${S.done}</b><small>revisões</small></div><div><b>${acc}%</b><small>acertos</small></div><div><b>${mins}</b><small>minuto${mins > 1 ? 's' : ''}</small></div></div>` : ''}
      ${waiting ? `<button class="btn btn-primary btn-block" id="ahead">Revisar agora mesmo assim</button>` : ''}
      <a class="btn ${waiting ? 'btn-ghost' : 'btn-primary'} btn-block" href="${targetHref(S.deckId)}">Voltar</a>
    </div>`;
  }
  let keyHandler = null;
  function bindStudy() {
    const S = state.session; if (!S) return;
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = (e) => {
      if (route().name !== 'estudar') return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!S.revealed && S.current) reveal(); else if (S.revealed) rate(3); }
      if (S.revealed && ['1', '2', '3', '4'].includes(e.key)) rate(+e.key);
      if ((e.key === 'z' && (e.ctrlKey || e.metaKey)) || e.key === 'u') undo();
    };
    document.addEventListener('keydown', keyHandler);
    if (!S.current) { const a = $('#ahead'); if (a) a.onclick = () => { S.current = { id: S.learn[0], kind: 'l' }; S.revealed = false; S.shownAt = Date.now(); render(true); }; if (S.done) confetti(); return; }
    const flip = $('#flip');
    hydrate(flip).then(() => {
      if (state.settings.autoplay) {
        const face = S.revealed ? $('.face.face-back', flip) : $('.face.face-front', flip);
        const boxes = $$('[data-audio]', face).filter((b) => !b.closest('.q-dim'));
        if (boxes[0] && boxes[0]._play) setTimeout(() => boxes[0]._play(), 350);
      }
    });
    const rv = $('#reveal'); if (rv) rv.onclick = reveal;
    $$('[data-r]').forEach((b) => b.onclick = () => rate(+b.dataset.r));
    $('#undo').onclick = undo;
    $('#quit').addEventListener('click', () => { stopAudio(); speechSynthesis && speechSynthesis.cancel(); });
    // toque e deslizar
    let sx = 0, dx = 0, drag = false, moved = false;
    const bl = $('.swipe-badge.l'), br = $('.swipe-badge.r');
    flip.addEventListener('pointerdown', (e) => { if (e.target.closest('button, a, .track, .c-code pre')) return; sx = e.clientX; dx = 0; drag = true; moved = false; });
    flip.addEventListener('pointermove', (e) => {
      if (!drag || !S.revealed) return;
      dx = e.clientX - sx; if (Math.abs(dx) > 8) moved = true;
      flip.style.transition = 'none';
      flip.style.transform = `rotateY(180deg) translateX(${-dx}px) rotate(${-dx / 25}deg)`;
      bl.style.opacity = Math.min(1, Math.max(0, -dx / 90)); br.style.opacity = Math.min(1, Math.max(0, dx / 90));
    });
    const end = () => {
      if (!drag) return; drag = false;
      flip.style.transition = ''; bl.style.opacity = 0; br.style.opacity = 0;
      if (S.revealed && Math.abs(dx) > 90) { rate(dx < 0 ? 1 : 3); return; }
      flip.style.transform = '';
      if (!moved && !S.revealed) reveal();
    };
    flip.addEventListener('pointerup', end); flip.addEventListener('pointercancel', end);
  }
  function reveal() {
    const S = state.session; if (!S || S.revealed) return;
    stopAudio(); S.revealed = true;
    const flip = $('#flip'); flip.classList.add('flipped');
    const btn = $('#reveal');
    if (btn) {
      btn.outerHTML = answersHTML(SRS.preview(cardById(S.current.id)));
      $$('[data-r]').forEach((b) => b.onclick = () => rate(+b.dataset.r));
    }
    if (state.settings.autoplay) {
      const boxes = $$('.face.face-back [data-audio]', flip).filter((b) => !b.closest('.q-dim'));
      if (boxes[0] && boxes[0]._play) setTimeout(() => boxes[0]._play(), 450);
    }
  }
  async function rate(r) {
    const S = state.session; if (!S || !S.revealed || S.busy) return;
    S.busy = true; stopAudio(); if ('speechSynthesis' in window) speechSynthesis.cancel();
    const before = { ...cardById(S.current.id) };
    const queues = { learn: [...S.learn], review: [...S.review], fresh: [...S.fresh] };
    const now = Date.now();
    const after = SRS.answer(before, r, now);
    const c = cardById(S.current.id); Object.assign(c, after);
    const log = { id: 'l_' + uid(), cardId: c.id, deckId: c.deckId, ts: now, rating: r, prevState: before.state, interval: after.interval, ms: now - S.shownAt };
    await DB.put('cards', c); await DB.put('logs', log); state.logs.push(log);
    S.history.push({ before, logId: log.id, queues, current: S.current, done: S.done, correct: S.correct });
    if (S.history.length > 30) S.history.shift();
    // remove das filas
    S.learn = S.learn.filter((x) => x !== c.id); S.review = S.review.filter((x) => x !== c.id); S.fresh = S.fresh.filter((x) => x !== c.id);
    if ((c.state === 'learning' || c.state === 'relearning') && c.due <= endOfToday()) S.learn.push(c.id);
    S.done++; if (r > 1) S.correct++;
    if (navigator.vibrate) navigator.vibrate(r === 1 ? [30, 40, 30] : 15);
    nextCard(S);
    S.busy = false;
    render(true);
  }
  function nextCard(S) {
    S.current = pickNext(S); S.revealed = false; S.shownAt = Date.now();
  }
  async function undo() {
    const S = state.session; if (!S || !S.history.length) return;
    const h = S.history.pop();
    const c = cardById(h.before.id); Object.keys(c).forEach((k) => delete c[k]); Object.assign(c, h.before);
    await DB.put('cards', c); await DB.del('logs', h.logId);
    state.logs = state.logs.filter((l) => l.id !== h.logId);
    Object.assign(S, h.queues); S.current = h.current; S.done = h.done; S.correct = h.correct; S.revealed = true;
    toast('Resposta desfeita'); render(true);
  }

  // ---------- todos os cards ----------
  function viewSearch() {
    const q = state.filter.q.toLowerCase(), dk = state.filter.deck;
    const list = state.cards.filter((c) => (dk === 'all' || c.deckId === dk) && (!q || (summary(c.front) + ' ' + summary(c.back)).toLowerCase().includes(q))).sort((a, b) => b.updatedAt - a.updatedAt);
    return `<header class="topbar"><div><h1 class="page-title">Cards</h1><div class="page-sub">${plural(state.cards.length, 'card')} em ${plural(state.decks.length, 'baralho')}</div></div></header>
      <label class="search" style="margin-top:0">${ICON.search}<input id="sq" type="search" placeholder="Buscar em todos os cards…" value="${esc(state.filter.q)}"/></label>
      <div class="chips"><button class="chip ${dk === 'all' ? 'active' : ''}" data-dk="all">Todos</button>${state.decks.map((d) => `<button class="chip ${dk === d.id ? 'active' : ''}" data-dk="${d.id}">${d.emoji} ${esc(d.name)}</button>`).join('')}</div>
      <div class="clist" id="slist">${state.cards.length ? cardRows(list, true) : '<div class="empty"><div class="big">🃏</div><h3>Nenhum card ainda</h3><p>Toque no + para criar o primeiro.</p></div>'}</div>`;
  }
  function bindSearch() {
    const sq = $('#sq');
    sq.oninput = () => { state.filter.q = sq.value; const s = sq.value.toLowerCase(), dk = state.filter.deck; $('#slist').innerHTML = cardRows(state.cards.filter((c) => (dk === 'all' || c.deckId === dk) && (!s || (summary(c.front) + ' ' + summary(c.back)).toLowerCase().includes(s))).sort((a, b) => b.updatedAt - a.updatedAt), true); };
    $$('[data-dk]').forEach((b) => b.onclick = () => { state.filter.deck = b.dataset.dk; render(true); });
  }

  // ---------- progresso ----------
  function viewStats() {
    const days = 30, today = dayStart();
    const per = Array.from({ length: days }, (_, i) => { const s = today - (days - 1 - i) * DAY; return state.logs.filter((l) => l.ts >= s && l.ts < s + DAY).length; });
    const max = Math.max(1, ...per);
    const last30 = state.logs.filter((l) => l.ts >= today - 29 * DAY);
    const reviewsOnly = last30.filter((l) => l.prevState === 'review');
    const retention = reviewsOnly.length ? Math.round((reviewsOnly.filter((l) => l.rating > 1).length / reviewsOnly.length) * 100) : null;
    const timeMin = Math.round(last30.reduce((s, l) => s + Math.min(l.ms || 0, 120000), 0) / MIN);
    const byState = { new: 0, learning: 0, young: 0, mature: 0 };
    state.cards.forEach((c) => { if (c.state === 'new') byState.new++; else if (c.state !== 'review') byState.learning++; else if (c.interval >= 21) byState.mature++; else byState.young++; });
    const tot = state.cards.length || 1;
    const segs = [['new', '#60A5FA', 'Novos'], ['learning', '#FB7185', 'Aprendendo'], ['young', '#34D399', 'Jovens'], ['mature', '#8B5CF6', 'Dominados (21d+)']];
    const next7 = Array.from({ length: 7 }, (_, i) => { const s = today + i * DAY; return state.cards.filter((c) => c.state !== 'new' && (i === 0 ? c.due < s + DAY : c.due >= s && c.due < s + DAY)).length; });
    const max7 = Math.max(1, ...next7);
    const wd = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    return `<header class="topbar"><div><h1 class="page-title">Progresso</h1><div class="page-sub">Últimos 30 dias</div></div></header>
      <div class="kpis">
        <div class="kpi"><small>Sequência</small><b>🔥 ${streak()}</b><em>dias seguidos</em></div>
        <div class="kpi"><small>Retenção</small><b>${retention === null ? '—' : retention + '%'}</b><em>acertos em revisões</em></div>
        <div class="kpi"><small>Revisões</small><b>${last30.length}</b><em>em 30 dias</em></div>
        <div class="kpi"><small>Tempo de estudo</small><b>${timeMin < 60 ? timeMin + ' min' : (timeMin / 60).toFixed(1).replace('.', ',') + ' h'}</b><em>em 30 dias</em></div>
      </div>
      <div class="section-head"><h2>Revisões por dia</h2></div>
      <div class="panel"><div class="chart">${per.map((n, i) => `<div title="${n}"><i style="height:${(n / max) * 100}%;animation-delay:${i * 15}ms;${n ? '' : 'opacity:.25'}"></i></div>`).join('')}</div>
        <div class="chart-x"><span>30 dias atrás</span><span>hoje</span></div></div>
      <div class="section-head"><h2>Próximos 7 dias</h2></div>
      <div class="panel"><div class="chart" style="height:100px">${next7.map((n, i) => `<div><i style="height:${(n / max7) * 100}%;background:var(--grad-warm);${n ? '' : 'opacity:.25'}"></i></div>`).join('')}</div>
        <div class="chart-x">${next7.map((n, i) => `<span>${i === 0 ? 'hoje' : wd[new Date(today + i * DAY).getDay()]}<br><b style="color:var(--text)">${n}</b></span>`).join('')}</div></div>
      <div class="section-head"><h2>Seus cards</h2></div>
      <div class="panel"><div class="dist">${segs.map(([k, c]) => byState[k] ? `<span style="flex:${byState[k]};background:${c}"></span>` : '').join('') || '<span style="flex:1;background:var(--surface-2)"></span>'}</div>
        <div class="legend">${segs.map(([k, c, n]) => `<span><i style="background:${c}"></i>${n} <b>${byState[k]}</b></span>`).join('')}</div></div>
      <div class="section-head"><h2>Constância</h2></div>
      <div class="panel">${heatmap(20)}</div>`;
  }

  // ---------- ajustes ----------
  function viewSettings() {
    const s = state.settings;
    return `<header class="topbar"><div><h1 class="page-title">Ajustes</h1><div class="page-sub">Seus dados ficam salvos neste aparelho</div></div></header>
      <div class="menu">
        <div><span class="mi">🎨</span><span class="mt">Tema</span><select class="input" id="s-theme" style="width:auto;min-height:38px;padding:6px 34px 6px 12px">${[['dark', 'Escuro'], ['light', 'Claro'], ['auto', 'Automático']].map(([k, v]) => `<option value="${k}" ${s.theme === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        <div><span class="mi">🆕</span><span class="mt">Cards novos por dia<small>Padrão para todos os baralhos</small></span><span class="stepper"><button data-step="-5">−</button><b id="s-new">${s.newPerDay}</b><button data-step="5">+</button></span></div>
        <label><span class="mi">🔊</span><span class="mt">Tocar áudio automaticamente<small>Ao mostrar a frente e o verso</small></span><span class="switch"><input type="checkbox" id="s-auto" ${s.autoplay ? 'checked' : ''}><span></span></span></label>
        <label><span class="mi">🗣️</span><span class="mt">Botão de ouvir o texto<small>Leitura em voz alta no idioma do baralho</small></span><span class="switch"><input type="checkbox" id="s-tts" ${s.tts ? 'checked' : ''}><span></span></span></label>
      </div>
      <div class="section-head"><h2>Dados</h2></div>
      <div class="menu">
        <button id="s-export"><span class="mi">💾</span><span class="mt">Exportar backup<small>Tudo, incluindo imagens e áudios</small></span><span class="chev">›</span></button>
        <button id="s-import"><span class="mi">📥</span><span class="mt">Importar<small>Backup .json ou planilha .csv/.tsv/.txt</small></span><span class="chev">›</span></button>
        <button id="s-demo"><span class="mi">✨</span><span class="mt">Adicionar baralhos de exemplo<small>Inglês, JavaScript e capitais</small></span><span class="chev">›</span></button>
        <button id="s-wipe" style="color:var(--red)"><span class="mi">🗑️</span><span class="mt">Apagar tudo</span><span class="chev">›</span></button>
      </div>
      <div class="section-head"><h2>Como funciona</h2></div>
      <div class="panel" style="font-size:14px;line-height:1.6;color:var(--muted)">
        O Infinity Memory usa <b style="color:var(--text)">repetição espaçada</b>, o mesmo princípio do Anki. Cada resposta define quando o card volta:
        <b style="color:var(--red)">Errei</b> repete em minutos, <b style="color:var(--amber)">Difícil</b> volta um pouco antes,
        <b style="color:var(--green)">Bom</b> aumenta o intervalo e <b style="color:var(--blue)">Fácil</b> aumenta bastante. Estude um pouco todo dia e os intervalos crescem para semanas e meses.
      </div>
      <p class="about">${infinity(60, 30, 'ga')}<br>Infinity Memory · v1.0<br>Instale na tela inicial para usar como app, até offline.</p>`;
  }
  function bindSettings() {
    $('#s-theme').onchange = (e) => { state.settings.theme = e.target.value; saveSettings(); applyTheme(); };
    $$('[data-step]').forEach((b) => b.onclick = () => { state.settings.newPerDay = Math.max(0, Math.min(500, state.settings.newPerDay + +b.dataset.step)); $('#s-new').textContent = state.settings.newPerDay; saveSettings(); });
    $('#s-auto').onchange = (e) => { state.settings.autoplay = e.target.checked; saveSettings(); };
    $('#s-tts').onchange = (e) => { state.settings.tts = e.target.checked; saveSettings(); };
    $('#s-export').onclick = exportBackup;
    $('#s-import').onclick = () => { const i = $('#file-import'); i.value = ''; i.click(); };
    $('#s-demo').onclick = loadDemo;
    $('#s-wipe').onclick = async () => {
      if (!(await confirmSheet('Apagar tudo?', 'Todos os baralhos, cards, mídias e o histórico serão apagados deste aparelho. Exporte um backup antes se quiser guardar.', 'Apagar tudo'))) return;
      for (const s of ['decks', 'cards', 'logs', 'media']) await DB.clear(s);
      state.decks = []; state.cards = []; state.logs = []; state.sections = []; await saveSections(); toast('Tudo apagado'); location.hash = '#/';
    };
  }
  function saveSettings() { DB.setMeta('settings', state.settings); }

  const blobToB64 = (b) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(b); });
  async function exportBackup() {
    toast('Gerando backup…');
    const media = await DB.all('media');
    const used = new Set(); state.cards.forEach((c) => [...c.front, ...c.back].forEach((b) => b.mediaId && used.add(b.mediaId)));
    const mediaOut = [];
    for (const m of media.filter((x) => used.has(x.id))) mediaOut.push({ id: m.id, type: m.type, data: await blobToB64(m.blob) });
    const data = { app: 'infinity-memory', version: 1, exportedAt: new Date().toISOString(), settings: state.settings, sections: state.sections, decks: state.decks, cards: state.cards, logs: state.logs, media: mediaOut };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const name = `infinity-memory-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Backup Infinity Memory' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast('Backup exportado ✓');
  }
  async function importFile(file) {
    const text = await file.text();
    if (/\.json$/i.test(file.name) || text.trim().startsWith('{')) {
      let data; try { data = JSON.parse(text); } catch { return toast('Arquivo inválido'); }
      if (!Array.isArray(data.cards) || !Array.isArray(data.decks)) return toast('Este não é um backup do Infinity Memory');
      if (!(await confirmSheet('Importar backup?', `${plural(data.decks.length, 'baralho')} e ${plural(data.cards.length, 'card')} serão adicionados (itens com o mesmo ID são atualizados).`, 'Importar', false))) return;
      for (const m of data.media || []) { const blob = await (await fetch(m.data)).blob(); await DB.put('media', { id: m.id, blob, type: m.type, size: blob.size, ts: Date.now() }); }
      if (Array.isArray(data.sections)) { const ids = new Set(state.sections.map((x) => x.id)); data.sections.forEach((x) => { if (ids.has(x.id)) Object.assign(secOf(x.id), x); else state.sections.push(x); }); await saveSections(); }
      await DB.putMany('decks', data.decks); await DB.putMany('cards', data.cards); if (Array.isArray(data.logs)) await DB.putMany('logs', data.logs);
      await loadAll(); toast('Backup importado ✓'); location.hash = '#/'; render();
      return;
    }
    const rows = parseList(text.replace(/","/g, '\t').replace(/^"|"$/gm, ''));
    if (!rows.length) return toast('Nenhuma linha “frente ; verso” encontrada');
    if (!state.decks.length) return toast('Crie um baralho antes de importar');
    sheet(`<h3>Importar ${plural(rows.length, 'card')}</h3><p>Escolha o baralho de destino.</p><div class="pick-list">${state.decks.map((d) => `<button class="btn btn-ghost btn-block" data-d="${d.id}">${d.emoji} ${esc(d.name)}</button>`).join('')}</div>`, (el, close) => {
      $$('[data-d]', el).forEach((b) => b.onclick = async () => { close(); const n = await createTextCards(b.dataset.d, rows, false); toast(`${plural(n, 'card importado', 'cards importados')} ✓`); location.hash = '#/baralho/' + b.dataset.d; });
    });
  }

  // ---------- exemplos ----------
  async function loadDemo() {
    const now = Date.now();
    const ms = (name, emoji, color, k) => ({ id: 'sec_' + uid(), name, emoji, color, createdAt: now + k, order: now + k, collapsed: false });
    const sIdi = ms('Idiomas', '🗣️', 1, 0), sProg = ms('Programação', '💻', 4, 1), sGer = ms('Conhecimentos gerais', '🧠', 3, 2);
    state.sections.push(sIdi, sProg, sGer); await saveSections();
    const mk = (name, emoji, color, ttsLang, sectionId) => ({ id: 'd_' + uid(), name, emoji, color, ttsLang, newPerDay: null, createdAt: now, sectionId });
    const en = mk('Inglês — Essencial', '🇺🇸', 1, 'en-US', sIdi.id);
    const js = mk('JavaScript', '⚛️', 4, 'pt-BR', sProg.id);
    const geo = mk('Capitais do mundo', '🌎', 3, 'pt-BR', sGer.id);
    const cards = [];
    let t = now;
    const add = (deck, front, back) => cards.push(newCard(deck.id, front, back, t++));
    const T = (text) => ({ type: 'text', text });
    const K = (code, lang = 'javascript') => ({ type: 'code', lang, code });
    [['to remember', 'lembrar'], ['to forget', 'esquecer'], ['although', 'embora'], ['however', 'no entanto'], ['to achieve', 'alcançar, conquistar'], ['meanwhile', 'enquanto isso'], ['to struggle', 'ter dificuldade, lutar'], ['actually', '**na verdade** (não é “atualmente”!)']].forEach(([a, b]) => add(en, [T(a)], [T(b)]));
    add(js, [T('O que este código imprime?'), K("const a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);")], [T('**4** — arrays são passados por referência: `a` e `b` apontam para o mesmo array.')]);
    add(js, [T('Diferença entre `==` e `===`?')], [T('`==` converte os tipos antes de comparar; `===` compara valor **e** tipo.'), K("0 == '0'   // true\n0 === '0'  // false")]);
    add(js, [T('Como remover duplicados de um array em uma linha?')], [K("const unicos = [...new Set(lista)];")]);
    add(js, [T('O que é uma *closure*?')], [T('Uma função que ==lembra as variáveis== do escopo onde foi criada, mesmo depois que esse escopo terminou.'), K("function contador() {\n  let n = 0;\n  return () => ++n;\n}\nconst c = contador();\nc(); // 1\nc(); // 2")]);
    add(js, [T('Qual a saída?'), K("console.log(typeof null);")], [T('`"object"` — um bug histórico da linguagem que nunca foi corrigido.')]);
    [['Japão', 'Tóquio'], ['Austrália', 'Camberra'], ['Canadá', 'Ottawa'], ['Turquia', 'Ancara'], ['Marrocos', 'Rabat'], ['Nova Zelândia', 'Wellington']].forEach(([a, b]) => add(geo, [T(`Capital de **${a}**?`)], [T(b)]));
    await DB.putMany('decks', [en, js, geo]); await DB.putMany('cards', cards);
    state.decks.push(en, js, geo); state.cards.push(...cards);
    confetti(); toast('Baralhos de exemplo adicionados ✨'); location.hash = '#/'; render();
  }

  function notFound() { return `<div class="empty"><div class="big">🔍</div><h3>Não encontrado</h3><p>Isso pode ter sido apagado.</p><a class="btn btn-primary" href="#/">Início</a></div>`; }

  // ---------- botão + ----------
  function fab() {
    if (!state.decks.length) { deckForm(); return; }
    const last = LS_get('lastDeck');
    const r = route();
    const deckId = r.name === 'baralho' && deckOf(r.id) ? r.id : deckOf(last) ? last : state.decks[0].id;
    location.hash = '#/novo/' + deckId;
  }

  // =========================================================
  // ROTEADOR
  // =========================================================
  function route() { const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); return { name: p[0] || '', id: p[1] }; }
  let lastKey = '';
  function render(soft) {
    const r = route();
    let html = '', bind = null, tab = null, tabs = true;
    if (!['novo', 'editar'].includes(r.name) && state.draft) state.draft = null;
    if (r.name !== 'estudar') state.session = null;
    if (r.name !== 'baralho' && r.name !== 'buscar') state.filter.q = '';
    switch (r.name) {
      case 'baralho': html = viewDeck(r.id); bind = () => bindDeck(r.id); tab = 'home'; break;
      case 'novo': html = viewEditor('new', r.id); bind = () => bindEditor('new', r.id); tabs = false; break;
      case 'editar': html = viewEditor('edit', r.id); bind = () => bindEditor('edit', r.id); tabs = false; break;
      case 'estudar':
        if (!state.session || (state.session.deckId || '') !== (r.id || '')) { state.session = buildSession(r.id || null); nextCard(state.session); }
        html = viewStudy(); bind = bindStudy; tabs = false; break;
      case 'buscar': html = viewSearch(); bind = bindSearch; tab = 'search'; break;
      case 'stats': html = viewStats(); tab = 'stats'; break;
      case 'ajustes': html = viewSettings(); bind = bindSettings; tab = 'settings'; break;
      default: html = viewHome(); bind = bindHome; tab = 'home';
    }
    const view = $('#view'); const y = scrollY; const key = location.hash;
    view.innerHTML = html;
    view.classList.toggle('full', !tabs);
    if (soft && key === lastKey) { view.style.animation = 'none'; scrollTo(0, y); } else { view.style.animation = ''; scrollTo(0, 0); }
    lastKey = key;
    $('#tabbar').classList.toggle('hidden', !tabs);
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
    try { bind && bind(); } catch (e) { console.error(e); }
  }

  async function loadAll() {
    [state.decks, state.cards, state.logs] = await Promise.all([DB.all('decks'), DB.all('cards'), DB.all('logs')]);
    state.decks.sort((a, b) => a.createdAt - b.createdAt);
    state.settings = { ...state.settings, ...(await DB.getMeta('settings', {})) };
    state.sections = await DB.getMeta('sections', []);
  }

  async function init() {
    try { await loadAll(); } catch (e) { console.error(e); toast('Erro ao abrir o armazenamento'); }
    applyTheme();
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
    $('#fab').onclick = fab;
    $('#file-image').onchange = (e) => e.target.files[0] && addImageBlob(e.target.files[0]);
    $('#file-camera').onchange = (e) => e.target.files[0] && addImageBlob(e.target.files[0]);
    $('#file-audio').onchange = (e) => e.target.files[0] && addAudioBlob(e.target.files[0]);
    $('#file-import').onchange = (e) => e.target.files[0] && importFile(e.target.files[0]);
    document.addEventListener('paste', (e) => {
      if (!state.draft) return;
      const it = [...(e.clipboardData?.items || [])].find((x) => x.type.startsWith('image/'));
      if (it) { e.preventDefault(); addImageBlob(it.getAsFile()); }
    });
    window.addEventListener('hashchange', () => render());
    if ('speechSynthesis' in window) speechSynthesis.getVoices();
    render();
    setTimeout(cleanupMedia, 4000);
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  init();
})();
