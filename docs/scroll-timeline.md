# Scroll timeline: "One shipment, one journey"

The landing page is one continuous scroll. Each moment is a tall section whose inner layer sticks
to the viewport, so copy holds still while you scroll through it. Between moments there is a
text-free gap of one viewport height where the camera travels to the next shot. Lengths are in
viewport heights (vh).

| # | Moment | Length | Camera shot | World / story | Copy and UI |
|---|--------|--------|-------------|---------------|-------------|
| 0 | Preloader | – | – | Scene builds, shaders compile | Navy screen, logomark, lime progress bar |
| 1 | Hero | 170vh | `hero`: low front three-quarter, headlights toward camera | Truck cruising, streetlights sweep over it | Headline, sub line, Book a demo, See how it works |
| 2 | Fragmentation | 380vh | `wide` (high, far) then `connect` (closer) | Five persona nodes drift apart, dim. Mid-way they gather, lime arcs draw from each node and lock onto the truck, then a ring links the nodes | Step A: the problem. Step B: one shipment record |
| 3–7 | Personas (Shipper, Carrier, Driver, Forwarder, Logistics) | 240vh each | `side`, `rearQuarter`, `cab`, `port`, `rear` | Truck slows a little. The persona's node is highlighted, others recede | Copy on one side, glass UI panel on the other, lime connector from the panel to a point on the truck |
| 8 | Payoff | 320vh | `top`: overhead crane shot | Truck rolls to a stop | Delivered → Proof verified → Charges reconciled → Payment confirmed, lit step by step as you scroll; four values |
| 9 | Statement | 180vh | `far`: wide pull-back | Truck moves off again | "One load. Every party. One system." + Book a demo |
| 10 | Closing (light) | normal flow | Canvas stops rendering once covered | – | Persona CTA cards, capabilities strip, placeholder figures, footer |

Persona switcher: fixed at the bottom from the end of the hero until the light section. It
smooth-scrolls (and flies the camera) to a persona moment and tracks the active one.

Persona pages reuse the same scene: hero (170vh) → three moments (220vh each) with panels →
light section (journey steps, features, CTA, other roles).

## Pacing rules

- Hold before you move: text only appears once the sticky layer has settled, and leaves before
  the camera travels.
- Camera transitions are eased in and out and arc around the truck (cylindrical interpolation)
  with a slight crane lift, never a straight cut through the rig.
- While a shot is held the camera keeps drifting slowly (orbit, dolly, rise), so nothing is ever
  fully static.
- Lenis smooths wheel input; the camera adds its own damping for weight.
