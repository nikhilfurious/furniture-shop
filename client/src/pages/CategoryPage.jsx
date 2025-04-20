import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
  import { API_URL } from "../endpoint";

const CategoryPage = () => {
  // Get the category slug from the URL (e.g., "living-room")
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 10000000 },
    inStock: false
  });
  const [location, setLocation] = useState(localStorage.getItem('userLocation') || '');



  const navigate = useNavigate();
  

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  // Helper to convert slug to title-case for display
  const displayCategoryName = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Fetch products from the backend using the category slug
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/category/${categoryId}`
        );
        // Expecting response.data.products or response.data to be an array of products
        const productsData = response.data.products || response.data;
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);



// Update the location state whenever it changes in localStorage
useEffect(() => {
  const handleLocationChange = () => {
    const newLocation = localStorage.getItem('userLocation') || '';
    setLocation(newLocation);
  };

  // Add an event listener to update location on localStorage change
  window.addEventListener('storage', handleLocationChange);

  // Update the location initially
  handleLocationChange();

  // Cleanup the event listener
  return () => {
    window.removeEventListener('storage', handleLocationChange);
  };
}, []);

  // Filter products based on price and stock availability
  const filteredProducts = products?.filter(product => {

    const productLocations = Array.isArray(product.location) ? product.location : [product.location];
  
    if (location && !productLocations.some(loc => loc.toLowerCase() === location.toLowerCase())) {
      return false;
    }

    if (product.basePrice < filters.priceRange.min || product.basePrice > filters.priceRange.max) {
      return false;
    }
    if (filters.inStock && !product.inStock) {
      return false;
    }
    return true;
  });

  // Sort products according to selected criteria
  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
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

  // Handlers for filter updates
  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    setFilters({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [type]: value
      }
    });
  };

  const handleStockChange = () => {
    setFilters({
      ...filters,
      inStock: !filters.inStock
    });
  };

  const resetFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 10000000 },
      inStock: false
    });
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg shadow" data-aos="fade-up">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center" data-aos="fade-down">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{displayCategoryName(categoryId)}</h1>
          <div className="h-1 w-24 bg-green-500 mx-auto rounded"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          

          {/* Products Listing */}
          <div className="flex-grow">
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row justify-between items-center" data-aos="fade-up">
              <p className="text-gray-600 mb-4 sm:mb-0">
                <span className="font-semibold text-green-500">{sortedProducts.length}</span> products found
              </p>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-3 text-gray-700">Sort by:</label>
                <select
                  id="sort"
                  className="border rounded-lg p-2 pr-8 bg-gray-50 focus:ring-2 focus:ring-green-300 transition"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl shadow-md" data-aos="fade-up">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-700">No products match your filters</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or browse all products</p>
                <button className=" m-4 cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-md hover:from-green-700 hover:to-emerald-700 flex-1 transition duration-300 shadow-md hover:shadow-lg"
                  onClick={()=>{navigate('/product')}}>
                    View Other Products
                </button>
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
                      {product.inStock && (
                        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          In Stock
                        </span>
                      )}
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover p-4 hover:scale-105 transition" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-800 hover:text-green-600 transition">{product.name}</h2>
                      <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-lg font-bold text-green-600">${(product.price || product.basePrice || 0).toFixed(2)}</p>
                        {product.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2 h-12 overflow-hidden">
                        {(product.description || 'No description available').substring(0, 70)}
                        {(product.description || '').length > 70 ? '...' : ''}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <Link 
                          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2`}
                          to={`/product/${product._id}`}
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
      </div>
    </div>
  );
};

export default CategoryPage;
