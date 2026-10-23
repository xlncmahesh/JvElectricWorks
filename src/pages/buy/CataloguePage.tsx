import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, PackageSearch } from 'lucide-react';
import { fetchProducts, fetchSubcategoriesByCategorySlug, fetchCategoryBySlug } from '@/lib/api';
import type { Product, Subcategory, Category } from '@/types';
import { setLastCategory } from '@/lib/preferences';
import { ProductCard } from '@/components/shopping/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { categoryImages, subcategoryImages } from '@/data/content';
import { useCart } from '@/hooks/useCart';
import { CartSidebar } from '@/components/shopping/CartSidebar';
import { useNavigate } from 'react-router-dom';

type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'newest';

const SORT_LABELS: Record<SortOption, string> = {
  newest:     'Newest',
  price_asc:  'Price: Low to High',
  price_desc: 'Price: High to Low',
  name_asc:   'Name A–Z',
};

const FULFILMENT_INFO: Record<string, { label: string; class: string }> = {
  cables:  { label: 'Delivery available on cable orders', class: 'badge-success' },
  lights:  { label: 'Lights & Fans — normally in-store purchase', class: 'badge-warning' },
  mobiles: { label: 'Electronics products — normally in-store purchase', class: 'badge-warning' },
  solar:   { label: 'Solar equipment — in-store or consultation', class: 'badge-teal' },
};

export default function CataloguePage() {
  const { category = '', subcategory } = useParams<{ category: string; subcategory?: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [subcats, setSubcats] = useState<Subcategory[]>([]);
  const [catInfo, setCatInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [sortOpen, setSortOpen] = useState(false);

  // Fetch category info + subcategories when category changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [cat, subs] = await Promise.all([
        fetchCategoryBySlug(category),
        fetchSubcategoriesByCategorySlug(category),
      ]);
      if (!mounted) return;
      setCatInfo(cat);
      setSubcats(subs);
    })();
    return () => { mounted = false; };
  }, [category]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        category_slug: category || undefined,
        subcategory_slug: subcategory || undefined,
        search: search || undefined,
        sort,
      });
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [category, subcategory, search, sort]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (category) setLastCategory(category); }, [category]);

  const categoryName = catInfo?.name
    ?? (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Products');
  const subcategoryName = subcategory
    ? subcats.find(s => s.slug === subcategory)?.name
      ?? (subcategory.charAt(0).toUpperCase() + subcategory.slice(1))
    : null;
  const heroImage = subcategory
    ? subcategoryImages[`${category}-${subcategory}`]
    : categoryImages[category];
  const fulfilment = FULFILMENT_INFO[category];

  const breadcrumb = [
    { label: 'Shop', href: '/buy' },
    { label: categoryName, href: `/buy/${category}` },
    ...(subcategoryName ? [{ label: subcategoryName }] : []),
  ];

  // Build subcategory tab list dynamically from DB, with "All" as first
  const subcatTabs = [
    { label: `All ${categoryName}`, path: `/buy/${category}` },
    ...subcats.map(s => ({ label: s.name, path: `/buy/${category}/${s.slug}` })),
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-12 bg-hero-glow">
        <div className="absolute inset-0 bg-grid" />
        {heroImage && (
          <div className="absolute inset-0">
            <img src={heroImage} alt="" className="w-full h-full object-cover opacity-8" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950" />
          </div>
        )}
        <div className="relative container-page">
          <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
            <Link to="/" className="hover:text-slate-300">Home</Link>
            {breadcrumb.map((b, i) => (
              <React.Fragment key={i}>
                <span>/</span>
                {b.href
                  ? <Link to={b.href} className="hover:text-slate-300">{b.label}</Link>
                  : <span className="text-slate-400">{b.label}</span>
                }
              </React.Fragment>
            ))}
          </nav>
          <h1 className="text-4xl font-bold text-white mb-2">
            {subcategoryName ? `${subcategoryName}` : categoryName}
          </h1>
          {fulfilment && (
            <span className={`${fulfilment.class} mt-2 inline-flex`}>
              {fulfilment.label}
            </span>
          )}
        </div>
      </section>

      {/* Subcategory tabs — dynamic from DB */}
      {subcatTabs.length > 1 && (
        <div className="sticky top-16 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800">
          <div className="container-page">
            <div className="flex gap-1 py-2.5 overflow-x-auto">
              {subcatTabs.map(sc => {
                const isActive = sc.path === `/buy/${category}${subcategory ? `/${subcategory}` : ''}`;
                return (
                  <Link
                    key={sc.path}
                    to={sc.path}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-electric-500/15 text-electric-300 ring-1 ring-electric-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {sc.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={`border-b border-slate-800 bg-slate-950/90 backdrop-blur ${subcatTabs.length > 1 ? 'sticky top-[calc(4rem+44px)] z-20' : 'sticky top-16 z-20'}`}>
        <div className="container-page py-3 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 py-1.5 text-xs h-9"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(v => !v)}
              className="btn-secondary btn-sm h-9 text-xs gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {SORT_LABELS[sort]}
              <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-slate-900 ring-1 ring-slate-700 shadow-card py-1 z-50 animate-fade-in">
                {(Object.keys(SORT_LABELS) as SortOption[]).map(s => (
                  <button
                    key={s}
                    onClick={() => { setSort(s); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors ${sort === s ? 'text-electric-300' : 'text-slate-300'}`}
                  >
                    {SORT_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto text-xs text-slate-600">
            {!loading && `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container-page py-8 pb-20">
        {error ? (
          <EmptyState variant="error" description={error} action={{ label: 'Retry', onClick: load }} />
        ) : loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-5">
              <PackageSearch className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {search ? 'No matches found' : 'Nothing here yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              {search
                ? `No products found matching "${search}". Try a different search term.`
                : 'Products in this category will appear here once they are added. Check back soon or contact us directly.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="btn-secondary btn-sm mt-5">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={(prod, qty) => { addToCart(prod, qty); setCartOpen(true); }} />
            ))}
          </div>
        )}
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); navigate('/checkout'); }} />
    </div>
  );
}
