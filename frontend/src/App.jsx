import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setDarkMode } from './store/slices/uiSlice';
import { getMe } from './store/slices/authSlice';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import CreateEventPage from './pages/admin/CreateEventPage';
import EditEventPage from './pages/admin/EditEventPage';
import NotFoundPage from './pages/NotFoundPage';

// Organizer Pages
import BecomeOrganizerPage from './pages/organizer/BecomeOrganizerPage';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerCreateEvent from './pages/organizer/OrganizerCreateEvent';

// Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import OrganizerRoute from './components/auth/OrganizerRoute';

function App() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Apply dark mode on mount
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Fetch current user if authenticated
    if (isAuthenticated) {
      dispatch(getMe());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected User Routes */}
          <Route path="/booking/:eventId" element={
            <ProtectedRoute><BookingPage /></ProtectedRoute>
          } />
          <Route path="/payment/:bookingId" element={
            <ProtectedRoute><PaymentPage /></ProtectedRoute>
          } />
          <Route path="/payment/success" element={
            <ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><UserDashboard /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/events" element={
            <AdminRoute><AdminEvents /></AdminRoute>
          } />
          <Route path="/admin/events/create" element={
            <AdminRoute><CreateEventPage /></AdminRoute>
          } />
          <Route path="/admin/events/edit/:id" element={
            <AdminRoute><EditEventPage /></AdminRoute>
          } />
          <Route path="/admin/bookings" element={
            <AdminRoute><AdminBookings /></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminUsers /></AdminRoute>
          } />

          {/* Organizer Routes */}
          <Route path="/become-organizer" element={
            <ProtectedRoute><BecomeOrganizerPage /></ProtectedRoute>
          } />
          <Route path="/organizer/dashboard" element={
            <OrganizerRoute><OrganizerDashboard /></OrganizerRoute>
          } />
          <Route path="/organizer/events/create" element={
            <OrganizerRoute><OrganizerCreateEvent /></OrganizerRoute>
          } />
          <Route path="/organizer/events/edit/:id" element={
            <OrganizerRoute><EditEventPage /></OrganizerRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
