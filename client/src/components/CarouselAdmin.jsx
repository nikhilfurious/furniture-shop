import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, Image, Edit, Loader } from 'lucide-react';
import axios from 'axios';

const CarouselAdmin = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: null,
    imagePreview: null
  });

  const API_URL = 'https://furniture-shop-dvh6.vercel.app';

  // Fetch existing carousel items on component mount
  useEffect(() => {
    fetchCarouselItems();
  }, []);

  const fetchCarouselItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/carousel`);
      
      // Make sure we're setting an array to carouselItems state
      const items = Array.isArray(response.data) ? response.data : 
                   (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      
      setCarouselItems(items);
    } catch (error) {
      console.error('Error fetching carousel items:', error);
      // Initialize with empty array on error
      setCarouselItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      image: file,
      imagePreview: previewUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create form data for the API request
      const apiFormData = new FormData();
      apiFormData.append('title', formData.title);
      apiFormData.append('subtitle', formData.subtitle);
      
      if (formData.image) {
        apiFormData.append('image', formData.image);
      }

      let response;
      
      // If editing an existing item, update it, otherwise create a new one
      if (editingItem !== null) {
        response = await axios.put(
          `${API_URL}/api/carousel/${carouselItems[editingItem]._id}`,
          apiFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/carousel`,
          apiFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // Refresh the list of carousel items
      await fetchCarouselItems();
      
      // Reset the form
      resetForm();
    } catch (error) {
      console.error('Error saving carousel item:', error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image: null,
      imagePreview: null
    });
    setEditingItem(null);
  };

  const handleEdit = (index) => {
    const item = carouselItems[index];
    setFormData({
      title: item.title,
      subtitle: item.subtitle,
      image: null,
      imagePreview: item.image
    });
    setEditingItem(index);
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Are you sure you want to delete this carousel item?')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/api/carousel/${carouselItems[index]._id}`);
      await fetchCarouselItems();
    } catch (error) {
      console.error('Error deleting carousel item:', error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Carousel Management
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Add, edit, and manage your carousel content
          </p>
        </div>
        
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10 transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {editingItem !== null ? 'Edit Carousel Item' : 'Add New Carousel Item'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="mt-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formData.imagePreview ? (
                      <div className="relative aspect-video w-full">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                          <p className="text-white font-medium px-4 py-2 bg-blue-600 bg-opacity-70 rounded-md">
                            Change Image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center">
                        <Image className="w-16 h-16 text-gray-400 mb-3" />
                        <p className="text-base text-gray-600 font-medium">Drop an image or click to upload</p>
                        <p className="text-sm text-gray-500 mt-1">
                          JPG, PNG or GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter carousel title"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter carousel subtitle"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-grow sm:flex-grow-0 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Saving...' : 'Save Item'}
                </button>
                
                {editingItem !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-grow sm:flex-grow-0 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Items List Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Current Carousel Items</h2>
            <span className="px-3 py-1 text-xs font-medium bg-blue-900 text-white rounded-full">
              {carouselItems.length} items
            </span>
          </div>
          
          {isLoading && !carouselItems.length ? (
            <div className="p-10 text-center">
              <Loader className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading carousel items...</p>
            </div>
          ) : carouselItems.length === 0 ? (
            <div className="p-10 text-center">
              <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No carousel items found</p>
              <p className="text-gray-400 text-sm mt-2">Create your first banner above!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {Array.isArray(carouselItems) && carouselItems.map((item, index) => (
                <li key={index} className="hover:bg-blue-50 transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
                    <div className="flex-shrink-0 w-full sm:w-32 h-24 rounded-lg overflow-hidden shadow-md">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.subtitle}</p>
                    </div>
                    <div className="flex gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleEdit(index)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselAdmin;