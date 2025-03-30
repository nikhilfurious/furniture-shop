import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, HelpCircle, Info, NotebookPen, ShieldCheck, ShoppingCart } from 'lucide-react';
import FAQ from '../components/Faq';
import { useCart } from '../Context/CartContext';
import { useNavigate, useParams } from 'react-router-dom';
import QuantitySelector from '../components/QuantitySelector';
import SpecialOffers from '../components/SpecialOffers';
import { fetchProducts, getProduct } from '../services/Productapi';
import { FaTape } from 'react-icons/fa';

const ProductPage = () => {
  const { productId } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTenure, setSelectedTenure] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const Navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await getProduct(productId);
        setProduct(fetchedProducts);
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

  const handleAddToCart = () => {
    // Make sure tenureOptions exists and selectedTenure is valid
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

  return (
    <div className="w-[92vw] p-4">
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
        <div className="md:w-[25%] min-w-[300px]">
          <div className="space-y-6">
            {/* Product Title */}
            <h1 className="text-2xl font-medium text-gray-900">{product.name}</h1>

            {/* Tenure Selector */}
            <div className="space-y-4 border-2 p-4 border-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <h3 className="font-medium">Choose Tenure</h3>
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
                    }

                    .custom-range::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #ef4444;
                      cursor: pointer;
                      border: 3px solid white;
                      box-shadow: 0 0 0 1px #ef4444;
                      margin-top: -7px;
                    }

                    .custom-range::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #ef4444;
                      cursor: pointer;
                      border: 3px solid white;
                      box-shadow: 0 0 0 1px #ef4444;
                      margin-top: -7px;
                    }

                    .custom-range::-webkit-slider-runnable-track {
                      width: 100%;
                      height: 6px;
                      background: linear-gradient(to right, #ef4444 0%, #ef4444 ${product.tenureOptions ? (selectedTenure / (product.tenureOptions.length - 1)) * 100 : 0}%, #e5e7eb ${product.tenureOptions ? (selectedTenure / (product.tenureOptions.length - 1)) * 100 : 0}%, #e5e7eb 100%);
                      border-radius: 9999px;
                    }

                    .custom-range::-moz-range-track {
                      width: 100%;
                      height: 6px;
                      background: linear-gradient(to right, #ef4444 0%, #ef4444 ${product.tenureOptions ? (selectedTenure / (product.tenureOptions.length - 1)) * 100 : 0}%, #e5e7eb ${product.tenureOptions ? (selectedTenure / (product.tenureOptions.length - 1)) * 100 : 0}%, #e5e7eb 100%);
                      border-radius: 9999px;
                    }
                  `}
                </style>
                {product.tenureOptions && product.tenureOptions.length > 0 && (
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
                        <div key={index} className="flex flex-col items-center">
                          <span className="text-sm font-medium text-gray-600">{option.months}</span>
                        </div>
                      ))}
                    </div>
                  </>
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
                    <span className="text-base text-gray-400 line-through">₹1337</span>
                  </div>
                  <p className="text-sm text-gray-500">Monthly Rent</p>
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
      <div className="mt-12 w-full">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
            <p className="text-gray-500 text-sm mt-1">Everything you need to know about this product</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {/* Features & Specs */}
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center gap-2">
                <NotebookPen className="text-primary" size={20} />
                Features & Specs
              </h3>
              <ul className="space-y-3">
                <li className="pb-2 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand</span>
                    <span className="font-medium">{product.brand || 'Not specified'}</span>
                  </div>
                </li>
                <li className="pb-2 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color</span>
                    <span className="font-medium">{product.color || 'Not specified'}</span>
                  </div>
                </li>
                <li className="pb-2 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material</span>
                    <span className="font-medium">{product.material || 'Premium Quality'}</span>
                  </div>
                </li>
                <li className="pb-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warranty</span>
                    <span className="font-medium">{product.warranty || '12 months'}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Dimensions Section */}
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center gap-2">
                <FaTape className="text-primary" size={20} />
                Dimensions
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  {product.dimensions || 
                    'Height: 80cm, Width: 120cm, Depth: 60cm. Please allow for minor variations as all measurements are approximate.'}
                </p>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Packed Dimensions</h4>
                <p className="text-gray-600">
                  Our products are carefully packed to ensure safe delivery. Package dimensions may vary slightly from actual product dimensions.
                </p>
              </div>
            </div>

            {/* Safety & Usage */}
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
              <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                Safety & Usage
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Safe Usage</h4>
                  <p className="text-gray-600 text-sm">
                    Always follow the manufacturer's guidelines for proper usage and maintenance. Keep away from children without supervision.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Maintenance</h4>
                  <p className="text-gray-600 text-sm">
                    Regular cleaning with a soft, dry cloth is recommended. Avoid using harsh chemicals that may damage the finish.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Care Instructions</h4>
                  <p className="text-gray-600 text-sm">
                    {product.care || 'For detailed care instructions, please refer to the user manual included with the product.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;