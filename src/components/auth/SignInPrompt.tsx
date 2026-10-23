import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, ArrowRight, ShoppingBag, Wrench, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DISMISS_KEY = 'jve_welcome_dismissed';

interface SignInPromptProps {
  children: ReactNode;
}

/**
 * Shows a one-time welcome prompt to unsigned-in visitors when they first
 * land on the site. Once dismissed (or after they sign in), it does not
 * reappear. The prompt offers sign-in/sign-up but lets visitors continue
 * browsing without an account.
 */
export function SignInPrompt({ children }: SignInPromptProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) { setShow(false); return; }
    // Don't show on the auth page itself
    if (location.pathname === '/auth') { setShow(false); return; }
    // Check if already dismissed this session
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') { setShow(false); return; }
    } catch { /* ignore */ }
    // Small delay so it appears as a gentle overlay, not a jarring flash
    const t = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t);
  }, [user, loading, location.pathname]);

  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setShow(false);
  };

  const goToAuth = () => {
    dismiss();
    navigate('/auth', { state: { from: location.pathname } });
  };

  if (!show) return <>{children}</>;

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={dismiss}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          className="relative card p-6 sm:p-8 max-w-md w-full shadow-card-hover animate-fade-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
        >
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-muted hover:text-heading transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/image.png" alt="JV Electric Works" className="w-10 h-10 object-contain" />
            </div>
            <p className="eyebrow-blue justify-center mb-3">
              <span className="w-4 h-px bg-electric-400 inline-block" />Welcome
            </p>
            <h2 id="welcome-title" className="text-2xl font-bold text-heading mb-2">
              Sign in to get the full experience
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Create an account or sign in to place orders, request repairs, and book solar consultations. You can also keep browsing without an account.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2.5 mb-6">
            {[
              { icon: <ShoppingBag className="w-3.5 h-3.5" />, text: 'Place and track orders' },
              { icon: <Wrench className="w-3.5 h-3.5" />, text: 'Request device repairs' },
              { icon: <Sun className="w-3.5 h-3.5" />, text: 'Book solar consultations' },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2.5 text-sm text-body">
                <span className="w-6 h-6 rounded-md bg-electric-500/10 text-electric-400 flex items-center justify-center flex-shrink-0">
                  {b.icon}
                </span>
                {b.text}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <button onClick={goToAuth} className="btn-primary btn-md w-full justify-center">
              Sign in or create account <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={dismiss} className="btn-ghost btn-md w-full justify-center text-sm">
              Continue browsing without an account
            </button>
          </div>

          <p className="text-center text-xs text-faint mt-5">
            You can sign in anytime from the top-right corner.
          </p>
        </div>
      </div>
    </>
  );
}

// Re-export Link for convenience in case consumers need it
export { Link };
