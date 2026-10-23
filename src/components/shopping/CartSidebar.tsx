import React from 'react';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import type { CartItem } from '@/types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

function CartItemRow({ item, onUpdate, onRemove }: {
  item: CartItem;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  const { product, quantity } = item;
  const step = product.quantity_increment;
  const min = product.min_quantity;
  const unit = product.purchasing_mode === 'length' ? 'm' : 'pcs';

  const decrease = () => {
    const newQ = Math.round((quantity - step) * 1000) / 1000;
    if (newQ < min) onRemove();
    else onUpdate(newQ);
  };
  const increase = () => {
    const newQ = Math.round((quantity + step) * 1000) / 1000;
    if (product.max_quantity && newQ > product.max_quantity) return;
    onUpdate(newQ);
  };

  return (
    <div className="flex gap-3 py-3">
      {/* Image */}
      <div className="w-14 h-14 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-slate-700"><ShoppingCart className="w-5 h-5" /></div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white line-clamp-2 leading-snug">{product.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">₹{product.price.toLocaleString('en-IN')} {product.price_unit}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 ring-1 ring-slate-700 rounded-lg overflow-hidden">
            <button onClick={decrease} className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs">
              −
            </button>
            <span className="px-2 text-xs font-medium text-white min-w-[40px] text-center">{quantity}{unit}</span>
            <button onClick={increase} className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs">
              +
            </button>
          </div>
          <button onClick={onRemove} className="text-slate-600 hover:text-danger-500 transition-colors p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-white">₹{item.line_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
}

export function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { cart, updateQuantity, removeItem } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-[420px] bg-slate-950 border-l border-slate-800 z-50
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-electric-400" />
            <h2 className="font-display font-bold text-white">Cart</h2>
            {cart.items.length > 0 && (
              <span className="badge-blue">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</span>
            )}
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm p-1.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 divide-y divide-slate-800/60">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm font-medium text-white mb-1">Your cart is empty</p>
              <p className="text-xs text-slate-500">Browse products and add them here.</p>
              <button onClick={onClose} className="btn-secondary btn-sm mt-5">Continue Shopping</button>
            </div>
          ) : (
            cart.items.map(item => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onUpdate={qty => updateQuantity(item.product.id, qty)}
                onRemove={() => removeItem(item.product.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-bold text-white text-base">₹{cart.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="text-xs text-slate-500">Fulfilment and delivery details confirmed at checkout.</p>
            <Button variant="primary" size="lg" className="w-full" onClick={onCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
