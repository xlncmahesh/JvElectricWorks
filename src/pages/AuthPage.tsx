import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, Loader2, ShieldCheck, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Accepted email domains — common providers only. Sketchy/custom domains are rejected.
const ACCEPTED_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'outlook.in',
  'hotmail.com',
  'hotmail.in',
  'live.com',
  'live.in',
  'msn.com',
  'yahoo.com',
  'yahoo.in',
  'yahoo.co.in',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'aol.com',
  'gmx.com',
  'yandex.com',
  'rediffmail.com',
  'rediff.com',
]);

type Mode = 'signin' | 'signup';
type Step = 'input' | 'otp';

interface LocationState {
  from?: string;
  intent?: string;
}

function emailDomainIsValid(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return ACCEPTED_EMAIL_DOMAINS.has(domain);
}

async function userExists(identifier: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_user_exists', { identifier });
  if (error) return false;
  return data === true;
}

function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const clean = digit.replace(/\D/g, '').slice(-1);
    const chars = value.padEnd(6, ' ').split('');
    chars[index] = clean || ' ';
    const next = chars.join('').trimEnd();
    onChange(next);
    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text) onChange(text);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ''}
          onChange={e => setDigit(i, e.target.value)}
          onKeyDown={e => onKeyDown(e, i)}
          className="w-11 h-14 sm:w-12 sm:h-14 rounded-xl bg-slate-900 text-center text-xl font-display font-bold text-white ring-1 ring-slate-700 focus:ring-2 focus:ring-electric-400 focus:outline-none transition-all disabled:opacity-50"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locState = (location.state as LocationState | null) ?? {};
  const redirectTo = locState.from ?? '/';

  const [mode, setMode] = useState<Mode>('signin');
  const [step, setStep] = useState<Step>('input');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const resetToInput = () => {
    setStep('input');
    setOtp('');
    setError('');
    setInfo('');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetToInput();
  };

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const continueWithGoogle = async () => {
    setError(''); setBusy(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectTo === '/' ? '/' : redirectTo}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      if (msg.includes('redirect_uri_mismatch') || msg.includes('redirect_uri')) {
        setError(`Google redirect URI not registered. In your Google Cloud Console, add this exact URL under Authorized redirect URIs: https://tjicsobkhjvjlpklulko.supabase.co/auth/v1/callback`);
      } else if (msg.includes('Unsupported provider') || msg.includes('not enabled')) {
        setError('Google sign-in is not yet enabled for this project. You can still sign in with email below.');
      } else {
        setError(msg);
      }
      setBusy(false);
    }
  };

  // ── Send OTP (email) ─────────────────────────────────────────────────────────
  const sendEmailOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setInfo('');
    const clean = email.trim().toLowerCase();
    if (!clean) { setError('Please enter your email address.'); return; }
    if (!emailDomainIsValid(clean)) {
      setError('Please use a common email provider (Gmail, Outlook, Hotmail, Yahoo, iCloud, etc.).');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        const exists = await userExists(clean);
        if (!exists) {
          setError(`No account found with ${clean}. Try signing up instead.`);
          setBusy(false);
          return;
        }
      }
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: clean,
        options: { shouldCreateUser: mode === 'signup' },
      });
      if (sendError) throw sendError;
      setStep('otp');
      setInfo(`We sent a 6-digit code to ${clean}. Enter it below to ${mode === 'signup' ? 'finish creating your account' : 'sign in'}.`);
      setResendIn(45);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send the code. Try again.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────────
  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setBusy(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: 'email',
      });
      if (verifyError) throw verifyError;
      setInfo('Verified! Taking you back…');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'That code did not match. Please try again.';
      setError(msg);
      setBusy(false);
    }
  };

  // ── Resend ───────────────────────────────────────────────────────────────────
  const resend = async () => {
    if (resendIn > 0 || busy) return;
    setBusy(true); setError('');
    try {
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: mode === 'signup' },
      });
      if (sendError) throw sendError;
      setResendIn(45);
      setInfo('A new code has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    } finally {
      setBusy(false);
    }
  };

  const intentLabel = locState.intent ?? (mode === 'signup' ? 'Create your account' : 'Welcome back');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-24">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-electric-500/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/image.png" alt="JV Electric Works" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-white">JV Electric Works</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{intentLabel}</h1>
          <p className="text-sm text-slate-500">
            {mode === 'signup'
              ? 'Create an account to place orders and request services.'
              : 'Sign in to continue to your account.'}
          </p>
        </div>

        <div className="card p-6 sm:p-7">
          {/* Mode tabs — only relevant on the input step */}
          {step === 'input' && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/60 rounded-xl mb-6">
              <button
                onClick={() => switchMode('signin')}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-electric-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-electric-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* ── OTP step ─────────────────────────────────────────────────────────── */}
          {step === 'otp' ? (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-electric-500/10 text-electric-400 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">Enter your 6-digit code</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{info}</p>
              </div>

              <OtpInput value={otp} onChange={setOtp} disabled={busy} />

              {error && <p className="text-sm text-danger-500 text-center">{error}</p>}

              <button type="submit" disabled={busy || otp.length !== 6} className="btn-primary btn-lg w-full justify-center">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Verify & continue
              </button>

              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={resetToInput} className="text-slate-400 hover:text-white transition-colors">
                  ← Use a different email
                </button>
                <button
                  type="button"
                  onClick={resend}
                  disabled={resendIn > 0 || busy}
                  className="text-electric-400 hover:text-electric-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* ── Google ─────────────────────────────────────────────────────── */}
              <button
                onClick={continueWithGoogle}
                disabled={busy}
                className="btn-md w-full justify-center bg-white text-slate-800 font-semibold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
              </button>

              {/* Google error hint */}
              {error && (error.includes('Google') || error.includes('google')) && (
                <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-warning-500/10 ring-1 ring-warning-500/30">
                  <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-warning-500 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-600 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* ── Email form ─────────────────────────────────────────────────── */}
              <form onSubmit={sendEmailOtp} className="space-y-4">
                <div>
                  <label className="label" htmlFor="auth-email">Email address</label>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="input"
                    disabled={busy}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    We accept common providers (Gmail, Outlook, Hotmail, Yahoo, iCloud, etc.).
                  </p>
                </div>
                {error && !error.includes('Google') && <p className="text-sm text-danger-500">{error}</p>}
                {error && error.includes('Google') && (
                  <p className="text-sm text-danger-500">
                    {mode === 'signup' ? 'Use your email to create an account below.' : 'Use your email to sign in below.'}
                  </p>
                )}
                <button type="submit" disabled={busy} className="btn-primary btn-md w-full justify-center">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {mode === 'signup' ? 'Send sign-up code' : 'Send sign-in code'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-6 leading-relaxed">
          By continuing, you agree to receive a one-time code by email to verify your identity.
          <br />
          <Link to="/" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 mt-2">
            Continue browsing without signing in <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
