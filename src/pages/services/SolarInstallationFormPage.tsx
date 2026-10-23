import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sun } from 'lucide-react';
import { PageHero } from '@/components/info/PageHero';
import { Button } from '@/components/ui/Button';
import { Input, PhoneInput, Textarea, Select } from '@/components/ui/FormFields';
import { propertyTypes } from '@/data/content';
import { fetchServiceRequestTypes, submitSolarRequest } from '@/lib/api';
import type { ServiceRequestResult, ServiceRequestType } from '@/types';
import { useCustomerContact } from '@/hooks/useCustomerContact';
import { isValidEmail, isValidIndianPhone, saveContact } from '@/lib/contact';

const emptyForm = { full_name: '', phone: '', email: '', install_address: '', install_locality: '', install_postal_code: '', property_type: '', estimated_consumption: '', notes: '' };

export default function SolarInstallationFormPage() {
  const [types, setTypes] = useState<ServiceRequestType[]>([]);
  const contact = useCustomerContact();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(previous => ({ ...previous, phone: previous.phone || contact.phone, email: previous.email || contact.email }));
  }, [contact.email, contact.phone]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<ServiceRequestResult | null>(null);

  useEffect(() => { fetchServiceRequestTypes().then(setTypes).catch(() => setTypes([])); }, []);
  const solarType = types.find(t => t.slug === 'solar_installation');
  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = 'Please enter your name.';
    if (!form.phone.trim() && !form.email.trim()) e.contact = 'Add a phone number or email.';
    if (form.phone && !isValidIndianPhone(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (form.email && !isValidEmail(form.email)) e.email = 'Enter a valid email address.';
    if (!form.install_address.trim()) e.install_address = 'Please enter the installation address.';
    if (!form.install_locality.trim()) e.install_locality = 'Please enter the locality or city.';
    if (!/^\d{5,6}$/.test(form.install_postal_code)) e.install_postal_code = 'Enter a valid 5–6 digit postal code.';
    if (!form.property_type) e.property_type = 'Choose a property type.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!solarType || !validate()) return;
    setBusy(true); setError('');
    try {
      setSuccess(await submitSolarRequest(form, solarType.id));
      saveContact({ email: form.email, phone: form.phone });
      setForm(emptyForm);
    } catch (cause) {
      console.error('solar request failed', cause);
      setError('We could not save your consultation request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (success) return (
    <div className="container-page py-20 max-w-xl">
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-solar-400 mx-auto mb-4" />
        <p className="eyebrow-solar justify-center mb-3">Request received</p>
        <h1 className="text-3xl font-bold mb-3">Your solar consultation request is in</h1>
        <p className="text-slate-400 leading-relaxed text-sm mb-6">We will review your details and schedule a site visit to assess your rooftop.</p>
        <div className="bg-slate-800/70 rounded-xl p-4 mb-6">
          <p className="text-xs text-slate-500 mb-1">Reference</p>
          <p className="text-xl font-display font-bold text-solar-300 tracking-wider">{success.reference}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/services" className="btn-secondary btn-md">Back to Services</Link>
          <button onClick={() => setSuccess(null)} className="btn-solar btn-md">Submit another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHero
        eyebrow="Solar Installation"
        title="Rooftop Solar Consultation"
        subtitle="Tell us about your property and energy usage. We will assess your roof and recommend the right solar setup."
        breadcrumbs={[{ label: 'Services', href: '/services' }, { label: 'Solar Consultation' }]}
        accent="solar"
      >
        <Link to="/services" className="btn-secondary btn-sm inline-flex"><ArrowLeft className="w-4 h-4" /> Back to Services</Link>
      </PageHero>

      <div className="container-page py-12 pb-20 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-solar-500/10 text-solar-400 flex items-center justify-center"><Sun className="w-5 h-5" /></div>
          <div><h2 className="font-semibold text-white">Consultation request form</h2><p className="text-xs text-slate-500">Fields marked with * are required.</p></div>
        </div>

        <form onSubmit={submit} className="card p-5 sm:p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full name *" value={form.full_name} onChange={e => set('full_name', e.target.value)} error={errors.full_name} />
            <div>
              <label className="label">Phone or email *</label>
              <p className="text-xs text-slate-500 mb-2">At least one is required so we can contact you.</p>
              <div className="grid sm:grid-cols-2 gap-2">
                <PhoneInput label="Phone" value={form.phone} onChange={value => set('phone', value)} error={errors.phone} />
                <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />
              </div>
              {errors.contact && <p className="field-error">{errors.contact}</p>}
            </div>
          </div>

          <Textarea label="Full installation address *" value={form.install_address} onChange={e => set('install_address', e.target.value)} error={errors.install_address} placeholder="Street, building, area" />

          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Locality / city *" value={form.install_locality} onChange={e => set('install_locality', e.target.value)} error={errors.install_locality} />
            <Input label="Postal code *" inputMode="numeric" value={form.install_postal_code} onChange={e => set('install_postal_code', e.target.value)} error={errors.install_postal_code} />
            <Select label="Property type *" value={form.property_type} onChange={e => set('property_type', e.target.value)} options={propertyTypes} placeholder="Choose type" error={errors.property_type} />
          </div>

          <Input label="Estimated usage or monthly bill (optional)" placeholder="e.g. 350 units/month or ₹2,500/month" value={form.estimated_consumption} onChange={e => set('estimated_consumption', e.target.value)} />
          <Textarea label="Requirements or notes (optional)" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Roof type, available space, shade concerns, etc." />

          {error && <div className="rounded-lg bg-danger-500/10 ring-1 ring-danger-500/30 p-3 text-sm text-danger-500">{error}</div>}

          <Button type="submit" variant="solar" loading={busy} icon={<Sun className="w-4 h-4" />}>Request solar consultation</Button>
        </form>
      </div>
    </div>
  );
}
