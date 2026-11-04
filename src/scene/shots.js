/**
 * Camera shots, in world metres. The rig faces +X: front bumper ~x=8.6, trailer rear ~x=-14.3,
 * roof ~y=4.1. +Z is the truck's right side (city skyline is far -Z, the port far +Z).
 *
 * pos / target: camera position and look-at point
 * fov: vertical field of view (auto-widened on portrait screens)
 * orbit: degrees the camera drifts around the truck while the shot is held
 * dolly: metres the camera pushes in while held
 * rise: metres the camera rises while held
 * m: optional overrides for phones (portrait), e.g. { targetY, fov, pos }
 */
export const PIVOT = [-3, 0, 0];

export const SHOTS = {
  hero: { pos: [25, 1.9, 12.5], target: [-1, 3.1, 4.6], fov: 30, orbit: 7, dolly: 4, rise: 0.6, m: { pos: [34, 6, 17], target: [-1, -3.4, 0], fov: 42 } },
  wide: { pos: [44, 30, 50], target: [-5, 4, -2], fov: 38, orbit: 12, dolly: 6, rise: 2, m: { fov: 58, target: [-4, 8, 0] } },
  connect: { pos: [30, 19, 38], target: [-4, 6.5, 0], fov: 40, orbit: 10, dolly: 4, rise: -1, m: { fov: 60, target: [-4, 6, 0] } },
  side: { pos: [-2, 4.2, 31], target: [-2, 4.6, 0], fov: 32, orbit: 8, dolly: 3, rise: 0.4, m: { pos: [-2, 6, 34], target: [-2, 3.2, 0], fov: 46 } },
  rearQuarter: { pos: [-31, 5.5, -17], target: [-7, 2.8, 1], fov: 33, orbit: 9, dolly: 3, rise: 0.5, m: { pos: [-34, 7, -22], target: [-5, 2.6, 0], fov: 50 } },
  cab: { pos: [10.5, 3.1, 9.5], target: [3.8, 2.7, 0], fov: 34, orbit: 10, dolly: 1.5, rise: 0.3, m: { pos: [16, 4, 13], target: [2, 2.6, 0], fov: 50 } },
  port: { pos: [-8, 15, -28], target: [4, 4.5, 26], fov: 40, orbit: 6, dolly: 3, rise: 1, m: { fov: 60, pos: [-10, 18, -32] } },
  rear: { pos: [-35, 3.2, 8.5], target: [-11, 2.7, -0.5], fov: 32, orbit: 8, dolly: 3, rise: 0.4, m: { pos: [-42, 4.5, 12], target: [-10, 2.6, 0], fov: 46 } },
  top: { pos: [12, 44, 16], target: [-3, 0, 0], fov: 36, orbit: 14, dolly: 6, rise: 0, m: { pos: [6, 58, 10], fov: 52 } },
  far: { pos: [74, 24, -58], target: [-3, 5, 0], fov: 30, orbit: 10, dolly: 10, rise: 4, m: { fov: 46 } },
  frontLow: { pos: [21, 1.3, -9.5], target: [-1, 3.2, -3.5], fov: 33, orbit: 8, dolly: 3, rise: 0.5, m: { pos: [28, 3, -14], target: [-1, 1.4, 0], fov: 44 } },
};
