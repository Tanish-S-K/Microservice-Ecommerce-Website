import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkBundles, clearCart } from '../api/cart';
import { createOrder } from '../api/orders';
import { recordBehavior } from '../api/recommendations';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { BundleCheckResponse } from '../types';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'CARD' | 'COD';
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, subtotal, setItems } = useCartStore();
  const { showToast } = useToastStore();
  const [bundleMatches, setBundleMatches] = useState<BundleCheckResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'CARD',
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    checkBundles(user.id)
      .then((response) => setBundleMatches(response.data))
      .catch(() => setBundleMatches([]));
  }, [user]);

  const discountAmount = useMemo(
    () => bundleMatches.reduce((sum, bundle) => sum + bundle.discountAmount, 0),
    [bundleMatches]
  );
  const total = subtotal() - discountAmount;

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const requiredFields = [form.fullName, form.email, form.phone, form.street, form.city, form.state, form.pincode];
    if (requiredFields.some((field) => !field.trim())) {
      return 'Please complete all required fields';
    }
    if (!/^\d{10}$/.test(form.phone)) {
      return 'Phone number must be 10 digits';
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      return 'Pincode must be 6 digits';
    }
    if (form.paymentMethod === 'CARD') {
      if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) {
        return 'Card number must be 16 digits';
      }
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
        return 'Expiry must be in MM/YY format';
      }
      if (!/^\d{3}$/.test(form.cvv)) {
        return 'CVV must be 3 digits';
      }
      if (!form.cardholderName.trim()) {
        return 'Cardholder name is required';
      }
    }
    return null;
  };

  const formatShippingAddress = () =>
    `${form.street.trim()}, ${form.city.trim()}, ${form.state.trim()} - ${form.pincode.trim()}`;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    const error = validate();
    if (error) {
      showToast(error, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const orderResponse = await createOrder({
        userId: user.id,
        items,
        subtotal: subtotal(),
        discountAmount,
        total,
        paymentMethod: form.paymentMethod,
        shippingAddress: formatShippingAddress(),
      });

      await Promise.all(
        items.map((item) =>
          recordBehavior({ userId: user.id, productId: item.productId, action: 'PURCHASE' })
        )
      );
      await clearCart(user.id);
      setItems([]);
      navigate(`/order-success/${orderResponse.data.id}`);
    } catch {
      showToast('Could not place your order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={form.fullName} onChange={(e) => updateForm('fullName', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input value={form.phone} onChange={(e) => updateForm('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
            <input value={form.street} onChange={(e) => updateForm('street', e.target.value)} placeholder="Street" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="City" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              <input value={form.state} onChange={(e) => updateForm('state', e.target.value)} placeholder="State" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              <input value={form.pincode} onChange={(e) => updateForm('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateForm('paymentMethod', 'CARD')}
                className={`rounded-xl border p-4 text-left ${form.paymentMethod === 'CARD' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
              >
                <p className="font-semibold text-gray-900">💳 Credit/Debit Card</p>
                <p className="text-sm text-gray-500">Secure simulated card payment</p>
              </button>
              <button
                type="button"
                onClick={() => updateForm('paymentMethod', 'COD')}
                className={`rounded-xl border p-4 text-left ${form.paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
              >
                <p className="font-semibold text-gray-900">💵 Cash on Delivery</p>
                <p className="text-sm text-gray-500">Pay when the order arrives</p>
              </button>
            </div>

            {form.paymentMethod === 'CARD' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={form.cardNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                    updateForm('cardNumber', digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim());
                  }}
                  placeholder="Card Number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent md:col-span-2"
                />
                <input value={form.expiry} onChange={(e) => updateForm('expiry', e.target.value.replace(/[^\d/]/g, '').slice(0, 5))} placeholder="MM/YY" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                <input value={form.cvv} onChange={(e) => updateForm('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="CVV" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                <input value={form.cardholderName} onChange={(e) => updateForm('cardholderName', e.target.value)} placeholder="Cardholder Name" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent md:col-span-2" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium w-full disabled:opacity-70"
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-3 text-sm">
                <span className="text-gray-600">
                  {item.productName} x {item.quantity}
                </span>
                <span className="font-medium text-gray-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-4 space-y-2">
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
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
