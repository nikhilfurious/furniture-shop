import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

export const fetchProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
  
};

export const getProduct = async (prouctId) =>{
  const response = await axios.get(`${API_URL}/${prouctId}`);
  return response.data;
}

export const addProduct = async (product, token) => {
  const response = await axios.post(API_URL, product, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProduct = async (id, product, token) => {
  const response = await axios.put(`${API_URL}/${id}`, product, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteProduct = async (id, token) => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
