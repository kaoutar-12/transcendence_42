import axios from 'axios';
import Router from 'next/router';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
    withCredentials: true
});

// Single flag to track refresh state
let isRefreshing = false;
// Store pending requests
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];


const processQueue = (error: any, token = null) => {
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
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.credentials = 'include';
                    return api(originalRequest);
                });
            }

            isRefreshing = true;
            originalRequest._retry = true;
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {},{withCredentials: true}
            );
                isRefreshing = false;
                return api(originalRequest);
            } catch (err) {
                // Clear queue with error
                processQueue(err, null);
                isRefreshing = false;
                Router.push('/login');
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;