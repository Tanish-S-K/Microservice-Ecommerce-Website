import { KeyboardEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { getCart } from '../api/cart';
import { useToastStore } from '../store/toastStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items, setItems, totalItems } = useCartStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') ?? '');
  }, [location.search]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    getCart(user.id)
      .then((response) => setItems(response.data.items ?? []))
      .catch(() => setItems([]));
  }, [user, setItems]);

  const submitSearch = () => {
    const trimmed = search.trim();
    navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products');
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      submitSearch();
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4 justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            ShopNest
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search for products..."
              className="w-full border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={submitSearch}
              className="bg-indigo-600 text-white px-4 rounded-r-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Search
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={submitSearch}
              className="md:hidden text-gray-600 hover:text-indigo-600"
              aria-label="Search"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.65 5.65a7.5 7.5 0 0011 11z" />
              </svg>
            </button>

            <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4h2l1.6 8.4a2 2 0 001.97 1.6H18a2 2 0 001.96-1.62L21 7H7" />
                <circle cx="9" cy="19" r="1.6" fill="currentColor" />
                <circle cx="18" cy="19" r="1.6" fill="currentColor" />
              </svg>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-red-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <Link to="/login" className="text-gray-700 hover:text-indigo-600">
                  Login
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
