import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return <div className="container-page py-24 text-center"><p className="eyebrow-blue justify-center mb-4">404</p><h1 className="text-4xl font-bold mb-3">Page not found</h1><p className="text-slate-400 text-sm mb-6">The page you requested does not exist.</p><Link to="/" className="btn-primary btn-md"><ArrowLeft className="w-4 h-4" /> Back home</Link></div>;
}
