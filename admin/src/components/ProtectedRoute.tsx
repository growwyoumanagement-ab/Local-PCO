import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const token = localStorage.getItem("adminToken");
    let adminUser: any = null;
    try {
        const storedUser = localStorage.getItem("adminUser");
        if (storedUser) {
            adminUser = JSON.parse(storedUser);
        }
    } catch (e) {
        // treating failures as missing user data
    }
    const role = adminUser?.role;

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        // Redirect verifiers trying to access admin-only pages to their home
        if (role === "verifier") {
            return <Navigate to="/verification" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
