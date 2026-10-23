import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Store, MessageSquare } from 'lucide-react';
import type { Product } from '@/types';
import { isOutOfStock, isLowStock, stockLabel } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, qty: number) => void;
}

const FULFILMENT_ICON = {
  delivery:     <Truck className="w-3 h-3" />,
  pickup:       <Store className="w-3 h-3" />,
  consultation: <MessageSquare className="w-3 h-3" />,
};
const FULFILMENT_BADGE: Record<string, 'success' | 'warning' | 'teal'> = {
  delivery:     'success',
  pickup:       'warning',
  consultation: 'teal',
};
const FULFILMENT_LABEL = {
  delivery:     'Delivery',
  pickup:       'Store Pickup',
  consultation: 'Consultation',
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const outOfStock = isOutOfStock(product);
  const lowStock = isLowStock(product);
  const stock = stockLabel(product);

  return (
    <div className="card card-hover flex flex-col overflow-hidden group">
      {/* Image */}
      <div className="relative h-44 bg-slate-800 overflow-hidden flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'grayscale opacity-60' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5">
          <Badge variant={FULFILMENT_BADGE[product.fulfilment_mode]}>
            {FULFILMENT_ICON[product.fulfilment_mode]}
            {FULFILMENT_LABEL[product.fulfilment_mode]}
          </Badge>
          {outOfStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-danger-500/20 text-danger-400 ring-1 ring-danger-500/30">
              Out of stock
            </span>
          )}
          {lowStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-warning-500/20 text-warning-400 ring-1 ring-warning-500/30">
              {stock}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {product.subcategory && (
          <Link
            to={`/buy/${product.category?.slug ?? 'products'}/${product.subcategory.slug}`}
            className="text-[10px] font-medium uppercase tracking-wider text-electric-400/70 hover:text-electric-300 transition-colors mb-1.5"
          >
            {product.subcategory.name}
          </Link>
        )}
        <h3 className="font-semibold text-white text-sm leading-snug mb-1 line-clamp-2">{product.name}</h3>
        {product.summary && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{product.summary}</p>
        )}
        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <div className={`text-lg font-bold ${outOfStock ? 'text-slate-500' : 'text-white'}`}>
                ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-500">{product.price_unit}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/buy/${product.category?.slug ?? 'products'}/product/${product.slug}`}
                className="btn-secondary btn-sm text-xs"
              >
                View <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              {onAddToCart && product.fulfilment_mode !== 'consultation' && !outOfStock && (
                <Button size="sm" onClick={() => onAddToCart(product, product.min_quantity)}>Add</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
