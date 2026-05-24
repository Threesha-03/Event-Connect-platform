import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchEvents, deleteEvent } from '../../store/slices/eventSlice';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiStar, FiTrendingUp } from 'react-icons/fi';
import { formatDate, formatCurrency, getImageUrl, getCategoryColor } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminEvents = () => {
  const dispatch = useDispatch();
  const { events, loading, pagination } = useSelector((state) => state.events);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchEvents({ page, limit: 15, search, sort: '-createdAt' }));
  }, [dispatch, page, search]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteEvent(id));
      toast.success('Event deleted');
      setDeleteConfirm(null);
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleFeature = async (id, isFeatured, isTrending) => {
    try {
      await api.put(`/admin/events/${id}/feature`, { isFeatured, isTrending });
      toast.success('Updated!');
      dispatch(fetchEvents({ page, limit: 15, search, sort: '-createdAt' }));
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Manage Events</h1>
            <p className="text-gray-500">{pagination?.total || 0} total events</p>
          </div>
          <Link to="/admin/events/create" className="btn-primary flex items-center gap-2">
            <FiPlus /> Create Event
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-11 max-w-md"
          />
        </div>

        {/* Events Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Price</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="skeleton-shimmer h-10 rounded" /></td>
                      <td className="px-6 py-4 hidden md:table-cell"><div className="skeleton-shimmer h-6 w-20 rounded" /></td>
                      <td className="px-6 py-4 hidden lg:table-cell"><div className="skeleton-shimmer h-6 w-24 rounded" /></td>
                      <td className="px-6 py-4 hidden lg:table-cell"><div className="skeleton-shimmer h-6 w-16 rounded" /></td>
                      <td className="px-6 py-4"><div className="skeleton-shimmer h-6 w-20 rounded" /></td>
                      <td className="px-6 py-4"><div className="skeleton-shimmer h-8 w-24 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : events.map((event) => (
                  <motion.tr
                    key={event._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(event.poster)}
                          alt={event.title}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100'; }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 max-w-[200px]">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.totalBookings} bookings</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`badge text-xs ${getCategoryColor(event.category)}`}>{event.category}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(event.date)}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(event.ticketTypes?.[0]?.price || 0)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {event.isFeatured && <span className="badge bg-yellow-100 text-yellow-700 text-xs">⭐</span>}
                        {event.isTrending && <span className="badge bg-orange-100 text-orange-700 text-xs">🔥</span>}
                        <span className={`badge text-xs ${
                          event.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>{event.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleFeature(event._id, !event.isFeatured, event.isTrending)}
                          title="Toggle Featured"
                          className={`p-2 rounded-lg transition-colors ${event.isFeatured ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                        >
                          <FiStar className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleToggleFeature(event._id, event.isFeatured, !event.isTrending)}
                          title="Toggle Trending"
                          className={`p-2 rounded-lg transition-colors ${event.isTrending ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}
                        >
                          <FiTrendingUp className="text-sm" />
                        </button>
                        <Link to={`/events/${event._id}`} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <FiEye className="text-sm" />
                        </Link>
                        <Link to={`/admin/events/edit/${event._id}`} className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                          <FiEdit2 className="text-sm" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(event._id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {events.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-gray-500">No events found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                  page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Event?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. All bookings for this event will be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
