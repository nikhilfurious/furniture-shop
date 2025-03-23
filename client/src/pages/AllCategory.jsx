import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';

const AllCategory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const API_URL = 'http://localhost:5000';
  const categoryName = 'All Categories';

  // Initialize AOS for scroll animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  // Fetch all products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Ensure your backend endpoint returns all products.
        const response = await axios.get(`${API_URL}/api/products`);
        // Assuming the response contains an array in response.data.products or directly response.data.
        const productsData = response.data.products || response.data;
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sorting logic: you can enhance filtering logic as needed.
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.price || a.basePrice || 0) - (b.price || b.basePrice || 0);
      case 'price-desc':
        return (b.price || b.basePrice || 0) - (a.price || a.basePrice || 0);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg shadow" data-aos="fade-up">
        <h2 className="text-xl font-bold mb-2">Error Loading Products</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center" data-aos="fade-down">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
          <div className="h-1 w-24 bg-blue-500 mx-auto rounded"></div>
        </div>

        {/* Sorting */}
        <div className="flex justify-end mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-md" data-aos="fade-up">
            <h3 className="text-xl font-semibold text-gray-700">No products found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product, index) => (
              <div
                key={product._id || index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
                data-aos="fade-up"
                data-aos-delay={100 * (index % 6)}
              >
                <div className="h-56 bg-gray-100 overflow-hidden relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover p-4 hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition">
                    {product.name}
                  </h2>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-lg font-bold text-blue-600">
                      ${(product.price || product.basePrice || 0).toFixed(2)}
                    </p>
                    {product.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 h-12 overflow-hidden">
                    {(product.description || '').substring(0, 70)}
                    {(product.description || '').length > 70 ? '...' : ''}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <Link
                      to={`/product/${product.id}`}
                      className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2`}
                    >
                      More Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCategory;
