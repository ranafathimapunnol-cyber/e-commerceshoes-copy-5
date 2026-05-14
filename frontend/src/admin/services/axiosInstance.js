import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/",
});

// ✅ REQUEST INTERCEPTOR (attach token)
axiosInstance.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("admin_access");
    const userToken = localStorage.getItem("access");

    const token = adminToken || userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR (handle 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("❌ Unauthorized - redirecting to login");

      localStorage.removeItem("admin_access");
      localStorage.removeItem("access");

      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;