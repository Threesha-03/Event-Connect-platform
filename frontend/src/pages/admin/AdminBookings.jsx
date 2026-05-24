import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiCheck, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [qrInput, setQrInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/bookings', { params });
      setBookings(res.data.bookings);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleValidateQR = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setValidating(true);
    setValidationResult(null);
    try {
      let bookingId = qrInput.trim();
      // Try to parse as JSON (QR code data)
      try {
        const parsed = JSON.parse(bookingId);
        bookingId = parsed.bookingId;
      } catch {}

      const res = await api.post('/bookings/validate-qr', { bookingId });
      setValidationResult({ success: true, data: res.data });
      toast.success('Check-in successful!');
      fetchBookings();
    } catch (err) {
      setValidationResult({ success: false, message: err.response?.data?.message || 'Invalid QR' });
      toast.error(err.response?.data?.message || 'Invalid QR code');
    } finally {
      setValidating(false);
    }
  };

  const filteredBookings = bookings.filter(b =>
    !search ||
    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.event?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.bookingId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Manage Bookings</h1>
            <p className="text-gray-500">{pagination?.total || 0} total bookings</p>
          </div>
        </div>

        {/* QR Validator */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🎟️ QR Code Validator</h2>
          <form onSubmit={handleValidateQR} className="flex gap-3">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Enter Booking ID or scan QR code..."
              className="input-field flex-1"
            />
            <button type="submit" disabled={validating} className="btn-primary px-6">
              {validating ? 'Validating...' : 'Validate'}
            </button>
          </form>

          {validationResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl border ${
                validationResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              {validationResult.success ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-700 dark:text-green-400">✓ Check-in Successful!</p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      {validationResult.data.booking?.user?.name} - {validationResult.data.booking?.event?.title}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <FiX className="text-red-500 text-xl" />
                  <p className="text-red-600 dark:text-red-400 font-medium">{validationResult.message}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, event, booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field sm:w-48"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="attended">Attended</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Booking ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Event</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4"><div className="skeleton-shimmer h-5 rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredBookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-gray-900 dark:text-white">{booking.bookingId}</p>
                      <p className="text-xs text-gray-500">{booking.ticketType?.name} × {booking.quantity}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.user?.name}</p>
                      <p className="text-xs text-gray-500">{booking.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[200px]">{booking.event?.title}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(booking.totalAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge text-xs ${getStatusColor(booking.status)}`}>{booking.status}</span>
                      {booking.isCheckedIn && <span className="badge bg-blue-100 text-blue-700 text-xs ml-1">✓ In</span>}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-500">{formatDate(booking.createdAt, 'MMM dd, yyyy')}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBookings.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>No bookings found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
