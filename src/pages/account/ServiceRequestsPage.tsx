import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ChevronRight, AlertCircle, Clock, ClipboardList } from 'lucide-react';
import { fetchServiceRequests } from '@/lib/api';
import type { ServiceRequestDetail } from '@/types';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'badge-success';
    case 'declined':
    case 'cancelled': return 'badge-danger';
    case 'accepted':
    case 'scheduled': return 'badge-teal';
    case 'reviewing': return 'badge-blue';
    default: return 'badge-warning';
  }
}

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequestDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceRequests()
      .then(data => { setRequests(data); setLoading(false); })
      .catch(e => { setError(e instanceof Error ? e.message : 'Failed to load requests'); setLoading(false); });
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden py-10 bg-hero-glow">
        <div className="absolute inset-0 bg-grid" />
        <div className="relative container-page">
          <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
            <Link to="/" className="hover:text-slate-300">Home</Link>
            <span>/</span>
            <span className="text-slate-400">My Requests</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Service Requests</h1>
          <p className="text-slate-400 text-sm">Track your repair requests and solar installation enquiries.</p>
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
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-5">
              <ClipboardList className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No service requests</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-5">
              When you submit a repair request or solar installation enquiry, it will appear here so you can track its status.
            </p>
            <Link to="/services" className="btn-primary btn-sm">View Services</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => {
              const isRepair = req.type?.slug === 'repair';
              const title = isRepair
                ? `${req.device_brand ?? ''} ${req.device_model ?? ''}`.trim() || 'Repair Request'
                : `Solar Installation — ${req.install_locality ?? ''}`.trim() || 'Solar Installation Request';
              return (
                <Link
                  key={req.id}
                  to={`/requests/${req.id}`}
                  className="card card-hover p-5 flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-electric-500/10 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-electric-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">{req.reference}</span>
                      <span className="text-[10px] uppercase tracking-wider text-faint">
                        {isRepair ? 'Repair' : 'Solar'}
                      </span>
                      <span className={`badge ${statusColor(req.status)}`}>
                        {SERVICE_REQUEST_STATUS_LABELS[req.status] ?? req.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-1">{title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(req.created_at)}
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
