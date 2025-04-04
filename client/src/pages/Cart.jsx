import React, { useEffect, useState } from 'react';
import { useCart } from '../Context/CartContext';
import QuantitySelector from '../components/QuantitySelector';
import { Trash2, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { removeFromCart, getTotalPrice, updateQuantity } = useCart();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const API_URL = 'http://localhost:5000';
  const auth = getAuth();
  const navigate = useNavigate();

  const fetchCart = async (initialLoad = false) => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(`${API_URL}/api/cart/${auth.currentUser?.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart(true);
  }, [auth.currentUser]);

  const handleRemove = async (itemId) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      
      // Optimistically update UI
      setCart(currentCart => currentCart.filter(item => item.id !== itemId));
      
      // Then update server
      await removeFromCart(itemId);
      
      // No need to refresh the entire cart - we've already removed the item locally
    } catch (error) {
      console.error('Error removing item:', error);
      // If there was an error, refresh to get the correct state
      fetchCart();
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      
      // Optimistically update UI
      setCart(currentCart => 
        currentCart.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      // Then update server
      await updateQuantity(itemId, newQuantity);
      
      // No need to refresh the entire cart - we've already updated the quantity locally
    } catch (error) {
      console.error('Error updating quantity:', error);
      // If there was an error, refresh to get the correct state
      fetchCart();
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag className="h-8 w-8 text-indigo-600" />
        <h2 className="text-3xl font-bold text-gray-800">Your Cart</h2>
      </div>

      {loading ? (
        <p className="text-xl m-4">Loading cart...</p>
      ) : cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl text-gray-500 font-medium">Your cart is empty</p>
          <p className="text-gray-400 mt-2">Add some items to get started</p>
          <button
            className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            onClick={() => navigate('/product')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-t-lg border-b text-sm font-medium text-gray-500">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y">
            {cart.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                <div className="col-span-6 flex items-center">
                  <div className="h-24 w-24 rounded-lg overflow-hidden border flex-shrink-0">
                    {item.images && (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover z-10"
                      />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Tenure: {item.tenure} months</p>
                  </div>
                </div>

                <div className="col-span-2 flex justify-center">
                  <div className="relative">
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrease={() => handleQuantityChange(item.id, item.quantity + 1)}
                      onDecrease={() => {
                        if (item.quantity > 1) {
                          handleQuantityChange(item.id, item.quantity - 1);
                        }
                      }}
                      className={`shadow-sm ${updatingItems.has(item.id) ? 'opacity-50' : ''}`}
                      disabled={updatingItems.has(item.id)}
                    />
                    {updatingItems.has(item.id) && (
                      <div className="absolute left-0 right-8 top-0 bottom-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <p className="font-bold text-gray-900">₹{item.price}</p>
                  <p className="text-xs text-gray-500">₹{item.price * item.quantity} total</p>
                </div>

                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md hover:bg-red-50 text-red-500 transition-colors ${
                      updatingItems.has(item.id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={updatingItems.has(item.id)}
                  >
                    {updatingItems.has(item.id) ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 rounded-b-lg border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{calculateTotal()}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium">₹0.00</span>
            </div>
            <div className="h-px bg-gray-200 mb-6"></div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold text-indigo-600">₹{calculateTotal()}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="px-6 py-3 cursor-pointer bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/product')}
              >
                Continue Shopping
              </button>
              <button
                className="px-6 py-3 cursor-pointer bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex-1"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;