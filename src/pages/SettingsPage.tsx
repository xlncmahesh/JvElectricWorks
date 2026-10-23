import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Monitor, UserRound, Mail, Phone, LogOut, Bell, Globe, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { PageHero } from '@/components/info/PageHero';

function SettingRow({ icon, title, desc, children }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-electric-500/10 text-electric-400 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-heading text-sm">{title}</h3>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className="sm:ml-auto">{children}</div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: 'dark' as const, icon: <Moon className="w-3.5 h-3.5" />, label: 'Dark' },
    { value: 'light' as const, icon: <Sun className="w-3.5 h-3.5" />, label: 'Light' },
  ];
  return (
    <div className="inline-flex p-1 rounded-lg bg-elevated ring-1 ring-themed">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            theme === opt.value
              ? 'bg-electric-500 text-white shadow-glow'
              : 'text-muted hover:text-heading'
          }`}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? 'bg-electric-500' : 'bg-elevated ring-1 ring-themed'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const accountLabel = user?.email ?? user?.phone ?? 'Account';
  const provider = user?.app_metadata?.provider ?? 'email';

  return (
    <div>
      <PageHero
        eyebrow="Account"
        title="Settings"
        subtitle="Manage your appearance preferences and account details."
        breadcrumbs={[{ label: 'Settings' }]}
      >
        <Link to="/" className="btn-secondary btn-sm inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </PageHero>

      <div className="container-page py-10 pb-20 max-w-2xl space-y-8">
        {/* ── Appearance ──────────────────────────────────────────────────── */}
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-4 h-4 text-electric-400" />
            <h2 className="font-semibold text-heading">Appearance</h2>
          </div>
          <p className="text-xs text-muted mb-2">Choose how the site looks to you. Your preference is saved on this device.</p>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            <SettingRow
              icon={<Sun className="w-4 h-4" />}
              title="Theme"
              desc="Switch between dark and light mode. Dark is the default."
            >
              <ThemeToggle />
            </SettingRow>
          </div>
        </section>

        {/* ── Account ────────────────────────────────────────────────────── */}
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <UserRound className="w-4 h-4 text-electric-400" />
            <h2 className="font-semibold text-heading">Account</h2>
          </div>
          <p className="text-xs text-muted mb-2">Your account details and sign-in method.</p>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            <SettingRow
              icon={user?.email ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              title="Contact"
              desc={accountLabel}
            >
              <span className="chip bg-electric-500/10 text-electric-400 ring-1 ring-electric-500/20 capitalize text-xs">
                {provider}
              </span>
            </SettingRow>
            <SettingRow
              icon={<ShieldCheck className="w-4 h-4" />}
              title="Account ID"
              desc="Your unique account reference."
            >
              <code className="text-xs text-muted font-mono">{user?.id?.slice(0, 8) ?? '—'}</code>
            </SettingRow>
            <SettingRow
              icon={<LogOut className="w-4 h-4" />}
              title="Sign out"
              desc="End your session on this device."
            >
              <button onClick={handleSignOut} className="btn-secondary btn-sm">
                Sign out
              </button>
            </SettingRow>
          </div>
        </section>

        {/* ── Notifications (placeholder) ────────────────────────────────── */}
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-electric-400" />
            <h2 className="font-semibold text-heading">Notifications</h2>
          </div>
          <p className="text-xs text-muted mb-2">Choose how you want to hear from us about your orders and requests.</p>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            <SettingRow
              icon={<Mail className="w-4 h-4" />}
              title="Order updates by email"
              desc="Get notified when your order status changes."
            >
              <ToggleSwitch checked={true} onChange={() => {}} label="Email order updates" />
            </SettingRow>
            <SettingRow
              icon={<Phone className="w-4 h-4" />}
              title="Service updates by SMS"
              desc="Get a text when your repair or solar request is updated."
            >
              <ToggleSwitch checked={true} onChange={() => {}} label="SMS service updates" />
            </SettingRow>
          </div>
        </section>

        {/* ── Preferences (placeholder) ──────────────────────────────────── */}
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-electric-400" />
            <h2 className="font-semibold text-heading">Preferences</h2>
          </div>
          <p className="text-xs text-muted mb-2">Regional and display preferences.</p>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            <SettingRow
              icon={<Globe className="w-4 h-4" />}
              title="Region"
              desc="India (default) — prices shown in INR."
            >
              <span className="chip bg-elevated text-muted ring-1 ring-themed text-xs">IN</span>
            </SettingRow>
          </div>
        </section>

        <p className="text-center text-xs text-faint">
          Current theme: <span className="text-muted font-medium capitalize">{theme}</span> · More settings coming soon.
        </p>
      </div>
    </div>
  );
}
