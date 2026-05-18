import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// Cookies are HttpOnly — JS never touches the token.
// Always send credentials so the browser includes the cookie on every request.
axios.defaults.withCredentials = true;

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "practitioner";
}

interface AuthStore {
  user: AuthUser | null;
  loginError: string | null;
  isLoggingIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  setPassword: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loginError: null,
      isLoggingIn: false,

      login: async (email, password) => {
        set({ isLoggingIn: true, loginError: null });
        try {
          const res = await axios.post("http://localhost:8000/auth/login", {
            email: email.trim().toLowerCase(),
            password: password,
          });
          // The server sets the HttpOnly cookie. We only store non-sensitive user info.
          set({ user: res.data.user, isLoggingIn: false });
          return true;
        } catch (err: any) {
          const message =
            err?.response?.data?.detail ?? "Login failed. Please check your credentials.";
          set({ loginError: message, isLoggingIn: false });
          return false;
        }
      },

      setPassword: async (email, password) => {
        set({ isLoggingIn: true, loginError: null });
        try {
          const res = await axios.post("http://localhost:8000/auth/set-password", {
            email: email.trim().toLowerCase(),
            password: password,
          });
          set({ user: res.data.user, isLoggingIn: false });
          return true;
        } catch (err: any) {
          const message =
            err?.response?.data?.detail ?? "Failed to set password. Please try again.";
          set({ loginError: message, isLoggingIn: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await axios.post("http://localhost:8000/auth/logout");
        } catch {
          // Proceed with local logout even if the server call fails
        }
        set({ user: null, loginError: null });
      },
    }),
    {
      name: "gp-connect-auth",
      // Only persist user profile info — never a token
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Global 401 interceptor — clears local user state and redirects to login
// when the HttpOnly cookie has expired or been invalidated on the server.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error?.response?.status === 401;
    const isLoginEndpoint = error?.config?.url?.includes("/auth/login");

    if (is401 && !isLoginEndpoint) {
      useAuthStore.getState().logout();
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default useAuthStore;
