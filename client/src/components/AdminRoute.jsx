import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase auth
import AdminPanel from "../pages/AdminPanel";

const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = 'https://furniture-shop-dvh6.vercel.app';
  const auth = getAuth(); // Initialize Firebase auth

  useEffect(() => {
    const fetchUserRole = async (firebaseUser) => {
      if (!firebaseUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Get the ID token to send to backend
        const token = await firebaseUser.getIdToken();
       
        
        // Send request with token in Authorization header
        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setIsAdmin(res.data.isAdmin);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      fetchUserRole(firebaseUser);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  return isAdmin ? <AdminPanel/> : <Navigate to="/login" />;
};

export default AdminRoute;