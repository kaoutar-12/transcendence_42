import axios from 'axios';
import Router from 'next/router';

const api=axios.create({baseURL:process.env.NEXT_PUBLIC_API_URL, withCredentials: true});
let isRefreshing=false;

api.interceptors.response.use(

    (response)=>response,

    async(error)=>
        {
            const failedResquest = error.config;

            if (error.response?.status === 401 && !failedResquest._retry)
                {
                    failedResquest._retry=true;
                    if (!isRefreshing)
                        {
                            try
                            {
                                isRefreshing=true;
                                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`,{},{withCredentials:true});
                                isRefreshing=false;
                                return api(failedResquest);
                            }
                            catch(error)
                            {
                                isRefreshing=true;
                                Router.push('/login');
                                return Promise.reject(error);
                            }
                        }
                }
                return Promise.reject(error);
        }

);
export default api;
