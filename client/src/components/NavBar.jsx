import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Store, MapPin, ChevronDown } from 'lucide-react';
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
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [cart, setCart] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';

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
  };

  // When a product is selected from the search dropdown
  const handleSelectProduct = (product) => {
    // Clear search state and navigate to the product page
    setSearchQuery('');
    setFilteredProducts([]);
    navigate(`/product/${product.slug}`);
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

  // Fetch cart data once
  useEffect(() => {

    const fetchCart = async () => {
      if (!auth.currentUser) return; 

      try {
        const response = await axios.get(`${API_URL}/api/cart/${auth.currentUser?.uid}`, {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        });
        setCart(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchCart();
  }, [auth.currentUser,cart]);

  // Category change handler
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    // Navigate based on category selection
    if (category === 'All Categories') {
      navigate(`/category`);
    } else {
      navigate(`/category/${category}`);
    }
  };

  // Location dropdown component
  function LocationDropdown({ locationData, openModal }) {
    const [selectedLocation, setSelectedLocation] = useState(
      locationData || localStorage.getItem('userLocation') || ''
    );
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
      if (locationData) {
        setSelectedLocation(locationData);
      }
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
          className="flex items-center text-gray-700 hover:text-primary transition-colors"
          onClick={() => setDropdownVisible(!dropdownVisible)}
        >
          <MapPin className="h-5 w-5 mr-1" />
          <span className="font-medium mr-1">
            {selectedLocation || 'Select Location'}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${dropdownVisible ? 'rotate-180' : ''}`} />
        </button>

        {dropdownVisible && (
          <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
            <div className="py-2">
              <div className="font-medium text-sm text-gray-500 px-4 py-1">Popular Cities</div>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    localStorage.setItem('userLocation', city);
                    setSelectedLocation(city);
                    setDropdownVisible(false);
                    // Optionally open modal if needed
                    // openModal(city);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center ${
                    selectedLocation === city ? 'bg-blue-50 text-primary' : ''
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {city}
                  {selectedLocation === city && (
                    <span className="ml-auto text-primary text-sm">✓</span>
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
    <nav
      className={`fixed top-0 w-full bg-white shadow-lg transition-transform duration-300 z-50 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold">ShopHub</span>
          </Link>

          {/* Location Dropdown */}
          <LocationDropdown locationData={locationData} openModal={openModal} />

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="flex items-center bg-white rounded-xl hover:shadow-lg transition-shadow duration-200 border-2 border-gray-100">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="px-4 py-3 rounded-l-xl bg-gray-50 border-r border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="Search for products..."
                  className="w-full px-6 py-3 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                {filteredProducts?.length > 0 && (
                  <ul className="absolute w-full bg-white mt-2 rounded-xl shadow-xl border border-gray-100 max-h-48 overflow-auto z-50">
                    {filteredProducts.map((product) => (
                      <li key={product.id} className="border-b border-gray-100 last:border-none">
                        <Link
                          to={`/product/${product.slug}`}
                          className="flex items-center px-4 py-3 hover:bg-blue-50 transition-colors"
                          onClick={() => handleSelectProduct(product)}
                        >
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-primary">
              <User className="h-6 w-6" />
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-primary relative">
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2">
                    {cart.length}
                  </span>
                )}
              </div>
            </Link>
            <div>
              {user ? (
                <div className="flex items-center gap-4">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full border"
                  />
                  <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to={{ pathname: '/login', state: { from: window.location.pathname } }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Breadcrumb />
    </nav>
  );
}

export default Navbar;
