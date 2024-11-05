// axiosClient.ts
import axios from 'axios';

// Create an Axios instance with default configurations
const axiosClient = axios.create({
  baseURL: 'http://localhost:3000', // Base URL for your server
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Optional timeout for requests
});

// Add an interceptor to handle errors globally
axiosClient.interceptors.response.use(
  response => response, // Pass successful responses through unchanged
  error => {
    if (error.response) {
      // Handle server errors (non-2xx responses)
      console.error('Server responded with an error:', error.response.data);
      return Promise.reject(new Error(`Server error: ${error.response.status}`));
    } else if (error.request) {
      // Handle cases where the request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject(new Error('No response received from server'));
    } else {
      // Handle any other errors
      console.error('Error setting up request:', error.message);
      return Promise.reject(new Error('Error setting up request'));
    }
  }
);

export default axiosClient;
