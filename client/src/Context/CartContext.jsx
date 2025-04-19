import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { getAuth } from "firebase/auth";

// Create the cart context
export const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = "https://furniture-shop-dvh6.vercel.app";
  
  const auth = getAuth();
  

  
useEffect(()=>{

    fetchCart();
  },[auth.currentUser])

  const fetchCart = async () => {
    if(!auth.currentUser) return;
    try {
      const response = await axios.get(`${API_URL}/api/cart/${auth.currentUser?.uid}`, {
        headers: {
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`
        }
      });

      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };
  
  const addToCart = async (product, tenure, price, quantity) => {
    try {
        
      const { data } = await axios.post(
        `${API_URL}/api/cart/add`, 
        {
          userId: auth.currentUser?.uid,
          productId: product.id,
          tenure,
          price,
          quantity
        },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`
          }
        }
      );
      
      // Check if the item is already in cart, update it instead of adding duplicate
      const existingItemIndex = cart.findIndex(item => 
        item.productId === product.id && item.tenure === tenure
      );
      
      if (existingItemIndex >= 0) {
        // Item exists, update the cart state
        const updatedCart = [...cart];
        updatedCart[existingItemIndex] = data.cartItem;
        setCart(updatedCart);
      } else {
        // Item is new, add to cart
        setCart([...cart, data.cartItem]);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Failed to add item to cart" 
      };
    }
  };
  
  const removeFromCart = async (id) => {
    
    try {
      await axios.delete(`${API_URL}/api/cart/remove/${id}`, {
        headers: {
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`
        }
      });
      setCart(cart.filter(item => item._id !== id));
      return { success: true };
    } catch (error) {
      console.error("Error removing from cart:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Failed to remove item from cart" 
      };
    }
  };
  
  const updateQuantity = async (id, quantity) => {
    try {
      await axios.put(
        `${API_URL}/api/cart/update/${id}`, 
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`
          }
        }
      );
      setCart(cart.map(item => item._id === id ? { ...item, quantity } : item));
      return { success: true };
    } catch (error) {
      console.error("Error updating quantity:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Failed to update quantity" 
      };
    }
  };
  
  const clearCart = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/cart/clear/${auth.currentUser?.uid}`,
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`
          }
        }
      );
      setCart([]);
      return { success: true };
    } catch (error) {
      console.error("Error clearing cart:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Failed to clear cart" 
      };
    }
  };
  
  const getTotalPrice = () => {
    
    if (!cart || cart.length === 0) return 0;
    
    return cart.reduce((total, item) => {
      
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };
  
  const getItemCount = () => {
    // Return 0 if still loading or if cart is empty/undefined
    if (loading || !cart || cart.length === 0) return 0;
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const prepareCheckoutData = () => {
    // Transform cart items to the format expected by the checkout page
    return {
      products: cart.map(item => ({
        id: item._id,
        productId: item.productId,
        name: item.name || "Product",
        images:item.images,  
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        tenure: item.tenure
      })),
      subtotal: getTotalPrice(),
      itemCount: getItemCount()
    };
  };
  
  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        loading,
        error,
        fetchCart,
        addToCart, 
        removeFromCart, 
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
        refreshCart: fetchCart,
        prepareCheckoutData
      }}
    >
      {children}
    </CartContext.Provider>
  );
};