import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sun, Battery, PanelsTopLeft } from 'lucide-react';
import { PageHero, ContentSection } from '@/components/info/PageHero';
import { solarPageContent } from '@/data/content';

export default function SolarPage() {
  const { hero, sections } = solarPageContent;
  return (
    <div>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        accent="solar"
        breadcrumbs={[{ label: 'Solar' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/buy/solar" className="btn-solar btn-md inline-flex">
            Shop Solar Equipment <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/services/solarinstallation/form" className="btn-secondary btn-md inline-flex">
            Request Installation
          </Link>
        </div>
      </PageHero>

      {/* Highlights */}
      <section className="py-16">
        <div className="container-page">
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: <PanelsTopLeft className="w-6 h-6" />, title: 'Solar Panels', desc: 'Efficient rooftop panels for residential and commercial installations.', color: 'bg-solar-500/10 text-solar-400' },
              { icon: <Sun className="w-6 h-6" />, title: 'Inverters', desc: 'Charge controllers and inverters that convert solar power for home use.', color: 'bg-solar-500/10 text-solar-400' },
              { icon: <Battery className="w-6 h-6" />, title: 'Battery Storage', desc: 'Battery systems to store excess energy for use when the sun isn’t shining.', color: 'bg-solar-500/10 text-solar-400' },
            ].map(card => (
              <div key={card.title} className="card p-5">
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-4`}>{card.icon}</div>
                <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-6">
        <div className="container-page">
          <div className="rounded-2xl bg-solar-500/10 ring-1 ring-solar-500/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1">Interested in solar installation?</h3>
              <p className="text-sm text-slate-400">Submit an installation consultation request and we will assess your site.</p>
            </div>
            <Link to="/services/solarinstallation/form" className="btn-solar btn-md flex-shrink-0">
              Request Consultation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-page max-w-2xl">
          <h2 className="section-title mb-8">Solar at JV Electric Works</h2>
          <div className="space-y-7">
            {sections.map(s => <ContentSection key={s.title} title={s.title} body={s.body} accent="solar" />)}
          </div>
        </div>
      </section>
    </div>
  );
}
