const P = {
  arrow: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  arrowDown: '<path d="M12 4v15"/><path d="m6 13 6 6 6-6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  check: '<path d="M5 12.5 10 17 19 7"/>',
  alert: '<path d="M12 8v5"/><path d="M12 16.5h.01"/><circle cx="12" cy="12" r="9"/>',
  road: '<path d="M3 17h2l1.5-9h11L19 17h2"/><path d="M12 9v2"/><path d="M12 13v2"/>',
  truck: '<path d="M2 6h11v10H2z"/><path d="M13 9h4.5L21 12.5V16h-8"/><circle cx="6" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>',
  rail: '<rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 10h14"/><path d="m8 21 2-5"/><path d="m16 21-2-5"/>',
  sea: '<path d="M4 15h16l-2.5 4h-11z"/><path d="M7 15V9h10v6"/><path d="M12 9V5"/><path d="M2 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>',
  air: '<path d="M2 13.5 22 8l-7.5 7.5L12 21l-1-5.5z"/><path d="m11 15.5 3.5-3.5"/>',
  hub: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/>',
};

export function icon(name, cls = 'i') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || ''}</svg>`;
}

/** HaulerHub mark: a hub ring with four spokes (the modes) and a signal-orange core. */
export function mark(size = 26) {
  return `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="11.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M16 1.5v6M16 24.5v6M1.5 16h6M24.5 16h6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="16" r="4.6" fill="#FF5A1F"/></svg>`;
}

export function logo(cls = 'logo') {
  return `<span class="${cls}">${mark()}<span class="logo__word">HaulerHub</span></span>`;
}
