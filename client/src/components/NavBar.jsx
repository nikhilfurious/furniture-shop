import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Store, MapPin, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import Breadcrumb from './BreadCrumb';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const categories = [
  'All Categories',
  'Electronics',
  'Living Room Furniture',
  'Bedroom Furniture',
  'Office Furniture',
  'Dining Room Furniture',
];

function Navbar({ products, openModal, locationData }) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [cart, setCart] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const auth = getAuth();
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';
  
  // Reference to the search input so we can handle blur/focus
  const searchInputRef = useRef(null);
  
  // Create a ref to store the interval ID
  const cartIntervalRef = useRef(null);

  // Fetch cart data function
  const fetchCart = async () => {
    if (!auth.currentUser) {
      setCart([]);
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${API_URL}/api/cart/${auth.currentUser.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Set up interval to poll for cart updates
  useEffect(() => {
    // Fetch cart immediately on mount
    fetchCart();
    
    // Set up interval to check for cart updates every 2 seconds
    cartIntervalRef.current = setInterval(() => {
      fetchCart();
    }, 2000);
    
    // Clean up interval on unmount
    return () => {
      if (cartIntervalRef.current) {
        clearInterval(cartIntervalRef.current);
      }
    };
  }, [auth.currentUser]); // Re-initialize if user changes

  // Additional useEffect to listen for specific cart update events if you have them
  useEffect(() => {
    // Function to handle custom cart update events
    const handleCartUpdate = () => {
      fetchCart();
    };
    
    // Add event listener for custom cart update events
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Handler for search filtering
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredProducts([]);
      return;
    }
    const filtered = products?.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
    setIsSuggestionsVisible(true);
  };

  // Handle key press: if Enter is pressed, navigate to search results page
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim() === '') return;
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSuggestionsVisible(false);
      setMobileSearchOpen(false);
    }
  };

  // When a product is selected from the suggestions
  const handleSelectProduct = (product) => {
    setSearchQuery('');
    setFilteredProducts([]);
    setIsSuggestionsVisible(false);
    navigate(`/product/${product.slug}`);
  };

  // Hide suggestions on blur (with a slight delay to allow click events)
  const handleBlur = () => {
    setTimeout(() => {
      setIsSuggestionsVisible(false);
    }, 200);
  };

  // Show suggestions on focus if query exists
  const handleFocus = () => {
    if (searchQuery.trim() !== '' && filteredProducts.length > 0) {
      setIsSuggestionsVisible(true);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim() === '') {
      setMobileSearchOpen(!mobileSearchOpen);
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsSuggestionsVisible(false);
    setMobileSearchOpen(false);
  };
  
  // Handle scroll visibility for navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Category change handler
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (category === 'All Categories') {
      navigate(`/category`);
    } else {
      navigate(`/category/${category}`);
    }
    setMobileMenuOpen(false);
  };

  // Close mobile menu when navigating
  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Location dropdown component
  function LocationDropdown({ locationData, openModal }) {
    const [selectedLocation, setSelectedLocation] = useState(
      locationData || localStorage.getItem('userLocation') || ''
    );
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
      // Function to fetch the location from localStorage
      const fetchLocation = () => {
        const loc = localStorage.getItem('userLocation');
        if (loc) {
          setSelectedLocation(loc);
        } else if (locationData) {
          setSelectedLocation(locationData);
        }
      };
    
      // Run on mount
      fetchLocation();
    
      // Listen for storage events (changes in localStorage across tabs)
      window.addEventListener('storage', fetchLocation);
    
      return () => {
        window.removeEventListener('storage', fetchLocation);
      };
    }, [locationData]);

    const cities = [
      'Chennai',
      'Delhi',
      'Mumbai',
      'Bangalore',
      'Kolkata',
      'Hyderabad',
    ];

    return (
      <div className="relative">
        <button
          className="flex items-center text-gray-700 hover:text-green-600 transition-colors"
          onClick={() => setDropdownVisible(!dropdownVisible)}
        >
          <MapPin className="hidden md:block h-5 w-5 mr-1 text-green-500" />
          <span className="font-medium mr-1 hidden md:inline">
            {selectedLocation || 'Select Location'}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${dropdownVisible ? 'rotate-180' : ''} text-green-500`} />
        </button>

        {dropdownVisible && (
          <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg border border-green-100 z-50">
            <div className="py-2">
              <div className="font-medium text-sm text-gray-500 px-4 py-1">Popular Cities</div>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    localStorage.setItem('userLocation', city);
                    setSelectedLocation(city);
                    setDropdownVisible(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-green-50 transition-colors flex items-center ${
                    selectedLocation === city ? 'bg-green-50 text-green-600' : ''
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-2 text-green-400" />
                  {city}
                  {selectedLocation === city && (
                    <span className="ml-auto text-green-600 text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <nav
        className={`fixed top-0 w-full bg-white border-b border-green-100 shadow-md transition-transform duration-300 z-50 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden flex items-center text-gray-700 hover:text-green-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Store className="h-7 w-7 text-green-600" />
              <span className="font-display text-xl md:text-2xl font-bold text-green-700">Spot Furnish</span>
            </Link>

            {/* Location Dropdown - Hide on mobile */}
            <div className="hidden md:block">
              <LocationDropdown locationData={locationData} openModal={openModal} />
            </div>

            {/* Search Bar - Hide on mobile */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <div className="flex items-center bg-white rounded-xl hover:shadow-lg transition-shadow duration-200 border-2 border-green-100 focus-within:border-green-300">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="px-3 py-2 rounded-l-xl bg-green-50 border-r border-green-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer hover:bg-green-100 transition-colors"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    placeholder="Search for products..."
                    className="w-full px-4 py-2 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400"
                  />
                  <Search
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 cursor-pointer hover:text-green-600"
                    onClick={handleSearchIconClick}
                  />

                  {isSuggestionsVisible && (
                    <ul className="absolute w-full bg-white mt-2 rounded-xl shadow-xl border border-green-100 max-h-48 overflow-auto z-50">
                      {filteredProducts && filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <li key={product.id} className="border-b border-green-100 last:border-none">
                            <Link
                              to={`/product/${product.slug}`}
                              className="block px-4 py-2 hover:bg-green-50 transition-colors"
                              onClick={() => {
                                setSearchQuery('');
                                setFilteredProducts([]);
                                setIsSuggestionsVisible(false);
                              }}
                            >
                              {product.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-gray-500">No products found</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Search Button */}
            <button 
              className="md:hidden text-gray-600 hover:text-green-600"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <Search className="h-6 w-6" />
            </button>

            {/* Right Icons - Simplified on mobile */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link to="/cart" className="text-gray-600 hover:text-green-600 transition-colors relative">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {cart && cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5 flex items-center justify-center min-w-5 h-5">
                      {cart.length}
                    </span>
                  )}
                </div>
              </Link>
              <div className="hidden md:block">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
                      <User className="h-6 w-6" />
                    </Link>
                    <span
                      onClick={logout}
                      className="cursor-pointer text-red-600 hover:text-green-600 transition-colors font-medium underline"
                    >
                      Logout
                    </span>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Conditionally Displayed */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 py-3 bg-green-50 border-t border-green-100">
            <div className="flex items-center bg-white rounded-xl border-2 border-green-200 focus-within:border-green-300">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Search for products..."
                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400"
                />
                <Search
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 cursor-pointer hover:text-green-600"
                  onClick={handleSearchIconClick}
                />

                {isSuggestionsVisible && (
                  <ul className="absolute w-full bg-white mt-2 rounded-xl shadow-xl border border-green-100 max-h-48 overflow-auto z-50">
                    {filteredProducts && filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <li key={product.id} className="border-b border-green-100 last:border-none">
                          <Link
                            to={`/product/${product.slug}`}
                            className="block px-4 py-2 hover:bg-green-50 transition-colors"
                            onClick={() => {
                              setSearchQuery('');
                              setFilteredProducts([]);
                              setIsSuggestionsVisible(false);
                              setMobileSearchOpen(false);
                            }}
                          >
                            {product.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500">No products found</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb - Hidden on mobile for space efficiency */}
        <div className="hidden md:block bg-green-50">
          <Breadcrumb />
        </div>
      </nav>

      {/* Mobile Menu - Slides in from left */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop with blur effect */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Menu Content */}
          <div className="absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-green-100">
              <div className="flex items-center space-x-2">
                <Store className="h-6 w-6 text-green-600" />
                <span className="font-display text-xl font-bold text-green-700">Spot Furnish</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-green-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Section */}
            <div className="p-4 border-b border-green-100 bg-green-50">
              {user ? (
                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium">Welcome!</span>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleNavigate('/dashboard')}
                      className="text-green-600 font-medium"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={logout}
                      className="text-red-600 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate('/login')}
                  className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Login / Register
                </button>
              )}
            </div>

            {/* Location Selection */}
            <div className="p-4 border-b border-green-100">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-medium">Select Location</h3>
              </div>
              <LocationDropdown locationData={locationData} openModal={openModal} />
            </div>

            {/* Categories */}
            <div className="p-4">
              <h3 className="font-medium mb-3">Browse Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange({ target: { value: category } })}
                    className={`w-full text-left p-2 rounded-lg hover:bg-green-50 transition-colors ${
                      selectedCategory === category ? 'bg-green-50 text-green-600 font-medium' : ''
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-4 border-t border-green-100 mt-auto">
              <h3 className="font-medium mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/cart" 
                    className="flex items-center p-2 hover:bg-green-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2 text-green-500" />
                    <span>Shopping Cart</span>
                    {cart && cart.length > 0 && (
                      <span className="ml-auto bg-green-500 text-white text-xs font-bold rounded-full px-2 py-1">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Content padding to avoid overlap with fixed navbar */}
      <div className="h-16 md:h-20"></div>
    </>
  );
}

export default Navbar;