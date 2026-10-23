import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Truck, ShieldCheck, Wrench, Sun, Store } from 'lucide-react';
import { PageHero } from '@/components/info/PageHero';
import { BUSINESS_NAME, BUSINESS_CITY } from '@/data/content';
import { categoryImages } from '@/data/content';

const VALUES = [
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Genuine Products', desc: 'We stock authentic cables, components, and accessories from trusted brands.' },
  { icon: <Truck className="w-5 h-5" />, title: 'Regional Distribution', desc: 'Cables supplied across Marathwada — Aurangabad, Jalna, Latur, Nanded — and to Pune.' },
  { icon: <Wrench className="w-5 h-5" />, title: 'Skilled Repairs', desc: 'Technicians experienced with mobiles, laptops, computers, and household devices.' },
  { icon: <Sun className="w-5 h-5" />, title: 'Solar Expertise', desc: 'Rooftop solar consultation, equipment supply, and end-to-end installation.' },
];

const CATEGORIES = [
  { name: 'Cables',  image: categoryImages.cables,  href: '/cables',  cta: 'Explore Cables' },
  { name: 'Lights & Fans', image: categoryImages.lights, href: '/lights',  cta: 'Explore Lights & Fans' },
  { name: 'Solar',   image: categoryImages.solar,   href: '/solar',   cta: 'Explore Solar' },
  { name: 'Electronics',  image: categoryImages.mobiles, href: '/mobiles', cta: 'Explore Electronics' },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About Us"
        title={`About ${BUSINESS_NAME}`}
        subtitle="An Aurangabad-based electrical supplier and service provider covering cables, lighting, solar, and mobile repairs across the Marathwada region."
        breadcrumbs={[{ label: 'About' }]}
      />

      {/* Story */}
      <section className="py-14">
        <div className="container-page max-w-2xl">
          <p className="eyebrow-blue mb-3"><span className="w-4 h-px bg-electric-400 inline-block" />Our Story</p>
          <h2 className="section-title mb-6">Built on trust and service</h2>
          <div className="space-y-5 text-sm text-slate-400 leading-relaxed">
            <p>
              {BUSINESS_NAME} is based in {BUSINESS_CITY}. We supply electrical cables, lighting, solar equipment, and mobile accessories, and we offer repair services for mobile phones, laptops, computers, and household electronic devices.
            </p>
            <p>
              Our cable distribution network reaches retailers and electricians across the Marathwada region — including Aurangabad, Jalna, Latur, and Nanded — with supply extending as far as Pune. Bulk and project orders are welcome.
            </p>
            <p>
              On the solar side, we focus on rooftop solar. We supply panels, inverters, and batteries, and we handle domestic rooftop installation from site assessment through to commissioning.
            </p>
            <p>
              Our repair technicians work on a wide range of devices — from mobile phones and laptops to televisions and household appliances. Submit a repair request through our services page and we will review your enquiry.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 border-y border-slate-800 bg-slate-900/40">
        <div className="container-page">
          <div className="mb-10">
            <p className="eyebrow-blue mb-3"><span className="w-4 h-px bg-electric-400 inline-block" />What we stand for</p>
            <h2 className="section-title">Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="card p-5">
                <div className="w-10 h-10 rounded-lg bg-electric-500/10 text-electric-400 flex items-center justify-center mb-4">{v.icon}</div>
                <h3 className="font-semibold text-white text-sm mb-2">{v.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container-page">
          <div className="mb-10">
            <p className="eyebrow-blue mb-3"><span className="w-4 h-px bg-electric-400 inline-block" />What we offer</p>
            <h2 className="section-title">Browse our categories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map(c => (
              <Link key={c.name} to={c.href} className="card card-hover overflow-hidden group block">
                <div className="h-36 overflow-hidden bg-slate-800">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-display font-semibold text-white">{c.name}</h3>
                  <span className="text-xs text-electric-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    {c.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Visit CTA */}
      <section className="py-10 pb-20">
        <div className="container-page">
          <div className="rounded-2xl bg-slate-900 ring-1 ring-slate-800 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-electric-500/10 text-electric-400 flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Visit our store</h3>
                <p className="text-sm text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {BUSINESS_CITY}</p>
              </div>
            </div>
            <Link to="/services" className="btn-primary btn-md flex-shrink-0">
              Request a Service <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
