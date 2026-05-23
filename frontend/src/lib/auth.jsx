import React, { createContext, useContext, useEffect, useState } from "react";
import { api, formatApiError } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // null = checking, false = unauthenticated, object = user
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("portfolio_token");
        if (!token) {
            setUser(false);
            return;
        }
        api.get("/auth/me")
            .then((res) => setUser(res.data))
            .catch(() => {
                localStorage.removeItem("portfolio_token");
                setUser(false);
            });
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post("/auth/login", { email, password });
            localStorage.setItem("portfolio_token", data.token);
            setUser(data.user);
            return { ok: true };
        } catch (e) {
            return {
                ok: false,
                error: formatApiError(e.response?.data?.detail) || e.message,
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("portfolio_token");
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
