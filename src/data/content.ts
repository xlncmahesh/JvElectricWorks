/**
 * Static structured content for informational pages.
 * Separated from presentation so it can later be replaced by CMS-managed data.
 */

export const BUSINESS_NAME = 'JV Electric Works';
export const BUSINESS_CITY = 'Aurangabad, Maharashtra';
export const BUSINESS_TAGLINE = 'Your trusted partner for cables, solar, lighting, and mobile services.';

export const STORE_ADDRESS = 'Aurangabad, Maharashtra, India';
export const STORE_PHONE = '+91 00000 00000';   // placeholder — update when confirmed
export const STORE_EMAIL = 'info@jvelectric.in'; // placeholder

// ── Category page content ───────────────────────────────────────────────────

export const cablePageContent = {
  hero: {
    eyebrow: 'Electrical Cables',
    title: 'Domestic & Industrial Cables',
    subtitle:
      'From residential wiring to heavy-duty industrial power cables, JV Electric Works supplies the right cable for every application — distributed across the Marathwada region and as far as Pune.',
    image: 'https://images.pexels.com/photos/28286039/pexels-photo-28286039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  subcategories: [
    {
      slug: 'domestic',
      name: 'Domestic Cables',
      tagline: 'Wiring for homes, apartments, and small premises',
      image: 'https://images.pexels.com/photos/3615731/pexels-photo-3615731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      buy_path: '/buy/cables/domestic',
      info_path: '/cables/domestic',
      description:
        'Domestic cables cover everything needed for safe and reliable residential electrical installations — single-core and multi-core PVC-insulated wires, flexible cables for appliances, and armoured cables for concealed runs.',
    },
    {
      slug: 'industrial',
      name: 'Industrial Cables',
      tagline: 'Power, control & instrumentation for demanding environments',
      image: 'https://images.pexels.com/photos/29596327/pexels-photo-29596327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      buy_path: '/buy/cables/industrial',
      info_path: '/cables/industrial',
      description:
        'Industrial cables are engineered for higher voltages, continuous loads, and challenging environments. JV Electric Works sources power cables, control cables, and armoured variants for manufacturing plants, workshops, and commercial buildings.',
    },
  ],
  sections: [
    {
      title: 'Distribution Reach',
      body: 'JV Electric Works supplies electrical cables to retailers and electricians throughout the Marathwada region, including Aurangabad, Jalna, Latur, and Nanded, with distribution extending to Pune. Bulk and project orders are welcome.',
    },
    {
      title: 'Applications',
      body: 'Our cable range covers house wiring, sub-distribution boards, motor circuits, outdoor underground runs, and control systems. If you have a specific requirement, speak to us before placing an order — we can advise on the appropriate rating, insulation, and sheathing for your application.',
    },
    {
      title: 'Delivery & Fulfilment',
      body: 'Cable orders are available for delivery across the Marathwada region and to Pune. Local customers may also collect from our Aurangabad store. Large distribution orders can be discussed directly.',
    },
  ],
};

export const lightsPageContent = {
  hero: {
    eyebrow: 'Lights & Fans',
    title: 'Lights & Fans',
    subtitle:
      'Energy-efficient lighting and ceiling fans for every setting — from warm-toned home fittings to robust fixtures built for offices, warehouses, and commercial installations.',
    image: 'https://images.pexels.com/photos/12092231/pexels-photo-12092231.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  subcategories: [
    {
      slug: 'domestic',
      name: 'Domestic Lighting & Fans',
      tagline: 'Bulbs, fittings, ceiling fans & decorative lighting for homes',
      image: 'https://images.pexels.com/photos/8357326/pexels-photo-8357326.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      buy_path: '/buy/lights/domestic',
      info_path: '/lights/domestic',
      description:
        'From everyday LED bulbs to ceiling panels, ceiling fans, and decorative fittings, our domestic range covers the full spectrum of residential lighting and air circulation needs.',
    },
    {
      slug: 'industrial',
      name: 'Industrial & Commercial Lighting',
      tagline: 'High-bay, flood, and factory lighting',
      image: 'https://images.pexels.com/photos/19881986/pexels-photo-19881986.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      buy_path: '/buy/lights/industrial',
      info_path: '/lights/industrial',
      description:
        'Industrial and commercial lighting solutions including high-bay LED fixtures, flood lights, batten fittings, and panel lights for warehouses, workshops, offices, and open areas.',
    },
  ],
  sections: [
    {
      title: 'Energy Efficiency',
      body: 'Modern LED lighting can reduce electricity consumption by up to 60–80% compared to traditional fluorescent and incandescent sources. Our range prioritises long-life, low-maintenance fixtures with good lumen output and colour rendering.',
    },
    {
      title: 'In-Store Purchase',
      body: 'Lighting products are normally purchased through an in-store visit so you can review the fitting, colour temperature, and form factor before buying. Visit our Aurangabad store for a hands-on look at the available range.',
    },
  ],
};

