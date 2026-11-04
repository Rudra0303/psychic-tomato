/**
 * HaulerHub site copy. Every word on the site lives here.
 * Panels (`ui`) are illustrative product UI built from blocks (see src/templates/ui.js).
 * All UI values are sample data. Items marked PLACEHOLDER must be confirmed before launch.
 */

export const site = {
  name: 'HaulerHub',
  tagline: 'Where freight connects.',
  url: 'https://haulerhub.example', // PLACEHOLDER: production domain
  description:
    'HaulerHub is the connected freight platform for road, rail, sea and air. Shippers, carriers, drivers, forwarders and logistics providers work on one shared shipment record, from first quote to final payment.',
};

export const links = {
  demo: 'mailto:demo@haulerhub.example?subject=HaulerHub%20demo', // PLACEHOLDER
  start: 'mailto:hello@haulerhub.example?subject=Get%20started', // PLACEHOLDER
};

export const nav = {
  items: [
    ['Product', '#product'],
    ['How it connects', '#network'],
    ['Journey', '#journey'],
    ['Platform', '#platform'],
  ],
  roles: 'Roles',
  demo: 'Book a demo',
  menu: 'Menu',
  close: 'Close',
  ticker: 'One shipment record · Road · Rail · Sea · Air · Every party connected · ',
};

export const roleOrder = ['shipper', 'carrier', 'driver', 'forwarder', 'logistics'];

export const roles = {
  shipper: { label: 'Shippers', short: 'Shipper', slug: 'shippers', line: 'Post once. See who qualifies and why.', thumb: 'shipper', station: 4 },
  carrier: { label: 'Carriers', short: 'Carrier', slug: 'carriers', line: 'Freight that fits your fleet.', thumb: 'carrier', station: 0 },
  driver: { label: 'Drivers', short: 'Driver', slug: 'drivers', line: 'A clearer day on the road.', thumb: 'driver', station: 0 },
  forwarder: { label: 'Freight forwarders', short: 'Forwarder', slug: 'forwarders', line: 'Global complexity. Clear control.', thumb: 'forwarder', station: 2 },
  logistics: { label: 'Logistics providers', short: 'Logistics', slug: 'logistics-providers', line: 'Your expertise. A connected network.', thumb: 'logistics', station: 1 },
};

/* ------------------------------------------------------------------ loader */
export const loader = {
  words: ['Road', 'Rail', 'Sea', 'Air', 'One record'],
};

/* ------------------------------------------------------------------ hero (product first) */
export const hero = {
  eyebrow: 'The connected freight platform',
  title: ['Every mode. Every party.', 'One shipment record.'],
  body: 'HaulerHub connects shippers, carriers, drivers, forwarders and logistics providers on one shared record, across road, rail, sea and air, from first quote to final payment.',
  primary: 'Book a demo',
  secondary: 'See how it connects',
  // The app composition shown in the hero (illustrative, sample data)
  app: {
    id: 'HH-20418',
    route: ['Chicago, IL', 'Tashkent, UZ'],
    status: 'In transit · Leg 2 of 4',
    nav: ['Shipments', 'Marketplace', 'Documents', 'Settlement', 'Partners'],
    legs: [
      ['road', 'Road', 'Chicago → New York', 'Delivered', 'done'],
      ['sea', 'Ocean', 'New York → Istanbul', 'ETA Nov 21', 'active'],
      ['rail', 'Rail', 'Istanbul → Baku', 'Booked', 'pending'],
      ['air', 'Air', 'Baku → Tashkent', 'Docs 4 of 6', 'pending'],
    ],
    parties: [
      ['Shipper', 'Acme Retail', 'Owner'],
      ['Forwarder', 'Atlas Forwarding', 'Plans the journey'],
      ['Carrier', 'Northline Freight', 'Leg 1 · done'],
      ['Ocean line', 'Blue Meridian', 'Leg 2 · in transit'],
      ['Terminal', 'Port of Istanbul', 'Leg 3 · ready'],
    ],
    docs: [['Bill of lading', 'done'], ['Commercial invoice', 'done'], ['Certificate of origin', 'warn']],
    cost: [['Agreed', '$18,420'], ['Approved extras', '$180'], ['Paid to date', '$6,120']],
    floats: {
      match: { tag: 'Match explained', title: 'Northline Freight fits', items: ["53' dry van", 'Authority on file', 'Lane run weekly'] },
      toast: { tag: 'Driver app', title: 'Seal 4471902 photographed', meta: 'Joliet DC · 08:42' },
      paid: { tag: 'Settlement', title: 'Invoice approved', meta: 'Proof attached · $1,418.25' },
    },
    caption: 'Illustrative interface · sample data',
  },
};

