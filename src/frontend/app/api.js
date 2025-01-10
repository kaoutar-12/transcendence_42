// import axios from 'axios';

// const api = axios.create({
//     baseURL: 'http://localhost:8000/api'
// });

// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('access_token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;

//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;

//             try {
//                 const refreshToken = localStorage.getItem('refresh_token');
                
//                 const response = await axios.post('http://localhost:8000/api/token/refresh/', {
//                     refresh: refreshToken
//                 });

//                 const newAccessToken = response.data.access;
//                 localStorage.setItem('access_token', newAccessToken);
//                 originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                
//                 return api(originalRequest);
//             } catch (error) {
//                 localStorage.removeItem('access_token');
//                 localStorage.removeItem('refresh_token');
//                 router.push('/auth/login');
//                 return Promise.reject(error);
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// export default api;
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api'
});

// Single flag to track refresh state
let isRefreshing = false;
// Store pending requests
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors that haven't been retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            isRefreshing = true;
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post('http://localhost:8000/api/token/refresh/', {
                    refresh: refreshToken
                });

                const newAccessToken = response.data.access;
                localStorage.setItem('access_token', newAccessToken);
                
                // Process all queued requests with new token
                processQueue(null, newAccessToken);
                isRefreshing = false;

                // Update and retry original request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (err) {
                // Clear queue with error
                processQueue(err, null);
                isRefreshing = false;
                
                // Clear tokens and redirect
                localStorage.clear();
                window.location.href = '/auth/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;