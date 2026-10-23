import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Truck, Store, MessageSquare, Package, ChevronRight, AlertTriangle } from 'lucide-react';
import { fetchProductBySlug } from '@/lib/api';
import type { Product } from '@/types';
import { isOutOfStock, isLowStock, stockLabel } from '@/types';
import { useCart } from '@/hooks/useCart';
import { QuantityInput } from '@/components/shopping/QuantityInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CartSidebar } from '@/components/shopping/CartSidebar';
import { fulfilmentLabels } from '@/data/content';

export default function ProductDetailPage() {
  const { category = '', slug = '' } = useParams<{ category: string; slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const p = await fetchProductBySlug(category, slug);
        if (!mounted) return;
        setProduct(p);
        if (p) setQty(p.min_quantity);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [category, slug]);

  const handleAdd = () => {
    if (!product) return;
    addToCart(product, qty);
    setAdded(true);
    setCartOpen(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const fulfilment = product ? fulfilmentLabels[product.fulfilment_mode] : null;
  const fulfilmentBadge = product?.fulfilment_mode === 'delivery' ? 'success' : product?.fulfilment_mode === 'consultation' ? 'teal' : 'warning';
  const lineTotal = product ? Math.round(product.price * qty * 100) / 100 : 0;
  const outOfStock = product ? isOutOfStock(product) : false;
  const lowStock = product ? isLowStock(product) : false;
  const stock = product ? stockLabel(product) : null;

  if (loading) return (
    <div className="container-page py-10 grid md:grid-cols-2 gap-10">
      <Skeleton className="h-80 rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );

  if (error) return (
    <div className="container-page py-16">
      <EmptyState variant="error" description={error} action={{ label: 'Back to catalogue', onClick: () => navigate(`/buy/${category}`) }} />
    </div>
  );

  if (!product) return (
    <div className="container-page py-16">
      <EmptyState variant="empty" title="Product not found" description="This product may no longer be available." action={{ label: 'Browse catalogue', onClick: () => navigate(`/buy/${category}`) }} />
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div className="container-page pt-8 pb-4">
        <nav className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-slate-300">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/buy" className="hover:text-slate-300">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/buy/${category}`} className="hover:text-slate-300 capitalize">{category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-400">{product.name}</span>
        </nav>
      </div>

      <div className="container-page pb-20">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-slate-900 ring-1 ring-slate-800 aspect-[4/3]">
            {product.image_url
              ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <Package className="w-16 h-16" />
                </div>
            }
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {product.subcategory && (
                <Link to={`/buy/${category}/${product.subcategory.slug}`} className="badge-blue mb-3 inline-flex">
                  {product.subcategory.name}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{product.name}</h1>
              {product.summary && <p className="text-slate-400 text-sm leading-relaxed">{product.summary}</p>}
            </div>

            {/* Price + Stock */}
            <div className="card p-4 flex items-end justify-between">
              <div>
                <div className={`text-3xl font-bold ${outOfStock ? 'text-slate-500' : 'text-white'}`}>
                  ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-slate-500">{product.price_unit}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {fulfilment && (
                  <Badge variant={fulfilmentBadge}>
                    {product.fulfilment_mode === 'delivery' && <Truck className="w-3 h-3" />}
                    {product.fulfilment_mode === 'pickup' && <Store className="w-3 h-3" />}
                    {product.fulfilment_mode === 'consultation' && <MessageSquare className="w-3 h-3" />}
                    {fulfilment.label}
                  </Badge>
                )}
                {stock && (
                  <span className={`text-xs font-medium ${outOfStock ? 'text-danger-400' : lowStock ? 'text-warning-400' : 'text-success-400'}`}>
                    {stock}
                  </span>
                )}
              </div>
            </div>

            {/* Out of stock notice */}
            {outOfStock && (
              <div className="flex items-start gap-2.5 rounded-xl bg-danger-500/10 ring-1 ring-danger-500/20 p-3.5">
                <AlertTriangle className="w-4 h-4 text-danger-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-danger-400 leading-relaxed">
                  This product is currently out of stock. Please check back later or contact us directly to inquire about availability.
                </p>
              </div>
            )}

            {/* Fulfilment note */}
            {fulfilment && (
              <div className={`rounded-xl p-3.5 text-xs leading-relaxed ${
                product.fulfilment_mode === 'delivery' ? 'bg-success-500/10 text-success-500 ring-1 ring-success-500/20' :
                product.fulfilment_mode === 'consultation' ? 'bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20' :
                'bg-warning-500/10 text-warning-500 ring-1 ring-warning-500/20'
              }`}>
                {fulfilment.description}
              </div>
            )}

            {/* Quantity */}
            <QuantityInput product={product} onChange={setQty} />

            {/* Line total */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Estimated total</span>
              <span className="font-bold text-white text-lg">
                ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Add to cart */}
            {product.fulfilment_mode === 'consultation' ? (
              <Link to="/services" className="btn-solar btn-lg w-full justify-center">
                <MessageSquare className="w-4 h-4" /> Request Consultation
              </Link>
            ) : outOfStock ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled
              >
                Out of Stock
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ShoppingCart className="w-4 h-4" />}
                onClick={handleAdd}
              >
                {added ? 'Added!' : 'Add to Cart'}
              </Button>
            )}

            {/* Attributes */}
            {Object.keys(product.attributes).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Specifications</h3>
                <dl className="divide-y divide-slate-800 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                  {Object.entries(product.attributes).map(([k, v]) => (
                    <div key={k} className="flex px-4 py-2.5 text-sm">
                      <dt className="w-40 text-slate-500 flex-shrink-0 capitalize">{k.replace(/_/g, ' ')}</dt>
                      <dd className="text-white">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); navigate('/checkout'); }} />
    </div>
  );
}