export const electronicsPageContent = {
  hero: {
    eyebrow: 'Electronics',
    title: 'Accessories, Spare Parts & Repair Services',
    subtitle:
      'Genuine electronics accessories, original spare parts, and professional repair services for mobiles, laptops, computers, and household devices.',
    image: 'https://images.pexels.com/photos/6754839/pexels-photo-6754839.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  sections: [
    {
      title: 'Electronics Accessories',
      body: 'We stock a wide range of electronics accessories including charging cables, adapters, screen protectors, protective cases, earphones, and power banks. Products are available in-store.',
    },
    {
      title: 'Original Spare Parts',
      body: 'Genuine and OEM-equivalent spare parts are available for a range of mobile phones and portable devices. If you need a specific part, contact us with your device model and we will advise on availability.',
    },
    {
      title: 'Repair Services',
      body: 'Our technicians handle repairs for mobile phones, laptops, desktop computers, and household electronic devices. Submit a repair request through our Services page and we will review your enquiry and get back to you.',
    },
  ],
};

export const solarPageContent = {
  hero: {
    eyebrow: 'Solar Energy',
    title: 'Rooftop Solar Panels, Equipment & Installation',
    subtitle:
      'Solar panels, inverters, batteries, and domestic rooftop solar installation services — helping homes and businesses in Aurangabad reduce their reliance on the grid.',
    image: 'https://images.pexels.com/photos/29206488/pexels-photo-29206488.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  sections: [
    {
      title: 'Solar Equipment',
      body: 'We supply solar panels, charge controllers, inverters, and battery storage systems for residential and small commercial rooftop installations. Our product selection covers the main components of a domestic solar setup.',
    },
    {
      title: 'Rooftop Installation',
      body: 'Domestic rooftop solar installation involves site assessment, load calculation, component selection, and commissioning. We handle the full installation process — from sizing the system to mounting panels and connecting the inverter and battery.',
    },
    {
      title: 'Installation Consultation',
      body: 'Every rooftop solar project starts with a consultation. We assess your roof, your energy consumption, and your budget to recommend the right system size and components. Submit a request through our Services page and we will schedule a site visit.',
    },
    {
      title: 'In-Store & Consultation',
      body: 'Solar equipment and installation services require an in-person consultation to correctly size the system for your property and consumption. Visit our Aurangabad store or submit an installation request to get started.',
    },
  ],
};

// ── Fulfilment descriptions ──────────────────────────────────────────────────

export const fulfilmentLabels: Record<string, { label: string; description: string; color: string }> = {
  delivery: {
    label: 'Delivery Available',
    description: 'This product can be delivered. Delivery charges and timelines will be confirmed with your order.',
    color: 'success',
  },
  pickup: {
    label: 'Store Pickup',
    description: 'This product is purchased in-store. Please visit our Aurangabad store.',
    color: 'warning',
  },
  consultation: {
    label: 'Consultation Required',
    description: 'This product or service requires an in-person consultation. Submit an enquiry to get started.',
    color: 'teal',
  },
};

// ── Device types for repair form ────────────────────────────────────────────

export const deviceTypes = [
  { value: 'mobile_phone', label: 'Mobile Phone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop Computer' },
  { value: 'smartwatch', label: 'Smartwatch' },
  { value: 'earphones', label: 'Earphones / Headphones' },
  { value: 'tv', label: 'Television' },
  { value: 'washing_machine', label: 'Washing Machine' },
  { value: 'refrigerator', label: 'Refrigerator' },
  { value: 'air_conditioner', label: 'Air Conditioner' },
  { value: 'mixer_grinder', label: 'Mixer / Grinder' },
  { value: 'other', label: 'Other Device' },
];

export const propertyTypes = [
  { value: 'residential', label: 'Residential (Home / Apartment)' },
  { value: 'commercial', label: 'Commercial (Office / Shop)' },
  { value: 'industrial', label: 'Industrial / Factory' },
  { value: 'agricultural', label: 'Agricultural / Farm' },
  { value: 'other', label: 'Other' },
];

// ── Category image map (for shopping + info pages) ───────────────────────────

export const categoryImages: Record<string, string> = {
  cables:    'https://images.pexels.com/photos/28286039/pexels-photo-28286039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  lights:    'https://images.pexels.com/photos/12092231/pexels-photo-12092231.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  mobiles:   'https://images.pexels.com/photos/5741882/pexels-photo-5741882.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  electronics: 'https://images.pexels.com/photos/5741882/pexels-photo-5741882.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  solar:     'https://images.pexels.com/photos/29206488/pexels-photo-29206488.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

export const subcategoryImages: Record<string, string> = {
  'cables-domestic':    'https://images.pexels.com/photos/3615731/pexels-photo-3615731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'cables-industrial':  'https://images.pexels.com/photos/29596327/pexels-photo-29596327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'lights-domestic':    'https://images.pexels.com/photos/8357326/pexels-photo-8357326.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'lights-industrial':  'https://images.pexels.com/photos/19881986/pexels-photo-19881986.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};
