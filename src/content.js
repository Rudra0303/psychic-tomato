/**
 * HaulerHub site copy. EVERY word on the site lives in this file.
 *
 * Editing tips
 * - Change any string and the dev server reloads the page.
 * - `shot` values name camera positions in src/scene/shots.js.
 * - `anchor` values name points on the truck in src/scene/anchors.js (where a panel's
 *   connector line attaches).
 * - Anything marked PLACEHOLDER must be replaced or confirmed before launch.
 * - Panels are illustrative UI mockups built from simple blocks (see src/templates/panels.js).
 *   All panel values are sample data, not customer data.
 */

export const site = {
  name: 'HaulerHub',
  tagline: 'Where Freight Connects.',
  // PLACEHOLDER: set to the production domain so social previews resolve.
  url: 'https://haulerhub.example',
  description:
    'HaulerHub connects shippers, carriers, drivers, freight forwarders and logistics providers in one shared freight journey, from first requirement to final payment.',
  ogImage: 'og-image.png',
  themeColor: '#07111C',
};

export const links = {
  // PLACEHOLDER: point these at the real demo booking and sign-up flows.
  demo: 'mailto:demo@haulerhub.example?subject=HaulerHub%20demo%20request',
  getStarted: 'mailto:hello@haulerhub.example?subject=Get%20started%20with%20HaulerHub',
};

export const nav = {
  menuLabel: 'Solutions',
  howItWorks: 'How it works',
  demo: 'Book a demo',
  skip: 'Skip to content',
};

/** Order matters: it is the order of the persona switcher and menus. */
export const personaOrder = ['shipper', 'carrier', 'driver', 'forwarder', 'logistics'];

export const personas = {
  shipper: {
    label: 'Shipper',
    plural: 'Shippers',
    slug: 'shippers',
    menuNote: 'Post loads, compare fit, see every cost',
    node: 'Shipper',
  },
  carrier: {
    label: 'Carrier',
    plural: 'Carriers',
    slug: 'carriers',
    menuNote: 'Fleets and owner-operators',
    node: 'Carrier',
  },
  driver: {
    label: 'Driver',
    plural: 'Drivers',
    slug: 'drivers',
    menuNote: 'Trips, proof and support in one app',
    node: 'Driver',
  },
  forwarder: {
    label: 'Forwarder',
    plural: 'Freight forwarders',
    slug: 'forwarders',
    menuNote: 'Multi-leg, multimodal, cross-border',
    node: 'Forwarder',
  },
  logistics: {
    label: 'Logistics',
    plural: 'Logistics providers',
    slug: 'logistics-providers',
    menuNote: 'Warehousing, customs, agents, services',
    node: 'Logistics provider',
  },
};

/* ------------------------------------------------------------------------------------------
 * Illustrative product UI panels. Block types: header, route, fields, chips, checks, steps,
 * legs, breakdown, alert, actions, map, chat, slots, meter. See src/templates/panels.js.
 * ---------------------------------------------------------------------------------------- */
const caption = 'Illustrative interface · sample data';

