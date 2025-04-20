import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api/tv', // Replace with your API base URL
    timeout: 10000, // Request timeout in milliseconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // You can add authorization tokens or other custom logic here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;