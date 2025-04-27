import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Plus, Home, Package, User, LogOut, X } from 'lucide-react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import LocationSelector from '../../components/LocationSelector';
import CarouselAdmin from '../../components/CarouselAdmin';
  import { API_URL } from "../../endpoint";

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  // Define product categories
  const defaultCategories = [
    'Electronics',
    'Living Room Furniture',
    'Bedroom Furniture',
    'Office Furniture',
    'Dining Room Furniture',
    'Outdoor Furniture',
    'Storage and Organization',
  ];
  
  // State for custom categories
  const [customCategories, setCustomCategories] = useState([]);
  
  // Combined categories for dropdown
  const productCategories = [...defaultCategories, ...customCategories];

  const fileInputRef = useRef(null);
  const categoryInputRef = useRef(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    // Load custom categories from localStorage when component mounts
    const savedCategories = localStorage.getItem('customCategories');
    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories));
    }
    
    const checkAdminStatus = async () => {
      setTimeout(() => {
        setIsAdmin(true);
        setIsLoading(false);
      }, 1000);
    };
    
    checkAdminStatus();
  }, []);

  // Product form state
  const [formData, setFormData] = useState({
    name: '',
    basePrice: 0,
    category: '',
    description: '',
    refundableDeposit: 0,
    dimensions: '',
    images: [],
    locations: [],
    tenureOptions: [
      { months: '', price: 0 }
    ]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add a new category
  const handleAddCategory = () => {
    if (newCategory.trim() && !productCategories.includes(newCategory.trim())) {
      const updatedCategories = [...customCategories, newCategory.trim()];
      setCustomCategories(updatedCategories);
      
      // Save to localStorage
      localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
      
      // Set the new category as the selected category
      setFormData({
        ...formData,
        category: newCategory.trim()
      });
      
      // Reset input and hide it
      setNewCategory('');
      setShowCategoryInput(false);
    }
  };

  // Handle pressing Enter in category input
  const handleCategoryKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  // Show the category input field
  const toggleCategoryInput = () => {
    setShowCategoryInput(!showCategoryInput);
    // Focus the input when showing
    if (!showCategoryInput) {
      setTimeout(() => {
        if (categoryInputRef.current) {
          categoryInputRef.current.focus();
        }
      }, 100);
    }
  };

  // Location handlers
  const handleSelectLocation = (location) => {
    setFormData({
      ...formData,
      locations: [...formData.locations, location]
    });
  };

  const handleRemoveLocation = (locationId) => {
    setFormData({
      ...formData,
      locations: formData.locations.filter(loc => loc.id !== locationId)
    });
  };

  const handleTenureChange = (index, field, value) => {
    const updatedTenureOptions = [...formData.tenureOptions];
    updatedTenureOptions[index] = {
      ...updatedTenureOptions[index],
      [field]: field === 'price' ? Number(value) : value
    };
    
    setFormData({
      ...formData,
      tenureOptions: updatedTenureOptions
    });
  };

  const addTenureOption = () => {
    setFormData({
      ...formData,
      tenureOptions: [...formData.tenureOptions, { months: '', price: 0 }]
    });
  };

  const removeTenureOption = (index) => {
    const updatedTenureOptions = [...formData.tenureOptions];
    updatedTenureOptions.splice(index, 1);
    
    setFormData({
      ...formData,
      tenureOptions: updatedTenureOptions
    });
  };

  

  const uploadImageToCloudinary = async (file) => {
    if(!file) return null;  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "z1ae4o1x"); // Set your Cloudinary upload preset
    formData.append("cloud_name", "dtzzmimzt"); // Set your Cloudinary cloud name
  
    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dtzzmimzt/image/upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      return data.secure_url; // Cloudinary image URL
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };
  
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      // Create FormData object for sending files and other data
      const formDataToSend = new FormData();
      
      // Add text fields directly to FormData
      formDataToSend.append('name', formData.name);
      formDataToSend.append('basePrice', formData.basePrice);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('refundableDeposit', formData.refundableDeposit);
      formDataToSend.append('dimensions', formData.dimensions);
      
      
      // Add locations data
      formDataToSend.append('locations', JSON.stringify(formData.locations));
      
      // Add tenure options as JSON string
      formDataToSend.append('tenureOptions', JSON.stringify(formData.tenureOptions));
      
      // Add each image file with unique field names
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });
      
      // Send POST request with proper content-type for FormData
      const response = await axios.post(`${API_URL}/api/products`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
  
      // If successful, add new product to state
      if (response.data) {
        setProducts([...products, response.data]);
        setActiveView('products');
        resetForm();
        alert('Product added successfully!');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.response?.data?.message || error.message);
      alert(`Error adding product: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const formDataToSend = new FormData();
  
      // Add basic text fields
      const textFields = [
        'name',
        'description',
        'price',
        'category',
        'quantity',
        'refundableDeposit',
        'dimensions',
        
      ];
      textFields.forEach(field => {
        if (formData[field] !== undefined && formData[field] !== null) {
          formDataToSend.append(field, formData[field]);
        }
      });
  
      // Handle tenureOptions specifically to make sure it's in the correct format
      if (formData.tenureOptions) {
        formDataToSend.append('tenureOptions', JSON.stringify(formData.tenureOptions));
      }
  
      // Handle location separately as well
      if (formData.location) {
        let locationValue = formData.location;
        
        // Convert to array if it's a string
        if (typeof locationValue === 'string') {
          try {
            locationValue = JSON.parse(locationValue);
          } catch {
            locationValue = locationValue.split(',').map(l => l.trim()).filter(Boolean);
          }
        }
        
        // Ensure locationValue is an array
        if (!Array.isArray(locationValue)) {
          locationValue = [locationValue];
        }
        
        formDataToSend.append('location', JSON.stringify(locationValue));
      }
  
      // Track which existing images to keep
      if (formData.existingImages && Array.isArray(formData.existingImages)) {
        formDataToSend.append("existingImages", JSON.stringify(formData.existingImages));
      }
  
      // Add new image files
      if (formData.images && Array.isArray(formData.images)) {
        formData.images.forEach((image) => {
          if (image instanceof File) {
            formDataToSend.append("images", image);
          }
        });
      }
  
      // Log what we're sending to help with debugging
      console.log("FormData being sent:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }
  
      // Make the API request
      const response = await axios.put(
        `${API_URL}/api/products/${currentProduct}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${await user.getIdToken()}`
          }
        }
      );
  
      if (response.data && response.data.product) {
        // Update local products state
        const updatedProducts = products.map((product) =>
          product._id === currentProduct ? response.data.product : product
        );
  
        setProducts(updatedProducts);
        setCurrentProduct(null);
        setActiveView("products");
        resetForm();
  
        if (typeof toast !== "undefined") {
          toast.success("Product updated successfully!");
        } else {
          alert("Product updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error updating product:", error);
      
      // Log more details about the error
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
  
      const errorMsg =
        error.response?.data?.message || error.message || "An unknown error occurred";
  
      setError(errorMsg);
  
      if (typeof toast !== "undefined") {
        toast.error(`Error: ${errorMsg}`);
      } else {
        alert(`Error updating product: ${errorMsg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  // Edit Product function - fetch the latest data from backend
  const handleEdit = async (id) => {
    try {
      setIsLoading(true);
      // Get the latest product data from the server
      const response = await axios.get(`${API_URL}/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
      
      if (response.data) {
        const productData = response.data;
        
        // Store existing image URLs separately
        setFormData({
          ...productData,
          existingImages: productData.images || [], // Store existing image URLs
          images: [], // Reset images array for new file uploads
          locations: productData.locations || [] // Ensure locations are included
        });
        
        // Set preview images from existing URLs
        setPreviewImages(
          (productData.images || []).map(url => ({
            preview: url,
            isExisting: true
          }))
        );
        
        setCurrentProduct(id);
        setActiveView('editProduct');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError(error.response?.data?.message || error.message);
      alert(`Error fetching product details: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete Product function with API request
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setIsLoading(true);
        // Send DELETE request
        await axios.delete(`${API_URL}/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${await user.getIdToken()}`
          }
        });
        
        // If successful, remove product from state
        setProducts(products.filter(product => product.id !== id));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        setError(error.response?.data?.message || error.message);
        alert(`Error deleting product: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Function to fetch all products - call this in useEffect
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = await user?.getIdToken();
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });
      
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle image selection
  const handleImageSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) return;
    
    console.log("Selected files:", selectedFiles);
    
    // Create preview URLs for the selected images
    const newPreviewImages = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    // Update state with new files and previews
    setFormData(prevFormData => ({
      ...prevFormData,
      images: [...prevFormData.images, ...selectedFiles]
    }));
    
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    
    // Reset the file input to allow selecting the same file again
    e.target.value = '';
  };
  
  // Remove a selected image
  const handleRemoveImage = (index) => {
    const imageToRemove = previewImages[index];
    
    // If it's a new image (not an existing one from the server)
    if (!imageToRemove.isExisting) {
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(imageToRemove.preview);
      
      // Remove the image from formData.images
      const updatedImages = [...formData.images];
      updatedImages.splice(index - (formData.existingImages?.length || 0), 1);
      
      setFormData(prev => ({ ...prev, images: updatedImages }));
    } else {
      // For existing images, remove from existingImages array
      const updatedExistingImages = [...formData.existingImages];
      updatedExistingImages.splice(index, 1);
      
      setFormData(prev => ({ ...prev, existingImages: updatedExistingImages }));
    }
    
    // Remove from preview array
    const updatedPreviews = [...previewImages];
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
  };  

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewImages.forEach(preview => {
        if (preview.preview && !preview.isExisting) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, []);

  const RenderImageSection = () => (
    <div className="mb-4">
      <label className="block font-medium mb-1">Product Images</label>
      
      <div className="mt-2 flex flex-wrap gap-4">
        {previewImages.map((img, index) => (
          <div key={index} className="relative">
            <img 
              src={img.preview} 
              alt={`Preview ${index}`} 
              className="w-24 h-24 object-cover rounded border"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={handleImageButtonClick}
          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center"
        >
          <span className="text-gray-500">+</span>
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          multiple
          accept="image/*"
          className="hidden"
        />
      </div>
      
      <p className="text-sm text-gray-500 mt-1">
        Click to add images. You can select multiple files.Only (jpg, png, jpeg) formats are allowed.
      </p>
    </div>
  );

  const resetForm = () => {
    // Clean up object URLs
    previewImages.forEach(preview => {
      if (preview.preview && !preview.isExisting) {
        URL.revokeObjectURL(preview.preview);
      }
    });
    
    setFormData({
      name: '',
      basePrice: 0,
      category: '',
      description: '',
      refundableDeposit: 0,
      dimensions: '',
      images: [],
      existingImages: [],
      locations: [],
      tenureOptions: [
        { months: '', price: 0 }
      ]
    });
    
    setPreviewImages([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 bg-blue-600">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center px-6 py-3 w-full text-left ${activeView === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
          >
            <Home size={18} className="mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView('products')}
            className={`flex items-center px-6 py-3 w-full text-left ${activeView === 'products' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
          >
            <Package size={18} className="mr-3" />
            Products
          </button>
          <button 
            onClick={() => setActiveView('addProduct')}
            className={`flex items-center px-6 py-3 w-full text-left ${activeView === 'addProduct' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
          >
            <Plus size={18} className="mr-3" />
            Add Product
          </button>
          <button 
            onClick={() => setActiveView('Carousel')}
            className={`flex items-center px-6 py-3 w-full text-left ${activeView === 'Carousel' ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
          >
            <Plus size={18} className="mr-3" />
            Add Carousel Items
          </button>
          <div className="mt-auto pt-6 border-t border-gray-200 pb-4">
            <button className="flex items-center px-6 py-3 w-full text-left text-gray-700">
              <User size={18} className="mr-3" />
              Profile
            </button>
            <button className="flex items-center px-6 py-3 w-full text-left text-gray-700">
              <LogOut size={18} className="mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>

     
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
      {activeView === 'Carousel' && <CarouselAdmin />}

        {activeView === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-700">Total Products</h3>
                <p className="text-3xl font-bold mt-2">{products.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-700">Categories</h3>
                <p className="text-3xl font-bold mt-2">
                  {new Set(products.map(p => p.category)).size}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-700">Recent Activity</h3>
                <p className="text-gray-600 mt-2">Last login: February 25, 2025</p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Products ({products.length})</h1>
              <button 
                onClick={() => setActiveView('addProduct')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add New Product
              </button>
            </div>
            
            <div className="bg-white shadow-md rounded-md overflow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-md" 
                              src={product.images?.[0] || "/api/placeholder/100/100"} 
                              alt={product.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.basePrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Array.isArray(product.location) 
                          ? product.location.join(', ')
                          : product.location || 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(product.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(activeView === 'addProduct' || activeView === 'editProduct') && (
          <div>
            <h1 className="text-2xl font-bold mb-6">
              {activeView === 'addProduct' ? 'Add New Product' : 'Edit Product'}
            </h1>
            
            <form onSubmit={activeView === 'addProduct' ? handleAddProduct : handleUpdateProduct} className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {error && (
                  <div className="md:col-span-2 mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="flex">
                    <div className="flex-grow relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-l-md"
                        required
                      >
                        <option value="" disabled>Select a category</option>
                        {productCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={toggleCategoryInput}
                      className="bg-gray-200 text-gray-700 px-3 rounded-r-md flex items-center justify-center"
                    >
                      {showCategoryInput ? <X size={16} /> : <Plus size={16} />}
                    </button>
                  </div>
                  
                  {/* New Category Input - Only appears when 'Add New' button is clicked */}
                  {showCategoryInput && (
                    <div className="mt-2 flex">
                      <input
                        type="text"
                        ref={categoryInputRef}
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={handleCategoryKeyPress}
                        placeholder="Enter new category"
                        className="w-full p-2 border border-gray-300 rounded-l-md"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="bg-blue-600 text-white px-3 rounded-r-md"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refundable Deposit ($)
                  </label>
                  <input
                    type="number"
                    name="refundableDeposit"
                    value={formData.refundableDeposit}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                

                {/* Location Selector - Full width in mobile, half width in desktop */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Locations
                  </label>
                  <LocationSelector
                    selectedLocations={formData.locations}
                    onSelectLocation={handleSelectLocation}
                    onRemoveLocation={handleRemoveLocation}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Select locations where this product is available
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                ></textarea>
              </div>
              
              <RenderImageSection/>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tenure Options
                  </label>
                  <button 
                    type="button" 
                    onClick={addTenureOption}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Option
                  </button>
                </div>
              
                
                {formData.tenureOptions.map((option, index) => (
                  <div key={index} className="flex items-center mb-3 gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Months
                      </label>
                      <input
                        type="text"
                        value={option.months}
                        onChange={(e) => handleTenureChange(index, 'months', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={option.price === 0 ? '' : option.price}
                        onChange={(e) => handleTenureChange(index, 'price', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    {formData.tenureOptions.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeTenureOption(index)}
                        className="mt-5 text-red-600 hover:text-red-900 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  type="button" 
                  onClick={() => {
                    setActiveView('products');
                    setCurrentProduct(null);
                    resetForm();
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-4"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  {activeView === 'addProduct' ? 'Add Product' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
