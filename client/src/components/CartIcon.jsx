// components/CartIcon.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { API_URL } from '../endpoint';

export default function CartIcon() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let intervalId;
    const auth = getAuth();

    const fetchCartCount = async () => {
      const user = auth.currentUser;
      if (!user) {
        setCount(0);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${API_URL}/api/cart/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCount(res.data.length);
      } catch (err) {
        console.error('Cart poll error:', err);
      }
    };

    // initial fetch + poll every 2s
    fetchCartCount();
    intervalId = setInterval(fetchCartCount, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Link to="/cart" className="relative text-gray-600 hover:text-green-600 transition-colors">
      <ShoppingCart className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5 flex items-center justify-center min-w-[1.25rem] h-5">
          {count}
        </span>
      )}
    </Link>
  );
}
