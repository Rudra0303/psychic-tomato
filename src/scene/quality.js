/**
 * Quality tiers. Override with ?quality=high|medium|low in the URL.
 */
export function detectQuality() {
  const params = new URLSearchParams(location.search);
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 760 || window.innerWidth < 760;
  const mobile = (coarse && small) || window.innerWidth < 760;
  const cores = navigator.hardwareConcurrency || 4;
  const tier = params.get('quality') || (mobile ? 'low' : cores <= 4 ? 'medium' : 'high');
  const dpr = window.devicePixelRatio || 1;
  const presets = {
    high: { dpr: Math.min(dpr, 1.75), msaa: 4, bloom: true, reflections: true, shadow: 2048, port: true, traffic: true, lights: 3 },
    medium: { dpr: Math.min(dpr, 1.25), msaa: 2, bloom: true, reflections: false, shadow: 1024, port: true, traffic: true, lights: 3 },
    low: { dpr: Math.min(dpr, 1.5), msaa: 0, bloom: false, reflections: false, shadow: 1024, port: true, traffic: true, lights: 1 },
  };
  const Q = { tier, mobile: tier === 'low', ...(presets[tier] || presets.high) };
  Q.minDpr = Math.min(1, Q.dpr);
  return Q;
}
