import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Ticket as TicketIcon, Clock, FileText } from 'lucide-react';
import { fetchSupportTicketById } from '@/lib/api';
import type { SupportTicket } from '@/types';
import { TICKET_STATUS_LABELS, TICKET_CATEGORIES } from '@/types';
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
    case 'resolved':
    case 'closed': return 'badge-success';
    case 'awaiting_response': return 'badge-warning';
    default: return 'badge-blue';
  }
}

function categoryLabel(value: string): string {
  return TICKET_CATEGORIES.find(c => c.value === value)?.label ?? value.replace(/_/g, ' ');
}

export default function SupportTicketDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchSupportTicketById(id);
        if (!mounted) return;
        setTicket(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load ticket');
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
      <Link to="/support" className="btn-secondary btn-sm">Back to Support</Link>
    </div>
  );

  if (!ticket) return (
    <div className="container-page py-16 flex flex-col items-center text-center">
      <TicketIcon className="w-10 h-10 text-slate-600 mb-3" />
      <h3 className="text-lg font-semibold text-white mb-2">Ticket not found</h3>
      <Link to="/support" className="btn-secondary btn-sm">Back to Support</Link>
    </div>
  );

  return (
    <div>
      <div className="container-page pt-8 pb-4">
        <nav className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-slate-300">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/support" className="hover:text-slate-300">Support</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-400">{ticket.reference}</span>
        </nav>
      </div>

      <div className="container-page pb-20 space-y-6">
        {/* Ticket header */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{ticket.subject}</h1>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-mono">{ticket.reference}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(ticket.created_at)}
                </span>
                <span>{categoryLabel(ticket.category)}</span>
              </div>
            </div>
            <span className={`badge ${statusColor(ticket.status)}`}>
              {TICKET_STATUS_LABELS[ticket.status as keyof typeof TICKET_STATUS_LABELS] ?? ticket.status}
            </span>
          </div>

          {/* Description */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Description</h3>
            </div>
            <div className="rounded-xl bg-slate-800/50 ring-1 ring-slate-800 p-4">
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            </div>
          </div>

          {/* Status note */}
          {ticket.status === 'open' && (
            <div className="mt-4 rounded-xl bg-slate-800/50 ring-1 ring-slate-800 p-3.5">
              <p className="text-xs text-slate-400 leading-relaxed">
                Your ticket is open and awaiting review. We will respond as soon as possible. You can send additional messages below.
              </p>
            </div>
          )}
        </div>

        {/* Chat */}
        <ChatPanel
          threadType="ticket"
          threadId={ticket.id}
          title={`Messages about ${ticket.reference}`}
        />
      </div>
    </div>
  );
}
