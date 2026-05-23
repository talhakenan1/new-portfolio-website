import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import HomePage from "@/pages/HomePage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";

function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                        <Route path="/admin/login" element={<AdminLoginPage />} />
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </BrowserRouter>
                <Toaster position="bottom-right" theme="light" richColors closeButton />
            </AuthProvider>
        </div>
    );
}

export default App;
