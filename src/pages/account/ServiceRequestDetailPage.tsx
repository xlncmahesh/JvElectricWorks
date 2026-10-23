import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Wrench, Clock, Sun, ImageIcon, Smartphone } from 'lucide-react';
import { fetchServiceRequestById } from '@/lib/api';
import type { ServiceRequestDetail } from '@/types';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/types';
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

export default function ServiceRequestDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchServiceRequestById(id);
        if (!mounted) return;
        setRequest(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load request');
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
      <Link to="/requests" className="btn-secondary btn-sm">Back to Requests</Link>
    </div>
  );

  if (!request) return (
    <div className="container-page py-16 flex flex-col items-center text-center">
      <Wrench className="w-10 h-10 text-slate-600 mb-3" />
      <h3 className="text-lg font-semibold text-white mb-2">Request not found</h3>
      <Link to="/requests" className="btn-secondary btn-sm">Back to Requests</Link>
    </div>
  );

  const isRepair = request.type?.slug === 'repair';

  return (
    <div>
      <div className="container-page pt-8 pb-4">
        <nav className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-slate-300">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/requests" className="hover:text-slate-300">My Requests</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-400">{request.reference}</span>
        </nav>
      </div>

      <div className="container-page pb-20 space-y-6">
        {/* Request header */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-electric-500/10 flex items-center justify-center flex-shrink-0">
                {isRepair ? <Smartphone className="w-5 h-5 text-electric-400" /> : <Sun className="w-5 h-5 text-electric-400" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white mb-1">{request.reference}</h1>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-medium text-electric-400">
                    {isRepair ? 'Repair Request' : 'Solar Installation'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(request.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <span className={`badge ${statusColor(request.status)}`}>
              {SERVICE_REQUEST_STATUS_LABELS[request.status] ?? request.status}
            </span>
          </div>

          {/* Status note */}
          <div className="mt-4 rounded-xl bg-slate-800/50 ring-1 ring-slate-800 p-3.5">
            <p className="text-xs text-slate-400 leading-relaxed">
              {request.status === 'pending' && 'Your request has been submitted and is awaiting review. We will update the status once we assess it.'}
              {request.status === 'reviewing' && 'Your request is currently under review. We are assessing the details and will respond soon.'}
              {request.status === 'accepted' && 'Your request has been accepted. We will schedule it shortly.'}
              {request.status === 'scheduled' && 'Your request has been scheduled. Please check back for updates.'}
              {request.status === 'completed' && 'This request has been completed.'}
              {request.status === 'declined' && 'This request has been declined. Please contact us if you have questions.'}
              {request.status === 'cancelled' && 'This request has been cancelled.'}
            </p>
          </div>
        </div>

        {/* Request details */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Request Details</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500 mb-1">Contact</dt>
              <dd className="text-white">{request.full_name}</dd>
              <dd className="text-slate-400 text-xs">{request.phone}</dd>
              {request.email && <dd className="text-slate-400 text-xs">{request.email}</dd>}
            </div>

            {isRepair ? (
              <>
                {request.device_type && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Device Type</dt>
                    <dd className="text-white capitalize">{request.device_type.replace(/_/g, ' ')}</dd>
                  </div>
                )}
                {request.device_brand && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Brand</dt>
                    <dd className="text-white">{request.device_brand}</dd>
                  </div>
                )}
                {request.device_model && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Model</dt>
                    <dd className="text-white">{request.device_model}</dd>
                  </div>
                )}
                {request.problem_description && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-slate-500 mb-1">Problem Description</dt>
                    <dd className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{request.problem_description}</dd>
                  </div>
                )}
              </>
            ) : (
              <>
                {request.install_address && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-slate-500 mb-1">Installation Address</dt>
                    <dd className="text-white">{request.install_address}</dd>
                  </div>
                )}
                {request.install_locality && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Locality</dt>
                    <dd className="text-white">{request.install_locality}</dd>
                  </div>
                )}
                {request.install_postal_code && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Postal Code</dt>
                    <dd className="text-white">{request.install_postal_code}</dd>
                  </div>
                )}
                {request.property_type && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Property Type</dt>
                    <dd className="text-white capitalize">{request.property_type}</dd>
                  </div>
                )}
                {request.estimated_consumption && (
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Estimated Consumption</dt>
                    <dd className="text-white">{request.estimated_consumption}</dd>
                  </div>
                )}
                {request.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-slate-500 mb-1">Notes</dt>
                    <dd className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{request.notes}</dd>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Uploaded images */}
          {request.images && request.images.length > 0 && (
            <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attached Images</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {request.images.map(img => (
                  <a
                    key={img.id}
                    href={img.public_url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden bg-slate-800 ring-1 ring-slate-700 aspect-square hover:ring-electric-500/40 transition-all"
                  >
                    {img.public_url ? (
                      <img src={img.public_url} alt="Repair" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat */}
        <ChatPanel
          threadType="service_request"
          threadId={request.id}
          title={`Messages about ${request.reference}`}
        />
      </div>
    </div>
  );
}
