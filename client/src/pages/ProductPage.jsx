import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, HelpCircle, Info, NotebookPen, ShieldCheck, ShoppingCart } from 'lucide-react';
import FAQ from '../components/Faq';
import { useCart } from '../Context/CartContext';
import { useNavigate, useParams } from 'react-router-dom';
import QuantitySelector from '../components/QuantitySelector';
import SpecialOffers from '../components/SpecialOffers';
import { fetchProducts, getProduct } from '../services/Productapi';
import { FaTape } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';

const ProductPage = () => {
  const { productId } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTenure, setSelectedTenure] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const { addToCart } = useCart();
  const Navigate = useNavigate();
  const user = getAuth().currentUser;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedProduct = await getProduct(productId);
        setProduct(fetchedProduct);
        
        // If tenureOptions exist and have at least one option, set the default selected tenure to the first one
        if (fetchedProduct.tenureOptions && fetchedProduct.tenureOptions.length > 0) {
          setSelectedTenure(0);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);


  if (!product || loading) {
    return <div className="text-center text-gray-500">Loading product...</div>;
  }

  if (!product.images) {
    return <div className="text-center text-gray-500">Product not found</div>;
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleSliderChange = (e) => {
    setSelectedTenure(Number(e.target.value));
  };


  const LoginPopup = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg max-w-md w-full border border-white border-opacity-20">
          <h2 className="text-xl font-bold mb-4">Login Required</h2>
          <p className="mb-6">Please login to add items to your cart.</p>
          <div className="flex justify-end space-x-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button 
              onClick={onLogin}
              className="px-4 py-2 bg-green-600 bg-opacity-90 text-white rounded hover:bg-green-700"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  };


  const handleAddToCart = () => {
    if (!user) {
      setIsLoginPopupOpen(true);
      return;
    }

    // Check if product has tenureOptions and if the selected tenure is valid
    if (product.tenureOptions && product.tenureOptions[selectedTenure]) {
      const selectedTenureOption = product.tenureOptions[selectedTenure];
      addToCart(
        product, 
        selectedTenureOption.months, 
        selectedTenureOption.price,
        quantity
      );
      alert("Added to cart!");
    } else {
      console.error("Selected tenure option is undefined");
      alert("Please select a valid tenure option");
    }
  };

  // Calculate total price based on quantity
  const getTotalPrice = () => {
    if (product.tenureOptions && product.tenureOptions[selectedTenure]) {
      return product.tenureOptions[selectedTenure].price * quantity;
    }
    return 'Price not available';
  };

  // Get the current selected tenure option
  const getCurrentTenure = () => {
    return product.tenureOptions && product.tenureOptions[selectedTenure] 
      ? product.tenureOptions[selectedTenure] 
      : { months: 0, price: 0 };
  };

  const handleLogin = () => {
    // Redirect to login page or open login modal
    setIsLoginPopupOpen(false);
    window.location.href = '/login';
  };

  return (
    <div className="w-[92vw] p-4">
      <LoginPopup 
          isOpen={isLoginPopupOpen} 
          onClose={() => setIsLoginPopupOpen(false)}
          onLogin={handleLogin}
      />
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left side - Image gallery */}
        <div className="md:w-[75%]">
          <div className="relative h-[600px] bg-gray-50 rounded-lg">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden
                  ${currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right side - Product details */}
        <div className="md:w-[25%] min-w-[300px] mb-16">
          <div className="space-y-6">
            {/* Product Title */}
            <h1 className="text-2xl font-medium text-gray-900">{product.name}</h1>
            <div className='bg-gray-50 p-4 rounded-lg border border-gray-100'>
              <h2 className='font-semibold mb-2'>Product Description:</h2>
              {product.description}
              <div className='m-2'></div>
              <h2 className='font-semibold mb-2'>Product Dimensions:</h2>
              {product.dimensions}
              </div>

            {/* Tenure Selector */}
            <div className="space-y-4 border-2 p-4 border-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <h3 className="font-medium">Choose Tenure (months)</h3>
                  <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                </div>
              </div>
              
              <div className="relative pt-6">
                <style>
                  {`
                    .custom-range {
                          -webkit-appearance: none;
                          width: 100%;
                          height: 6px;
                          background: #e5e7eb;
                          border-radius: 9999px;
                          outline: none;
                          padding: 0;
                          margin: 0;
                          transition: background 0.3s ease;
                        }

                        .custom-range::-webkit-slider-thumb {
                          -webkit-appearance: none;
                          appearance: none;
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: #22c55e;  /* Changed to green-600 */
                          cursor: pointer;
                          border: 3px solid white;
                          box-shadow: 0 0 0 1px #22c55e;  /* Changed to green-600 */
                          margin-top: -7px;
                          transition: all 0.3s ease;
                        }

                        .custom-range::-moz-range-thumb {
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: #22c55e;  /* Changed to green-600 */
                          cursor: pointer;
                          border: 3px solid white;
                          box-shadow: 0 0 0 1px #22c55e;  /* Changed to green-600 */
                          margin-top: -7px;
                          transition: all 0.3s ease;
                        }

                        .custom-range::-webkit-slider-runnable-track {
                          width: 100%;
                          height: 6px;
                          background: linear-gradient(to right, #22c55e 0%, #22c55e ${(selectedTenure / (product.tenureOptions?.length - 1 || 1)) * 100}%, #e5e7eb ${(selectedTenure / (product.tenureOptions?.length - 1 || 1)) * 100}%, #e5e7eb 100%);
                          border-radius: 9999px;
                          transition: background 0.3s ease;
                        }

                        .custom-range::-moz-range-track {
                          width: 100%;
                          height: 6px;
                          background: linear-gradient(to right, #22c55e 0%, #22c55e ${(selectedTenure / (product.tenureOptions?.length - 1 || 1)) * 100}%, #e5e7eb ${(selectedTenure / (product.tenureOptions?.length - 1 || 1)) * 100}%, #e5e7eb 100%);
                          border-radius: 9999px;
                          transition: background 0.3s ease;
                        }

                        /* Optional hover effect for better user experience */
                        .custom-range:hover::-webkit-slider-thumb {
                          background: #16a34a;  /* Green-700 for hover state */
                          box-shadow: 0 0 0 1px #16a34a;
                        }

                        .custom-range:hover::-moz-range-thumb {
                          background: #16a34a;  /* Green-700 for hover state */
                          box-shadow: 0 0 0 1px #16a34a;
                        }
                  `}
                </style>
                {product.tenureOptions && product.tenureOptions.length > 0 ? (
                  <>
                    <input
                      type="range"
                      min="0"
                      max={product.tenureOptions.length - 1}
                      value={selectedTenure}
                      step="1"
                      onChange={handleSliderChange}
                      className="custom-range"
                    />
                    <div className="flex justify-between mt-4">
                      {product.tenureOptions.map((option, index) => (
                        <div 
                          key={index} 
                          className={`flex flex-col items-center ${selectedTenure === index ? 'text-green-500 font-bold' : ''}`}
                          onClick={() => setSelectedTenure(index)}
                        >
                          <span className="text-sm font-medium">{option.months}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">No tenure options available</div>
                )}
              </div>
            </div>

            {/* Price and Benefits */}
            <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {product.tenureOptions && product.tenureOptions[selectedTenure] 
                        ? `₹${product.tenureOptions[selectedTenure].price}` 
                        : 'Price not available'}
                    </span>
                    <span className="text-base text-gray-400 line-through">
                      ₹{product.tenureOptions && product.tenureOptions[selectedTenure] 
                        ? Math.round(product.tenureOptions[0].price) 
                        : '1337'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Monthly Rent for {getCurrentTenure().months} months</p>
                </div>
              </div>
              
              {/* Added total price section */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-700">Total ({quantity} {quantity === 1 ? 'item' : 'items'})</p>
                  <p className="text-lg font-bold text-gray-900">₹{getTotalPrice()}</p>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <div className="flex mt-6 space-x-4">
              <div className='flex gap-4'>
                <QuantitySelector 
                  quantity={quantity} 
                  onIncrease={() => setQuantity(quantity + 1)} 
                  onDecrease={() => setQuantity(Math.max(1, quantity - 1))} 
                />
                <button
                  className="bg-primary px-6 py-3 rounded-lg hover:bg-primary-dark transition cursor-pointer border-2 border-gray-200"
                  onClick={handleAddToCart}
                >
                  Add to Cart 🛒
                </button>
                
              </div>
              
            </div>
            
            
          </div>
        </div>
      </div>

      {/* Styled Product Details Section */}
      
    </div>
  );
};

export default ProductPage;