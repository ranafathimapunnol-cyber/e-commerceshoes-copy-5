import axios from 'axios';

const API_URL = '/api/token/'; // ✅ correct endpoint

export const login = async (userData) => {
  const response = await axios.post(API_URL, userData);

  return {
    access: response.data.access,
    refresh: response.data.refresh
  }
};