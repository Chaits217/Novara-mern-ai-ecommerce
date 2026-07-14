import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Attach bearer token as a fallback for environments where cross-site
// cookies are restricted (the API also sets an httpOnly cookie).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("novara_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
