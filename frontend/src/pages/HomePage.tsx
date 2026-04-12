import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBundles } from '../api/cart';
import { getProduct } from '../api/products';
import { getRecommendations } from '../api/recommendations';
import BundleCard from '../components/BundleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';
import { useAuthStore } from '../store/authStore';
import { BundleDeal, Product } from '../types';

const categories = [
  { name: 'Electronics', icon: '💻', bg: 'bg-blue-50' },
  { name: 'Clothing', icon: '👕', bg: 'bg-pink-50' },
  { name: 'Home & Kitchen', icon: '🏠', bg: 'bg-yellow-50' },
  { name: 'Books', icon: '📚', bg: 'bg-green-50' },
  { name: 'Sports', icon: '⚽', bg: 'bg-orange-50' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [bundles, setBundles] = useState<BundleDeal[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    getBundles()
      .then((response) => setBundles(response.data))
      .catch(() => setBundles([]));
  }, []);

  useEffect(() => {
    if (!user) {
      setRecommendedProducts([]);
      return;
    }

    const loadRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        const response = await getRecommendations(user.id);
        const details = await Promise.all(
          response.data.productIds.map(async (productId) => {
            try {
              const productResponse = await getProduct(productId);
              return productResponse.data;
            } catch {
              return null;
            }
          })
        );
        setRecommendedProducts(details.filter((product): product is Product => product !== null));
      } finally {
        setLoadingRecommendations(false);
      }
    };

    void loadRecommendations();
  }, [user]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-16 text-white">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">Shop Smarter, Live Better</h1>
            <p className="text-lg text-indigo-100">
              Discover thoughtfully curated products, personalized recommendations, and bundle deals that stretch your budget further.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium">
                Shop Now
              </Link>
              <Link to="/products?sort=rating" className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200 font-medium">
                View Deals
              </Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
                className={`${category.bg} rounded-2xl p-6 text-left hover:shadow-md transition border border-white`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              </button>
            ))}
          </div>
        </section>

        {bundles.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Today&apos;s Bundle Deals</h2>
              <span className="inline-flex bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                Save More
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {bundles.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended For You</h2>
          {!isAuthenticated && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-600">
              Login to see personalized recommendations
            </div>
          )}
          {isAuthenticated && loadingRecommendations && <LoadingSpinner />}
          {isAuthenticated && !loadingRecommendations && recommendedProducts.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="min-w-[260px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          {isAuthenticated && !loadingRecommendations && recommendedProducts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-600">
              Keep browsing and ordering to train your recommendations.
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © 2025 ShopNest. Built with React &amp; Spring Boot
      </footer>
    </>
  );
}
