import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addToCart, getCart } from '../api/cart';
import { getProduct } from '../api/products';
import { getSimilar, recordBehavior } from '../api/recommendations';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { Product } from '../types';

export default function ProductDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setItems } = useCartStore();
  const { showToast } = useToastStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(id);
        setProduct(response.data);
        const similarResponse = await getSimilar(id);
        const similarDetails = await Promise.all(
          similarResponse.data.productIds.map(async (productId) => {
            try {
              const detail = await getProduct(productId);
              return detail.data;
            } catch {
              return null;
            }
          })
        );
        setSimilarProducts(similarDetails.filter((item): item is Product => item !== null));
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

  useEffect(() => {
    if (!user || !id) {
      return;
    }
    void recordBehavior({ userId: user.id, productId: id, action: 'VIEW' }).catch(() => undefined);
  }, [id, user]);

  const maxQuantity = useMemo(() => product?.stock ?? 1, [product]);

  const handleAddToCart = async (buyNow = false) => {
    if (!product) {
      return;
    }
    if (!user) {
      showToast('Please login to continue', 'info');
      navigate('/login');
      return;
    }

    try {
      await addToCart(user.id, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
      });
      await recordBehavior({ userId: user.id, productId: product.id, action: 'ADD_TO_CART' });
      const cartResponse = await getCart(user.id);
      setItems(cartResponse.data.items ?? []);
      showToast('Added to cart!');
      if (buyNow) {
        navigate('/cart');
      }
    } catch {
      showToast('Could not add item to cart', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
        Product not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-xl object-cover bg-white border border-gray-100" />

          {similarProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarProducts.slice(0, 4).map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5 h-fit">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-3 text-gray-500">
            <StarRating rating={product.rating} />
            <span>{product.reviewCount} reviews</span>
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            ₹{product.price.toLocaleString('en-IN')}
          </div>
          <p className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
          </p>
          <p className="text-gray-600">{product.description}</p>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {tag}
              </span>
            ))}
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Quantity</p>
            <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="px-4 py-2 hover:bg-gray-50"
              >
                -
              </button>
              <span className="px-5 py-2 border-x border-gray-300">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                className="px-4 py-2 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={product.stock === 0}
              onClick={() => void handleAddToCart(false)}
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium w-full disabled:opacity-50"
            >
              Add to Cart
            </button>
            <button
              type="button"
              disabled={product.stock === 0}
              onClick={() => void handleAddToCart(true)}
              className="border border-indigo-600 text-indigo-600 px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium w-full disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
