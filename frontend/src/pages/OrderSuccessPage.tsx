import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { orderId = '' } = useParams();

  const estimatedDelivery = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-xl w-full text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12.5l2.5 2.5L16.5 9" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
          <p className="text-gray-500 mt-2">Order ID: #{orderId.slice(-5).toUpperCase()}</p>
          <p className="text-gray-500 mt-1">Estimated Delivery: {estimatedDelivery}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${orderId}`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium">
            View Order
          </Link>
          <Link to="/" className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
