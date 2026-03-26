import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// User pages
import UserDashboard from '../pages/user/UserDashboard';
import ComplaintForm from '../pages/user/ComplaintForm';
import MyComplaints from '../pages/user/MyComplaints';
import BookingForm from '../pages/user/BookingForm';
import MyBookings from '../pages/user/MyBookings';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageComplaints from '../pages/admin/ManageComplaints';
import ManageBookings from '../pages/admin/ManageBookings';
import ManageResources from '../pages/admin/ManageResources';
import Reports from '../pages/admin/Reports';

// Technician pages
import TechDashboard from '../pages/technician/TechDashboard';
import AssignedComplaints from '../pages/technician/AssignedComplaints';

export default function AppRoutes() {
  const { user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'technician': return '/technician';
      default: return '/dashboard';
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getDefaultRoute()} /> : <Register />} />

      {/* User routes */}
      <Route element={<ProtectedRoute roles={['user']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/complaints" element={<MyComplaints />} />
        <Route path="/complaints/new" element={<ComplaintForm />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/bookings/new" element={<BookingForm />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/complaints" element={<ManageComplaints />} />
        <Route path="/admin/bookings" element={<ManageBookings />} />
        <Route path="/admin/resources" element={<ManageResources />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>

      {/* Technician routes */}
      <Route element={<ProtectedRoute roles={['technician']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/technician" element={<TechDashboard />} />
        <Route path="/technician/complaints" element={<AssignedComplaints />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}
