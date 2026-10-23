import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHero, ContentSection } from '@/components/info/PageHero';
import { InfoSubcategoryCard } from '@/components/shopping/CategoryCard';
import { lightsPageContent } from '@/data/content';

export default function LightsPage() {
  const { hero, subcategories, sections } = lightsPageContent;
  return (
    <div>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        accent="teal"
        breadcrumbs={[{ label: 'Lights & Fans' }]}
      >
        <Link to="/buy/lights" className="btn-primary btn-md inline-flex">
          Shop Lights & Fans <ArrowRight className="w-4 h-4" />
        </Link>
      </PageHero>

      <section className="py-16">
        <div className="container-page">
          <div className="mb-8">
            <p className="eyebrow-teal mb-2"><span className="w-4 h-px bg-teal-400 inline-block" />Categories</p>
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
                accent="teal"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-page max-w-2xl">
          <h2 className="section-title mb-8">About Our Lights & Fans Range</h2>
          <div className="space-y-7">
            {sections.map(s => <ContentSection key={s.title} title={s.title} body={s.body} accent="teal" />)}
          </div>
        </div>
      </section>
    </div>
  );
}
