/** Illustrative product UI panels, rendered from simple block specs in content.js. */
import { icon } from './icons.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const st = (s) => {
  if (s === 'done') return `<span class="st st--done">${icon('check')}</span>`;
  if (s === 'warn') return `<span class="st st--warn">!</span>`;
  if (s === 'active') return '<span class="st st--active"><i></i></span>';
  return '<span class="st st--pending"><i></i></span>';
};

const B = {
  checks: (b) => `<div class="ub">${b.title ? `<p class="ub__label">${esc(b.title)}</p>` : ''}<ul class="ub-checks">${b.items
    .map(([t, s]) => `<li class="is-${s}">${st(s)}<span>${esc(t)}</span></li>`)
    .join('')}</ul></div>`,
  rank: (b) => `<div class="ub"><p class="ub__label">Ranked after eligibility</p><ul class="ub-rank">${b.items
    .map(([t, v], i) => `<li><span class="ub-rank__n">0${i + 1}</span><span class="ub-rank__t">${esc(t)}</span><span class="ub-rank__bar"><i style="--v:${v / 100}"></i></span><b>${v}</b></li>`)
    .join('')}</ul></div>`,
  breakdown: (b) => `<div class="ub ub-box"><dl class="ub-kv">${b.rows
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('')}</dl><div class="ub-total"><span>${esc(b.total[0])}</span><strong>${esc(b.total[1])}</strong></div></div>`,
  kv: (b) => `<dl class="ub ub-grid">${b.items.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`,
  actions: (b) => `<div class="ub ub-actions">${b.items
    .map(([t, p]) => `<span class="ub-btn${p ? ' ub-btn--primary' : ''}">${esc(t)}</span>`)
    .join('')}</div>`,
  legs: (b) => `<ol class="ub ub-legs">${b.items
    .map(([t, n, s]) => `<li class="is-${s}">${st(s)}<div><p>${esc(t)}</p><span>${esc(n)}</span></div></li>`)
    .join('')}</ol>`,
  alert: (b) => `<div class="ub ub-alert">${icon('alert')}<div><p>${esc(b.title)}</p><span>${esc(b.body)}</span></div></div>`,
  steps: (b) => `<ol class="ub ub-steps">${b.items.map(([t, s]) => `<li class="is-${s}"><i></i><span>${esc(t)}</span></li>`).join('')}</ol>`,
  route: (b) => `<div class="ub ub-route"><div><span class="ub-route__dot"></span><b>${esc(b.from[0])}</b><span>${esc(b.from[1])}</span></div><div class="ub-route__line"><span>${esc(b.meta)}</span></div><div class="ub-route__to"><span class="ub-route__dot ub-route__dot--to"></span><b>${esc(b.to[0])}</b><span>${esc(b.to[1])}</span></div></div>`,
  chat: (b) => `<div class="ub ub-chat">${b.items
    .map(([who, t, me]) => `<div class="msg${me ? ' msg--me' : ''}"><span>${esc(who)}</span><p>${esc(t)}</p></div>`)
    .join('')}</div>`,
  slots: (b) => `<div class="ub ub-slots">${b.items
    .map(([t, s]) => `<span class="slot slot--${s}"><b>${esc(t)}</b>${s === 'mine' ? 'Your load' : s === 'open' ? 'Open' : 'Booked'}</span>`)
    .join('')}</div>`,
};

export function renderUI(ui) {
  if (!ui) return '';
  const [label, tone] = ui.status || [];
  return `<figure class="ui" aria-label="Illustrative interface: ${esc(ui.title)}">
    <div class="ui__bar" aria-hidden="true"><span class="ui__dots"><i></i><i></i><i></i></span><span class="ui__app">haulerhub</span></div>
    <div class="ui__head"><div><p class="ui__title">${esc(ui.title)}</p><p class="ui__meta">${esc(ui.meta)}</p></div>${label ? `<span class="pill pill--${tone}">${esc(label)}</span>` : ''}</div>
    <div class="ui__body">${ui.blocks.map((b) => (B[b.type] ? B[b.type](b) : '')).join('')}</div>
    <figcaption class="ui__cap">${esc(ui.caption)}</figcaption>
  </figure>`;
}
