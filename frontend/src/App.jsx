import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import CreateReturnPage from './pages/CreateReturnPage';
import MyReturns from './pages/MyReturns';
import CustomerReturnStatus from './pages/CustomerReturnStatus';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerReturnDetail from './pages/ManagerReturnDetail';

import DeliveryLogin from './pages/DeliveryLogin';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryPickupDetail from './pages/DeliveryPickupDetail';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<LandingPage />} />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute role="customer">
                <Layout><CustomerDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/create-return"
            element={
              <ProtectedRoute role="customer">
                <Layout><CreateReturnPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/my-returns"
            element={
              <ProtectedRoute role="customer">
                <Layout><MyReturns /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/return/:id"
            element={
              <ProtectedRoute role="customer">
                <Layout><CustomerReturnStatus /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute role="manager">
                <Layout><ManagerDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/returns"
            element={
              <ProtectedRoute role="manager">
                <Layout><ManagerDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/return/:id"
            element={
              <ProtectedRoute role="manager">
                <Layout><ManagerReturnDetail /></Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute role="delivery">
                <Layout><DeliveryDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery/return/:id"
            element={
              <ProtectedRoute role="delivery">
                <Layout><DeliveryPickupDetail /></Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
