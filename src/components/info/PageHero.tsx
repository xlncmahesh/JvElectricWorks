import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  breadcrumbs?: BreadcrumbItem[];
  accent?: 'blue' | 'solar' | 'teal';
  children?: React.ReactNode;
}

export function PageHero({ eyebrow, title, subtitle, image, breadcrumbs, accent = 'blue', children }: PageHeroProps) {
  const eyebrowColor = { blue: 'eyebrow-blue', solar: 'eyebrow-solar', teal: 'eyebrow-teal' }[accent];
  const glowClass = { blue: 'bg-hero-glow', solar: 'bg-solar-glow', teal: '' }[accent];

  return (
    <section className={`relative overflow-hidden pt-12 pb-14 ${glowClass}`}>
      <div className="absolute inset-0 bg-grid opacity-100" />
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 to-slate-950" />
        </div>
      )}
      <div className="relative container-page">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <ArrowRight className="w-3 h-3" />
                {crumb.href
                  ? <Link to={crumb.href} className="hover:text-slate-300 transition-colors">{crumb.label}</Link>
                  : <span className="text-slate-400">{crumb.label}</span>
                }
              </React.Fragment>
            ))}
          </nav>
        )}
        {eyebrow && <p className={`${eyebrowColor} mb-4 animate-fade-up`}><span className="w-4 h-px bg-current inline-block align-middle mr-2" />{eyebrow}</p>}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 max-w-2xl animate-fade-up text-balance" style={{ animationDelay: '0.05s' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed animate-fade-up text-pretty" style={{ animationDelay: '0.1s' }}>
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>{children}</div>}
      </div>
    </section>
  );
}

interface ContentSectionProps {
  title: string;
  body: string;
  accent?: 'blue' | 'solar' | 'teal';
}

export function ContentSection({ title, body, accent = 'blue' }: ContentSectionProps) {
  const dotColor = { blue: 'bg-electric-500', solar: 'bg-solar-500', teal: 'bg-teal-500' }[accent];
  return (
    <div className="flex gap-5">
      <div className={`mt-1.5 w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
      <div>
        <h3 className="font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
