import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Sun, ClipboardCheck, Camera, MapPin, LogIn } from 'lucide-react';
import { PageHero } from '@/components/info/PageHero';
import { useAuth } from '@/hooks/useAuth';

const SERVICE_CARDS = [
  {
    slug: 'repair',
    icon: <Wrench className="w-6 h-6" />,
    title: 'Device Repair',
    description: 'Repairs for mobile phones, laptops, desktop computers, and household electronic devices. Share your device details and photos — our technicians will review and respond.',
    features: ['Mobiles & smartphones', 'Laptops & desktops', 'Household devices', 'Photo-based assessment'],
    formPath: '/services/repair/form',
    cta: 'Request a Repair',
    accent: 'blue' as const,
  },
  {
    slug: 'solar',
    icon: <Sun className="w-6 h-6" />,
    title: 'Rooftop Solar Installation',
    description: 'Consultation for domestic and small commercial rooftop solar. Tell us about your property and energy usage — we will assess your roof and recommend a system.',
    features: ['Rooftop site assessment', 'Panel & inverter sizing', 'Battery storage options', 'End-to-end installation'],
    formPath: '/services/solarinstallation/form',
    cta: 'Request Solar Consultation',
    accent: 'solar' as const,
  },
];

export default function ServicesPage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHero
        eyebrow="Customer Services"
        title="How can we help?"
        subtitle="Request a device repair or a rooftop solar installation consultation. Every request is reviewed by our team before any work is confirmed."
        breadcrumbs={[{ label: 'Services' }]}
      />

      {/* Service cards */}
      <section className="py-12 pb-20">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICE_CARDS.map(service => {
              const accentClasses = service.accent === 'solar'
                ? { ring: 'hover:ring-solar-500/40', icon: 'bg-solar-500/10 text-solar-400', btn: 'btn-solar', glow: 'hover:shadow-glow-solar' }
                : { ring: 'hover:ring-electric-500/40', icon: 'bg-electric-500/10 text-electric-400', btn: 'btn-primary', glow: 'hover:shadow-card-hover' };
              return (
                <div key={service.slug} className={`card p-6 sm:p-7 flex flex-col transition-all duration-300 ${accentClasses.ring} ${accentClasses.glow}`}>
                  <div className={`w-12 h-12 rounded-xl ${accentClasses.icon} flex items-center justify-center mb-5`}>
                    {service.icon}
                  </div>
                  <h2 className="text-xl font-display font-bold text-white mb-2">{service.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${service.accent === 'solar' ? 'bg-solar-400' : 'bg-electric-400'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={service.formPath} className={`${accentClasses.btn} btn-md mt-auto self-start`}>
                    {service.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                  {!user && (
                    <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                      <LogIn className="w-3 h-3" /> You will be asked to sign in first.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-slate-800 bg-slate-900/40 py-14">
        <div className="container-page">
          <div className="mb-10">
            <p className="eyebrow-blue mb-3"><span className="w-4 h-px bg-electric-400 inline-block" />How it works</p>
            <h2 className="section-title">A simple, reviewed process</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '01', icon: <ClipboardCheck className="w-5 h-5" />, title: 'Submit your request', desc: 'Fill out the relevant form with your details and device or property info.' },
              { step: '02', icon: <Camera className="w-5 h-5" />, title: 'We review', desc: 'Our team reviews your request — for repairs, we assess the photos you share.' },
              { step: '03', icon: <MapPin className="w-5 h-5" />, title: 'We contact you', desc: 'We reach out to confirm details, provide a quote, or schedule a site visit.' },
              { step: '04', icon: <Wrench className="w-5 h-5" />, title: 'Work begins', desc: 'Once confirmed, the repair or solar installation is carried out.' },
            ].map(s => (
              <div key={s.step} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-electric-500/10 text-electric-400 flex items-center justify-center">{s.icon}</div>
                  <span className="text-xs font-bold text-slate-700">{s.step}</span>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
