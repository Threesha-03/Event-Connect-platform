import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FiUsers, FiCalendar, FiDollarSign, FiTrendingUp, FiPlus, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, change }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
        <Icon className="text-white text-xl" />
      </div>
      {change && (
        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
          +{change}%
        </span>
      )}
    </div>
    <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-shimmer h-36 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = stats?.monthlyRevenue?.map(item => ({
    month: monthNames[item._id.month - 1],
    revenue: item.revenue,
    bookings: item.count,
  })) || [];

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening.</p>
          </div>
          <Link to="/admin/events/create" className="btn-primary flex items-center gap-2">
            <FiPlus /> Create Event
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FiUsers} label="Total Users" value={stats?.stats?.totalUsers?.toLocaleString() || 0} color="bg-blue-500" change={12} />
          <StatCard icon={FiCalendar} label="Total Events" value={stats?.stats?.totalEvents?.toLocaleString() || 0} color="bg-purple-500" change={8} />
          <StatCard icon={FiTrendingUp} label="Total Bookings" value={stats?.stats?.totalBookings?.toLocaleString() || 0} color="bg-green-500" change={23} />
          <StatCard icon={FiDollarSign} label="Total Revenue" value={formatCurrency(stats?.stats?.totalRevenue || 0)} color="bg-orange-500" change={15} />
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Bookings</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
              <Link to="/admin/bookings" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {stats?.recentBookings?.slice(0, 5).map(booking => (
                <div key={booking._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {booking.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{booking.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{booking.event?.title}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(booking.createdAt, 'MMM dd')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Events */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Events</h2>
              <Link to="/admin/events" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {stats?.topEvents?.map((event, i) => (
                <div key={event._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.totalBookings} bookings · {event.category}</p>
                  </div>
                  <Link to={`/events/${event._id}`} className="text-gray-400 hover:text-primary-500 transition-colors">
                    <FiEye className="text-sm" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { to: '/admin/events', label: 'Manage Events', icon: FiCalendar, color: 'bg-purple-500' },
            { to: '/admin/bookings', label: 'All Bookings', icon: FiTrendingUp, color: 'bg-green-500' },
            { to: '/admin/users', label: 'Manage Users', icon: FiUsers, color: 'bg-blue-500' },
            { to: '/admin/events/create', label: 'Create Event', icon: FiPlus, color: 'bg-orange-500' },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
