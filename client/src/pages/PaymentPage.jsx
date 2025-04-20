import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PurchaseButton from '../components/PurchaseButton';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
  import { API_URL } from "../endpoint";

const PaymentPage = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const auth = getAuth();
 

  const adminEmail = "pragarajesh779jd@gmail.com";

  // Fetch cart data
  const fetchCartData = async (uid) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(`${API_URL}/api/cart/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Cart Response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setError("Failed to load your cart. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate subtotal when products change
  useEffect(() => {
    if (products.length > 0) {
      const total = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
      console.log("Calculated Subtotal:", total);
      setSubtotal(total);
    } else {
      setSubtotal(0);
    }
  }, [products]);

  // Track auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCustomer({
          userId: user.uid,
          customerName: user.displayName || 'Unknown User',
          email: user.email || "email",
        });
        fetchCartData(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => customer?.userId && fetchCartData(customer.userId)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-gray-400 text-4xl mb-4">🛒</div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">There are no products in your checkout.</p>
          <button 
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax - discount;

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }
    
    if (couponCode.toLowerCase() === 'discount20') {
      setDiscount(subtotal * 0.2);
    } else {
      setDiscount(0);
      alert('Invalid coupon code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Left Column - Products */}
          <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Cart</h2>
            
            <div className="divide-y divide-gray-200">
              {products.map(product => (
                <div key={product.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center">
                  <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center mr-4 mb-2 sm:mb-0">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover rounded-md" 
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-300 rounded-md"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      Quantity: {product.quantity}
                      {product.tenure && <span> | Tenure: {product.tenure}</span>}
                    </p>
                  </div>
                  
                  <div className="text-right mt-2 sm:mt-0">
                    <p className="font-medium text-gray-800">₹{(product.price * product.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={applyCoupon}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Try code: DISCOUNT20 for 20% off</p>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="w-full lg:w-1/3 mt-4 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹{shipping.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                    className="mt-1 h-4 w-4 text-green-600"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the <a href="/policy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Terms and Conditions</a> and
                    <a href="/policy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline"> Privacy Policy</a>
                  </span>
                </label>
              </div>
              
              <PurchaseButton disabled={!termsAccepted} products={products} customer={customer} adminEmail={adminEmail}>
                Pay ₹{total.toFixed(2)}
              </PurchaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;