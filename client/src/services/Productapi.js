import axios from 'axios';
import { API_URL } from "../endpoint";

export const fetchProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
  
};

export const getProduct = async (prouctId) =>{
  const response = await axios.get(`${API_URL}/api/products/${prouctId}`);
  return response.data;
}

export const addProduct = async (product, token) => {
  const response = await axios.post(`${API_URL}/api/products`, product, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProduct = async (id, product, token) => {
  const response = await axios.put(`${API_URL}/api/products/${id}`, product, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteProduct = async (id, token) => {
  await axios.delete(`${API_URL}/api/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
