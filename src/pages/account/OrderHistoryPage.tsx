import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, AlertCircle, PackageOpen } from 'lucide-react';
import { fetchOrders } from '@/lib/api';
import type { Order } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders()
      .then(data => { setOrders(data); setLoading(false); })
      .catch(e => { setError(e instanceof Error ? e.message : 'Failed to load orders'); setLoading(false); });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-10 bg-hero-glow">
        <div className="absolute inset-0 bg-grid" />
        <div className="relative container-page">
          <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
            <Link to="/" className="hover:text-slate-300">Home</Link>
            <span>/</span>
            <span className="text-slate-400">My Orders</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-slate-400 text-sm">
            {user?.email ? `Signed in as ${user.email}` : 'View your order history and track status.'}
          </p>
        </div>
      </section>

      <div className="container-page py-8 pb-20">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-8 h-8 text-danger-400 mb-3" />
            <p className="text-sm text-muted mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary btn-sm">Retry</button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-5">
              <PackageOpen className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No orders yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-5">
              When you place an order, it will appear here so you can track its status and message us about it.
            </p>
            <Link to="/buy" className="btn-primary btn-sm">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const itemCount = order.order_items?.length ?? 0;
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="card card-hover p-5 flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-electric-500/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-electric-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">{order.reference}</span>
                      <span className={`badge ${statusColor(order.status)}`}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.created_at)}
                      </span>
                      <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                      <span className="font-medium text-slate-400">
                        ₹{Number(order.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-electric-400 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
