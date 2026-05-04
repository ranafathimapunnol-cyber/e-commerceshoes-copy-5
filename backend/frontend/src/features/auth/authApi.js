import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/token/'; // ✅ correct endpoint

export const login = async (userData) => {
  const response = await axios.post(API_URL, userData);

  return {
    access: response.data.access,
    refresh: response.data.refresh
  }
};