export const panels = {
  shipperPost: {
    label: 'Load posting',
    caption,
    blocks: [
      { type: 'header', title: 'New load', meta: 'LD-20418 · Draft', status: { label: 'Ready to post', tone: 'lime' } },
      { type: 'route', from: { city: 'Joliet, IL', sub: 'Pickup · Nov 12, 08:00–10:00' }, to: { city: 'Columbus, OH', sub: 'Delivery · Nov 13 by 14:00' }, meta: '355 mi' },
      { type: 'fields', items: [['Equipment', "53' dry van"], ['Weight', '38,500 lb'], ['Commodity', 'Packaged goods'], ['Handling', 'Floor-loaded']] },
      { type: 'chips', items: ['Appointment required', 'No hazmat', 'Dock high', 'Seal on departure'] },
      { type: 'steps', title: 'Qualifying capacity', items: [{ label: 'Equipment', state: 'done' }, { label: 'Authority', state: 'done' }, { label: 'Lane', state: 'done' }, { label: 'Availability', state: 'active' }] },
      { type: 'actions', items: [{ label: 'Save draft' }, { label: 'Post load', primary: true }] },
    ],
  },
  shipperMatches: {
    label: 'Qualified providers',
    caption,
    blocks: [
      { type: 'header', title: 'Qualified providers', meta: 'LD-20418 · 4 eligible', status: { label: 'Explained', tone: 'blue' } },
      { type: 'checks', title: 'Why Northline Freight fits', items: [{ label: "53' dry van registered", state: 'done' }, { label: 'Authority and cargo insurance on file', state: 'done' }, { label: 'Runs Joliet → Columbus weekly', state: 'done' }, { label: 'Confirm dock appointment', state: 'warn' }] },
      { type: 'breakdown', rows: [['Provider charge', '$1,450.00'], ['Shipper fee', '$101.50'], ['Accessorials', 'None yet']], total: ['Total before booking', '$1,551.50'] },
      { type: 'actions', items: [{ label: 'Compare 3 more' }, { label: 'Agree and book', primary: true }] },
    ],
  },
  shipperTrack: {
    label: 'Live tracking',
    caption,
    blocks: [
      { type: 'header', title: 'In transit', meta: 'LD-20418 · Northline Freight', status: { label: 'On plan', tone: 'lime' } },
      { type: 'map', progress: 0.62, from: 'Joliet', to: 'Columbus', eta: 'ETA 13:20' },
      { type: 'legs', items: [{ label: 'Picked up · seal 4471902', note: 'Nov 12 · 08:42', state: 'done' }, { label: 'Crossed into Indiana', note: '10:15', state: 'done' }, { label: 'Delivery appointment', note: 'Nov 13 · 14:00', state: 'active' }] },
      { type: 'alert', tone: 'blue', title: 'ETA updated', body: 'Weather near Indianapolis. New ETA shared with the receiver.' },
    ],
  },

  carrierMatch: {
    label: 'Bid and book',
    caption,
    blocks: [
      { type: 'header', title: 'Load fits your fleet', meta: 'Joliet → Columbus · 355 mi', status: { label: 'Match', tone: 'lime' } },
      { type: 'checks', title: 'Why it fits', items: [{ label: "Equipment: 53' dry van, unit 214", state: 'done' }, { label: 'Lane: in your preferred network', state: 'done' }, { label: 'Credentials: all current', state: 'done' }, { label: 'Pickup window: confirm by 16:00', state: 'warn' }] },
      { type: 'breakdown', rows: [['Your rate', '$1,450.00'], ['Est. cost to run', '−$1,012.00'], ['Provider fee', '−$101.50']], total: ['Est. margin', '$336.50'] },
      { type: 'actions', items: [{ label: 'Counter offer' }, { label: 'Accept and book', primary: true }] },
    ],
  },
  carrierDispatch: {
    label: 'Dispatch board',
    caption,
    blocks: [
      { type: 'header', title: 'Dispatch', meta: 'Today · 6 units', status: { label: '2 need a driver', tone: 'amber' } },
      { type: 'legs', items: [{ label: 'Unit 214 · M. Alvarez', note: 'LD-20418 · Joliet → Columbus', state: 'done' }, { label: 'Unit 208 · R. Okafor', note: 'LD-20433 · Gary → Detroit', state: 'done' }, { label: 'Unit 221 · Unassigned', note: 'LD-20440 · Aurora → St. Louis', state: 'warn' }] },
      { type: 'meter', label: 'Fleet capacity booked this week', value: 0.74, note: '74%' },
      { type: 'actions', items: [{ label: 'View lanes' }, { label: 'Assign driver', primary: true }] },
    ],
  },
  carrierSettle: {
    label: 'Invoice and settlement',
    caption,
    blocks: [
      { type: 'header', title: 'Invoice INV-7731', meta: 'LD-20418 · Delivered', status: { label: 'Approved', tone: 'lime' } },
      { type: 'checks', title: 'Evidence attached', items: [{ label: 'Signed proof of delivery', state: 'done' }, { label: '4 condition photos', state: 'done' }, { label: 'Detention: 1h approved by shipper', state: 'done' }] },
      { type: 'breakdown', rows: [['Linehaul', '$1,450.00'], ['Detention (approved)', '$75.00'], ['Provider fee', '−$106.75']], total: ['Net to you', '$1,418.25'] },
      { type: 'steps', items: [{ label: 'Submitted', state: 'done' }, { label: 'Reconciled', state: 'done' }, { label: 'Paid', state: 'active' }] },
    ],
  },

  driverTrip: {
    label: 'Driver app',
    variant: 'phone',
    caption,
    blocks: [
      { type: 'header', title: 'Today’s trip', meta: 'LD-20418 · Unit 214', status: { label: 'Checked in', tone: 'lime' } },
      { type: 'legs', items: [{ label: 'Joliet DC · Dock 14', note: 'Pickup 08:30 · ref PO-55120', state: 'done' }, { label: 'Columbus DC · Door 3', note: 'Deliver by 14:00 tomorrow', state: 'active' }] },
      { type: 'fields', items: [['Drive time left', '6h 40m'], ['Next break', 'in 2h 10m']] },
      { type: 'checks', items: [{ label: 'Seal 4471902 photographed', state: 'done' }, { label: 'Bill of lading signed', state: 'done' }, { label: 'Cargo photos 3 of 4', state: 'active' }] },
      { type: 'actions', items: [{ label: 'Capture proof', primary: true }] },
    ],
  },
  driverProof: {
    label: 'Proof of delivery',
    variant: 'phone',
    caption,
    blocks: [
      { type: 'header', title: 'Deliver', meta: 'Columbus DC · Door 3', status: { label: 'Arrived 13:12', tone: 'blue' } },
      { type: 'checks', title: 'Before you close the trip', items: [{ label: 'Seal intact: 4471902', state: 'done' }, { label: 'Receiver signature', state: 'done' }, { label: 'Condition photos 4 of 4', state: 'done' }, { label: 'Shortage or damage', state: 'none', note: 'None reported' }] },
      { type: 'actions', items: [{ label: 'Close trip', primary: true }] },
    ],
  },
  driverSupport: {
    label: 'Report a problem',
    variant: 'phone',
    caption,
    blocks: [
      { type: 'header', title: 'Trip chat', meta: 'Dispatch · Shipper · Receiver', status: { label: 'Shared', tone: 'lime' } },
      { type: 'chat', items: [{ from: 'You', text: 'Dock 14 is blocked. Told to wait 45 min.', me: true }, { from: 'Dispatch', text: 'Logged as a delay. Detention clock started.' }, { from: 'Shipper', text: 'Moving you to Dock 9. 10 minutes.' }] },
      { type: 'actions', items: [{ label: 'Add photo' }, { label: 'Send update', primary: true }] },
    ],
  },

  forwarderJourney: {
    label: 'Documents and customs',
    caption,
    blocks: [
      { type: 'header', title: 'Journey FJ-3302', meta: 'Chicago → Tashkent · 4 legs', status: { label: 'Docs 4 of 6', tone: 'amber' } },
      { type: 'legs', items: [{ label: 'Road · Chicago → New York', note: 'Delivered to port', state: 'done' }, { label: 'Ocean · New York → Istanbul', note: 'In transit', state: 'active' }, { label: 'Road · Istanbul → Baku', note: 'Agent confirmed', state: 'pending' }, { label: 'Customs · Tashkent', note: 'Awaiting certificate', state: 'warn' }] },
      { type: 'checks', title: 'Trade documents', items: [{ label: 'Commercial invoice', state: 'done' }, { label: 'Bill of lading', state: 'done' }, { label: 'Certificate of origin', state: 'warn' }] },
    ],
  },
  forwarderDocs: {
    label: 'Procurement',
    caption,
    blocks: [
      { type: 'header', title: 'Tender · Leg 3', meta: 'Istanbul → Baku · road', status: { label: '3 offers', tone: 'blue' } },
      { type: 'breakdown', rows: [['Agent A · 6 days', '$4,180'], ['Agent B · 5 days', '$4,420'], ['Agent C · 7 days', '$3,960']], total: ['Selected', 'Agent B'] },
      { type: 'checks', items: [{ label: 'Operates in both jurisdictions', state: 'done' }, { label: 'Cargo insurance confirmed', state: 'done' }, { label: 'Handoff evidence required', state: 'done' }] },
      { type: 'actions', items: [{ label: 'Compare' }, { label: 'Confirm leg', primary: true }] },
    ],
  },
  forwarderDelay: {
    label: 'Exception impact',
    caption,
    blocks: [
      { type: 'header', title: 'Vessel delayed', meta: 'Leg 2 · New York → Istanbul', status: { label: '+2 days', tone: 'amber' } },
      { type: 'alert', tone: 'amber', title: '2 later legs affected', body: 'Road pickup in Istanbul and Tashkent customs appointment need new dates.' },
      { type: 'legs', items: [{ label: 'Istanbul pickup', note: 'Nov 21 → Nov 23 · agent notified', state: 'done' }, { label: 'Customs slot', note: 'Rebook requested', state: 'active' }, { label: 'Revised cost', note: '+$180 storage · awaiting approval', state: 'warn' }] },
      { type: 'actions', items: [{ label: 'Review' }, { label: 'Confirm new plan', primary: true }] },
    ],
  },

  providerOrder: {
    label: 'Work order and evidence',
    caption,
    blocks: [
      { type: 'header', title: 'Cross-dock WO-118', meta: 'Joliet, IL · LD-20418', status: { label: 'In progress', tone: 'blue' } },
      { type: 'checks', title: 'Agreed scope', items: [{ label: 'Unload and count · 26 pallets', state: 'done' }, { label: 'Re-label for Columbus DC', state: 'done' }, { label: 'Load out to carrier', state: 'active' }] },
      { type: 'legs', items: [{ label: 'Inbound handoff', note: '08:42 · 26 pallets · photos', state: 'done' }, { label: 'Outbound handoff', note: 'Door 6 · 11:30', state: 'pending' }] },
      { type: 'actions', items: [{ label: 'Add evidence' }, { label: 'Invoice', primary: true }] },
    ],
  },
  providerSlots: {
    label: 'Appointments',
    caption,
    blocks: [
      { type: 'header', title: 'Dock schedule', meta: 'Thu · Joliet cross-dock', status: { label: '3 open', tone: 'lime' } },
      { type: 'slots', items: [{ time: '07:00', state: 'busy' }, { time: '08:30', state: 'mine' }, { time: '10:00', state: 'open' }, { time: '11:30', state: 'busy' }, { time: '13:00', state: 'open' }, { time: '14:30', state: 'open' }] },
      { type: 'fields', items: [['Doors', '8 of 12 in use'], ['Labor', '2 crews']] },
      { type: 'actions', items: [{ label: 'Block time' }, { label: 'Confirm slot', primary: true }] },
    ],
  },
  providerInvoice: {
    label: 'Service invoice',
    caption,
    blocks: [
      { type: 'header', title: 'Invoice SV-2290', meta: 'WO-118 · Cross-dock', status: { label: 'Matched to scope', tone: 'lime' } },
      { type: 'breakdown', rows: [['Handling · 26 pallets', '$468.00'], ['Re-labeling', '$130.00'], ['Storage (approved)', '$60.00']], total: ['Invoice total', '$658.00'] },
      { type: 'steps', items: [{ label: 'Evidence', state: 'done' }, { label: 'Approved', state: 'done' }, { label: 'Paid', state: 'active' }] },
    ],
  },
};

