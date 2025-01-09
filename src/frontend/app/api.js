import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api'  // Your backend URL
});

// Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Get refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                
                // Get new access token
                const response = await axios.post('http://localhost:8000/api/token/refresh/', {
                    refresh: refreshToken
                });

                // Save new access token
                const newAccessToken = response.data.access;
                localStorage.setItem('access_token', newAccessToken);

                // Update authorization header
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                
                // Retry original request
                return api(originalRequest);
            } catch (error) {
                // If refresh fails, logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // Redirect to login
                router.push('/auth/login');
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;