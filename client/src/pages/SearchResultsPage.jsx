// src/pages/SearchResultsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:5000/api';
  const Navigate = useNavigate()

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/products/search/${query}`, {
          params: { q: query }
        });
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query, API_URL]);

  const handleClick = (url) =>{
    Navigate(`/product/${url}`)
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Search Results for: "{query}"</h2>
      {loading ? (
        <p>Loading...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white p-4 rounded-lg shadow-md"  >
              <img 
                src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-500">{product.description}</p>
              <p className="font-bold text-indigo-600 mt-2">₹{product.basePrice}</p>
              <button 
                onClick={() => handleClick(product._id)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No products found matching your search.</p>
      )}
    </div>
  );
};

export default SearchResultsPage;
