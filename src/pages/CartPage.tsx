import { useNavigate } from 'react-router-dom';
import { CartSidebar } from '@/components/shopping/CartSidebar';

export default function CartPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950">
      <CartSidebar
        isOpen
        onClose={() => navigate('/buy')}
        onCheckout={() => navigate('/checkout')}
      />
    </div>
  );
}
