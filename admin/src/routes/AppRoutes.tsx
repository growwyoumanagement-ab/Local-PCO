import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { VerifierLayout } from "@/components/VerifierLayout";
import Dashboard from "@/pages/Dashboard";
import Partners from "@/pages/Partners";
import Bookings from "@/pages/Bookings";
import Login from "@/pages/Login";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Clients from "@/pages/Clients";
import Services from "@/pages/Services";
import Verifiers from "@/pages/Verifiers";
import AddVerifier from "@/pages/AddVerifier";
import Content from "@/pages/Content";
import VerifierDashboard from "@/pages/VerifierDashboard";
import VerificationQueue from "@/pages/VerificationQueue";
import VerificationHistory from "@/pages/VerificationHistory";

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="partners" element={<Partners />} />
                <Route path="verification-history" element={<VerificationHistory />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="clients" element={<Clients />} />
                <Route path="verifiers" element={<Verifiers />} />
                <Route path="verifiers/add" element={<AddVerifier />} />
                <Route path="services" element={<Services />} />
                <Route path="content" element={<Content />} />
            </Route>

            {/* Verifier Routes */}
            <Route path="/verification" element={
                <ProtectedRoute allowedRoles={["admin", "verifier"]}>
                    <VerifierLayout />
                </ProtectedRoute>
            }>
                <Route index element={<VerifierDashboard />} />
                <Route path="queue" element={<VerificationQueue />} />
                <Route path="history" element={<VerificationHistory />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
