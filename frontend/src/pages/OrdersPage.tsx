import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelOrder, getOrder, getUserOrders } from '../api/orders';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Order } from '../types';

const statusStyles: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-yellow-100 text-yellow-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PENDING: 'bg-gray-100 text-gray-700',
};

export default function OrdersPage() {
  const { orderId } = useParams();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(orderId ?? null);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      const response = await getUserOrders(user.id);
      let nextOrders = response.data;
      if (orderId && !response.data.some((order) => order.id === orderId)) {
        try {
          const singleOrder = await getOrder(orderId);
          nextOrders = [singleOrder.data, ...response.data];
        } catch {
          // ignore
        }
      }
      setOrders(nextOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, [user, orderId]);

  const handleCancel = async (id: string) => {
    try {
      await cancelOrder(id);
      showToast('Order cancelled', 'info');
      await loadOrders();
    } catch {
      showToast('Order cannot be cancelled at this stage', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">No orders yet. Start shopping!</h1>
        <Link to="/products" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium inline-block">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status] ?? statusStyles.PENDING}`}>
                {order.status}
              </span>
              <span className="font-semibold text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
              <span className="text-sm text-gray-500">{order.items.length} items</span>
              <button
                type="button"
                onClick={() => setExpandedId((current) => (current === order.id ? null : order.id))}
                className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium"
              >
                View Details
              </button>
              {(order.status === 'CONFIRMED' || order.status === 'PENDING') && (
                <button
                  type="button"
                  onClick={() => void handleCancel(order.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {expandedId === order.id && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center">
                  <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      ₹{item.price.toLocaleString('en-IN')} x {item.quantity}
                    </p>
                  </div>
                  <div className="font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
