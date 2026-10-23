import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { createSupportTicket } from '@/lib/api';
import { TICKET_CATEGORIES } from '@/types';
import type { SupportTicket } from '@/types';
import { Input, Textarea, Select } from '@/components/ui/FormFields';

export default function NewSupportTicketPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SupportTicket | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !category || !description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await createSupportTicket({
        subject: subject.trim(),
        category,
        description: description.trim(),
      });
      setSuccess(ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container-page py-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-success-500/15 flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-success-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Ticket Created</h1>
        <p className="text-sm text-slate-400 max-w-md mb-2">
          Your support ticket has been submitted. We will review it and respond as soon as possible.
        </p>
        <p className="text-sm font-semibold text-electric-400 mb-6">Reference: {success.reference}</p>
        <div className="flex gap-3">
          <Link to={`/support/${success.id}`} className="btn-primary btn-sm">View Ticket</Link>
          <Link to="/support" className="btn-secondary btn-sm">All Tickets</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container-page pt-8 pb-4">
        <Link to="/support" className="text-xs text-slate-500 hover:text-electric-400 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3 h-3" /> Back to Support
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">New Support Ticket</h1>
        <p className="text-slate-400 text-sm mb-6">Tell us what you need help with and we'll get back to you.</p>
      </div>

      <div className="container-page pb-20">
        <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-danger-500/10 ring-1 ring-danger-500/20 p-3.5">
              <AlertCircle className="w-4 h-4 text-danger-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger-400">{error}</p>
            </div>
          )}

          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your issue"
            required
            maxLength={200}
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={TICKET_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
            placeholder="Select a category…"
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue or question in detail…"
            required
            rows={6}
            maxLength={2000}
            hint="Include any relevant order numbers, product names, or dates."
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !subject.trim() || !category || !description.trim()}
              className="btn-primary btn-md"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </button>
            <Link to="/support" className="btn-ghost btn-md">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
