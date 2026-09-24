import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import TenantDashboard from './pages/TenantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import TenantProfile from './pages/TenantProfile';
import Listings from './pages/Listings';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Tenant Secured Routes */}
              <Route
                path="/tenant-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['tenant']}>
                    <TenantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenant-profile"
                element={
                  <ProtectedRoute allowedRoles={['tenant']}>
                    <TenantProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/listings"
                element={
                  <ProtectedRoute allowedRoles={['tenant', 'admin']}>
                    <Listings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches"
                element={
                  <ProtectedRoute allowedRoles={['tenant']}>
                    <Matches />
                  </ProtectedRoute>
                }
              />

              {/* Owner Secured Routes */}
              <Route
                path="/owner-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-listing"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <CreateListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-listing/:id"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <EditListing />
                  </ProtectedRoute>
                }
              />

              {/* Admin Secured Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared Secured Routes */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute allowedRoles={['tenant', 'owner']}>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['tenant', 'owner', 'admin']}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
