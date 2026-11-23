/* Infinity Memory — repetição espaçada (variante do SM-2 usado pelo Anki)
   Estados: new → learning → review ⇄ relearning
   Notas: 1 = Errei, 2 = Difícil, 3 = Bom, 4 = Fácil */
const SRS = (() => {
  const MIN = 60e3, DAY = 864e5;
  const DEFAULTS = {
    learnSteps: [1, 10],      // minutos
    relearnSteps: [10],       // minutos
    graduatingInterval: 1,    // dias
    easyInterval: 4,          // dias
    startingEase: 2.5,
    easyBonus: 1.3,
    hardInterval: 1.2,
    maxInterval: 36500,
    learnAheadMin: 20,
  };
  let cfg = { ...DEFAULTS };

  function fuzz(days) {
    if (days < 2.5) return days;
    const f = Math.max(1, Math.round(days * 0.05));
    return days + Math.round((Math.random() * 2 - 1) * f);
  }
  const clampIvl = (d) => Math.min(cfg.maxInterval, Math.max(1, Math.round(d)));

  // Devolve os novos campos do card após uma resposta (não altera o original)
  function answer(card, rating, now = Date.now(), { noFuzz = false } = {}) {
    const c = { ...card };
    const F = noFuzz ? (d) => d : fuzz;
    c.reps = (c.reps || 0) + 1;
    c.lastReview = now;
    const state = c.state || 'new';

    if (state === 'new' || state === 'learning' || state === 'relearning') {
      const relearn = state === 'relearning';
      const steps = relearn ? cfg.relearnSteps : cfg.learnSteps;
      let step = state === 'new' ? 0 : (c.step || 0);
      if (state === 'new') { c.ease = cfg.startingEase; c.interval = 0; }
      const graduate = (ivlDays) => {
        c.state = 'review'; c.step = 0;
        c.interval = clampIvl(F(ivlDays));
        c.due = now + c.interval * DAY;
      };
      if (rating === 1) {
        c.state = relearn ? 'relearning' : 'learning'; c.step = 0;
        c.due = now + steps[0] * MIN;
      } else if (rating === 2) {
        c.state = relearn ? 'relearning' : 'learning'; c.step = step;
        const cur = steps[step] ?? steps[steps.length - 1];
        const next = steps[step + 1];
        const mins = step === 0 && next ? (cur + next) / 2 : step === 0 ? cur * 1.5 : cur;
        c.due = now + mins * MIN;
      } else if (rating === 3) {
        step += 1;
        if (step >= steps.length) graduate(relearn ? Math.max(1, c.interval || 1) : cfg.graduatingInterval);
        else { c.state = relearn ? 'relearning' : 'learning'; c.step = step; c.due = now + steps[step] * MIN; }
      } else {
        graduate(relearn ? Math.max(1, (c.interval || 1) + 1) : cfg.easyInterval);
      }
      return c;
    }

    // revisão
    const ivl = c.interval || 1;
    const ease = c.ease || cfg.startingEase;
    const daysLate = Math.max(0, (now - (c.due || now)) / DAY);
    if (rating === 1) {
      c.lapses = (c.lapses || 0) + 1;
      c.ease = Math.max(1.3, ease - 0.2);
      c.interval = Math.max(1, Math.round(ivl * 0.2));
      c.state = 'relearning'; c.step = 0;
      c.due = now + cfg.relearnSteps[0] * MIN;
      return c;
    }
    let next;
    if (rating === 2) { next = Math.max(ivl + 1, ivl * cfg.hardInterval); c.ease = Math.max(1.3, ease - 0.15); }
    else if (rating === 3) { next = Math.max(ivl + 1, (ivl + daysLate / 2) * ease); }
    else { next = Math.max(ivl + 1, (ivl + daysLate) * ease * cfg.easyBonus); c.ease = ease + 0.15; }
    c.interval = clampIvl(F(next));
    c.state = 'review';
    c.due = now + c.interval * DAY;
    return c;
  }

  // Prévia do intervalo de cada botão
  function preview(card, now = Date.now()) {
    return [1, 2, 3, 4].map((r) => {
      const n = answer(card, r, now, { noFuzz: true });
      return n.due - now;
    });
  }

  function fmt(ms) {
    const m = ms / MIN;
    if (m < 1) return '<1 min';
    if (m < 60) return `${Math.round(m)} min`;
    const h = m / 60;
    if (h < 24) return `${Math.round(h)} h`;
    const d = h / 24;
    if (d < 30) return `${Math.round(d)} d`;
    if (d < 365) return `${(d / 30).toFixed(d < 300 ? 1 : 0).replace('.0', '').replace('.', ',')} mês`;
    return `${(d / 365).toFixed(1).replace('.0', '').replace('.', ',')} ano${d >= 730 ? 's' : ''}`;
  }

  return { answer, preview, fmt, MIN, DAY, get cfg() { return cfg; }, setCfg(p) { cfg = { ...cfg, ...p }; } };
})();
