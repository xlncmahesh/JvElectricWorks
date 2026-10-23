import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardCheck, Wrench } from 'lucide-react';
import { PageHero } from '@/components/info/PageHero';
import { Button } from '@/components/ui/Button';
import { Input, PhoneInput, Textarea, Select } from '@/components/ui/FormFields';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { deviceTypes } from '@/data/content';
import { fetchServiceRequestTypes, submitRepairRequest } from '@/lib/api';
import type { ServiceRequestResult, ServiceRequestType } from '@/types';
import { useCustomerContact } from '@/hooks/useCustomerContact';
import { isValidEmail, isValidIndianPhone, saveContact } from '@/lib/contact';

const emptyForm = { full_name: '', phone: '', email: '', device_type: '', device_brand: '', device_model: '', problem_description: '' };

export default function RepairFormPage() {
  const [types, setTypes] = useState<ServiceRequestType[]>([]);
  const contact = useCustomerContact();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(previous => ({ ...previous, phone: previous.phone || contact.phone, email: previous.email || contact.email }));
  }, [contact.email, contact.phone]);
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<ServiceRequestResult | null>(null);

  useEffect(() => { fetchServiceRequestTypes().then(setTypes).catch(() => setTypes([])); }, []);
  const repairType = types.find(t => t.slug === 'repair');
  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = 'Please enter your name.';
    if (!form.phone.trim() && !form.email.trim()) e.contact = 'Add a phone number or email.';
    if (form.phone && !isValidIndianPhone(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (form.email && !isValidEmail(form.email)) e.email = 'Enter a valid email address.';
    if (!form.device_type) e.device_type = 'Choose a device type.';
    if (!form.device_brand.trim()) e.device_brand = 'Please enter the brand.';
    if (!form.device_model.trim()) e.device_model = 'Please enter the model.';
    if (!form.problem_description.trim()) e.problem_description = 'Please describe the problem.';
    if (images.length === 0) e.images = 'At least one device photo is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!repairType || !validate()) return;
    setBusy(true); setError('');
    try {
      setSuccess(await submitRepairRequest({ ...form, images }, repairType.id));
      saveContact({ email: form.email, phone: form.phone });
      setForm(emptyForm);
      setImages([]);
    } catch (cause) {
      console.error('repair request failed', cause);
      setError('We could not save your repair request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (success) return (
    <div className="container-page py-20 max-w-xl">
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-success-500 mx-auto mb-4" />
        <p className="eyebrow text-success-500 justify-center mb-3">Request received</p>
        <h1 className="text-3xl font-bold mb-3">Your repair enquiry is pending review</h1>
        <p className="text-slate-400 leading-relaxed text-sm mb-6">We will review your device and contact you to confirm the issue and next steps.</p>
        <div className="bg-slate-800/70 rounded-xl p-4 mb-6">
          <p className="text-xs text-slate-500 mb-1">Reference</p>
          <p className="text-xl font-display font-bold text-electric-300 tracking-wider">{success.reference}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/services" className="btn-secondary btn-md">Back to Services</Link>
          <button onClick={() => setSuccess(null)} className="btn-primary btn-md">Submit another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHero
        eyebrow="Repair Service"
        title="Device Repair Request"
        subtitle="Tell us about your device and the problem. Our technicians will review your enquiry and get back to you."
        breadcrumbs={[{ label: 'Services', href: '/services' }, { label: 'Repair Request' }]}
      >
        <Link to="/services" className="btn-secondary btn-sm inline-flex"><ArrowLeft className="w-4 h-4" /> Back to Services</Link>
      </PageHero>

      <div className="container-page py-12 pb-20 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-electric-500/10 text-electric-400 flex items-center justify-center"><Wrench className="w-5 h-5" /></div>
          <div><h2 className="font-semibold text-white">Repair enquiry form</h2><p className="text-xs text-slate-500">Fields marked with * are required.</p></div>
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

          <div className="grid sm:grid-cols-3 gap-4">
            <Select label="Device type *" value={form.device_type} onChange={e => set('device_type', e.target.value)} options={deviceTypes} placeholder="Choose device" error={errors.device_type} />
            <Input label="Brand *" placeholder="e.g. Samsung" value={form.device_brand} onChange={e => set('device_brand', e.target.value)} error={errors.device_brand} />
            <Input label="Exact model *" placeholder="e.g. Galaxy A54" value={form.device_model} onChange={e => set('device_model', e.target.value)} error={errors.device_model} />
          </div>

          <Textarea label="What is the problem? *" placeholder="Describe what happened and what the device is doing now" value={form.problem_description} onChange={e => set('problem_description', e.target.value)} error={errors.problem_description} />

          <ImageUpload label="Device photos *" required error={errors.images} onChange={setImages} />

          {error && <div className="rounded-lg bg-danger-500/10 ring-1 ring-danger-500/30 p-3 text-sm text-danger-500">{error}</div>}

          <Button type="submit" loading={busy} icon={<ClipboardCheck className="w-4 h-4" />}>Submit repair enquiry</Button>
        </form>
      </div>
    </div>
  );
}
