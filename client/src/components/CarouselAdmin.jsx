
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, Image, Loader, Edit } from 'lucide-react';
import axios from 'axios';
import { API_URL } from "../endpoint";

const CarouselAdmin = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCarouselItems();
  }, []);

  const fetchCarouselItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/carousel`);
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setCarouselItems(items);
    } catch {
      setCarouselItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiFormData = new FormData();
      if (imageFile) apiFormData.append('image', imageFile);

      if (editingItem !== null) {
        await axios.put(
          `${API_URL}/api/carousel/${carouselItems[editingItem]._id}`,
          apiFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        await axios.post(
          `${API_URL}/api/carousel`,
          apiFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      await fetchCarouselItems();
      resetForm();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
  };

  const handleEdit = (index) => {
    const item = carouselItems[index];
    setImageFile(null);
    setImagePreview(item.image);
    setEditingItem(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Are you sure you want to delete this carousel item?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/api/carousel/${carouselItems[index]._id}`);
      await fetchCarouselItems();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Carousel Management</h1>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {editingItem !== null ? 'Edit Carousel Image' : 'Add Carousel Image'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Image Upload Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carousel Image
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full h-full absolute opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto w-full max-w-md h-auto object-cover rounded-lg"
                    />
                  ) : (
                    <div className="py-8 flex flex-col items-center">
                      <Image className="w-16 h-16 text-gray-400 mb-3" />
                      <p className="text-base text-gray-600 font-medium">
                        Drop an image or click to upload
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG or GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !imageFile && editingItem === null}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isLoading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                {editingItem !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Current Carousel Images</h2>
            <span className="px-3 py-1 text-xs font-medium bg-blue-900 text-white rounded-full">
              {carouselItems.length} items
            </span>
          </div>
          {isLoading && carouselItems.length === 0 ? (
            <div className="p-10 text-center">
              <Loader className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading carousel items...</p>
            </div>
          ) : carouselItems.length === 0 ? (
            <div className="p-10 text-center">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No carousel images found</p>
              <p className="text-gray-400 text-sm">Upload your first image above!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {carouselItems.map((item, index) => (
                <li key={item._id} className="hover:bg-blue-50 transition-colors">
                  <div className="flex items-center p-4 gap-4">
                    <div className="w-32 h-24 overflow-hidden rounded-lg shadow-md">
                      <img
                        src={item.image}
                        alt="Carousel"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="px-3 py-2 bg-white border rounded text-gray-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="px-3 py-2 bg-white border rounded text-gray-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
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

