import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { Product } from '../types';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [searchText, setSearchText] = useState(searchParams.get('search') ?? '');

  const selectedCategory = searchParams.get('category') ?? '';
  const currentPage = Number(searchParams.get('page') ?? '0');
  const sort = searchParams.get('sort') ?? '';

  useEffect(() => {
    getCategories()
      .then((response) => setCategories(response.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({
          category: selectedCategory || undefined,
          search: searchText || undefined,
          page: currentPage,
          size: 12,
          sort: sort || undefined,
        });

        const parsedMin = minPrice ? Number(minPrice) : null;
        const parsedMax = maxPrice ? Number(maxPrice) : null;
        const filtered = response.data.content.filter((product) => {
          const minPass = parsedMin === null || product.price >= parsedMin;
          const maxPass = parsedMax === null || product.price <= parsedMax;
          return minPass && maxPass;
        });

        setProducts(filtered);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [selectedCategory, searchText, currentPage, sort, minPrice, maxPrice]);

  const pageNumbers = useMemo(() => {
    const total = totalPages || 1;
    return Array.from({ length: total }, (_, index) => index);
  }, [totalPages]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) {
      next.set('page', '0');
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchText('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Filters</h2>
            <div className="space-y-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Categories</p>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedCategory === category}
                        onChange={() =>
                          updateParams({ category: selectedCategory === category ? null : category })
                        }
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min ₹</label>
                  <input
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max ₹</label>
                  <input
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateParams({
                    search: searchText || null,
                    minPrice: minPrice || null,
                    maxPrice: maxPrice || null,
                  })
                }
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium w-full"
              >
                Apply Filters
              </button>
              <button type="button" onClick={clearFilters} className="text-indigo-600 text-sm">
                Clear Filters
              </button>
            </div>
          </div>
        </aside>

        <section className="lg:w-3/4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="text-sm text-gray-600">{totalElements} products found</div>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    updateParams({ search: searchText || null });
                  }
                }}
                placeholder="Search products..."
                className="w-full md:w-72 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                value={sort}
                onChange={(event) => updateParams({ sort: event.target.value || null, page: '0' })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-600">
              No products matched your filters.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => updateParams({ page: String(Math.max(currentPage - 1, 0)) })}
              className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              Prev
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                onClick={() => updateParams({ page: String(pageNumber) })}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentPage === pageNumber
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage >= Math.max(totalPages - 1, 0)}
              onClick={() => updateParams({ page: String(currentPage + 1) })}
              className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
