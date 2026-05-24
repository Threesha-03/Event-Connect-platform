import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchEvents, setFilters, clearFilters } from '../store/slices/eventSlice';
import EventCard from '../components/events/EventCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { CATEGORIES, SORT_OPTIONS } from '../utils/helpers';

const EventsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { events, loading, pagination, filters } = useSelector((state) => state.events);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    date: '',
    sort: '-createdAt',
  });

  useEffect(() => {
    const params = {
      page,
      limit: 12,
      ...localFilters,
    };
    // Remove empty params
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    dispatch(fetchEvents(params));
  }, [dispatch, page, localFilters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setLocalFilters({ search: '', category: '', city: '', minPrice: '', maxPrice: '', date: '', sort: '-createdAt' });
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = Object.entries(localFilters).some(([k, v]) => v && k !== 'sort');

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">All Events</h1>
          <p className="text-white/70">
            {pagination ? `${pagination.total} events found` : 'Discover amazing events'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search events..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pl-12"
            />
          </div>

          {/* Category */}
          <select
            value={localFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-field lg:w-48"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={localFilters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="input-field lg:w-52"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400'
            }`}
          >
            <FiFilter />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-white text-primary-600 rounded-full text-xs flex items-center justify-center font-bold">
                {Object.values(localFilters).filter((v, i) => v && i !== 6).length}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={localFilters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={localFilters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Min Price (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={localFilters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Max Price (₹)</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={localFilters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium"
              >
                <FiX /> Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {/* Results */}
        {loading ? (
          <SkeletonGrid count={12} />
        ) : events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event, i) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiChevronLeft />
                </button>

                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === pageNum
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={handleClearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
