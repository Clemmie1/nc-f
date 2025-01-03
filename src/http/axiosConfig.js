import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: import.meta.env.APP_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                // Attempt to refresh the token
                const refreshToken = Cookies.get("refreshToken"); // Ensure you store a refresh token
                const { data } = await axios.get(
                    `${import.meta.env.APP_API_URL}/auth/refresh`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Cookie: `refreshToken=${refreshToken}`,
                        },
                        withCredentials: true
                    }
                );

                // Save new tokens
                Cookies.set("token", data.accessToken);
                Cookies.set("refreshToken", data.refreshToken);

                // Retry original request with new token
                error.config.headers["Authorization"] = `Bearer ${data.accessToken}`;
                return api.request(error.config);
            } catch (refreshError) {
                // Handle refresh token failure
                // console.error("Token refresh failed:", refreshError);
                // Cookies.remove("token");
                // Cookies.remove("refresh_token");
                // window.location.href = "/ui/login"; // Redirect to login
            }
        }
        return Promise.reject(error);
    }
);

export default api;
