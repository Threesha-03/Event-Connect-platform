import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchMyBookings, cancelBooking } from '../store/slices/bookingSlice';
import { QRCodeSVG } from 'qrcode.react';
import {
  FiCalendar, FiMapPin, FiUser, FiHeart, FiSettings,
  FiClock, FiDownload, FiX, FiCheck, FiStar, FiAward,
} from 'react-icons/fi';
import { formatDate, formatCurrency, getStatusColor, getImageUrl } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'bookings', label: 'My Bookings', icon: FiCalendar },
  { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
  { id: 'profile', label: 'Profile', icon: FiSettings },
];

const BookingCard = ({ booking, onCancel }) => {
  const [showQR, setShowQR] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isEligibleForCertificate = (() => {
    const eventDate = new Date(booking.event?.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  })();
  const canGetCertificate = ['confirmed', 'attended'].includes(booking.status) && isEligibleForCertificate;

  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/certificates/${booking.bookingId}`, {
        responseType: 'blob',
      });
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${booking.event?.title?.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded! 🎓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex gap-4">
        <img
          src={getImageUrl(booking.event?.poster)}
          alt={booking.event?.title}
          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
              {booking.event?.title}
            </h3>
            <span className={`badge text-xs flex-shrink-0 ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          <div className="mt-1 space-y-1">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FiCalendar className="text-primary-500" /> {formatDate(booking.event?.date)} · {booking.event?.time}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FiMapPin className="text-primary-500" /> {booking.event?.venue?.city}
            </p>
            <p className="text-xs text-gray-500">
              {booking.ticketType?.name} × {booking.quantity} · <span className="font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(booking.totalAmount)}</span>
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            {booking.status === 'confirmed' && (
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg font-medium hover:bg-primary-100 transition-colors"
              >
                {showQR ? 'Hide QR' : '🎟️ Show QR'}
              </button>
            )}
            {booking.status === 'confirmed' && (
              <button
                onClick={() => onCancel(booking._id)}
                className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Cancel
              </button>
            )}
            {canGetCertificate && (
              <button
                onClick={handleDownloadCertificate}
                disabled={downloading}
                className="text-xs px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-1 disabled:opacity-60"
              >
                {downloading ? (
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 border border-amber-600 border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <><FiAward className="text-xs" /> Certificate</>
                )}
              </button>
            )}
            <Link
              to={`/events/${booking.event?._id}`}
              className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              View Event
            </Link>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {showQR && (booking.qrCodeData || booking.qrCode) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center"
        >
          <p className="text-xs text-gray-500 mb-3">Show at venue for entry</p>
          <div className="inline-block p-3 bg-white rounded-xl shadow border border-gray-100">
            {booking.qrCodeData ? (
              <QRCodeSVG value={booking.qrCodeData} size={150} level="H" fgColor="#1a1a2e" />
            ) : (
              <img src={booking.qrCode} alt="QR" className="w-36 h-36" />
            )}
          </div>
          <p className="text-xs font-mono text-gray-400 mt-2">{booking.bookingId}</p>
        </motion.div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookings, loading, pagination } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'bookings');
  const [wishlist, setWishlist] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (activeTab === 'bookings') dispatch(fetchMyBookings());
    if (activeTab === 'wishlist') loadWishlist();
  }, [activeTab, dispatch]);

  const loadWishlist = async () => {
    try {
      const res = await api.get('/users/wishlist');
      setWishlist(res.data.wishlist);
    } catch {}
  };

  const handleCancelBooking = (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      dispatch(cancelBooking(id));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/users/profile', profileForm);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/change-password', passwordForm);
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveWishlist = async (eventId) => {
    try {
      await api.post(`/users/wishlist/${eventId}`);
      setWishlist(prev => prev.filter(e => e._id !== eventId));
      toast.success('Removed from wishlist');
    } catch {}
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: FiCalendar, color: 'text-blue-500' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: FiCheck, color: 'text-green-500' },
    { label: 'Wishlist', value: wishlist.length, icon: FiHeart, color: 'text-red-500' },
    { label: 'Attended', value: bookings.filter(b => b.status === 'attended').length, icon: FiStar, color: 'text-yellow-500' },
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-black">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user?.name}</h1>
              <p className="text-white/70">{user?.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <Icon className={`${color} text-xl mb-1`} />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSearchParams({ tab: id }); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="card p-5">
                    <div className="flex gap-4">
                      <div className="skeleton-shimmer w-20 h-20 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
                        <div className="skeleton-shimmer h-3 w-2/3 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map(booking => (
                  <BookingCard key={booking._id} booking={booking} onCancel={handleCancelBooking} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🎟️</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-6">Start exploring events and book your first ticket!</p>
                <Link to="/events" className="btn-primary">Browse Events</Link>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(event => (
                  <div key={event._id} className="card-hover relative">
                    <button
                      onClick={() => handleRemoveWishlist(event._id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <FiX className="text-sm" />
                    </button>
                    <Link to={`/events/${event._id}`}>
                      <img
                        src={getImageUrl(event.poster)}
                        alt={event.title}
                        className="w-full aspect-video object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'; }}
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">{event.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FiCalendar className="text-primary-500" /> {formatDate(event.date)}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <FiMapPin className="text-primary-500" /> {event.venue?.city}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">❤️</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">Save events you're interested in!</p>
                <Link to="/events" className="btn-primary">Explore Events</Link>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={user?.email} disabled className="input-field opacity-60 cursor-not-allowed" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    className="input-field"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <button type="submit" disabled={savingProfile} className="btn-primary w-full">
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                <button type="submit" className="btn-primary w-full">Change Password</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
