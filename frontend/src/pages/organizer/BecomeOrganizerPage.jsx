import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { becomeOrganizer } from '../../store/slices/organizerSlice';
import { getMe } from '../../store/slices/authSlice';
import { FiCalendar, FiUsers, FiDollarSign, FiStar, FiCheck } from 'react-icons/fi';

const PERKS = [
  { icon: FiCalendar, title: 'Create Unlimited Events', desc: 'Publish music concerts, workshops, meetups, and more' },
  { icon: FiUsers, title: 'Manage Attendees', desc: 'See who\'s coming and check them in with QR codes' },
  { icon: FiDollarSign, title: 'Sell Tickets', desc: 'Set your own ticket prices and collect payments via Razorpay' },
  { icon: FiStar, title: 'Get Reviews', desc: 'Build your reputation with attendee ratings and reviews' },
];

const BecomeOrganizerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.organizer);
  const [form, setForm] = useState({ bio: '', website: '' });
  const [agreed, setAgreed] = useState(false);

  if (user?.role === 'organizer' || user?.role === 'admin') {
    navigate('/organizer/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(becomeOrganizer(form));
    if (becomeOrganizer.fulfilled.match(result)) {
      await dispatch(getMe()); // refresh user role
      navigate('/organizer/dashboard');
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-5xl mb-4 block">🎤</span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Become an <span className="gradient-text">Organizer</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Create and manage your own events. Sell tickets, check in attendees, and build your audience — all for free.
          </p>
        </motion.div>

        {/* Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {PERKS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon className="text-primary-600 dark:text-primary-400 text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-8 max-w-lg mx-auto"
        >
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Set Up Your Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Your Name</label>
              <input type="text" value={user?.name} disabled className="input-field opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Short Bio (Optional)</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell attendees about yourself or your organization..."
                rows={3}
                className="input-field resize-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1">{form.bio.length}/200</p>
            </div>
            <div>
              <label className="label">Website / Social Link (Optional)</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))}
                placeholder="https://yourwebsite.com"
                className="input-field"
              />
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-400 font-medium mb-2">📋 Organizer Guidelines</p>
              <ul className="text-xs text-amber-700 dark:text-amber-500 space-y-1">
                <li className="flex items-center gap-1.5"><FiCheck className="flex-shrink-0" /> Only create real, legitimate events</li>
                <li className="flex items-center gap-1.5"><FiCheck className="flex-shrink-0" /> Provide accurate event details and timings</li>
                <li className="flex items-center gap-1.5"><FiCheck className="flex-shrink-0" /> Honor all ticket bookings and refund policies</li>
                <li className="flex items-center gap-1.5"><FiCheck className="flex-shrink-0" /> Violations may result in account suspension</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the organizer guidelines and{' '}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="btn-primary w-full py-4 text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </span>
              ) : '🚀 Become an Organizer'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BecomeOrganizerPage;
