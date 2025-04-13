import React, { useState, useEffect, useRef } from 'react';
import { TenureOptionsInput } from './TenureOptionsInput';

export const ProductForm = ({ 
  activeView, 
  currentProduct, 
  handleAddProduct, 
  handleUpdateProduct, 
  handleNavigation, 
  setCurrentProduct,
  error
}) => {
  // Define categories and locations arrays
  const categories = [
    'Electronics',
    'Living Room Furniture',
    'Bedroom Furniture',
    'Office Furniture',
    'Dining Room Furniture',
    'Outdoor Furniture',
    'Storage and Optimisations'
  ];

  const cities = [
    'Chennai',
    'Delhi',
    'Mumbai',
    'Bangalore',
    'Kolkata',
    'Hyderabad',
  ];

  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    basePrice: 0,
    category: categories[0],
    description: '',
    refundableDeposit: 0,
    brand: '',
    dimensions: '',
    color: '',
    locations: [cities[0]],
    images: [],
    existingImages: []
  });

  // Preview images state
  const [previewImages, setPreviewImages] = useState([]);
  
  // Tenure options state
  const [tenureOptions, setTenureOptions] = useState([
    { months: 3, price: 0 },
    { months: 6, price: 0 },
    { months: 12, price: 0 }
  ]);

  // Set form data when editing an existing product
  useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name || '',
        basePrice: currentProduct.basePrice || 0,
        category: currentProduct.category || categories[0],
        description: currentProduct.description || '',
        refundableDeposit: currentProduct.refundableDeposit || 0,
        brand: currentProduct.brand || '',
        dimensions: currentProduct.dimensions || '',
        color: currentProduct.color || '',
        locations: currentProduct.locations || [cities[0]],
        images: [],
        existingImages: currentProduct.images || []
      });
      
      // Set tenure options if available
      if (currentProduct.tenureOptions && currentProduct.tenureOptions.length > 0) {
        setTenureOptions(currentProduct.tenureOptions);
      }
      
      // Set preview images
      setPreviewImages(
        (currentProduct.images || []).map(url => ({
          preview: url,
          isExisting: true
        }))
      );
    } else {
      resetForm();
    }
  }, [currentProduct]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle multiple location selection
  const handleLocationChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData((prev) => ({
      ...prev,
      locations: selectedOptions,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Include tenure options in the form data
    const submissionData = {
      ...formData,
      tenureOptions: tenureOptions
    };
    
    if (activeView === 'addProduct') {
      handleAddProduct(submissionData);
    } else {
      handleUpdateProduct(submissionData);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) return;
    
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

  // Reset form to initial state
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
      category: categories[0],
      description: '',
      refundableDeposit: 0,
      brand: '',
      dimensions: '',
      color: '',
      locations: [cities[0]],
      images: [],
      existingImages: []
    });
    
    setTenureOptions([
      { months: 3, price: 0 },
      { months: 6, price: 0 },
      { months: 12, price: 0 }
    ]);
    
    setPreviewImages([]);
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
      <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
      
      <div className="mt-2 flex flex-wrap gap-4">
        {previewImages.map((img, index) => (
          <div key={index} className="relative">
            <img 
              src={img.preview} 
              alt={`Preview ${index}`} 
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border"
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
          className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center"
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
        Click to add images. You can select multiple files.
      </p>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {activeView === 'addProduct' ? 'Add New Product' : 'Edit Product'}
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price ($)
            </label>
            <input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Locations (multiple)
            </label>
            <select
              multiple
              name="locations"
              value={formData.locations || []}
              onChange={handleLocationChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              required
              size={4}
            >
              {cities.map((city) => (
                <option 
                  key={city} 
                  value={city} 
                  className="p-2 hover:bg-blue-50"
                >
                  {city}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple locations
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <TenureOptionsInput 
            tenureOptions={tenureOptions} 
            setTenureOptions={setTenureOptions} 
          />
        </div>
        
        <div className="mt-4 md:mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          ></textarea>
        </div>
        
        <RenderImageSection />
        
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <button 
            type="button" 
            onClick={() => {
              handleNavigation('products');
              setCurrentProduct(null);
              resetForm();
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-150 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-150 w-full sm:w-auto"
          >
            {activeView === 'addProduct' ? 'Add Product' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};