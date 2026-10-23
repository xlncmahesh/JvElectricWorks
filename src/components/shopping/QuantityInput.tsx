import React, { useState } from 'react';
import type { Product } from '@/types';

interface QuantityInputProps {
  product: Product;
  onChange: (qty: number) => void;
  value?: number;
}

export function QuantityInput({ product, onChange, value }: QuantityInputProps) {
  const { min_quantity, quantity_increment, max_quantity, purchasing_mode } = product;
  const [qty, setQty] = useState(value ?? min_quantity);
  const unit = purchasing_mode === 'length' ? 'm' : '';
  const label = purchasing_mode === 'length' ? 'metres' : 'quantity';

  const clamp = (v: number) => {
    let clamped = Math.max(min_quantity, v);
    if (max_quantity) clamped = Math.min(max_quantity, clamped);
    // Snap to nearest increment
    clamped = Math.round(clamped / quantity_increment) * quantity_increment;
    return Math.round(clamped * 1000) / 1000;
  };

  const update = (v: number) => {
    const c = clamp(v);
    setQty(c);
    onChange(c);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) update(v);
  };

  return (
    <div>
      <label className="label capitalize">{label}</label>
      <div className="flex items-stretch gap-0 rounded-lg ring-1 ring-slate-700 overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => update(qty - quantity_increment)}
          className="px-3 py-2 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-lg font-light border-r border-slate-700"
          aria-label="Decrease"
        >
          −
        </button>
        <input
          type="number"
          value={qty}
          min={min_quantity}
          max={max_quantity ?? undefined}
          step={quantity_increment}
          onChange={handleInput}
          onBlur={() => update(qty)}
          className="w-20 text-center bg-slate-900 text-white text-sm font-medium focus:outline-none focus:bg-slate-800"
        />
        <button
          type="button"
          onClick={() => update(qty + quantity_increment)}
          className="px-3 py-2 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-lg font-light border-l border-slate-700"
          aria-label="Increase"
        >
          +
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Min: {min_quantity}{unit} · Increment: {quantity_increment}{unit}
        {max_quantity ? ` · Max: ${max_quantity}${unit}` : ''}
      </p>
    </div>
  );
}
