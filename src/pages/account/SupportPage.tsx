import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, ChevronRight, Plus, AlertCircle, Ticket as TicketIcon, Clock } from 'lucide-react';
import { fetchSupportTickets } from '@/lib/api';
import type { SupportTicket } from '@/types';
import { TICKET_STATUS_LABELS } from '@/types';
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
    case 'resolved':
    case 'closed': return 'badge-success';
    case 'awaiting_response': return 'badge-warning';
    default: return 'badge-blue';
  }
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupportTickets()
      .then(data => { setTickets(data); setLoading(false); })
      .catch(e => { setError(e instanceof Error ? e.message : 'Failed to load tickets'); setLoading(false); });
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden py-10 bg-hero-glow">
        <div className="absolute inset-0 bg-grid" />
        <div className="relative container-page">
          <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
            <Link to="/" className="hover:text-slate-300">Home</Link>
            <span>/</span>
            <span className="text-slate-400">Support</span>
          </nav>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Support Tickets</h1>
              <p className="text-slate-400 text-sm">Get help with orders, products, or any other questions.</p>
            </div>
            <Link to="/support/new" className="btn-primary btn-sm flex-shrink-0">
              <Plus className="w-4 h-4" /> New Ticket
            </Link>
          </div>
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
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-5">
              <LifeBuoy className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No support tickets</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-5">
              Need help with something? Create a support ticket and we will get back to you.
            </p>
            <Link to="/support/new" className="btn-primary btn-sm">
              <Plus className="w-4 h-4" /> Create Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/support/${ticket.id}`}
                className="card card-hover p-5 flex items-center gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-electric-500/10 flex items-center justify-center flex-shrink-0">
                  <TicketIcon className="w-5 h-5 text-electric-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{ticket.reference}</span>
                    <span className={`badge ${statusColor(ticket.status)}`}>
                      {TICKET_STATUS_LABELS[ticket.status as keyof typeof TICKET_STATUS_LABELS] ?? ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-1">{ticket.subject}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(ticket.created_at)}
                    </span>
                    <span className="capitalize">{ticket.category.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-electric-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
