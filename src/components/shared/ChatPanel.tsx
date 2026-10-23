import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Send, MessageCircle, AlertCircle, Loader2, Paperclip, X, FileText } from 'lucide-react';
import { getOrCreateConversation, fetchMessages, sendMessage } from '@/lib/api';
import type { Message, ThreadType } from '@/types';

interface ChatPanelProps {
  threadType: ThreadType;
  threadId: string;
  title?: string;
}

export function ChatPanel({ threadType, threadId, title = 'Conversation' }: ChatPanelProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const convId = await getOrCreateConversation(threadType, threadId);
      setConversationId(convId);
      const msgs = await fetchMessages(convId);
      setMessages(msgs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [threadType, threadId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const body = input.trim();
    if ((!body && files.length === 0) || !conversationId || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await sendMessage(conversationId, body, files);
      setMessages(prev => [...prev, msg]);
      setInput('');
      setFiles([]);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const next = [...files, ...selected].slice(0, 5);
    setFiles(next);
    event.target.value = '';
  };

  const removeFile = (file: File) => setFiles(current => current.filter(item => item !== file));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card overflow-hidden flex flex-col" style={{ minHeight: '400px' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <MessageCircle className="w-4 h-4 text-electric-400" />
        <h3 className="text-sm font-semibold text-heading">{title}</h3>
        <span className="ml-auto text-[10px] text-faint">Messages are not real-time</span>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ maxHeight: '400px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-electric-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="w-6 h-6 text-danger-400 mb-2" />
            <p className="text-sm text-muted mb-3">{error}</p>
            <button onClick={load} className="btn-secondary btn-sm">Retry</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-sm text-muted">No messages yet</p>
            <p className="text-xs text-faint mt-1 max-w-xs">
              Send a message below to start the conversation. You'll see replies here once the business responds.
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                  msg.sender === 'customer'
                    ? 'bg-electric-500/15 ring-1 ring-electric-500/25'
                    : 'bg-slate-800 ring-1 ring-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-faint">
                    {msg.sender === 'customer' ? 'You' : 'JV Electric Works'}
                  </span>
                </div>
                <p className="text-sm text-body whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
                {msg.attachments?.map(attachment => (
                  <a
                    key={attachment.id}
                    href={attachment.signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center gap-2 rounded-lg bg-black/10 px-2.5 py-2 text-xs text-electric-300 hover:text-electric-200"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{attachment.file_name}</span>
                  </a>
                ))}
                <span className="text-[10px] text-faint mt-1 block">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <div className="border-t px-3 py-3" style={{ borderColor: 'var(--border)' }}>
        {sendError && (
          <p className="text-xs text-danger-400 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> {sendError}
          </p>
        )}
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map(file => (
              <span key={`${file.name}-${file.size}`} className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-elevated px-2.5 py-1.5 text-xs text-body ring-1 ring-themed">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="max-w-[180px] truncate">{file.name}</span>
                <button type="button" onClick={() => removeFile(file)} aria-label={`Remove ${file.name}`} className="text-muted hover:text-heading">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <label className="btn-secondary btn-md shrink-0 cursor-pointer px-3" aria-label="Attach files">
            <Paperclip className="w-4 h-4" />
            <input type="file" className="hidden" multiple accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFiles} />
          </label>
          <textarea
            ref={textAreaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            disabled={sending}
            className="input flex-1 resize-none text-sm py-2.5"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && files.length === 0) || sending}
            className="btn-primary btn-md flex-shrink-0"
            aria-label="Send message"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-faint mt-1.5">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