/* ------------------------------------------------------------------------------------------
 * Landing page: "One shipment, one journey"
 * ---------------------------------------------------------------------------------------- */
export const landing = {
  meta: {
    title: 'HaulerHub · Where Freight Connects',
    description: site.description,
  },
  hero: {
    shot: 'hero',
    eyebrow: 'The connected freight platform',
    title: ['Many parties move freight.', 'HaulerHub makes them work as one.'],
    body: 'Shippers, carriers, drivers, forwarders and logistics providers on one shared journey. From first requirement to final payment.',
    primary: { label: 'Book a demo', href: 'demo' },
    secondary: { label: 'See how it works', href: '#fragment' },
    scrollHint: 'Scroll to follow the load',
  },
  fragment: {
    shot: 'wide',
    shotB: 'connect',
    a: {
      eyebrow: 'The problem',
      title: 'Freight touches many hands. Rarely the same picture.',
      body: 'Calls, emails, portals and spreadsheets. Every handoff is a place where status, documents and costs drift apart.',
    },
    b: {
      eyebrow: 'The HaulerHub way',
      title: 'One shipment record. Every party connected.',
      body: 'Requirements, responsibilities, milestones, documents and costs stay together. Access follows each participant’s role.',
    },
  },
  // One moment per persona. Panel ids reference `panels` above.
  personas: {
    shipper: {
      shot: 'side',
      anchor: 'trailerMid',
      side: 'left',
      eyebrow: 'For shippers',
      title: 'Your freight. Your visibility.',
      points: [
        ['Post once, in full detail.', 'Lanes, dates, equipment, temperature, hazmat and site access in one load brief.'],
        ['See why a provider fits.', 'Qualified matches arrive with their reasons, not just a rate.'],
        ['Know the total before you book.', 'Provider charge, fees, accessorials and terms, side by side.'],
      ],
      cta: { label: 'Post a load', page: 'shipper' },
      panel: 'shipperPost',
    },
    carrier: {
      shot: 'rearQuarter',
      anchor: 'trailerRear',
      side: 'right',
      eyebrow: 'For carriers and owner-operators',
      title: 'Build a stronger freight business.',
      points: [
        ['Freight that fits your fleet.', 'Loads matched to your equipment, lanes, credentials and capacity.'],
        ['Price on your real costs.', 'Know your cost to run before you bid. Set your own accessorial rules.'],
        ['Book, dispatch, get paid.', 'Accept terms, assign a driver and invoice from the same record.'],
      ],
      cta: { label: 'Find freight', page: 'carrier' },
      panel: 'carrierMatch',
    },
    driver: {
      shot: 'cab',
      anchor: 'door',
      side: 'left',
      eyebrow: 'For drivers',
      title: 'A clearer day on the road.',
      points: [
        ['The whole trip in your pocket.', 'Assignment, facility instructions, references and hours-aware planning.'],
        ['Proof in a few taps.', 'Seals, photos, signatures and cargo condition at every stop.'],
        ['Problems reach the right people.', 'Report a delay once. Dispatch, shipper and receiver all see it.'],
      ],
      cta: { label: 'Start driving with HaulerHub', page: 'driver' },
      panel: 'driverTrip',
    },
    forwarder: {
      shot: 'port',
      anchor: 'roof',
      side: 'right',
      eyebrow: 'For freight forwarders',
      title: 'Global complexity. Clear control.',
      points: [
        ['Design the whole journey.', 'Multi-leg, multimodal moves with a clear owner for every leg.'],
        ['Documents ready before the border.', 'Trade documents and customs readiness tracked leg by leg.'],
        ['See what a delay changes.', 'When one leg slips, see the impact downstream and confirm the new plan.'],
      ],
      cta: { label: 'Plan a journey', page: 'forwarder' },
      panel: 'forwarderJourney',
    },
    logistics: {
      shot: 'rear',
      anchor: 'rearDoors',
      side: 'left',
      eyebrow: 'For logistics providers',
      title: 'Your expertise. A connected network.',
      points: [
        ['A storefront for what you really do.', 'Warehousing, customs, agent and specialist services, by area and capability.'],
        ['Scope and price agreed upfront.', 'Receive suitable work. Confirm scope and rates before anything moves.'],
        ['Evidence that closes the loop.', 'Capture each handoff, then invoice from the same record.'],
      ],
      cta: { label: 'List your services', page: 'logistics' },
      panel: 'providerOrder',
    },
  },
  payoff: {
    shot: 'top',
    eyebrow: 'Delivery',
    title: 'Delivered. Proven. Paid.',
    body: 'Proof of delivery, reconciliation and payment confirmed in one flow. Nobody chasing paperwork.',
    flow: [
      { label: 'Delivered', note: 'Columbus DC · 13:12' },
      { label: 'Proof verified', note: 'Signature, seal, 4 photos' },
      { label: 'Charges reconciled', note: 'Approved items only' },
      { label: 'Payment confirmed', note: 'Every party notified' },
    ],
    flowCaption: 'Illustrative flow · sample data',
    values: [
      ['Clarity', 'Everyone knows what happens next.'],
      ['Control', 'Approval before consequence.'],
      ['Transparency', 'See the rate. See the fees.'],
      ['Confidence', 'Evidence at every handoff.'],
    ],
  },
  statement: {
    shot: 'far',
    title: ['One load.', 'Every party.', 'One system.'],
    body: 'Less friction. More forward.',
    primary: { label: 'Book a demo', href: 'demo' },
  },
  closing: {
    eyebrow: 'Start where you work',
    title: 'Built for your role. Ready when you are.',
    body: 'Pick your seat in the journey. Every role gets its own tools on the same shared record.',
    cards: {
      shipper: { title: 'Ship with full visibility', cta: 'Post a load' },
      carrier: { title: 'Fill your trucks with freight that fits', cta: 'Find freight' },
      driver: { title: 'Run a clearer day on the road', cta: 'Get the driver app' },
      forwarder: { title: 'Control every leg of the journey', cta: 'Plan a journey' },
      logistics: { title: 'Plug your services into the network', cta: 'List your services' },
    },
    demo: { title: 'Run a fleet or a freight team?', body: 'See HaulerHub on your own lanes and workflows.', cta: 'Book a demo' },
  },
};

