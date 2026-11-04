import { icon } from './icons.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const stateIcon = (state) => {
  if (state === 'done') return `<span class="st st--done">${icon('check')}</span>`;
  if (state === 'warn') return `<span class="st st--warn">${icon('alert')}</span>`;
  if (state === 'active') return '<span class="st st--active"><i></i></span>';
  if (state === 'none') return `<span class="st st--none">${icon('check')}</span>`;
  return '<span class="st st--pending"><i></i></span>';
};

const blocks = {
  header: (b) => `<div class="pb pb-header" data-pb>
      <div><p class="pb-title">${esc(b.title)}</p><p class="pb-meta">${esc(b.meta)}</p></div>
      ${b.status ? `<span class="pill pill--${b.status.tone || 'grey'}">${esc(b.status.label)}</span>` : ''}
    </div>`,

  route: (b) => `<div class="pb pb-route" data-pb>
      <div class="route__end"><span class="route__dot"></span><p class="route__city">${esc(b.from.city)}</p><p class="route__sub">${esc(b.from.sub)}</p></div>
      <div class="route__line"><span>${esc(b.meta)}</span></div>
      <div class="route__end route__end--to"><span class="route__dot route__dot--to"></span><p class="route__city">${esc(b.to.city)}</p><p class="route__sub">${esc(b.to.sub)}</p></div>
    </div>`,

  fields: (b) => `<dl class="pb pb-fields" data-pb>${b.items
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('')}</dl>`,

  chips: (b) => `<div class="pb pb-chips" data-pb>${b.items.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>`,

  checks: (b) => `<div class="pb pb-checks" data-pb>
      ${b.title ? `<p class="pb-label">${esc(b.title)}</p>` : ''}
      <ul>${b.items
        .map((i) => `<li class="is-${i.state}">${stateIcon(i.state)}<span>${esc(i.label)}</span>${i.note ? `<em>${esc(i.note)}</em>` : ''}</li>`)
        .join('')}</ul>
    </div>`,

  steps: (b) => `<div class="pb pb-steps" data-pb>
      ${b.title ? `<p class="pb-label">${esc(b.title)}</p>` : ''}
      <ol>${b.items.map((i) => `<li class="is-${i.state}"><span class="step__bar"></span><span>${esc(i.label)}</span></li>`).join('')}</ol>
    </div>`,

  legs: (b) => `<ol class="pb pb-legs" data-pb>${b.items
    .map((i) => `<li class="is-${i.state}">${stateIcon(i.state)}<div><p>${esc(i.label)}</p><span>${esc(i.note)}</span></div></li>`)
    .join('')}</ol>`,

  breakdown: (b) => `<div class="pb pb-breakdown" data-pb>
      <dl>${b.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <div class="breakdown__total"><span>${esc(b.total[0])}</span><strong>${esc(b.total[1])}</strong></div>
    </div>`,

  alert: (b) => `<div class="pb pb-alert pb-alert--${b.tone || 'blue'}" data-pb>
      ${icon(b.tone === 'amber' ? 'alert' : 'info')}
      <div><p>${esc(b.title)}</p><span>${esc(b.body)}</span></div>
    </div>`,

  actions: (b) => `<div class="pb pb-actions" data-pb>${b.items
    .map((a) => `<span class="mock-btn${a.primary ? ' mock-btn--primary' : ''}">${esc(a.label)}</span>`)
    .join('')}</div>`,

  meter: (b) => `<div class="pb pb-meter" data-pb>
      <div class="meter__top"><span>${esc(b.label)}</span><strong>${esc(b.note)}</strong></div>
      <div class="meter__track"><span style="--v:${Number(b.value) || 0}"></span></div>
    </div>`,

  chat: (b) => `<div class="pb pb-chat" data-pb>${b.items
    .map((m) => `<div class="msg${m.me ? ' msg--me' : ''}"><span class="msg__from">${esc(m.from)}</span><p>${esc(m.text)}</p></div>`)
    .join('')}</div>`,

  slots: (b) => `<div class="pb pb-slots" data-pb>${b.items
    .map((s) => `<span class="slot slot--${s.state}"><b>${esc(s.time)}</b>${s.state === 'mine' ? 'Your load' : s.state === 'open' ? 'Open' : 'Booked'}</span>`)
    .join('')}</div>`,

  map: (b) => {
    // A small stylised route map. The truck marker sits at `progress` along the curve.
    const p0 = [24, 104], c1 = [96, 18], c2 = [196, 128], p3 = [276, 34];
    const t = Math.min(1, Math.max(0, b.progress ?? 0.5));
    const bz = (a, b2, c, d) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b2 + 3 * (1 - t) * t * t * c + t ** 3 * d;
    const x = bz(p0[0], c1[0], c2[0], p3[0]).toFixed(1);
    const y = bz(p0[1], c1[1], c2[1], p3[1]).toFixed(1);
    const d = `M${p0} C${c1} ${c2} ${p3}`;
    return `<div class="pb pb-map" data-pb>
      <svg viewBox="0 0 300 136" aria-hidden="true" focusable="false">
        <defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,.06)"/></pattern></defs>
        <rect width="300" height="136" fill="url(#g)"/>
        <path d="${d}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3" stroke-linecap="round"/>
        <path class="map__done" d="${d}" pathLength="1" style="--p:${t}" fill="none" stroke="#A6F24A" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${p0[0]}" cy="${p0[1]}" r="4" fill="#fff"/><circle cx="${p3[0]}" cy="${p3[1]}" r="4" fill="none" stroke="#fff" stroke-width="2"/>
        <circle class="map__pulse" cx="${x}" cy="${y}" r="10" fill="rgba(166,242,74,.25)"/><circle cx="${x}" cy="${y}" r="5" fill="#A6F24A"/>
      </svg>
      <div class="map__labels"><span>${esc(b.from)}</span><strong>${esc(b.eta)}</strong><span>${esc(b.to)}</span></div>
    </div>`;
  },
};

export function renderPanel(panel, id = '') {
  if (!panel) return '';
  const body = panel.blocks.map((b) => (blocks[b.type] ? blocks[b.type](b) : '')).join('');
  const phone = panel.variant === 'phone';
  return `<figure class="panel${phone ? ' panel--phone' : ''}" data-panel="${esc(id)}" aria-label="Illustrative interface: ${esc(panel.label)}">
    ${
      phone
        ? '<div class="panel__notch" aria-hidden="true"></div>'
        : `<div class="panel__chrome" aria-hidden="true"><span class="panel__dots"><i></i><i></i><i></i></span><span class="panel__app">HaulerHub · ${esc(panel.label)}</span></div>`
    }
    <div class="panel__body">${body}</div>
    <figcaption class="panel__caption">${esc(panel.caption)}</figcaption>
  </figure>`;
}
