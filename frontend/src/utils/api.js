import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// 🔐 Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Handle auth errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ===================== AUTH =====================
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// ===================== PROFILE (FIXED) =====================
export const getProfile = () => API.get("/users/profile");
// CORRECT
export const updateProfile = (data) => API.put("/auth/profile", data);

// ===================== PRODUCTS =====================
export const getProducts = () => API.get("/products");
export const addProduct = (data) => API.post("/products", data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getLowStock = () => API.get("/products/low-stock");

// ===================== SALES =====================
export const getSales = () => API.get("/sales");
export const createSale = (data) => API.post("/sales", data);

// ===================== ANALYTICS =====================
export const getAnalytics = () => API.get("/analytics/summary");

// ===================== SUPPLIERS =====================
export const getSuppliers = () => API.get("/suppliers");
export const addSupplier = (data) => API.post("/suppliers", data);
export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// ===================== USERS (ADMIN) =====================
export const getUsers = () => API.get("/users");
export const addUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// ===================== AUDIT LOGS =====================
export const getAuditLogs = () => API.get("/audit");

// ===================== NOTIFICATIONS =====================
export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) =>
  API.put(`/notifications/${id}/read`);
export const markAllRead = () => API.put("/notifications/mark-all-read");

// ===================== WAREHOUSES =====================
export const getWarehouses = () => API.get("/warehouses");
export const addWarehouse = (data) => API.post("/warehouses", data);

// ===================== AI =====================
export const askAI = (message, context) =>
  API.post("/ai/query", { message, context });

export default API;
