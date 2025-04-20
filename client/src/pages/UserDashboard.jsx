import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';
  import { API_URL } from "../endpoint";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/orders/${user.uid}`);
        setOrders(response.data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.uid]);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h2 className="text-3xl font-bold">Welcome, {user.displayName}!</h2>
      <img src={user.photoURL} alt={user.displayName} className="w-20 h-20 rounded-full mt-3" />
      <p className="text-gray-600 mt-2">Email: {user.email}</p>

      <button
        onClick={logout}
        className="mt-5 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>

      <h3 className="text-2xl font-semibold mt-8">Your Orders</h3>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="w-full mt-4 border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Invoice Number</th>
              <th className="p-2">Date</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.invoiceNumber} className="border-t">
                <td className="p-2">{order.invoiceNumber}</td>
                <td className="p-2">{new Date(order.orderDate).toLocaleDateString()}</td>
                
                <td className="p-2">${order.totalAmount.toFixed(2)}</td>
                <td className="p-2">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserDashboard;