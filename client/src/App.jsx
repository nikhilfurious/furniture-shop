import React, { Suspense ,useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import LocationModal from './components/LocationModal';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Footer from './components/Footer';
import CartPage from './pages/Cart';
import Breadcrumb from './components/BreadCrumb';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import AdminPanel from './pages/AdminPanel';

import ProductList from './pages/Shop';

import ForgotPassword from './pages/ForgotPassword';
import { fetchProducts } from './services/Productapi';
import AdminRoute from './components/AdminRoute';
import PaymentPage from './pages/PaymentPage';
import AllCategory from './pages/AllCategory';
import SearchResultsPage from './pages/SearchResultsPage';
import FAQ from './components/Faq';
import TermsAndPrivacy from './pages/TermsAndPrivacy';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));


// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);




const App = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [products,setProducts] = useState([]);
  const [locationData,setLocationData] = useState(localStorage.getItem("location") || null);
  
  
    const handleLocationSelect = (location) => {
      if(location){
        localStorage.setItem("location", location);
        setLocationData(location); 

      }
      setShowLocationModal(false); // Hide modal after selection
    };

    const getProducts = async() =>{
      const response = await fetchProducts();
      setProducts(response);
      
    }

    useEffect(()=>{
      getProducts();
    }
    ,[]);



  return (
    <AuthProvider>

        <Router>
        <div className=" min-h-screen">
          <Navbar products={products} openModal={() => setShowLocationModal(true)} locationData={locationData}/>
          
          <LocationModal isOpen={showLocationModal} onLocationSelect={handleLocationSelect} onClose={() => setShowLocationModal(false)} />
          <main className="w-[92vw] mt-32 px-4 sm:px-6 flex flex-col justify-center mx-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/category/" element={<AllCategory />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/product/:productId" element={<ProductPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path='/faq' element={<FAQ/>}/>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<PaymentPage/>} />
                <Route path="/about" element={<AboutPage/>} />
                <Route path='/product' element={<ProductList/>} />
                <Route path="/contact" element={<ContactPage/>} />
                <Route path="/policy" element={<TermsAndPrivacy/>} />
                <Route path="/forgot-password" element={<ForgotPassword/>} />
                
                  <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                    } 
                  />
              
                

                <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                <Route path="*" element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Page not found</h2>
                    <p className="mt-2 text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
      
   
  );
};

export default App;