import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardList, MapPin } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { submitOrder } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, PhoneInput, Textarea, Select } from '@/components/ui/FormFields';
import { EmptyState } from '@/components/ui/EmptyState';
import type { FulfilmentMode, OrderInput, OrderResult } from '@/types';
import { useCustomerContact } from '@/hooks/useCustomerContact';
import { isValidEmail, isValidIndianPhone, saveContact } from '@/lib/contact';

const fulfilmentOptions = [
  { value: 'delivery', label: 'Delivery (where available)' },
  { value: 'pickup', label: 'Store pickup in Aurangabad' },
  { value: 'consultation', label: 'Consultation required' },
];

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const contact = useCustomerContact();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', fulfilment_mode: 'pickup' as FulfilmentMode, delivery_address: '', notes: '' });

  useEffect(() => {
    setForm(previous => ({
      ...previous,
      phone: previous.phone || contact.phone,
      email: previous.email || contact.email,
    }));
  }, [contact.email, contact.phone]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OrderResult | null>(null);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.full_name.trim()) next.full_name = 'Please enter your name.';
    if (!form.phone.trim()) next.phone = 'Please enter a mobile number.';
    else if (!isValidIndianPhone(form.phone)) next.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (form.email && !isValidEmail(form.email)) next.email = 'Please enter a valid email address.';
    if (form.fulfilment_mode === 'delivery' && !form.delivery_address.trim()) next.delivery_address = 'Please enter a delivery address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate() || cart.items.length === 0) return;
    setSaving(true); setError('');
    const input: OrderInput = {
      ...form,
      items: cart.items.map(({ product, quantity, line_total }) => ({
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        unit_price: product.price,
        price_unit: product.price_unit,
        purchasing_mode: product.purchasing_mode,
        quantity,
        line_total,
        image_url: product.image_url,
      })),
    };
    try {
      const order = await submitOrder(input);
      setResult(order);
      saveContact({ email: form.email, phone: form.phone });
      clearCart();
    } catch (cause) {
      console.error('order submission failed', cause);
      setError('We could not submit your order request. Please try again or contact the store directly.');
    } finally { setSaving(false); }
  };

  if (result) return (
    <div className="container-page py-20 max-w-xl">
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-success-500 mx-auto mb-4" />
        <p className="eyebrow text-success-500 justify-center mb-3">Request received</p>
        <h1 className="text-3xl font-bold mb-3">Your order request is pending review</h1>
        <p className="text-slate-400 leading-relaxed text-sm mb-6">We have recorded your request. The store will contact you to confirm availability and fulfilment.</p>
        <div className="bg-slate-800/70 rounded-xl p-4 mb-6">
          <p className="text-xs text-slate-500 mb-1">Reference</p>
          <p className="text-xl font-display font-bold text-electric-300 tracking-wider">{result.reference}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${result.id}`} className="btn-primary btn-md">View Order Details</Link>
          <Link to="/orders" className="btn-secondary btn-md">My Orders</Link>
        </div>
      </div>
    </div>
  );

  if (cart.items.length === 0) return (
    <div className="container-page py-16"><EmptyState variant="empty" title="Your cart is empty" description="Add products before starting checkout." action={{ label: 'Browse the shop', onClick: () => navigate('/buy') }} /></div>
  );

  return (
    <div className="container-page py-10 pb-20">
      <Link to="/buy" className="link-underline text-sm inline-flex items-center gap-2 mb-8"><ArrowLeft className="w-4 h-4" /> Back to shopping</Link>
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <form onSubmit={submit} className="space-y-6">
          <div><p className="eyebrow-blue mb-2">Checkout</p><h1 className="text-3xl font-bold">Submit an order request</h1><p className="text-sm text-slate-500 mt-2">Your request is not confirmed until the store reviews availability and contacts you.</p></div>
          <div className="card p-5 sm:p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><ClipboardList className="w-4 h-4 text-electric-400" /> Contact details</h2>
            <Input label="Full name" value={form.full_name} onChange={e => update('full_name', e.target.value)} error={errors.full_name} required />
            <div className="grid sm:grid-cols-2 gap-4"><PhoneInput value={form.phone} onChange={value => update('phone', value)} error={errors.phone} required /><Input label="Email (optional)" type="email" autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)} error={errors.email} /></div>
          </div>
          <div className="card p-5 sm:p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-electric-400" /> Fulfilment</h2>
            <Select label="Preferred fulfilment" value={form.fulfilment_mode} onChange={e => update('fulfilment_mode', e.target.value)} options={fulfilmentOptions} />
            {form.fulfilment_mode === 'delivery' && <Textarea label="Delivery address" value={form.delivery_address} onChange={e => update('delivery_address', e.target.value)} error={errors.delivery_address} placeholder="Street, locality, city, postal code" required />}
            <Textarea label="Notes (optional)" value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any requirements or questions for the store" />
          </div>
          {error && <div className="rounded-lg bg-danger-500/10 ring-1 ring-danger-500/30 p-3 text-sm text-danger-500">{error}</div>}
          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={saving}>Submit order request</Button>
        </form>
        <aside className="card p-5 lg:sticky lg:top-24"><h2 className="font-semibold text-white mb-4">Order summary</h2><div className="space-y-4 divide-y divide-slate-800">{cart.items.map(item => <div key={item.product.id} className="flex gap-3 pt-4 first:pt-0"><div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">{item.product.image_url && <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />}</div><div className="flex-1 min-w-0"><p className="text-sm text-white line-clamp-2">{item.product.name}</p><p className="text-xs text-slate-500 mt-1">{item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}</p></div><p className="text-sm font-semibold text-white">₹{item.line_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></div>)}</div><div className="divider my-5" /><div className="flex justify-between"><span className="text-sm text-slate-400">Subtotal</span><span className="font-bold text-white">₹{cart.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div></aside>
      </div>
    </div>
  );
}
