import { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart, getCart } from '../api/cart';
import { recordBehavior } from '../api/recommendations';
import { Product } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import StarRating from './StarRating';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setItems } = useCartStore();
  const { showToast } = useToastStore();

  const handleAddToCart = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!user) {
      showToast('Please login to add items to your cart', 'info');
      navigate('/login');
      return;
    }

    try {
      await addToCart(user.id, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
      });
      await recordBehavior({ userId: user.id, productId: product.id, action: 'ADD_TO_CART' });
      const cartResponse = await getCart(user.id);
      setItems(cartResponse.data.items ?? []);
      showToast('Added to cart!');
    } catch {
      showToast('Could not add item to cart', 'error');
    }
  };

  return (
    <article
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer border border-gray-100"
    >
      <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
      <div className="p-4 space-y-3">
        <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
          {product.category}
        </span>
        <h3 className="font-medium text-gray-900 line-clamp-2 min-h-12">{product.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <StarRating rating={product.rating} size="sm" />
          <span>({product.reviewCount})</span>
        </div>
        <div className="text-xl font-bold text-indigo-600">
          ₹{product.price.toLocaleString('en-IN')}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
            product.stock === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
