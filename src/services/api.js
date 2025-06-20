import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "https://disaster-1.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (userId) {
      config.headers["x-user-id"] = userId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/login";
      toast.error("Session expired. Please login again.");
    } else if (response?.status === 403) {
      toast.error("Access denied. Insufficient permissions.");
    } else if (response?.status === 404) {
      toast.error("Resource not found.");
    } else if (response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please check your connection.");
    } else if (!response) {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const disasterAPI = {
  getAll: (params = {}) => api.get("/disasters", { params }),
  getById: (id) => api.get(`/disasters/${id}`),
  create: (data) => api.post("/disasters", data),
  update: (id, data) => api.put(`/disasters/${id}`, data),
  delete: (id) => api.delete(`/disasters/${id}`),
};

export const reportAPI = {
  getByDisaster: (disasterId, params = {}) =>
    api.get(`/reports/disaster/${disasterId}`, { params }),
  getOfficialUpdates: (disasterId) =>
    api.get(`/reports/disaster/${disasterId}/official-updates`),
  create: (data) => api.post("/reports", data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const resourceAPI = {
  getByDisaster: (disasterId, params = {}) =>
    api.get(`/resources/disaster/${disasterId}`, { params }),
  getNearby: (params = {}) => api.get("/resources/nearby", { params }),
  create: (data) => api.post("/resources", data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

export const socialMediaAPI = {
  getByDisaster: (disasterId, params = {}) =>
    api.get(`/social-media/disaster/${disasterId}`, { params }),
  search: (params = {}) => api.get("/social-media/search", { params }),
  getMock: () => api.get("/mock-social-media"),
};

export const geocodingAPI = {
  geocode: (data) => api.post("/geocoding", data),
};

export const verificationAPI = {
  verifyImage: (disasterId, data) =>
    api.post(`/verification/disaster/${disasterId}/image`, data),
  batchVerify: (data) => api.post("/verification/batch", data),
};

export const healthAPI = {
  check: () => api.get("/health"),
};

export default api;
