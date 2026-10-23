import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Wrench, Package } from 'lucide-react';
import { PageHero, ContentSection } from '@/components/info/PageHero';
import { electronicsPageContent } from '@/data/content';

export default function MobilesPage() {
  const { hero, sections } = electronicsPageContent;
  return (
    <div>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        accent="blue"
        breadcrumbs={[{ label: 'Electronics' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/buy/mobiles" className="btn-primary btn-md inline-flex">
            Shop Electronics <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/services/repair/form" className="btn-secondary btn-md inline-flex">
            <Wrench className="w-4 h-4" /> Request Repair
          </Link>
        </div>
      </PageHero>

      {/* Feature cards */}
      <section className="py-16">
        <div className="container-page">
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: <Smartphone className="w-6 h-6" />, title: 'Accessories', desc: 'Cables, cases, screen protectors, earphones, and power banks.', href: '/buy/mobiles' },
              { icon: <Package className="w-6 h-6" />, title: 'Spare Parts', desc: 'Original and OEM-equivalent spare parts for phones and devices.', href: '/buy/mobiles' },
              { icon: <Wrench className="w-6 h-6" />, title: 'Repairs', desc: 'Professional repair for mobiles, laptops, computers, and household devices.', href: '/services' },
            ].map(card => (
              <Link key={card.title} to={card.href} className="card card-hover p-5 group">
                <div className="w-10 h-10 rounded-lg bg-electric-500/10 text-electric-400 flex items-center justify-center mb-4">{card.icon}</div>
                <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                <div className="flex items-center gap-1 text-electric-400 text-xs font-medium mt-3 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-page max-w-2xl">
          <h2 className="section-title mb-8">Electronics Products & Services</h2>
          <div className="space-y-7">
            {sections.map(s => <ContentSection key={s.title} title={s.title} body={s.body} accent="blue" />)}
          </div>
        </div>
      </section>
    </div>
  );
}
