// components/LocationAdmin.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Loader, Plus } from 'lucide-react';
import { API_URL } from '../endpoint';

const LocationAdmin = () => {
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCities = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cities`);
      setCities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addCity = async () => {
    if (!newCity.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/cities`, { name: newCity.trim() });
      setNewCity('');
      fetchCities();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add city');
    } finally {
      setLoading(false);
    }
  };

  const deleteCity = async (id) => {
    if (!window.confirm('Delete this city?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/cities/${id}`);
      fetchCities();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);


  {loading && <Loader className="animate-spin w-5 h-5" />}

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Manage Cities</h2>
      <div className="flex gap-3 mb-6">
        <input
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="Enter new city"
          className="flex-1 px-4 py-2 border rounded-md"
        />
        <button
          onClick={addCity}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
        >
          {loading ? <Loader className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5 mr-1" />}
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {cities.map((city) => (
          <li key={city._id} className="flex justify-between items-center border-b pb-2">
            <span>{city.name}</span>
            <button
              onClick={() => deleteCity(city._id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LocationAdmin;
