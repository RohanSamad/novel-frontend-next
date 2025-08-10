import axios from "axios";

const API_BASE_URL = "https://api.noveltavern.com";

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This ensures cookies are sent with every request
});

// Track if CSRF cookie is fetched already
let csrfFetched = false;

// Interceptor to fetch CSRF cookie if not fetched yet
api.interceptors.request.use(async (config) => {
  if (!csrfFetched) {
    await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    csrfFetched = true;
  }
  return config;
});

export default api;
