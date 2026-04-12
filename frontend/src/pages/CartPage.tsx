import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkBundles, getCart, removeCartItem, updateCartItem } from '../api/cart';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { BundleCheckResponse } from '../types';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, setItems, subtotal } = useCartStore();
  const { showToast } = useToastStore();
  const [bundleMatches, setBundleMatches] = useState<BundleCheckResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setItems([]);
      return;
    }

    const loadCart = async () => {
      try {
        setLoading(true);
        const [cartResponse, bundleResponse] = await Promise.all([
          getCart(user.id),
          checkBundles(user.id),
        ]);
        setItems(cartResponse.data.items ?? []);
        setBundleMatches(bundleResponse.data);
      } catch {
        setItems([]);
        setBundleMatches([]);
      } finally {
        setLoading(false);
      }
    };

    void loadCart();
  }, [user, setItems]);

  const discountAmount = useMemo(
    () => bundleMatches.reduce((sum, bundle) => sum + bundle.discountAmount, 0),
    [bundleMatches]
  );

  const total = subtotal() - discountAmount;

  const changeQuantity = async (productId: string, quantity: number) => {
    if (!user) {
      return;
    }
    try {
      const response = await updateCartItem(user.id, { productId, quantity });
      setItems(response.data.items ?? []);
      const bundleResponse = await checkBundles(user.id);
      setBundleMatches(bundleResponse.data);
    } catch {
      showToast('Could not update quantity', 'error');
    }
  };

  const removeItem = async (productId: string) => {
    if (!user) {
      return;
    }
    try {
      await removeCartItem(user.id, productId);
      const cartResponse = await getCart(user.id);
      const bundleResponse = await checkBundles(user.id);
      setItems(cartResponse.data.items ?? []);
      setBundleMatches(bundleResponse.data);
    } catch {
      showToast('Could not remove item', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Please login to view your cart</h1>
        <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium inline-block">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
        <Link to="/products" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-8">
        <section className="space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
              <img src={item.imageUrl} alt={item.productName} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                <p className="text-gray-500">₹{item.price.toLocaleString('en-IN')} each</p>
                <div className="flex items-center flex-wrap gap-3">
                  <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => void changeQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-2 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => void changeQuantity(item.productId, item.quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => void removeItem(item.productId)} className="text-red-500 hover:text-red-600">
                    Remove
                  </button>
                </div>
              </div>
              <div className="font-semibold text-gray-900">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </section>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal().toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-4">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            {bundleMatches.length > 0 && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
                {bundleMatches.map((bundle) => (
                  <p key={bundle.bundleId}>
                    🎉 Bundle Deal Applied: {bundle.bundleName} — You save ₹{bundle.discountAmount.toLocaleString('en-IN')}!
                  </p>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium w-full"
            >
              Proceed to Checkout
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
