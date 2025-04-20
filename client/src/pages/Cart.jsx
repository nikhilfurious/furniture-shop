import React, { useEffect, useState } from 'react';
import { useCart } from '../Context/CartContext';
import QuantitySelector from '../components/QuantitySelector';
import { Trash2, ShoppingBag, ChevronDown, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../endpoint";

const CartPage = () => {
  const { removeFromCart, updateQuantity } = useCart();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showDeposit, setShowDeposit] = useState({});
  const auth = getAuth();
  const navigate = useNavigate();
  const DELIVERY_CHARGE = 650; // Define delivery charge constant

  // 1) Fetch cart on mount
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

  // 2) Remove item
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

  // 3) Change quantity
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

  // 4) Change tenure & price locally, then persist via generic update route
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

  // 5) Deposit logic unchanged
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
  const depositTotal = cart.reduce((sum, i) =>
    showDeposit[i.id] ? sum + (i.refundableDeposit||0)*i.quantity : sum
  ,0).toFixed(2);
  // Include delivery charge in total
  const total = (parseFloat(subtotal) + parseFloat(depositTotal) + DELIVERY_CHARGE).toFixed(2);

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
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Shopping Cart</h1>
      
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Cart Header - visible on larger screens */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-gray-100 rounded-t-lg font-medium text-gray-600">
            <div className="md:col-span-6">Product</div>
            <div className="md:col-span-2 text-center">Quantity</div>
            <div className="md:col-span-2 text-center">Duration</div>
            <div className="md:col-span-2 text-right">Price</div>
          </div>
        
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {cart.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`grid md:grid-cols-12 gap-4 p-6 items-center hover:bg-gray-50 transition-colors ${
                      index !== cart.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    {/* Image + Name */}
                    <div className="md:col-span-6 flex">
                      <div className="h-28 w-28 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                        <img 
                          src={item.images[0]} 
                          className="h-full w-full object-cover" 
                          alt={item.name}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <p className="font-semibold text-lg text-gray-800">{item.name}</p>
                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={updatingItems.has(item.id)}
                            className="text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {item.refundableDeposit > 0 && (
                          <label className="flex items-center text-sm mt-2 text-gray-600">
                            
                            Deposit (₹{item.refundableDeposit})
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex justify-center">
                      <QuantitySelector
                        quantity={item.quantity}
                        onIncrease={() => handleQuantityChange(item.id, item.quantity + 1)}
                        onDecrease={() => item.quantity > 1 && handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={updatingItems.has(item.id)}
                      />
                    </div>

                    {/* Tenure Dropdown */}
                    <div className="md:col-span-2 flex justify-center relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                        disabled={updatingItems.has(item.id)}
                        className="flex items-center border border-gray-300 px-3 py-2 rounded-md w-32 justify-between bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span>{item.tenure} mo</span>
                        <ChevronDown size={16} />
                      </button>
                      {openDropdown === item.id && (
                        <ul className="absolute z-10 bg-white border w-32 mt-1 rounded-md shadow-lg py-1 top-full">
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
                              {opt.months} mo — ₹{opt.price}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Price - Show total for quantity + unit price */}
                    <div className="md:col-span-2 text-right">
                      <p className="font-bold text-lg text-gray-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          ₹{item.price} each
                        </p>
                      )}
                      {showDeposit[item.id] && item.refundableDeposit > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          +₹{(item.refundableDeposit * item.quantity).toFixed(2)} deposit
                        </p>
                      )}
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

            {/* Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  
                  {parseFloat(depositTotal) > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Refundable Deposits</span>
                      <span>₹{depositTotal}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery</span>
                    <span>₹{DELIVERY_CHARGE.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-gray-200">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
                >
                  <ShoppingBag size={18} className="mr-2" />
                  Proceed to Checkout
                </button>
              </div>
             
              
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;