/** Shown in the capabilities strip on every page. */
export const capabilities = {
  title: 'Powerful underneath. Simple on the surface.',
  items: [
    ['Capability-based matching', 'Qualify first. Rank second.'],
    ['Configurable pricing', 'Rates, fees and accessorials in view.'],
    ['Visibility and exceptions', 'See the next step and who owns it.'],
    ['Documents and evidence', 'Proof attached to every handoff.'],
    ['Permissions and governance', 'Access follows each role.'],
    ['Integration architecture', 'Built to connect your systems.'],
  ],
  // PLACEHOLDER figures: catalog counts as stated on the current site. Confirm before launch.
  figures: [
    { value: 21, label: 'Connected services' },
    { value: 13, label: 'Equipment categories' },
    { value: 5, label: 'Roles, one platform' },
    { value: 1, label: 'Shared shipment record' },
  ],
  figuresNote: 'Placeholder figures: catalog counts to confirm before launch.',
};

export const footer = {
  line: 'Many parties move freight. HaulerHub makes them work as one.',
  location: 'Chicago, Illinois, United States',
  company: 'ForwardNow LLC · ITF Group of Companies',
  copyright: '© 2026 HaulerHub',
  disclaimer:
    'Product interfaces on this site are illustrative and show sample data. Capabilities shown may be in development; availability varies.',
};