/* ------------------------------------------------------------------ problem → record */
export const problem = {
  eyebrow: 'The problem',
  title: ['Freight runs on systems', 'that never spoke.'],
  body: 'A single international move touches a dozen companies. Each keeps its own version of the truth in calls, emails, spreadsheets, PDFs and portals.',
  fragments: [
    ['mail', 'Re: Re: FW: pickup time??', 'Dispatch · 7 replies'],
    ['call', 'Missed call · Carrier', 'Driver at the wrong dock'],
    ['sheet', 'loads_final_v7.xlsx', 'Edited by 4 people'],
    ['pdf', 'BOL_scan_002.pdf', 'Unsigned'],
    ['chat', '“Is the container on the vessel?”', 'Forwarder · 2 days ago'],
    ['portal', 'Carrier portal', 'Password expired'],
    ['mail', 'Invoice dispute #3302', 'Detention not approved'],
    ['chat', '“Who has the customs docs?”', 'Agent · unanswered'],
  ],
  after: {
    eyebrow: 'The HaulerHub way',
    title: ['One shipment record.', 'Every party connected.'],
    body: 'Requirements, responsibilities, milestones, documents and costs in one place. Every party sees what their role needs, and nobody chases anyone.',
    figures: [
      { value: 4, label: 'Transport modes' },
      { value: 5, label: 'Roles on one platform' },
      { value: 21, label: 'Connected services' },
      { value: 1, label: 'Shared shipment record' },
    ],
    figuresNote: 'Catalog figures. PLACEHOLDER: confirm before launch.',
  },
};

