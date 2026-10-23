import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  tagline?: string | null;
  image: string;
  buyPath: string;
  isSelected?: boolean;
  accent?: 'blue' | 'solar' | 'teal';
  onClick?: () => void;
}

export function CategoryCard({
  name, tagline, image, buyPath, isSelected, accent = 'blue', onClick
}: CategoryCardProps) {
  const ringColor = {
    blue:  'ring-electric-500',
    solar: 'ring-solar-500',
    teal:  'ring-teal-500',
  }[accent];

  const gradColor = {
    blue:  'from-electric-500/30',
    solar: 'from-solar-600/40',
    teal:  'from-teal-600/30',
  }[accent];

  const textColor = {
    blue:  'text-electric-400',
    solar: 'text-solar-400',
    teal:  'text-teal-400',
  }[accent];

  return (
    <Link
      to={buyPath}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl group block cursor-pointer transition-all duration-300
        ring-1 ${isSelected ? `${ringColor} shadow-card` : 'ring-slate-800 hover:ring-slate-700'}
        hover:-translate-y-0.5 hover:shadow-card-hover
      `}
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-800 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${gradColor} to-slate-950/70`} />
        {isSelected && (
          <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${accent === 'solar' ? 'bg-solar-400' : accent === 'teal' ? 'bg-teal-400' : 'bg-electric-400'} ring-2 ring-white shadow`} />
        )}
      </div>

      {/* Label */}
      <div className="bg-slate-900 px-4 py-3.5 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-white">{name}</h3>
          {tagline && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{tagline}</p>}
        </div>
        <ArrowRight className={`w-4 h-4 ${textColor} transition-transform group-hover:translate-x-1`} />
      </div>
    </Link>
  );
}

interface InfoSubcategoryCardProps {
  name: string;
  description: string;
  image: string;
  buyPath: string;
  infoPath?: string;
  accent?: 'blue' | 'solar' | 'teal';
}

export function InfoSubcategoryCard({ name, description, image, buyPath, infoPath, accent = 'blue' }: InfoSubcategoryCardProps) {

  const actionClass = accent === 'solar' ? 'btn-solar' : 'btn-primary';

  return (
    <div className="card card-hover overflow-hidden flex flex-col">
      <div className="h-52 overflow-hidden bg-slate-800">
        <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-white text-lg mb-2">{name}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1">{description}</p>
        <div className="flex gap-3">
          <Link to={buyPath} className={`${actionClass} btn-sm flex-1 justify-center`}>
            Shop {name.split(' ')[0]} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {infoPath && (
            <Link to={infoPath} className="btn-secondary btn-sm">
              Learn more
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
