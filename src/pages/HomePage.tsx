import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Truck, Wrench, Sun, Lightbulb, Smartphone, MapPin, ShieldCheck } from 'lucide-react';
import { categoryImages } from '@/data/content';

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-5 flex gap-4 items-start">
      <div className="w-10 h-10 rounded-lg bg-electric-500/10 flex items-center justify-center flex-shrink-0 text-electric-400">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function CategoryShowcase({ name, tag, image, href, accent }: {
  name: string; tag: string; image: string; href: string; accent: 'blue' | 'solar';
}) {
  const ringColor = accent === 'solar' ? 'group-hover:ring-solar-500/50' : 'group-hover:ring-electric-500/50';
  const gradColor = accent === 'solar' ? 'from-solar-900/60' : 'from-electric-900/60';
  return (
    <Link to={href} className={`relative overflow-hidden rounded-2xl group ring-1 ring-slate-800 ${ringColor} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover block`}>
      <div className="h-52 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-t ${gradColor} to-transparent`} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${accent === 'solar' ? 'text-solar-400' : 'text-electric-400'}`}>{tag}</p>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-white text-lg">{name}</h3>
          <ArrowRight className={`w-5 h-5 ${accent === 'solar' ? 'text-solar-400' : 'text-electric-400'} transition-transform group-hover:translate-x-1`} />
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute inset-0 bg-grid opacity-100" />
        <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-electric-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />

        <div className="relative container-page py-20">
          <div className="max-w-3xl">
            <div className="eyebrow-blue mb-6 animate-fade-up">
              <span className="w-4 h-px bg-electric-400 inline-block" />
              Aurangabad, Maharashtra
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
              <span className="text-white">JV</span>{' '}
              <span className="text-electric-400">Electric</span>{' '}
              <span className="text-white">Works</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-8 max-w-xl animate-fade-up text-pretty" style={{ animationDelay: '0.1s' }}>
              Electrical cables, solar equipment, lighting, mobile accessories, and repair services — your trusted partner for electrical needs across the Marathwada region.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <Link to="/buy" className="btn-primary btn-lg">
                Shop Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/services" className="btn-secondary btn-lg">
                Request a Service
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 mt-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {[
                { icon: <MapPin className="w-3.5 h-3.5" />, text: 'Aurangabad Store' },
                { icon: <Truck className="w-3.5 h-3.5" />, text: 'Marathwada Distribution' },
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: 'Genuine Products' },
              ].map(s => (
                <div key={s.text} className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="text-electric-500">{s.icon}</span>
                  {s.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY SHOWCASE ────────────────────────── */}
      <section className="py-20">
        <div className="container-page">
          <div className="mb-10">
            <p className="eyebrow-blue mb-3"><span className="w-4 h-px bg-electric-400 inline-block" />What we offer</p>
            <h2 className="section-title">Our Products & Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Cables', tag: 'Electrical', image: categoryImages.cables, href: '/cables', accent: 'blue' as const },
              { name: 'Lights & Fans', tag: 'Domestic & Commercial', image: categoryImages.lights, href: '/lights', accent: 'blue' as const },
              { name: 'Solar', tag: 'Panels & Installation', image: categoryImages.solar, href: '/solar', accent: 'solar' as const },
              { name: 'Electronics', tag: 'Accessories & Repairs', image: categoryImages.mobiles, href: '/mobiles', accent: 'blue' as const },
            ].map(c => (
              <CategoryShowcase key={c.name} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CABLE DISTRIBUTION STRIP ──────────────────── */}
      <section className="border-y border-slate-800 bg-slate-900/50 py-12">
        <div className="container-page">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <p className="eyebrow-blue mb-3"><span className="w-4 h-px bg-electric-400 inline-block" />Distribution Network</p>
              <h2 className="text-2xl font-bold text-white mb-3">Cables Across Marathwada — and to Pune</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                JV Electric Works distributes domestic and industrial electrical cables to retailers and electricians across the Marathwada region — covering Aurangabad, Jalna, Latur, and Nanded — with supply extending as far as Pune. Bulk and project orders are welcome.
              </p>
              <Link to="/cables" className="btn-secondary btn-md mt-5 inline-flex">
                Explore Cables <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-shrink-0 hidden md:block">
              <div className="w-56 h-40 rounded-2xl overflow-hidden ring-1 ring-slate-700">
                <img
                  src="https://images.pexels.com/photos/18082922/pexels-photo-18082922.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Electrical cables"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIGHTING STRIP ─────────────────────────────── */}
      <section className="py-12">
        <div className="container-page">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 hidden md:block order-2">
              <div className="w-56 h-40 rounded-2xl overflow-hidden ring-1 ring-slate-700">
                <img src={categoryImages.lights} alt="Lighting" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1 order-1">
              <p className="eyebrow-teal mb-3"><span className="w-4 h-px bg-teal-400 inline-block" />Lights &amp; Fans</p>
              <h2 className="text-2xl font-bold text-white mb-3">Energy-efficient lighting and fans for every setting</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                From warm-toned home fittings to ceiling fans and robust fixtures for offices and warehouses, our lighting and fan range covers domestic and commercial needs with a focus on long-life LED technology.
              </p>
              <Link to="/lights" className="btn-secondary btn-md mt-5 inline-flex">
                Explore Lights &amp; Fans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE STRIP ────────────────────────────── */}
      <section className="border-y border-slate-800 bg-slate-900/50 py-12">
        <div className="container-page">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <p className="eyebrow-blue mb-3"><span className="w-4 h-px bg-electric-400 inline-block" />Electronics</p>
              <h2 className="text-2xl font-bold text-white mb-3">Accessories, spare parts &amp; repair services</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Genuine electronics accessories, original spare parts, and professional repair services for mobiles, laptops, computers, and household devices.
              </p>
              <Link to="/mobiles" className="btn-secondary btn-md mt-5 inline-flex">
                Explore Electronics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-shrink-0 hidden md:block">
              <div className="w-56 h-40 rounded-2xl overflow-hidden ring-1 ring-slate-700">
                <img src={categoryImages.mobiles} alt="Mobile & electronics" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLAR STRIP ──────────────────────────────── */}
      <section className="py-12">
        <div className="container-page">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 hidden md:block order-2">
              <div className="w-56 h-40 rounded-2xl overflow-hidden ring-1 ring-slate-700">
                <img src={categoryImages.solar} alt="Solar panels" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1 order-1">
              <p className="eyebrow-solar mb-3"><span className="w-4 h-px bg-solar-400 inline-block" />Solar Energy</p>
              <h2 className="text-2xl font-bold text-white mb-3">Rooftop solar panels &amp; installation</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Solar panels, inverters, batteries, and domestic rooftop solar installation services — helping homes and businesses in Aurangabad reduce their reliance on the grid.
              </p>
              <Link to="/solar" className="btn-secondary btn-md mt-5 inline-flex">
                Explore Solar <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="py-20">
        <div className="container-page">
          <div className="mb-10">
            <p className="eyebrow-blue mb-3"><span className="w-4 h-px bg-electric-400 inline-block" />Why choose us</p>
            <h2 className="section-title">Built for every electrical need</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon={<Zap className="w-5 h-5" />} title="Electrical Cables" desc="Domestic and industrial cables supplied across Marathwada to Pune." />
            <FeatureCard icon={<Sun className="w-5 h-5" />} title="Solar Equipment" desc="Panels, inverters, and batteries for home and commercial installations." />
            <FeatureCard icon={<Lightbulb className="w-5 h-5" />} title="Lights & Fans" desc="Energy-efficient lighting and ceiling fans for domestic and commercial use." />
            <FeatureCard icon={<Smartphone className="w-5 h-5" />} title="Electronics & Accessories" desc="Genuine accessories and original spare parts for electronic devices." />
            <FeatureCard icon={<Wrench className="w-5 h-5" />} title="Repair Services" desc="Mobile, laptop, desktop, and household device repairs." />
            <FeatureCard icon={<Truck className="w-5 h-5" />} title="Delivery Available" desc="Cable orders eligible for delivery across the region." />
          </div>
        </div>
      </section>

      {/* ── SERVICES CTA ─────────────────────────────── */}
      <section className="py-16">
        <div className="container-page">
          <div className="rounded-2xl bg-slate-900 ring-1 ring-slate-700 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-solar-500/5 blur-3xl pointer-events-none" />
            <div className="relative max-w-xl">
              <p className="eyebrow-solar mb-3"><span className="w-4 h-px bg-solar-400 inline-block" />Repair & Installation</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Device repair or solar consultation?</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Submit a device repair request or request a solar installation assessment online. Our team will review your enquiry and get back to you.
              </p>
              <Link to="/services" className="btn-solar btn-lg inline-flex">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
