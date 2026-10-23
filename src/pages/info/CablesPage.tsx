import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck } from 'lucide-react';
import { PageHero, ContentSection } from '@/components/info/PageHero';
import { InfoSubcategoryCard } from '@/components/shopping/CategoryCard';
import { cablePageContent } from '@/data/content';

export default function CablesPage() {
  const { hero, subcategories, sections } = cablePageContent;
  return (
    <div>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        accent="blue"
        breadcrumbs={[{ label: 'Cables' }]}
      >
        <Link to="/buy/cables" className="btn-primary btn-md inline-flex">
          Shop Cables <ArrowRight className="w-4 h-4" />
        </Link>
      </PageHero>

      {/* Subcategories */}
      <section className="py-16">
        <div className="container-page">
          <div className="mb-8">
            <p className="eyebrow-blue mb-2"><span className="w-4 h-px bg-electric-400 inline-block" />Categories</p>
            <h2 className="section-title">Domestic & Industrial</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {subcategories.map(sub => (
              <InfoSubcategoryCard
                key={sub.slug}
                name={sub.name}
                description={sub.description}
                image={sub.image}
                buyPath={sub.buy_path}
                infoPath={sub.info_path}
                accent="blue"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Distribution callout */}
      <section className="py-6">
        <div className="container-page">
          <div className="rounded-2xl bg-slate-900 ring-1 ring-slate-800 p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-electric-500/10 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-electric-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Distribution across Marathwada and Pune</h3>
              <p className="text-sm text-slate-400">Cables can be delivered to retailers and project sites across the region. Contact us for bulk orders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <section className="py-14">
        <div className="container-page max-w-2xl">
          <h2 className="section-title mb-8">About Our Cable Range</h2>
          <div className="space-y-7">
            {sections.map(s => <ContentSection key={s.title} title={s.title} body={s.body} accent="blue" />)}
          </div>
        </div>
      </section>
    </div>
  );
}
