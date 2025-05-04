import React, { useEffect, useState } from 'react';
import { useCart } from '../Context/CartContext';
import QuantitySelector from '../components/QuantitySelector';
import { Trash2, ShoppingBag, ChevronDown, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../endpoint";
import PurchaseButton from '../components/PurchaseButton';

const CartPage = () => {
  const { removeFromCart, updateQuantity } = useCart();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showDeposit, setShowDeposit] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [customer, setCustomer] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();
  const DELIVERY_CHARGE = 750; 

  const adminEmail = "pragarajesh779jd@gmail.com";

  // Using all existing logic
  const fetchCart = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const token = await auth.currentUser.getIdToken();
      const { data } = await axios.get(
        `${API_URL}/api/cart/${auth.currentUser.uid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // init deposit flags
      const depositFlags = {};
      data.forEach(item => depositFlags[item.id] = false);
      setShowDeposit(depositFlags);
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) fetchCart(true);
  }, [auth.currentUser]);

  const handleRemove = async id => {
    setUpdatingItems(s => { const c = new Set(s); c.add(id); return c; });
    setCart(c => c.filter(i => i.id !== id));
    try {
      await removeFromCart(id);
    } catch {
      fetchCart();
    } finally {
      setUpdatingItems(s => { const c = new Set(s); c.delete(id); return c; });
    }
  };

  const handleQuantityChange = async (id, qty) => {
    setUpdatingItems(s => { const c = new Set(s); c.add(id); return c; });
    setCart(c => c.map(i => i.id === id ? { ...i, quantity: qty } : i));
    try {
      await updateQuantity(id, qty);
    } catch {
      fetchCart();
    } finally {
      setUpdatingItems(s => { const c = new Set(s); c.delete(id); return c; });
    }
  };

  const handleTenureChange = async (id, months) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    // find the matching option
    const opt = item.tenureOptions.find(o => String(o.months) === String(months));
    const newPrice = opt ? opt.price : item.price;

    // update UI
    setCart(c =>
      c.map(i => i.id === id
        ? { ...i, tenure: months, price: newPrice }
        : i
      )
    );
    setOpenDropdown(null);
    setUpdatingItems(s => { const c = new Set(s); c.add(id); return c; });

    // persist
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `${API_URL}/api/cart/update/${id}`,
        { tenure: months, price: newPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      fetchCart();
    } finally {
      setUpdatingItems(s => { const c = new Set(s); c.delete(id); return c; });
    }
  };

  const toggleDeposit = id => setShowDeposit(s => ({ ...s, [id]: !s[id] }));
  const updateDeposit = async (id, include) => {
    setUpdatingItems(s => { const c = new Set(s); c.add(id); return c; });
    toggleDeposit(id);
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `${API_URL}/api/cart/update/${id}`,
        { includeDeposit: include },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      toggleDeposit(id);
    } finally {
      setUpdatingItems(s => { const c = new Set(s); c.delete(id); return c; });
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);
  const calculateDepositTotal = () => {
    return cart.reduce((sum, item) => {
      
      
  
      // tenure comes in as a string like "3" or "6"
      const months = parseInt(item.tenure, 10) || 0;
      const monthlyPayout = item.price;  // price is your monthly rate
  
      // deposit for this line = monthly rate * months * quantity
      return sum + monthlyPayout * months * item.quantity;
    }, 0).toFixed(2);
  };
  const depositTotal = calculateDepositTotal();
  const total = (parseFloat(subtotal) + DELIVERY_CHARGE + parseFloat(depositTotal)).toFixed(2);


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

  if (!loading && cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <ShoppingBag size={64} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <button 
            onClick={() => navigate('/product')}
            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h1>
      
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Items Column */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-md overflow-visible">
              {cart.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    index !== cart.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <div className="w-full md:w-36 h-36 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      <img 
                        src={item.images[0]} 
                        className="h-full w-full object-cover" 
                        alt={item.name}
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-xl text-gray-800">{item.name}</h3>
                          <div className="flex items-center mt-1 text-gray-600">
                            <span className="font-medium">₹{item.price}</span>
                            <span className="text-sm ml-1">/Month</span>
                          </div>
                          {item.refundableDeposit > 0 && (
                            <div className="text-sm mt-1 text-gray-600">
                              ₹{item.refundableDeposit} Deposit
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {/* Bottom controls grid */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        {/* Duration */}
                        <div className="relative">
                          <p className="text-sm font-medium text-gray-600 mb-2">Duration</p>
                          <button
                            onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                            disabled={updatingItems.has(item.id)}
                            className="flex items-center border border-gray-300 px-3 py-2 rounded-md w-full justify-between bg-white hover:bg-gray-50 transition-colors"
                          >
                            <span>{item.tenure} Month</span>
                            <ChevronDown size={16} />
                          </button>
                          {openDropdown === item.id && (
                            <ul className="absolute z-50 bg-white border w-full mt-1 rounded-md shadow-lg py-1">
                              {item.tenureOptions?.map(opt => (
                                <li
                                  key={opt.months}
                                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                                    String(opt.months) === String(item.tenure)
                                      ? 'bg-green-50 text-green-700 font-medium'
                                      : 'text-gray-700'
                                  }`}
                                  onClick={() => handleTenureChange(item.id, opt.months)}
                                >
                                  {opt.months} Month
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        
                        {/* Quantity */}
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Quantity</p>
                          <div className="flex border border-gray-300 rounded-md bg-white">
                            <button
                              onClick={() => item.quantity > 1 && handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={updatingItems.has(item.id) || item.quantity <= 1}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              -
                            </button>
                            <div className="flex-1 flex items-center justify-center font-medium">
                              {item.quantity}
                            </div>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updatingItems.has(item.id)}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-600 mb-2">Price</p>
                          <p className="font-bold text-lg text-gray-800">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                          {showDeposit[item.id] && item.refundableDeposit > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              +₹{(item.refundableDeposit * item.quantity).toFixed(2)} deposit
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Continue Shopping Button */}
            <button
              onClick={() => navigate('/product')}
              className="mt-6 flex items-center text-green-600 hover:text-green-800 transition-colors font-medium"
            >
              <ArrowLeft size={18} className="mr-2" />
              Continue Shopping
            </button>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              
              
              <div className="bg-gray-50 p-4  rounded-md">
                <div className="bg-green-100 text-green-800 font-medium py-2 px-4 mb-4 rounded">
                  Monthly Payable
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Rent</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                    <span className="font-medium">Total Monthly Payout</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-4 mb-6">
                After delivery of the items, monthly payable will be deducted
              </p>
              
              <div className="bg-green-100 text-green-800 font-medium py-2 px-4 rounded text-center mb-4">
                Pay Now
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex justify-between">
                  <span>Refundable Deposit</span>
                  <span className="font-medium">₹{calculateDepositTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-medium">₹{DELIVERY_CHARGE.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex flex-col justify-between items-center pt-4 border-t border-gray-200">
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
                <div className='flex items-center justify-between w-full gap-8'>
                  <div>
                    <p className="font-medium text-gray-700">Total</p>
                    <p className="text-2xl font-bold">₹{total}</p>
                  </div>
                  
                  <PurchaseButton disabled={!termsAccepted} products={cart} customer={customer} adminEmail={adminEmail}>
                  Pay ₹{total}
                  </PurchaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;