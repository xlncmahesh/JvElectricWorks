import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { categoryImages } from '@/data/content';
import { getLastCategory, setLastCategory } from '@/lib/preferences';
import { CategoryCard } from '@/components/shopping/CategoryCard';
import { fetchCategories } from '@/lib/api';
import type { Category } from '@/types';

const ACCENT_MAP: Record<string, 'blue' | 'teal' | 'solar'> = {
  blue: 'blue',
  teal: 'teal',
  solar: 'solar',
  cyan: 'blue',
  amber: 'solar',
};

export default function BuyHomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [lastCat, setLastCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLastCat(getLastCategory());
    fetchCategories()
      .then(cats => { setCategories(cats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (slug: string) => {
    setLastCategory(slug);
    setLastCat(slug);
  };

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden py-14 bg-hero-glow">
        <div className="absolute inset-0 bg-grid" />
        <div className="relative container-page">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-5 h-5 text-electric-400" />
            <nav className="text-xs text-slate-500">
              <Link to="/" className="hover:text-slate-300">Home</Link>
              <span className="mx-1.5">/</span>
              <span className="text-slate-400">Shop</span>
            </nav>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">What are you looking for?</h1>
          <p className="text-slate-400 text-lg">Browse by category to find the right products.</p>
          {lastCat && (
            <p className="mt-2 text-xs text-slate-600">
              Last browsed: <span className="text-slate-500 capitalize">{lastCat}</span>
            </p>
          )}
        </div>
      </section>

      {/* Category grid */}
      <section className="py-12">
        <div className="container-page">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-slate-900 ring-1 ring-slate-800 animate-pulse h-64" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map(cat => (
                <CategoryCard
                  key={cat.id}
                  name={cat.name}
                  tagline={cat.tagline ?? ''}
                  image={categoryImages[cat.slug] ?? ''}
                  buyPath={cat.buy_path}
                  accent={ACCENT_MAP[cat.accent] ?? 'blue'}
                  isSelected={lastCat === cat.slug}
                  onClick={() => handleSelect(cat.slug)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info callout */}
      <section className="py-8 pb-16">
        <div className="container-page">
          <div className="rounded-2xl bg-slate-900 ring-1 ring-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div>
              <p className="text-sm font-semibold text-white mb-1">Need a repair or installation?</p>
              <p className="text-xs text-slate-500">Device repairs and solar installations are handled through our services page.</p>
            </div>
            <Link to="/services" className="btn-secondary btn-sm flex-shrink-0">
              Services <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
