import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart, getCart } from '../api/cart';
import { getProduct } from '../api/products';
import { BundleDeal, Product } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';

interface BundleCardProps {
  bundle: BundleDeal;
}

export default function BundleCard({ bundle }: BundleCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setItems } = useCartStore();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(false);

  const addBundleToCart = async () => {
    if (!user) {
      showToast('Please login to add bundles', 'info');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const productResponses = await Promise.all(bundle.productIds.map((productId) => getProduct(productId)));
      await Promise.all(
        productResponses.map(({ data }: { data: Product }) =>
          addToCart(user.id, {
            productId: data.id,
            productName: data.name,
            price: data.price,
            quantity: 1,
            imageUrl: data.imageUrl,
          })
        )
      );
      const cartResponse = await getCart(user.id);
      setItems(cartResponse.data.items ?? []);
      showToast(`${bundle.name} added to cart!`);
    } catch {
      showToast('Could not add bundle to cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 min-w-[280px] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
          <p className="text-sm text-gray-600">{bundle.description}</p>
        </div>
        <span className="inline-flex bg-amber-200 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
          {bundle.discountPercent}% OFF
        </span>
      </div>
      <p className="text-sm text-amber-900">{bundle.productIds.length} products included</p>
      <button
        type="button"
        onClick={addBundleToCart}
        disabled={loading}
        className="w-full bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium disabled:opacity-70"
      >
        {loading ? 'Adding...' : 'Add Bundle to Cart'}
      </button>
    </div>
  );
}
