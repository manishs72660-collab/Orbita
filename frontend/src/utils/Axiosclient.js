import axios from "axios";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // send/receive httpOnly cookies (accessToken, refreshToken)
    headers: {
        "Content-Type": "application/json",
    },
});

// NOTE: there's no POST /auth/refresh route on the backend yet, so this
// client does not attempt token refresh. A 401 just means "not logged in" —
// callers (e.g. AuthContext) treat that as logged-out and move on.
// If/when a refresh endpoint is added server-side, the refresh-and-retry
// interceptor can be reintroduced here.
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // no response at all -> network/server down
        if (!error.response) {
            return Promise.reject(new Error("Network error, please check your connection"));
        }
        return Promise.reject(error);
    }
);

export default axiosClient;