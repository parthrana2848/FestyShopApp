import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/api';

type UnauthorizedHandler = () => void;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let unauthorizedHandler: UnauthorizedHandler | null = null;

// Retry configuration for rate limiting
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Base delay in ms

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandler = handler;
};

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }

    // Handle 429 Too Many Requests with exponential backoff
    if (error.response?.status === 429 && config) {
      const retryCount = (config as any).__retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        (config as any).__retryCount = retryCount + 1;
        
        // Exponential backoff: delay = baseDelay * 2^retryCount
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        
        console.log(`Rate limited. Retrying after ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        await new Promise(resolve => setTimeout(() => resolve(undefined), delay));
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
