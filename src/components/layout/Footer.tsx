import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { BUSINESS_NAME, BUSINESS_CITY, STORE_PHONE, STORE_EMAIL } from '@/data/content';

const PRODUCT_LINKS = [
  { label: 'Cables',  to: '/cables' },
  { label: 'Lights & Fans',  to: '/lights' },
  { label: 'Electronics',  to: '/mobiles' },
  { label: 'Solar',   to: '/solar' },
];

const SHOP_LINKS = [
  { label: 'Shop Cables',  to: '/buy/cables' },
  { label: 'Shop Lights & Fans',  to: '/buy/lights' },
  { label: 'Shop Electronics',  to: '/buy/mobiles' },
  { label: 'Shop Solar',   to: '/buy/solar' },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-24">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group w-fit">
              <img src="/image.png" alt="JV Electric Works" className="w-9 h-9 object-contain" />
              <span className="font-display font-bold text-white">{BUSINESS_NAME}</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
              Electrical cables, solar equipment, lighting, mobile accessories, and repair services based in Aurangabad, Maharashtra.
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-500">
              <a href={`tel:${STORE_PHONE}`} className="flex items-center gap-2 hover:text-slate-300 transition-colors">
                <Phone className="w-3.5 h-3.5 shrink-0" />{STORE_PHONE}
              </a>
              <a href={`mailto:${STORE_EMAIL}`} className="flex items-center gap-2 hover:text-slate-300 transition-colors">
                <Mail className="w-3.5 h-3.5 shrink-0" />{STORE_EMAIL}
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />{BUSINESS_CITY}
              </span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Products</h3>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'About', to: '/about' },
                { label: 'Services', to: '/services' },
                { label: 'Repair Request', to: '/services/repair/form' },
                { label: 'Solar Consultation', to: '/services/solarinstallation/form' },
                { label: 'Sign In / Sign Up', to: '/auth' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider mt-10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</p>
          <p>{BUSINESS_CITY}</p>
        </div>
      </div>
    </footer>
  );
}
