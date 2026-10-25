import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true, // Send HTTP-Only cookies with every request
});

// Attach JWT token from localStorage as fallback header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hcm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect if 401 and NOT checking /auth/me or already on public pages
    const isAuthEndpoint = err.config?.url?.includes('/auth/me') || err.config?.url?.includes('/auth/login');
    const isPublicPage = window.location.pathname.includes('/login') || 
                         window.location.pathname.includes('/signup') || 
                         window.location.pathname.includes('/setup') || 
                         window.location.pathname.includes('/forgot-password');

    if (err.response?.status === 401 && !isAuthEndpoint && !isPublicPage) {
      localStorage.removeItem("hcm_token");
      localStorage.removeItem("hcm_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
