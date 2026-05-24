import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchTrendingEvents, fetchFeaturedEvents } from '../store/slices/eventSlice';
import EventCard from '../components/events/EventCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { FiSearch, FiArrowRight, FiCalendar, FiMapPin, FiStar, FiUsers, FiZap } from 'react-icons/fi';
import { CATEGORIES, getCategoryIcon } from '../utils/helpers';

const HERO_STATS = [
  { icon: FiCalendar, value: '500+', label: 'Events Monthly' },
  { icon: FiUsers, value: '50K+', label: 'Happy Attendees' },
  { icon: FiMapPin, value: '20+', label: 'Cities' },
  { icon: FiStar, value: '4.9', label: 'Avg Rating' },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trendingEvents, featuredEvents, loading } = useSelector((state) => state.events);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    dispatch(fetchTrendingEvents());
    dispatch(fetchFeaturedEvents());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (searchCity) params.set('city', searchCity);
    navigate(`/events?${params.toString()}`);
  };

  const handleCategoryClick = (category) => {
    if (category === 'All') navigate('/events');
    else navigate(`/events?category=${category}`);
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-gray-900">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium mb-6">
                <FiZap className="text-yellow-400" />
                India's #1 Event Booking Platform
              </span>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
                Discover
                <span className="block bg-gradient-to-r from-primary-300 to-accent-400 bg-clip-text text-transparent">
                  Amazing Events
                </span>
                Near You
              </h1>

              <p className="text-xl text-white/70 mb-10 leading-relaxed">
                From music festivals to tech conferences, find and book tickets for the events that matter to you.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search events, artists, venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-base shadow-xl"
                  />
                </div>
                <div className="relative sm:w-48">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="City"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 text-base shadow-xl"
                  />
                </div>
                <button type="submit" className="btn-primary py-4 px-8 text-base whitespace-nowrap shadow-xl">
                  Search
                </button>
              </form>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl"
          >
            {HERO_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="glass rounded-2xl p-4 text-center">
                <Icon className="text-primary-300 text-xl mx-auto mb-1" />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Find events that match your interests</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((category, i) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category)}
                className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="text-lg">{getCategoryIcon(category)}</span>
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Events */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="section-title flex items-center gap-3">
                🔥 Trending Events
              </h2>
              <p className="section-subtitle">Most popular events right now</p>
            </div>
            <Link to="/events?trending=true" className="btn-secondary hidden sm:flex items-center gap-2 text-sm">
              View All <FiArrowRight />
            </Link>
          </motion.div>

          {loading ? (
            <SkeletonGrid count={4} />
          ) : trendingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trendingEvents.slice(0, 8).map((event, i) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🎭</p>
              <p className="text-lg">No trending events yet</p>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/events?trending=true" className="btn-secondary inline-flex items-center gap-2">
              View All Trending <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <h2 className="section-title flex items-center gap-3">
                  ⭐ Featured Events
                </h2>
                <p className="section-subtitle">Handpicked events you'll love</p>
              </div>
              <Link to="/events?featured=true" className="btn-secondary hidden sm:flex items-center gap-2 text-sm">
                View All <FiArrowRight />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 6).map((event, i) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to Experience Something Amazing?
            </h2>
            <p className="text-xl text-white/70 mb-10">
              Join thousands of event-goers who trust EventFlow for their best experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events" className="bg-white text-primary-700 font-bold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-xl">
                Browse Events
              </Link>
              <Link to="/register" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/20 transition-all duration-200 hover:scale-105">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
