import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiCalendar, FiMapPin, FiHeart, FiStar, FiUsers } from 'react-icons/fi';
import { formatDate, formatCurrency, getMinTicketPrice, getCategoryColor, getCategoryIcon, getImageUrl, isEventUpcoming } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const EventCard = ({ event, index = 0 }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(
    user?.wishlist?.includes(event._id)
  );
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const minPrice = getMinTicketPrice(event.ticketTypes);
  const upcoming = isEventUpcoming(event.date);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save events');
      return;
    }
    setWishlistLoading(true);
    try {
      await api.post(`/users/wishlist/${event._id}`);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to={`/events/${event._id}`} className="block">
        <div className="card-hover h-full">
          {/* Image */}
          <div className="relative overflow-hidden aspect-[16/9]">
            <img
              src={getImageUrl(event.poster)}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
              }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`badge text-xs font-semibold ${getCategoryColor(event.category)}`}>
                {getCategoryIcon(event.category)} {event.category}
              </span>
              {event.isTrending && (
                <span className="badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-semibold">
                  🔥 Trending
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                isWishlisted
                  ? 'bg-red-500 text-white scale-110'
                  : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <FiHeart className={`text-sm ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Status Badge */}
            {!upcoming && (
              <div className="absolute bottom-3 left-3">
                <span className="badge bg-gray-800/80 text-gray-200 text-xs">Past Event</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {event.title}
            </h3>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FiCalendar className="flex-shrink-0 text-primary-500" />
                <span>{formatDate(event.date)} · {event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FiMapPin className="flex-shrink-0 text-primary-500" />
                <span className="truncate">{event.venue?.name}, {event.venue?.city}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Starting from</p>
                <p className="font-bold text-primary-600 dark:text-primary-400 text-base">
                  {formatCurrency(minPrice)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {event.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <FiStar className="text-yellow-400 fill-current" />
                    {event.averageRating}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FiUsers />
                  {event.totalBookings}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
