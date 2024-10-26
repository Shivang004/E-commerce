import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const getProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};

export const addProduct = async (product) => {
  const response = await axios.post(`${API_BASE_URL}/products`, product);
  return response.data;
};

export const updateProduct = async (id, product, token) => {
  const response = await axios.put(`${API_BASE_URL}/products/${id}`, product, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteProduct = async (id, token) => {
  const response = await axios.delete(`${API_BASE_URL}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  return response.data;
};