/* ------------------------------------------------------------------ network (3D explanation) */
export const network = {
  eyebrow: 'How it connects',
  title: ['Watch the platform', 'connect every handoff.'],
  hint: 'Scroll to travel the network',
  stations: [
    {
      key: 'road',
      label: 'Road',
      caption: 'Full truckload, LTL, drayage and last mile.',
      parties: ['Shipper', 'Carrier', 'Driver', 'Warehouse'],
      does: ['Matches the load to carriers that qualify, and shows why', 'Sends the driver trip, dock and reference details', 'Captures pickup proof the moment it happens'],
      hotspots: [
        {
          role: 'carrier',
          tag: 'For carriers',
          title: 'Freight that fits your fleet',
          chips: ['Equipment-matched', 'Clear terms'],
          text: 'Loads matched to your equipment, lanes, credentials and capacity, with the reason each one fits.',
          rows: [['Matching', 'Qualify first, rank second'], ['Pricing', 'Your rates and rules'], ['Settlement', 'Invoices with proof']],
        },
        {
          role: 'driver',
          tag: 'For drivers',
          title: 'A clearer day on the road',
          chips: ['Hours-aware', 'Proof in a tap'],
          text: 'Trip, dock instructions and references before you roll. Seals, photos and signatures at every stop.',
          rows: [['Trip plan', 'Hours-aware'], ['Evidence', 'Photos, seals, signatures'], ['Support', 'One channel, right people']],
        },
      ],
    },
    {
      key: 'rail',
      label: 'Rail',
      caption: 'Rail and intermodal legs in the same plan.',
      parties: ['Carrier', 'Terminal', 'Rail operator', 'Forwarder'],
      does: ['Hands the container from road to rail with custody evidence', 'Books terminal slots against the same shipment', 'Shows the next owner before the handoff, not after'],
      hotspots: [
        {
          role: 'logistics',
          tag: 'For logistics providers',
          title: 'Your expertise, connected',
          chips: ['Terminals & yards', 'Scope agreed upfront'],
          text: 'Terminals, yards, warehouses and agents plug into full shipment plans and receive work that fits.',
          rows: [['Storefront', 'Services by area'], ['Handoffs', 'Evidence at every exchange'], ['Invoicing', 'Matched to agreed scope']],
        },
        {
          role: null,
          tag: 'Platform',
          title: 'Intermodal in one plan',
          chips: ['Relay', 'Transload'],
          text: 'Road, rail and terminal legs live on the same shipment record, each with an owner and a handoff.',
          rows: [['Legs', 'Road, rail, terminal'], ['Ownership', 'One owner per leg'], ['Milestones', 'Shared with every party']],
        },
      ],
    },
    {
      key: 'sea',
      label: 'Sea',
      caption: 'Ocean freight with every leg accounted for.',
      parties: ['Forwarder', 'Ocean line', 'Port', 'Customs broker'],
      does: ['Tracks bills of lading and customs readiness per leg', 'Shares vessel ETAs with every party on the shipment', 'Shows downstream impact when a sailing slips'],
      hotspots: [
        {
          role: 'forwarder',
          tag: 'For forwarders',
          title: 'Global complexity. Clear control.',
          chips: ['Multi-leg', 'Jurisdiction-aware'],
          text: 'Design multimodal journeys, procure each leg and see what a delay changes downstream.',
          rows: [['Journey', 'Every leg has an owner'], ['Procurement', 'Agents on equal terms'], ['Recovery', 'Confirm the new plan']],
        },
        {
          role: null,
          tag: 'Platform',
          title: 'Documents before the border',
          chips: ['Customs', 'Trade documents'],
          text: 'Invoices, bills of lading and certificates tracked leg by leg, ready before arrival.',
          rows: [['Readiness', 'Per leg, per border'], ['Custody', 'Signed at every handoff'], ['Access', 'Shaped by role']],
        },
      ],
    },
    {
      key: 'air',
      label: 'Air',
      caption: 'When it cannot wait, it flies.',
      parties: ['Forwarder', 'Airline', 'Ground handler', 'Agent'],
      does: ['Adds an air leg without starting a new shipment', 'Carries the same documents and references forward', 'Gets revised costs approved before they land'],
      hotspots: [
        {
          role: null,
          tag: 'Platform',
          title: 'A delay changes the plan. Everyone sees how.',
          chips: ['Impact', 'Recovery'],
          text: 'When one leg slips, the impact on every later leg is visible, and the new plan is confirmed in one place.',
          rows: [['Detect', 'Exceptions with an owner'], ['Coordinate', 'Every party notified'], ['Confirm', 'Revised costs approved']],
        },
        {
          role: null,
          tag: 'Platform',
          title: 'One live picture',
          chips: ['Milestones', 'Changed ETAs'],
          text: 'Pickup, handoffs, flights and delivery on one timeline, shared with everyone who needs it.',
          rows: [['Status', 'Live, by leg'], ['ETAs', 'Updated for all'], ['History', 'Full audit trail']],
        },
      ],
    },
    {
      key: 'hub',
      label: 'Hub',
      caption: 'One record behind every move.',
      parties: ['Shipper', 'Receiver', 'Carrier', 'Finance'],
      does: ['Confirms delivery with signature, seal and photos', 'Reconciles charges against what was agreed', 'Pays every party from one approved record'],
      hotspots: [
        {
          role: 'shipper',
          tag: 'For shippers',
          title: 'Your freight. Your visibility.',
          chips: ['Post once', 'Full cost upfront'],
          text: 'Define the load once. See who qualifies and why, and the total cost before you book.',
          rows: [['Brief', 'Lanes, dates, equipment'], ['Providers', 'Ranked with reasons'], ['Cost', 'Rate, fees, accessorials']],
        },
        {
          role: null,
          tag: 'Platform',
          title: 'Delivered. Proven. Paid.',
          chips: ['Proof of delivery', 'Reconciled'],
          text: 'Proof of delivery, reconciliation and payment confirmed in one flow. Nobody chasing paperwork.',
          rows: [['Proof', 'Signature, seal, photos'], ['Charges', 'Approved items only'], ['Payment', 'Every party notified']],
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ journey */
export const journey = {
  eyebrow: 'Follow one shipment',
  marquee: 'One shipment · Every mode · ',
  hud: { speed: 'Speed', leg: 'Leg' },
  chapters: [
    {
      key: 'booked',
      events: [['Shipper', 'Load posted'], ['Carrier', 'Offer accepted'], ['Driver', 'Trip assigned']],
      n: '01',
      label: 'Booked',
      title: ['Posted once.', 'Matched with reasons.'],
      body: 'The shipper posts the load. Qualified carriers see why it fits. Terms are agreed and a driver is assigned, all on one record.',
      cards: [
        ['Shipper', 'Load posted', 'Origin, destination, equipment, dates and handling in one brief.'],
        ['Carrier', 'Qualified match', 'Equipment, authority and lane checked first. Ranked second.'],
        ['Both', 'Terms agreed', 'Rate, fees and accessorials visible before anyone commits.'],
        ['Driver', 'Trip assigned', 'Instructions, references and dock times in the app.'],
      ],
    },
    {
      key: 'road',
      n: '02',
      events: [['Driver', 'Seal photographed'], ['Carrier', 'ETA shared'], ['Terminal', 'Slot confirmed']],
      label: 'Road',
      title: ['First mile.', 'Fully visible.'],
      body: 'Pickup checked in, seal photographed, ETA shared with everyone who needs it.',
    },
    {
      key: 'rail',
      n: '03',
      events: [['Terminal', 'Container received'], ['Rail operator', 'Custody signed'], ['Forwarder', 'Leg 3 owner notified']],
      label: 'Rail',
      title: ['Handoffs without', 'blind spots.'],
      body: 'At the terminal the container moves to rail. Custody transfers with evidence, and the next owner is already on the record.',
    },
    {
      key: 'sea',
      n: '04',
      events: [['Ocean line', 'Bill of lading issued'], ['Customs broker', 'Docs 4 of 6 ready'], ['Shipper', 'Vessel ETA updated']],
      label: 'Sea',
      title: ['Across oceans.', 'Across one record.'],
      body: 'Bills of lading, customs readiness and vessel ETAs tracked leg by leg, visible to the forwarder, the shipper and the agent at the other end.',
      points: ['Every leg has an owner', 'Documents ready before arrival', 'Delays show their impact', 'Revised costs approved in context'],
    },
    {
      key: 'air',
      n: '05',
      events: [['Forwarder', 'Air leg added'], ['Airline', 'Booking confirmed'], ['Shipper', 'Revised cost approved']],
      label: 'Air',
      title: ['When it cannot wait,', 'it flies.'],
      body: 'Time-critical cargo moves to air without losing the thread: same shipment, same documents, a new leg.',
    },
    {
      key: 'delivered',
      events: [['Receiver', 'Signed for delivery'], ['Finance', 'Charges reconciled'], ['Every party', 'Payment confirmed']],
      n: '06',
      label: 'Delivered',
      title: ['Delivered. Proven.', 'Paid.'],
      body: 'Proof of delivery, reconciliation and payment confirmed in one flow.',
      flow: ['Delivered', 'Proof verified', 'Charges reconciled', 'Payment confirmed'],
    },
  ],
};

/* ------------------------------------------------------------------ platform */
const cap = 'Illustrative interface · sample data';
export const platform = {
  eyebrow: 'The platform',
  title: ['Powerful underneath.', 'Simple on the surface.'],
  modules: [
    {
      key: 'matching',
      label: 'Matching',
      title: 'Qualify first. Rank second.',
      body: 'Equipment, compliance, lane and availability decide who is eligible. Preferences, performance and total price rank them, and every match shows its reason.',
      ui: {
        title: 'Qualified providers',
        meta: 'LD-20418 · Joliet → Columbus',
        status: ['4 eligible', 'accent'],
        caption: cap,
        blocks: [
          { type: 'checks', title: 'Why Northline fits', items: [["53' dry van registered", 'done'], ['Authority and insurance on file', 'done'], ['Runs this lane weekly', 'done'], ['Confirm dock appointment', 'warn']] },
          { type: 'rank', items: [['Northline Freight', 96], ['Lakeside Haul', 91], ['Midway Carriers', 84]] },
        ],
      },
    },
    {
      key: 'pricing',
      label: 'Pricing',
      title: 'See the rate. See the fees.',
      body: 'Provider charge, platform fees and accessorials are visible before anyone books. Carriers set their own rate and accessorial rules.',
      ui: {
        title: 'Offer LD-20418',
        meta: 'Dry van · 355 mi',
        status: ['Ready to book', 'accent'],
        caption: cap,
        blocks: [
          { type: 'breakdown', rows: [['Provider charge', '$1,450.00'], ['Platform fee', '$101.50'], ['Accessorials', 'None yet']], total: ['Total before booking', '$1,551.50'] },
          { type: 'actions', items: [['Counter'], ['Agree and book', true]] },
        ],
      },
    },
    {
      key: 'tracking',
      label: 'Tracking',
      title: 'See the next step and who owns it.',
      body: 'Milestones, changed ETAs and exceptions reach every party on the shipment, each with an owner.',
      ui: {
        title: 'In transit',
        meta: 'FJ-3302 · 4 legs',
        status: ['On plan', 'accent'],
        caption: cap,
        blocks: [
          { type: 'legs', items: [['Road · Chicago → New York', 'Delivered to port', 'done'], ['Ocean · New York → Istanbul', 'In transit · ETA Nov 21', 'active'], ['Road · Istanbul → Baku', 'Agent confirmed', 'pending'], ['Customs · Tashkent', 'Documents 4 of 6', 'warn']] },
        ],
      },
    },
    {
      key: 'documents',
      label: 'Documents',
      title: 'Evidence attached to every handoff.',
      body: 'Bills of lading, invoices, seals, photos and signatures live on the shipment record, not in inboxes.',
      ui: {
        title: 'Trade documents',
        meta: 'Leg 2 · Ocean',
        status: ['4 of 6 ready', 'warn'],
        caption: cap,
        blocks: [
          { type: 'checks', items: [['Commercial invoice', 'done'], ['Packing list', 'done'], ['Bill of lading', 'done'], ['Insurance certificate', 'done'], ['Certificate of origin', 'warn'], ['Import licence', 'pending']] },
        ],
      },
    },
    {
      key: 'exceptions',
      label: 'Exceptions',
      title: 'A delay changes the plan. Everyone sees how.',
      body: 'Detect the impact, coordinate recovery and confirm the new plan, with revised costs approved before they land.',
      ui: {
        title: 'Vessel delayed',
        meta: 'Leg 2 · New York → Istanbul',
        status: ['+2 days', 'warn'],
        caption: cap,
        blocks: [
          { type: 'alert', title: '2 later legs affected', body: 'Istanbul pickup and Tashkent customs slot need new dates.' },
          { type: 'legs', items: [['Istanbul pickup', 'Nov 21 → Nov 23 · agent notified', 'done'], ['Customs slot', 'Rebook requested', 'active'], ['Storage +$180', 'Awaiting approval', 'warn']] },
        ],
      },
    },
    {
      key: 'settlement',
      label: 'Settlement',
      title: 'Invoices that arrive with proof.',
      body: 'Proof of delivery, photos and approved accessorials travel with the invoice, so settlement is a check, not a dispute.',
      ui: {
        title: 'Invoice INV-7731',
        meta: 'LD-20418 · Delivered',
        status: ['Approved', 'accent'],
        caption: cap,
        blocks: [
          { type: 'breakdown', rows: [['Linehaul', '$1,450.00'], ['Detention (approved)', '$75.00'], ['Provider fee', '−$106.75']], total: ['Net to carrier', '$1,418.25'] },
          { type: 'steps', items: [['Submitted', 'done'], ['Reconciled', 'done'], ['Paid', 'active']] },
        ],
      },
    },
  ],
};

/* ------------------------------------------------------------------ roles grid */
export const rolesGrid = {
  eyebrow: 'Roles',
  title: ['Built for every seat', 'in the journey.'],
  explore: 'Explore',
  demo: { title: 'See it on your lanes', body: 'A walkthrough with your roles, lanes and workflows.', cta: 'Book a demo' },
};

/* ------------------------------------------------------------------ faq */
export const faq = {
  title: 'F.A.Q',
  sub: 'Straight answers before you book a demo.',
  items: [
    ['What is HaulerHub?', 'A connected freight platform and marketplace. Shippers, carriers, drivers, forwarders and logistics providers work on one shared shipment record, from planning and matching through delivery, documents and settlement.'],
    ['Which transport modes are covered?', 'Road (full truckload, LTL, partial, drayage, last mile), rail and intermodal, ocean, air and cross-border moves, plus warehousing, customs brokerage and value-added services.'],
    ['Is HaulerHub a load board?', 'No. A load board lists freight. HaulerHub matches on real capability, then carries the shipment through booking, execution, documents and settlement.'],
    ['How does matching work?', 'Requirements first: equipment, compliance, lane and availability decide who qualifies. Preferences, performance and total price then rank the eligible providers, and the reason is shown.'],
    ['Who sees what?', 'Access follows each participant’s role. Everyone on a shipment sees the milestones they need; commercial details stay with the parties they belong to.'],
    ['Can I see it on my own lanes?', 'Yes. Book a demo and we will walk through your lanes, roles and workflows.'],
  ],
};

/* ------------------------------------------------------------------ closing */
export const cta = {
  title: ['Ready to move', 'as one?'],
  body: 'See HaulerHub on your own lanes, roles and workflows.',
  button: 'Book a demo',
  cursor: 'Book a demo',
};

export const footer = {
  marquee: ['Full truckload', 'LTL', 'Drayage', 'Rail', 'Intermodal', 'Ocean', 'Air cargo', 'Cross-border', 'Last mile', 'Warehousing', 'Customs', 'Cross-docking'],
  cols: {
    site: 'Site',
    roles: 'Roles',
    company: 'Company',
  },
  location: 'Chicago, Illinois, United States',
  company: 'ForwardNow LLC · ITF Group of Companies',
  copyright: '© 2026 HaulerHub',
  disclaimer: 'Product interfaces shown are illustrative and use sample data. Capabilities may be in development.',
};

/* ------------------------------------------------------------------ persona pages */
const step = (label, title, body, ui) => ({ label, title, body, ui: { caption: cap, ...ui } });

export const pages = {
  shipper: {
    meta: { title: 'HaulerHub for Shippers · Your freight. Your visibility.', description: 'Post detailed loads, review qualified providers and see every cost before you book. Follow every milestone to proof of delivery.' },
    hero: { eyebrow: 'For shippers', title: ['Your freight.', 'Your visibility.'], body: 'Define the load once. See who qualifies and why, know the full cost before you commit, and follow every milestone to proof of delivery.', primary: 'Post a load', station: 'hub' },
    steps: [
      step('Plan', 'Requirements first.', 'Origin, destination, commodity, weight, dates, equipment, temperature, hazmat and site access in one brief.', { title: 'New load', meta: 'LD-20418 · Draft', status: ['Ready to post', 'accent'], blocks: [{ type: 'route', from: ['Joliet, IL', 'Nov 12 · 08:00'], to: ['Columbus, OH', 'Nov 13 · 14:00'], meta: '355 mi' }, { type: 'kv', items: [['Equipment', "53' dry van"], ['Weight', '38,500 lb'], ['Handling', 'Floor-loaded'], ['Access', 'Dock high']] }] }),
      step('Match', 'A match you can understand.', 'Only qualified capacity becomes booking-ready. Each match shows why it fits, and what it costs, before you agree.', platform.modules[0].ui),
      step('Book', 'The total before you commit.', 'Provider charge, fees and accessorials side by side. No surprises after delivery.', platform.modules[1].ui),
      step('Settle', 'Delivered. Proven. Paid.', 'Proof of delivery, claims and approved charges close the loop on the same record.', platform.modules[5].ui),
    ],
  },
  carrier: {
    meta: { title: 'HaulerHub for Carriers · Freight that fits your fleet.', description: 'Find freight that fits your equipment, lanes and credentials. Price on real costs, dispatch drivers and get paid with evidence attached.' },
    hero: { eyebrow: 'For carriers & owner-operators', title: ['Freight that', 'fits your fleet.'], body: 'Matched to what your trucks can really do. Clear terms, clear costs, and invoices backed by evidence.', primary: 'Find freight', station: 'road' },
    steps: [
      step('Find', 'Know why a load fits.', 'Matching explains why a load fits your fleet, or which qualification is missing.', platform.modules[0].ui),
      step('Price', 'Your costs, your rules.', 'Know your cost to run before you bid. Set your own rate and accessorial rules.', { title: 'Offer', meta: 'Joliet → Columbus', status: ['Match', 'accent'], blocks: [{ type: 'breakdown', rows: [['Your rate', '$1,450.00'], ['Est. cost to run', '−$1,012.00'], ['Provider fee', '−$101.50']], total: ['Est. margin', '$336.50'] }] }),
      step('Run', 'Dispatch from the same record.', 'Assign the right driver and truck. Every milestone stays attached to the load.', { title: 'Dispatch', meta: 'Today · 6 units', status: ['2 need a driver', 'warn'], blocks: [{ type: 'legs', items: [['Unit 214 · M. Alvarez', 'LD-20418 · Joliet → Columbus', 'done'], ['Unit 208 · R. Okafor', 'LD-20433 · Gary → Detroit', 'done'], ['Unit 221 · Unassigned', 'LD-20440 · Aurora → St. Louis', 'warn']] }] }),
      step('Get paid', 'Invoices that arrive with proof.', 'Proof of delivery and approved accessorials travel with the invoice.', platform.modules[5].ui),
    ],
  },
  driver: {
    meta: { title: 'HaulerHub for Drivers · A clearer day on the road.', description: 'Trip and facility instructions, hours-aware planning, pickup and delivery proof, and support that reaches the right people.' },
    hero: { eyebrow: 'For drivers', title: ['A clearer day', 'on the road.'], body: 'Know where you are going, what is expected at the dock, and who to tell when something changes. All in one app.', primary: 'Get started', station: 'road' },
    steps: [
      step('Before you roll', 'The trip, already sorted.', 'Assignment, dock instructions, references and hours-aware planning before you leave the yard.', { title: 'Today’s trip', meta: 'LD-20418 · Unit 214', status: ['Checked in', 'accent'], blocks: [{ type: 'legs', items: [['Joliet DC · Dock 14', 'Pickup 08:30 · ref PO-55120', 'done'], ['Columbus DC · Door 3', 'Deliver by 14:00 tomorrow', 'active']] }, { type: 'kv', items: [['Drive time left', '6h 40m'], ['Next break', 'in 2h 10m']] }] }),
      step('At pickup', 'Proof in a few taps.', 'Seals, photos, signatures and cargo condition captured at every stop.', { title: 'Pickup evidence', meta: 'Joliet DC · Dock 14', status: ['3 of 4', 'warn'], blocks: [{ type: 'checks', items: [['Seal 4471902 photographed', 'done'], ['Bill of lading signed', 'done'], ['Cargo photos 3 of 4', 'active'], ['Temperature check', 'pending']] }] }),
      step('On the road', 'Say it once. Everyone hears it.', 'Report a delay or a blocked dock once. Dispatch, shipper and receiver see the same update.', { title: 'Trip chat', meta: 'Dispatch · Shipper · Receiver', status: ['Shared', 'accent'], blocks: [{ type: 'chat', items: [['You', 'Dock 14 is blocked. Told to wait 45 min.', true], ['Dispatch', 'Logged as a delay. Detention clock started.'], ['Shipper', 'Moving you to Dock 9. 10 minutes.']] }] }),
      step('At delivery', 'Close the trip with proof.', 'Receiver signature, seal check and condition photos, so nobody questions the delivery later.', { title: 'Deliver', meta: 'Columbus DC · Door 3', status: ['Arrived 13:12', 'accent'], blocks: [{ type: 'checks', items: [['Seal intact', 'done'], ['Receiver signature', 'done'], ['Condition photos 4 of 4', 'done']] }, { type: 'actions', items: [['Close trip', true]] }] }),
    ],
  },
  forwarder: {
    meta: { title: 'HaulerHub for Freight Forwarders · Global complexity. Clear control.', description: 'Design multi-leg, multimodal journeys, procure every leg, keep trade documents ready and see the impact of every delay.' },
    hero: { eyebrow: 'For freight forwarders', title: ['Global complexity.', 'Clear control.'], body: 'A journey with many legs and one chain of responsibility. Plan it, procure it, document it and keep it on course.', primary: 'Plan a journey', station: 'sea' },
    steps: [
      step('Design', 'Every leg has an owner.', 'Countries, modes, customs, insurance and responsibilities mapped before the first pickup.', platform.modules[2].ui),
      step('Procure', 'Agents on equal terms.', 'Tender each leg and compare offers on price, timing and qualifications.', { title: 'Tender · Leg 3', meta: 'Istanbul → Baku · road', status: ['3 offers', 'accent'], blocks: [{ type: 'rank', items: [['Agent B · 5 days', 94], ['Agent A · 6 days', 88], ['Agent C · 7 days', 81]] }, { type: 'actions', items: [['Compare'], ['Confirm leg', true]] }] }),
      step('Document', 'Ready before the border.', 'Trade documents and customs readiness tracked leg by leg.', platform.modules[3].ui),
      step('Recover', 'Delays show their impact.', 'See what a delay changes downstream and confirm the new plan with revised costs approved.', platform.modules[4].ui),
    ],
  },
  logistics: {
    meta: { title: 'HaulerHub for Logistics Providers · Your expertise. A connected network.', description: 'Bring warehousing, terminals, customs, agent and specialist services into connected shipment plans. Agree scope, capture evidence and invoice.' },
    hero: { eyebrow: 'For logistics providers', title: ['Your expertise.', 'A connected network.'], body: 'Warehouses, terminals, cross-docks, customs brokers and agents: plug your services into full shipment plans and get work that fits.', primary: 'List your services', station: 'rail' },
    steps: [
      step('Offer', 'A storefront for what you do.', 'Define service area and capability. Receive work that fits, with scope and price agreed upfront.', { title: 'Cross-dock WO-118', meta: 'Joliet, IL', status: ['Scope agreed', 'accent'], blocks: [{ type: 'checks', items: [['Unload and count · 26 pallets', 'done'], ['Re-label for Columbus DC', 'done'], ['Load out to carrier', 'active']] }] }),
      step('Coordinate', 'Appointments that line up.', 'Slots, doors and crews coordinated with the carriers and shippers on the same shipment.', { title: 'Dock schedule', meta: 'Thursday', status: ['3 open', 'accent'], blocks: [{ type: 'slots', items: [['07:00', 'busy'], ['08:30', 'mine'], ['10:00', 'open'], ['11:30', 'busy'], ['13:00', 'open'], ['14:30', 'open']] }] }),
      step('Hand off', 'Evidence at every exchange.', 'Inbound and outbound handoffs recorded with counts, photos and times.', { title: 'Handoffs', meta: 'WO-118', status: ['In progress', 'accent'], blocks: [{ type: 'legs', items: [['Inbound from carrier', '08:42 · 26 pallets · photos', 'done'], ['Outbound to carrier', 'Door 6 · 11:30', 'pending']] }] }),
      step('Invoice', 'Bill on documented work.', 'Invoice against the agreed scope, with approved extras only.', { title: 'Invoice SV-2290', meta: 'WO-118 · Cross-dock', status: ['Matched to scope', 'accent'], blocks: [{ type: 'breakdown', rows: [['Handling · 26 pallets', '$468.00'], ['Re-labeling', '$130.00'], ['Storage (approved)', '$60.00']], total: ['Invoice total', '$658.00'] }] }),
    ],
  },
};

export const personaPage = {
  stepsEyebrow: 'How it works for you',
  otherRoles: 'Other roles',
  back: 'Back to the network',
};
