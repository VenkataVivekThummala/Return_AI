import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/CustomerDashboard';
import CreateReturnPage from './pages/CreateReturnPage';
import MyReturns from './pages/MyReturns';
import CustomerReturnStatus from './pages/CustomerReturnStatus';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerReturnDetail from './pages/ManagerReturnDetail';

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
          <Route path="/" element={<Navigate to="/login" replace />} />

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

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
