import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink as RRNavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronDown, LogIn, LogOut, UserRound, Settings, Package, LifeBuoy, Wrench } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const NAV_LINKS = [
  {
    label: 'Products',
    href: null,
    children: [
      { label: 'Cables',  href: '/cables' },
      { label: 'Lights & Fans',  href: '/lights' },
      { label: 'Electronics',  href: '/mobiles' },
      { label: 'Solar',   href: '/solar' },
    ],
  },
  { label: 'Shop',     href: '/buy',      children: null },
  { label: 'Services', href: '/services', children: null },
];

export function Header() {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setAccountOpen(false); }, [location]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAccountOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const accountLabel = user?.email ?? (user?.phone ?? 'Account');

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'header-solid' : 'header-transparent'}`}>
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="JV Electric Works home">
            <div className="relative w-9 h-9 flex-shrink-0">
              <img src="/image.png" alt="JV Electric Works logo" className="w-9 h-9 object-contain" />
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-white text-[15px] leading-tight">JV Electric Works</div>
              <div className="text-[10px] text-slate-500 tracking-wider uppercase">Aurangabad</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              link.children ? (
                <div key="products" className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(v => !v)}
                    className="btn-ghost btn-sm flex items-center gap-1"
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-44 rounded-xl card ring-1 shadow-card py-1.5 animate-fade-in z-50">
                      {link.children.map(child => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block px-4 py-2 text-sm text-body hover:text-heading hover:bg-white/5 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <RRNavLink
                  key={link.href}
                  to={link.href!}
                  className={({ isActive }) => `btn-ghost btn-sm ${isActive ? 'text-white' : ''}`}
                >
                  {link.label}
                </RRNavLink>
              )
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative btn-ghost btn-sm p-2"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-electric-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {user ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen(v => !v)}
                  className="btn-ghost btn-sm flex items-center gap-1.5"
                  aria-label="Account menu"
                >
                  <span className="w-6 h-6 rounded-full bg-electric-500/20 text-electric-300 flex items-center justify-center text-[10px] font-bold">
                    {(accountLabel[0] ?? 'A').toUpperCase()}
                  </span>
                  <span className="hidden sm:block max-w-[120px] truncate text-xs text-slate-300">{accountLabel}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                {accountOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 rounded-xl ring-1 shadow-card py-1.5 animate-fade-in z-50 card">
                    <div className="px-4 py-2 border-b mb-1" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs text-muted">Signed in as</p>
                      <p className="text-sm text-heading truncate font-medium">{accountLabel}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 text-body hover:text-heading hover:bg-white/5"
                    >
                      <Package className="w-3.5 h-3.5" /> My Orders
                    </Link>
                    <Link
                      to="/requests"
                      onClick={() => setAccountOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 text-body hover:text-heading hover:bg-white/5"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Service Requests
                    </Link>
                    <Link
                      to="/support"
                      onClick={() => setAccountOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 text-body hover:text-heading hover:bg-white/5"
                    >
                      <LifeBuoy className="w-3.5 h-3.5" /> Support
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setAccountOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 text-body hover:text-heading hover:bg-white/5"
                    >
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 text-body hover:text-heading hover:bg-white/5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:inline-flex btn-ghost btn-sm flex items-center gap-1.5">
                <LogIn className="w-4 h-4" /> Sign in
              </Link>
            )}

            <Link to="/buy" className="hidden sm:inline-flex btn-md btn-primary text-sm">
              Shop Now
            </Link>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden btn-ghost btn-sm p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden backdrop-blur-md border-t animate-fade-in" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-base) 96%, transparent)', borderColor: 'var(--border)' }}>
          <div className="container-page py-4 flex flex-col gap-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-faint px-3 pb-2">Products</div>
            {NAV_LINKS[0].children?.map(child => (
              <Link key={child.href} to={child.href} className="block px-3 py-2.5 rounded-lg text-body hover:text-heading hover:bg-white/5 text-sm">
                {child.label}
              </Link>
            ))}
            <div className="divider my-2" />
            {NAV_LINKS.slice(1).map(link => (
              <Link key={link.href} to={link.href!} className="block px-3 py-2.5 rounded-lg text-body hover:text-heading hover:bg-white/5 text-sm font-medium">
                {link.label}
              </Link>
            ))}
            <div className="divider my-2" />
            {user ? (
              <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted">
                <UserRound className="w-4 h-4 text-electric-400" />
                <span className="truncate">{accountLabel}</span>
              </div>
            ) : (
              <Link to="/auth" className="block px-3 py-2.5 rounded-lg text-body hover:text-heading hover:bg-white/5 text-sm font-medium flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign in / Sign up
              </Link>
            )}
            {user && (
              <>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-body hover:text-heading hover:bg-white/5 text-sm font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" /> My Orders
                </Link>
                <Link to="/requests" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-body hover:text-heading hover:bg-white/5 text-sm font-medium flex items-center gap-2">
                  <Wrench className="w-4 h-4" /> Service Requests
                </Link>
                <Link to="/support" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-body hover:text-heading hover:bg-white/5 text-sm font-medium flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4" /> Support
                </Link>
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-body hover:text-heading hover:bg-white/5 text-sm font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <button onClick={handleSignOut} className="block w-full text-left px-3 py-2.5 rounded-lg text-body hover:text-heading hover:bg-white/5 text-sm font-medium flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            )}
            <div className="pt-2">
              <Link to="/buy" className="btn-primary btn-md w-full justify-center">Shop Now</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
