import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchEvent, clearEvent } from '../store/slices/eventSlice';
import { EventMap } from '../components/common/MapComponent';
import {
  FiCalendar, FiMapPin, FiClock, FiUsers, FiStar, FiShare2,
  FiHeart, FiTag, FiChevronDown, FiChevronUp, FiCheck,
} from 'react-icons/fi';
import {
  formatDate, formatCurrency, getCategoryColor, getCategoryIcon,
  getImageUrl, isEventUpcoming, getTotalAvailableSeats,
} from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ReviewCard = ({ review }) => (
  <div className="card p-4">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        {review.user?.name?.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.user?.name}</p>
            {review.isVerifiedAttendee && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <FiCheck className="text-xs" /> Verified Attendee
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
        {review.comment && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{review.comment}</p>
        )}
      </div>
    </div>
  </div>
);

const EventDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { event, loading } = useSelector((state) => state.events);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAllDesc, setShowAllDesc] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchEvent(id));
    loadReviews();
    return () => dispatch(clearEvent());
  }, [id, dispatch]);

  useEffect(() => {
    if (event && user) {
      setIsWishlisted(user.wishlist?.some(w => w._id === event._id || w === event._id));
    }
  }, [event, user]);

  const loadReviews = async () => {
    try {
      const res = await api.get(`/reviews/event/${id}`);
      setReviews(res.data.reviews);
    } catch {}
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      await api.post(`/users/wishlist/${id}`);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch { toast.error('Failed'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    navigate(`/booking/${id}`, { state: { ticketTypeIndex: selectedTicket, quantity } });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { eventId: id, ...reviewForm });
      toast.success('Review submitted!');
      loadReviews();
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="skeleton-shimmer h-96 rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton-shimmer h-8 w-3/4 rounded" />
              <div className="skeleton-shimmer h-4 w-full rounded" />
              <div className="skeleton-shimmer h-4 w-2/3 rounded" />
            </div>
            <div className="skeleton-shimmer h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event not found</h2>
          <Link to="/events" className="btn-primary">Browse Events</Link>
        </div>
      </div>
    );
  }

  const upcoming = isEventUpcoming(event.date);
  const totalSeats = getTotalAvailableSeats(event.ticketTypes);
  const selectedTicketType = event.ticketTypes?.[selectedTicket];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={getImageUrl(event.poster)}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-colors text-sm font-medium"
        >
          ← Back
        </button>

        {/* Action buttons */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button onClick={handleShare} className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
            <FiShare2 />
          </button>
          <button
            onClick={handleWishlist}
            className={`w-10 h-10 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all ${
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <FiHeart className={isWishlisted ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`badge text-xs font-semibold ${getCategoryColor(event.category)}`}>
              {getCategoryIcon(event.category)} {event.category}
            </span>
            {event.isTrending && <span className="badge bg-orange-500 text-white text-xs">🔥 Trending</span>}
            {event.isFeatured && <span className="badge bg-yellow-500 text-white text-xs">⭐ Featured</span>}
            {!upcoming && <span className="badge bg-gray-600 text-white text-xs">Past Event</span>}
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: FiCalendar, label: 'Date', value: formatDate(event.date, 'MMM dd, yyyy') },
                { icon: FiClock, label: 'Time', value: event.time },
                { icon: FiMapPin, label: 'City', value: event.venue?.city },
                { icon: FiUsers, label: 'Seats Left', value: totalSeats > 0 ? totalSeats : 'Sold Out' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="card p-4 text-center">
                  <Icon className="text-primary-500 text-xl mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
              <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${!showAllDesc ? 'line-clamp-4' : ''}`}>
                {event.description}
              </p>
              {event.description?.length > 300 && (
                <button
                  onClick={() => setShowAllDesc(!showAllDesc)}
                  className="mt-2 text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center gap-1"
                >
                  {showAllDesc ? <><FiChevronUp /> Show less</> : <><FiChevronDown /> Read more</>}
                </button>
              )}

              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <FiTag className="text-gray-400 mt-0.5" />
                  {event.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Venue & Map */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📍 Venue & Location</h2>
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white">{event.venue?.name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{event.venue?.address}, {event.venue?.city}, {event.venue?.state}</p>
              </div>
              <EventMap
                latitude={event.venue?.latitude}
                longitude={event.venue?.longitude}
                venueName={event.venue?.name}
                venueAddress={`${event.venue?.address}, ${event.venue?.city}`}
              />
            </div>

            {/* Organizer */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">👤 Organizer</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                  {event.organizerName?.charAt(0) || 'O'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{event.organizerName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{event.organizerEmail}</p>
                  {event.organizerPhone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.organizerPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Reviews {event.totalReviews > 0 && `(${event.totalReviews})`}
                </h2>
                {event.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar key={i} className={`text-lg ${i < Math.round(event.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{event.averageRating}</span>
                  </div>
                )}
              </div>

              {/* Review Form */}
              {isAuthenticated && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="font-medium text-gray-900 dark:text-white mb-3">Write a Review</p>
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                        className="text-2xl transition-transform hover:scale-110"
                      >
                        <FiStar className={star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                    placeholder="Share your experience..."
                    rows={3}
                    className="input-field resize-none mb-3"
                  />
                  <button type="submit" disabled={submittingReview} className="btn-primary text-sm py-2">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map(review => <ReviewCard key={review._id} review={review} />)
                ) : (
                  <p className="text-center text-gray-400 py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Book Tickets</h2>

                {/* Ticket Types */}
                <div className="space-y-3 mb-6">
                  {event.ticketTypes?.map((ticket, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTicket(i)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTicket === i
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{ticket.name}</p>
                          {ticket.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ticket.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{ticket.availableSeats} seats left</p>
                        </div>
                        <p className="font-bold text-primary-600 dark:text-primary-400 text-lg">
                          {formatCurrency(ticket.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="label">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-lg transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold text-gray-900 dark:text-white w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(10, q + 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total */}
                {selectedTicketType && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>{selectedTicketType.name} × {quantity}</span>
                      <span>{formatCurrency(selectedTicketType.price * quantity)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <span>Total</span>
                      <span className="text-primary-600 dark:text-primary-400 text-lg">
                        {formatCurrency(selectedTicketType.price * quantity)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBookNow}
                  disabled={!upcoming || totalSeats === 0 || (selectedTicketType?.availableSeats < quantity)}
                  className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {!upcoming ? 'Event Ended' : totalSeats === 0 ? 'Sold Out' : 'Book Now'}
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    <Link to="/login" className="text-primary-500 hover:underline">Login</Link> to book tickets
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
