import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/products/";

// helper for auth
const getAuthHeader = () => {
  const token = localStorage.getItem("access");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ==========================
// CATEGORY
// ==========================

export const fetchCategories = async () => {
  const res = await axios.get(`${BASE_URL}categories/`);
  return res.data;
};

// ==========================
// SUBCATEGORY
// ==========================

export const fetchSubCategories = async (categoryId) => {
  const res = await axios.get(`${BASE_URL}subcategories/${categoryId}/`);
  return res.data;
};

// ==========================
// PRODUCTS
// ==========================

// 🔥 THIS replaces your old fetchProducts
export const fetchProducts = async (subCategoryId) => {
  const res = await axios.get(
    `${BASE_URL}?sub_category=${subCategoryId}`
  );
  return res.data;
};

// single product
export const fetchProduct = async (id) => {
  const res = await axios.get(`${BASE_URL}${id}/`);
  return res.data;
};

// ==========================
// CART
// ==========================

export const addToCart = async (productId) => {
  const res = await axios.post(
    `${BASE_URL}cart/add/`,
    { product: productId },
    getAuthHeader()
  );
  return res.data;
};

export const getCart = async () => {
  const res = await axios.get(
    `${BASE_URL}cart/`,
    getAuthHeader()
  );
  return res.data;
};

export const removeFromCart = async (id) => {
  const res = await axios.delete(
    `${BASE_URL}cart/remove/${id}/`,
    getAuthHeader()
  );
  return res.data;
};