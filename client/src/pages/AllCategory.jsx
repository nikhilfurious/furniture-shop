import React, { useEffect, useState, useCallback } from 'react';
import { fetchProducts } from '../services/Productapi';
import { useNavigate } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import ProductFilter from '../components/Filters';

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    months: []
  });
  const [userLocation, setUserLocation] = useState('');
  const navigate = useNavigate();

  // Set up polling to check for localStorage changes
  useEffect(() => {
    // Get initial location
    const initialLocation = localStorage.getItem('userLocation') || '';
    setUserLocation(initialLocation);

    // Set up interval to check for location changes
    const checkLocationInterval = setInterval(() => {
      const currentLocation = localStorage.getItem('userLocation') || '';
      if (currentLocation !== userLocation) {
        setUserLocation(currentLocation);
      }
    }, 1000);

    // Add window storage event listener for changes in other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'userLocation') {
        setUserLocation(e.newValue || '');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Clean up
    return () => {
      clearInterval(checkLocationInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userLocation]);

  // Create a custom localStorage wrapper that will update our state
  const updateUserLocation = useCallback((newLocation) => {
    localStorage.setItem('userLocation', newLocation);
    setUserLocation(newLocation);
  }, []);

  // Expose the wrapper to window object for external scripts to use
  useEffect(() => {
    // Add a method to window that other scripts can call to update location
    window.updateUserLocationAndRefresh = updateUserLocation;
    
    return () => {
      // Clean up
      delete window.updateUserLocationAndRefresh;
    };
  }, [updateUserLocation]);

  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
    });

    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Memoize the filter function to prevent unnecessary re-renders
  const applyFiltersAndSort = useCallback(() => {
    if (products.length === 0) return;
    
    // First filter by user location if available
    let filtered = [...products];
    // add it case insensitive
    const userLocationLower = userLocation.toLowerCase();
    if (userLocationLower) {
      filtered = filtered.filter(product =>
        product.location && product.location.some(location => 
          location.toLowerCase().includes(userLocationLower)
        )
      );
    }
    
    // Then apply category filters if any are selected
    if (activeFilters.categories && activeFilters.categories.length > 0) {
      filtered = filtered.filter(product => 
        activeFilters.categories.includes(product.category)
      );
    }
    
    // Filter by tenure months if any are selected
    if (activeFilters.months && activeFilters.months.length > 0) {
      filtered = filtered.filter(product => {
        // Check if product has tenure options that match any of the selected months
        if (!product.tenureOptions || product.tenureOptions.length === 0) return false;
        
        return product.tenureOptions.some(option => 
          activeFilters.months.includes(option.months)
        );
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'featured':
      default:
        // Keep original order or sort by featured status if available
        break;
    }
    
    setFilteredProducts(filtered);
  }, [products, activeFilters, sortBy, userLocation]);

  // Apply filtering and sorting when dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Don't refresh AOS on every filter change as it causes flickering
  useEffect(() => {
    if (!loading && products.length > 0) {
      // Only refresh AOS when products are initially loaded, not on every filter change
      AOS.refresh();
    }
  }, [loading, products]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(prevFilters => {
      // Only update if the filters actually changed
      if (JSON.stringify(prevFilters) === JSON.stringify(filters)) {
        return prevFilters;
      }
      return filters;
    });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value !== sortBy) {
      setSortBy(value);
    }
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      categories: [],
      months: []
    });
    setSortBy('featured');
  };

  // For testing: allows changing location directly from the UI
  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    updateUserLocation(newLocation);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-green-800 font-medium">Loading products...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-700 mb-2">Oops!</h2>
        <p className="text-gray-700">{error}</p>
        <button 
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner with green gradient */}
      <section className="bg-gradient-to-r from-[#32706f] to-[#519116] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4" data-aos="fade-up">Our Product Collection</h2>
          <p className="text-xl max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
            Quality appliances with flexible rental plans tailored to your needs
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile filters toggle */}
        <div className="md:hidden mb-6">
          <button 
            onClick={toggleMobileFilters} 
            className="w-full py-3 bg-green-600 text-white rounded-lg shadow-md flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter sidebar - Fixed positioning for mobile */}
          <div 
            className={`${
              mobileFiltersOpen ? 'fixed inset-0 bg-black bg-opacity-50 z-40 md:relative md:bg-transparent md:inset-auto' : 'hidden'
            } md:block md:w-72 md:shrink-0`}
          >
            <div className={`
              ${mobileFiltersOpen ? 'absolute right-0 top-0 h-full w-80 overflow-y-auto' : ''}
              md:sticky md:top-8 md:relative bg-white p-6 rounded-xl shadow-md
            `}>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-green-900">Filters</h2>
                  {(activeFilters.categories.length > 0 || activeFilters.months?.length > 0 || sortBy !== 'featured') && (
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {/* Display active filters */}
                {(activeFilters.categories.length > 0 || activeFilters.months?.length > 0 || userLocation) && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Active Filters:</h3>
                    <div className="flex flex-wrap gap-2">
                      {userLocation && (
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                          Location: {userLocation}
                        </span>
                      )}
                      {activeFilters.categories.map(category => (
                        <span key={category} className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full">
                          {category}
                        </span>
                      ))}
                      {activeFilters.months.map(month => (
                        <span key={month} className="bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full">
                          {month} months
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <ProductFilter 
                  onFilterChange={handleFilterChange} 
                  activeFilters={activeFilters}
                />
                
                {/* Sorting Options */}
                <div className="mt-6">
                  <h3 className="font-bold text-gray-700 mb-3">Sort By</h3>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none transition-all cursor-pointer"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>
              
              {/* Close button for mobile filters */}
              <div className="md:hidden mt-4">
                <button 
                  onClick={toggleMobileFilters}
                  className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-700 mb-3 sm:mb-0">
                <span className="font-bold text-green-900">{filteredProducts.length}</span> Products Found
                {userLocation && <span className="ml-1 text-gray-500">in {userLocation}</span>}
              </p>
              <select 
                className="w-full sm:w-auto p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none transition-all cursor-pointer md:hidden"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-4">
                  {userLocation ? 
                    `No products available in ${userLocation}. Try changing your location or filters.` : 
                    'Try changing your filters or check back later for new items.'}
                </p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => handleProductClick(product._id)}
                    data-aos="fade-up"
                  >
                    {/* Product Image */}
                    <div className="relative h-56 bg-gray-100 overflow-hidden group">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 m-3 rounded-full text-sm font-medium">
                        {product.category}
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 text-gray-800 hover:text-green-600 transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="text-xl font-bold text-green-700">₹{product.basePrice}</span>
                          <span className="text-gray-500 text-sm">/month</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {product.location && product.location.length > 0 ? 
                          `Available in: ${product.location.join(", ")}` : 
                          "Location not specified"}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-md hover:from-green-700 hover:to-emerald-600 flex-1 transition duration-300 shadow-md hover:shadow-lg">
                          View Details
                        </button>
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
        }
      `}</style>
    </div>
  );
}

export default ProductListPage;