/* ------------------------------------------------------------------------------------------
 * Persona pages. Each is a shorter scroll journey using the same truck scene.
 * ---------------------------------------------------------------------------------------- */
export const pages = {
  shipper: {
    meta: {
      title: 'HaulerHub for Shippers · Your freight. Your visibility.',
      description: 'Post detailed loads, review qualified providers and see every cost before you book. Track milestones, proof of delivery and claims in one record.',
    },
    hero: {
      shot: 'frontLow',
      eyebrow: 'HaulerHub for shippers',
      title: ['Your freight.', 'Your visibility.'],
      body: 'Define the load once. See who qualifies and why. Know the full cost before you commit, and follow every milestone to proof of delivery.',
      primary: { label: 'Post a load', href: 'start' },
      secondary: { label: 'Book a demo', href: 'demo' },
    },
    moments: [
      { shot: 'side', anchor: 'trailerMid', side: 'left', eyebrow: '01 · Plan', title: 'Requirements first.', body: 'Origin, destination, commodity, weight, dates, equipment, temperature, hazmat and site access. Everything a provider needs, in one brief.', points: ['Facility and appointment details in the same record', 'Pickup references shared with the right people'], panel: 'shipperPost' },
      { shot: 'rearQuarter', anchor: 'trailerRear', side: 'right', eyebrow: '02 · Match and book', title: 'A match you can understand.', body: 'Only qualified capacity becomes booking-ready. Each match shows why it fits, and what it costs, before you agree.', points: ['Provider charge, shipper fee and accessorials in view', 'Mandatory requirements are never relaxed silently'], panel: 'shipperMatches' },
      { shot: 'top', anchor: 'roof', side: 'left', eyebrow: '03 · Move and settle', title: 'One shipment. One shared picture.', body: 'Milestones, changed ETAs and exceptions reach everyone involved. Proof of delivery, claims and approved charges close the loop.', points: ['Damage and shortage claims tied to evidence', 'Reconcile against approved charges only'], panel: 'shipperTrack' },
    ],
    features: [
      ['Shipment planning', 'Every requirement captured before anyone quotes.'],
      ['Capability-based matching', 'Equipment, compliance, lane and availability checked first.'],
      ['Quote and charge visibility', 'See the rate. See the fees.'],
      ['Appointments and facilities', 'Docks, windows and references in one place.'],
      ['Tracking and exceptions', 'Changed ETAs with an owner for every issue.'],
      ['Documents, delivery and claims', 'Proof of delivery and claims tied to the record.'],
    ],
    cta: { title: 'Ship with full visibility.', body: 'Post your first load, or see HaulerHub on your own lanes.', primary: { label: 'Post a load', href: 'start' }, secondary: { label: 'Book a demo', href: 'demo' } },
  },
  carrier: {
    meta: {
      title: 'HaulerHub for Carriers · Build a stronger freight business.',
      description: 'Find freight that fits your equipment, lanes and credentials. Price on your real costs, dispatch drivers and get paid with evidence attached.',
    },
    hero: {
      shot: 'rearQuarter',
      eyebrow: 'HaulerHub for carriers and owner-operators',
      title: ['Build a stronger', 'freight business.'],
      body: 'Freight matched to what your trucks can really do. Clear terms, clear costs, and invoices backed by evidence.',
      primary: { label: 'Find freight', href: 'start' },
      secondary: { label: 'Book a demo', href: 'demo' },
    },
    moments: [
      { shot: 'side', anchor: 'trailerMid', side: 'left', eyebrow: '01 · Find', title: 'Know why a load fits.', body: 'Matching explains why a load fits your fleet, or which qualification is missing. No guesswork, no wasted calls.', points: ['Equipment and operating profiles you control', 'Preferred lanes and capacity windows'], panel: 'carrierMatch' },
      { shot: 'cab', anchor: 'door', side: 'right', eyebrow: '02 · Run', title: 'Dispatch from the same record.', body: 'Accept terms, assign the right driver and truck, and keep every milestone attached to the load.', points: ['Drivers get instructions without a phone chain', 'Exceptions logged with an owner'], panel: 'carrierDispatch' },
      { shot: 'rear', anchor: 'rearDoors', side: 'left', eyebrow: '03 · Get paid', title: 'Invoices that arrive with proof.', body: 'Proof of delivery, photos and approved accessorials travel with the invoice, so settlement is a check, not a dispute.', points: ['Detention and accessorials approved in the flow', 'Performance history you can stand behind'], panel: 'carrierSettle' },
    ],
    features: [
      ['Business and equipment profile', 'Show what you run and where.'],
      ['Operating-cost intelligence', 'Know your cost to run before you bid.'],
      ['Rate and accessorial controls', 'Your pricing rules, applied every time.'],
      ['Capacity and freight discovery', 'Loads that fit, ranked after eligibility.'],
      ['Dispatch, drivers and fleet', 'Assign and follow every unit.'],
      ['Invoicing and settlement evidence', 'Get paid on documented work.'],
    ],
    cta: { title: 'Fill your trucks with freight that fits.', body: 'Set up your fleet profile, or talk to us about your operation.', primary: { label: 'Find freight', href: 'start' }, secondary: { label: 'Book a demo', href: 'demo' } },
  },
  driver: {
    meta: {
      title: 'HaulerHub for Drivers · A clearer day on the road.',
      description: 'Trip and facility instructions, hours-aware planning, pickup and delivery proof, and support that reaches the right people.',
    },
    hero: {
      shot: 'cab',
      eyebrow: 'HaulerHub for drivers',
      title: ['A clearer day', 'on the road.'],
      body: 'Know where you are going, what is expected at the dock, and who to tell when something changes. All in one app.',
      primary: { label: 'Get started', href: 'start' },
      secondary: { label: 'For fleet owners', href: 'page:carrier' },
    },
    moments: [
      { shot: 'frontLow', anchor: 'door', side: 'left', eyebrow: '01 · Before you roll', title: 'The trip, already sorted.', body: 'Assignment, facility instructions, references and hours-aware planning ready before you leave the yard.', points: ['Confirm identity, credentials and assignment', 'Dock, door and appointment details up front'], panel: 'driverTrip' },
      { shot: 'side', anchor: 'trailerMid', side: 'right', eyebrow: '02 · On the road', title: 'Say it once. Everyone hears it.', body: 'Report a delay, a blocked dock or a problem with the load. Dispatch, shipper and receiver see the same update.', points: ['Custody and relay handoffs coordinated', 'Support when you need it'], panel: 'driverSupport' },
      { shot: 'rear', anchor: 'rearDoors', side: 'left', eyebrow: '03 · At delivery', title: 'Close the trip with proof.', body: 'Seal checks, condition photos and signatures captured in a few taps, so nobody questions the delivery later.', points: ['Damage and shortage recorded on the spot', 'Trip closed, evidence shared'], panel: 'driverProof' },
    ],
    features: [
      ['Profile and credentials', 'Your qualifications, ready to share.'],
      ['Trip and facility information', 'Instructions before you arrive.'],
      ['Hours-aware trip planning', 'Plans that respect your clock.'],
      ['Pickup and delivery evidence', 'Seals, photos and signatures.'],
      ['Custody and relay coordination', 'Clean handoffs between drivers.'],
      ['Communication and support', 'One channel, the right people.'],
    ],
    cta: { title: 'Run a clearer day on the road.', body: 'Get started with HaulerHub, or ask your carrier to connect you.', primary: { label: 'Get started', href: 'start' }, secondary: { label: 'Book a demo', href: 'demo' } },
  },
  forwarder: {
    meta: {
      title: 'HaulerHub for Freight Forwarders · Global complexity. Clear control.',
      description: 'Design multi-leg, multimodal journeys, procure every leg, keep trade documents ready and see the impact of every delay.',
    },
    hero: {
      shot: 'port',
      eyebrow: 'HaulerHub for freight forwarders',
      title: ['Global complexity.', 'Clear control.'],
      body: 'A journey with many legs and one chain of responsibility. Plan it, procure it, document it and keep it on course.',
      primary: { label: 'Plan a journey', href: 'start' },
      secondary: { label: 'Book a demo', href: 'demo' },
    },
    moments: [
      { shot: 'wide', anchor: 'roof', side: 'right', eyebrow: '01 · Design', title: 'Every leg has an owner.', body: 'Countries, modes, customs, insurance and responsibilities mapped before the first pickup. One leg should not be a blind spot.', points: ['Road, ocean, air and rail in one plan', 'Handoff evidence required at each border'], panel: 'forwarderJourney' },
      { shot: 'rearQuarter', anchor: 'trailerRear', side: 'left', eyebrow: '02 · Procure', title: 'Compare agents on the same terms.', body: 'Tender each leg, compare offers on price, timing and qualifications, and confirm with the documents attached.', points: ['Jurisdiction-aware matching', 'Partner and agent network in one view'], panel: 'forwarderDocs' },
      { shot: 'top', anchor: 'roof', side: 'right', eyebrow: '03 · Recover', title: 'A delay changes the plan. Everyone sees how.', body: 'Detect the impact, coordinate recovery and confirm the new plan, with revised costs approved before they land.', points: ['Dependencies between legs made visible', 'Final reconciliation across the journey'], panel: 'forwarderDelay' },
    ],
    features: [
      ['Multi-leg shipment design', 'One journey, many modes.'],
      ['Tender and contract procurement', 'Compare offers leg by leg.'],
      ['Partner and agent network', 'Local knowledge, connected.'],
      ['Jurisdiction-aware matching', 'Qualified for each country and border.'],
      ['Trade documents and readiness', 'Prepare the crossing before arrival.'],
      ['Journey economics and exceptions', 'Revised costs, approved in context.'],
    ],
    cta: { title: 'Control every leg of the journey.', body: 'Plan your next multi-leg move, or see HaulerHub on a live lane of yours.', primary: { label: 'Plan a journey', href: 'start' }, secondary: { label: 'Book a demo', href: 'demo' } },
  },
  logistics: {
    meta: {
      title: 'HaulerHub for Logistics Providers · Your expertise. A connected network.',
      description: 'Bring warehousing, customs, agent and specialist services into connected shipment plans. Agree scope, coordinate handoffs, capture evidence and invoice.',
    },
    hero: {
      shot: 'rear',
      eyebrow: 'HaulerHub for logistics providers',
      title: ['Your expertise.', 'A connected network.'],
      body: 'Warehouses, cross-docks, customs brokers, agents and specialists. Plug your services into full shipment plans and get work that fits.',
      primary: { label: 'List your services', href: 'start' },
      secondary: { label: 'Book a demo', href: 'demo' },
    },
    moments: [
      { shot: 'side', anchor: 'trailerMid', side: 'right', eyebrow: '01 · Offer', title: 'Define work before confirmation.', body: 'Set your service area and capability, receive suitable work and agree scope and price before anything arrives.', points: ['A storefront for your real services', 'Pricing tied to agreed scope'], panel: 'providerOrder' },
      { shot: 'frontLow', anchor: 'door', side: 'left', eyebrow: '02 · Coordinate', title: 'Appointments that line up.', body: 'Slots, doors and crews coordinated with the carriers and shippers on the same shipment.', points: ['Capacity visible to the right partners', 'Exceptions and approvals in context'], panel: 'providerSlots' },
      { shot: 'rear', anchor: 'rearDoors', side: 'right', eyebrow: '03 · Close', title: 'Evidence at handoff. Invoices that match.', body: 'Capture service proof at every handoff, then invoice against the agreed scope.', points: ['Approved extras only', 'Performance you can show'], panel: 'providerInvoice' },
    ],
    features: [
      ['Service storefront', 'Show what you do, and where.'],
      ['Work scope and pricing', 'Agree before anything moves.'],
      ['Appointment and capacity coordination', 'Doors, slots and crews in sync.'],
      ['Handoff and service evidence', 'Proof at every exchange.'],
      ['Exceptions and approvals', 'Changes approved in context.'],
      ['Invoices and performance', 'Bill on documented work.'],
    ],
    cta: { title: 'Plug your services into the network.', body: 'List your services, or talk to us about your facilities.', primary: { label: 'List your services', href: 'start' }, secondary: { label: 'Book a demo', href: 'demo' } },
  },
};

/** Shared journey steps shown on persona pages. */
export const journey = {
  title: 'From first quote. To final payment.',
  steps: [
    ['Plan', 'Requirements'],
    ['Match', 'Provider fit'],
    ['Book', 'Confirmed terms'],
    ['Move', 'Track and document'],
    ['Settle', 'Reconcile and pay'],
  ],
};

export const ui = {
  switcherLabel: 'Choose your role',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  loading: 'Loading the journey',
  otherRoles: 'Other roles',
  backHome: 'The full journey',
};
