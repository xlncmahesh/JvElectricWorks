import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Truck, Store, MessageSquare, Package, AlertCircle, Clock } from 'lucide-react';
import { fetchOrderById } from '@/lib/api';
import type { Order } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';
import { ChatPanel } from '@/components/shared/ChatPanel';
import { Skeleton } from '@/components/ui/Skeleton';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const FULFILMENT_ICON = {
  delivery: <Truck className="w-4 h-4" />,
  pickup: <Store className="w-4 h-4" />,
  consultation: <MessageSquare className="w-4 h-4" />,
};
const FULFILMENT_LABEL = {
  delivery: 'Delivery',
  pickup: 'Store Pickup',
  consultation: 'Consultation',
};

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'badge-success';
    case 'cancelled': return 'badge-danger';
    case 'processing':
    case 'to_be_delivered':
    case 'to_be_picked_up': return 'badge-teal';
    default: return 'badge-warning';
  }
}

export default function OrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchOrderById(id);
        if (!mounted) return;
        setOrder(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load order');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return (
    <div className="container-page py-10">
      <Skeleton className="h-6 w-32 mb-6" />
      <Skeleton className="h-32 rounded-2xl mb-6" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );

  if (error) return (
    <div className="container-page py-16 flex flex-col items-center text-center">
      <AlertCircle className="w-8 h-8 text-danger-400 mb-3" />
      <p className="text-sm text-muted mb-4">{error}</p>
      <Link to="/orders" className="btn-secondary btn-sm">Back to Orders</Link>
    </div>
  );

  if (!order) return (
    <div className="container-page py-16 flex flex-col items-center text-center">
      <Package className="w-10 h-10 text-slate-600 mb-3" />
      <h3 className="text-lg font-semibold text-white mb-2">Order not found</h3>
      <p className="text-sm text-slate-500 mb-4">This order may have been removed or you may not have access.</p>
      <Link to="/orders" className="btn-secondary btn-sm">Back to Orders</Link>
    </div>
  );

  const items = order.order_items ?? [];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="container-page pt-8 pb-4">
        <nav className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-slate-300">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/orders" className="hover:text-slate-300">My Orders</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-400">{order.reference}</span>
        </nav>
      </div>

      <div className="container-page pb-20 space-y-6">
        {/* Order header */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{order.reference}</h1>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(order.created_at)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <span className={`badge ${statusColor(order.status)}`}>
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
              <Link to="/orders" className="text-xs text-slate-500 hover:text-electric-400 flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> All orders
              </Link>
            </div>
          </div>

          {/* Status note */}
          <div className="mt-4 rounded-xl bg-slate-800/50 ring-1 ring-slate-800 p-3.5">
            <p className="text-xs text-slate-400 leading-relaxed">
              {order.status === 'pending' && 'Your order has been received and is awaiting confirmation from the business. You will see status updates here once the business processes your order.'}
              {order.status === 'processing' && 'Your order is being prepared. The business will update the status once it is ready for pickup or delivery.'}
              {order.status === 'to_be_delivered' && 'Your order is ready and will be delivered to your address.'}
              {order.status === 'to_be_picked_up' && 'Your order is ready for pickup at our Aurangabad store.'}
              {order.status === 'completed' && 'This order has been completed.'}
              {order.status === 'cancelled' && 'This order has been cancelled.'}
            </p>
          </div>
        </div>

        {/* Order items */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Items ({items.length})</h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white line-clamp-1">{item.product_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.quantity} {item.price_unit} × ₹{Number(item.unit_price).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-white">
                    ₹{Number(item.line_total).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm text-slate-400">Subtotal</span>
            <span className="text-lg font-bold text-white">
              ₹{Number(order.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Fulfilment details */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Fulfilment Details</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500 mb-1">Mode</dt>
              <dd className="text-white flex items-center gap-2">
                {FULFILMENT_ICON[order.fulfilment_mode]}
                {FULFILMENT_LABEL[order.fulfilment_mode]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 mb-1">Contact</dt>
              <dd className="text-white">{order.full_name}</dd>
              <dd className="text-slate-400 text-xs">{order.phone}</dd>
              {order.email && <dd className="text-slate-400 text-xs">{order.email}</dd>}
            </div>
            {order.delivery_address && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500 mb-1">Delivery Address</dt>
                <dd className="text-white text-sm">{order.delivery_address}</dd>
              </div>
            )}
            {order.notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500 mb-1">Notes</dt>
                <dd className="text-slate-300 text-sm">{order.notes}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <ChatPanel
          threadType="order"
          threadId={order.id}
          title={`Messages about ${order.reference}`}
        />
      </div>
    </div>
  );
}
