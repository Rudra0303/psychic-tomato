/**
 * DOM layers that follow the 3D scene: persona node labels, the lime connector from the active
 * UI panel to its anchor on the truck, panel tilt/parallax and the payoff flow.
 */
import * as THREE from 'three';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function createOverlays({ stage, director, reduced }) {
  const labelsEl = document.querySelector('[data-labels]');
  const labels = labelsEl ? [...labelsEl.querySelectorAll('[data-node]')] : [];
  const svg = document.querySelector('[data-connector]');
  const path = svg?.querySelector('path');
  const [dot, ring] = svg ? svg.querySelectorAll('circle') : [];
  const sections = [...document.querySelectorAll('.moment[data-anchor]')];
  const flowSteps = [...document.querySelectorAll('[data-flow-step]')];
  const flow = document.querySelector('[data-flow]');
  const proj = { x: 0, y: 0, z: 0, visible: false };
  const lift = new THREE.Vector3();
  let conn = 0;
  let lastActive = null;
  let t = 0;

  return {
    update(dt) {
      t += dt;
      const net = stage.network;
      const st = director.state;

      // node labels
      labels.forEach((el) => {
        const n = net.nodes.find((x) => x.key === el.dataset.node);
        if (!n) return;
        lift.copy(n.pos);
        lift.y += 1.7 + n.hi * 0.4;
        stage.project(lift, proj);
        const vis = net.state.visible * (net.state.highlight ? (n.key === net.state.highlight ? 1 : 0) : 1);
        const op = proj.visible ? vis : 0;
        el.style.opacity = op.toFixed(3);
        el.style.transform = `translate3d(${proj.x.toFixed(1)}px, ${proj.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
        el.classList.toggle('is-on', net.state.gather > 0.5);
      });

      // active panel connector
      const y = window.scrollY;
      let active = null;
      for (const sec of sections) {
        const r = director.range(sec.id);
        if (r && y >= r[0] - director.vh * 0.1 && y <= r[1] + director.vh * 0.05) {
          active = sec;
          break;
        }
      }
      if (active !== lastActive) {
        conn = 0;
        lastActive = active;
      }
      const target = active ? 1 : 0;
      conn += (target - conn) * Math.min(1, dt * (target ? 1.6 : 6));
      if (svg && path) {
        if (active && conn > 0.002) {
          const panel = active.querySelector('.panel');
          const anchor = stage.truck.anchors[active.dataset.anchor];
          stage.project(anchor, proj);
          const r = panel.getBoundingClientRect();
          const op = parseFloat(getComputedStyle(panel.parentElement).opacity || '1');
          let sx;
          let sy;
          if (proj.x > r.right) {
            sx = r.right;
            sy = r.top + r.height * 0.38;
          } else if (proj.x < r.left) {
            sx = r.left;
            sy = r.top + r.height * 0.38;
          } else {
            sx = r.left + r.width / 2;
            sy = proj.y < r.top ? r.top : r.bottom;
          }
          const horiz = proj.x > r.right || proj.x < r.left;
          const dx = (proj.x - sx) * 0.5;
          const dy = (proj.y - sy) * 0.5;
          const c1 = horiz ? `${sx + dx},${sy}` : `${sx},${sy + dy}`;
          const c2 = horiz ? `${proj.x - dx},${proj.y}` : `${proj.x},${proj.y - dy}`;
          path.setAttribute('d', `M${sx.toFixed(1)},${sy.toFixed(1)} C${c1} ${c2} ${proj.x.toFixed(1)},${proj.y.toFixed(1)}`);
          path.setAttribute('pathLength', '1');
          const draw = clamp((conn - 0.25) / 0.6);
          path.style.strokeDashoffset = (1 - draw).toFixed(3);
          const vis = proj.visible && r.width > 0 ? Math.min(1, op) : 0;
          path.style.opacity = vis.toFixed(3);
          dot.setAttribute('cx', proj.x.toFixed(1));
          dot.setAttribute('cy', proj.y.toFixed(1));
          ring.setAttribute('cx', proj.x.toFixed(1));
          ring.setAttribute('cy', proj.y.toFixed(1));
          const pulse = (t * 0.8) % 1;
          dot.style.opacity = (vis * clamp((draw - 0.9) * 10)).toFixed(3);
          ring.style.opacity = (vis * clamp((draw - 0.9) * 10) * (1 - pulse)).toFixed(3);
          ring.setAttribute('r', (6 + pulse * 14).toFixed(1));
        } else {
          path.style.opacity = '0';
          dot.style.opacity = '0';
          ring.style.opacity = '0';
        }
      }

      // panel tilt + parallax
      if (!reduced) {
        const P = director.pointer;
        sections.forEach((sec) => {
          const panel = sec.querySelector('.panel');
          if (!panel) return;
          const right = sec.classList.contains('side-left');
          const base = window.innerWidth > 860 ? (right ? -9 : 9) : 0;
          panel.style.setProperty('--ry', `${(base + P.sx * 4).toFixed(2)}deg`);
          panel.style.setProperty('--rx', `${(-P.sy * 3 + 2).toFixed(2)}deg`);
          panel.style.setProperty('--px', `${(P.sx * -10).toFixed(1)}px`);
          panel.style.setProperty('--py', `${(P.sy * -8).toFixed(1)}px`);
        });
      }

      // payoff flow: steps light up as you scroll through the moment
      if (flow) {
        const p = director.progressOf('payoff');
        const k = reduced ? 1 : clamp((p - 0.12) / 0.5);
        flow.style.setProperty('--flow', k.toFixed(3));
        flowSteps.forEach((el, i) => el.classList.toggle('is-on', reduced || k >= i / (flowSteps.length - 1) - 0.001 && p > 0.1));
      }
    },
  };
}
