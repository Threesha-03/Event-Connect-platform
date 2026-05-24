import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchEvent } from '../store/slices/eventSlice';
import { createOrder } from '../store/slices/bookingSlice';
import { formatDate, formatCurrency, getImageUrl } from '../utils/helpers';
import { FiCalendar, FiMapPin, FiClock, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { event, loading: eventLoading } = useSelector((state) => state.events);
  const { paymentLoading, orderData } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  const { ticketTypeIndex = 0, quantity: initQty = 1 } = location.state || {};
  const [selectedTicket, setSelectedTicket] = useState(ticketTypeIndex);
  const [quantity, setQuantity] = useState(initQty);
  const [attendee, setAttendee] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    dispatch(fetchEvent(eventId));
  }, [eventId, dispatch]);

  // When order is created, redirect to payment
  useEffect(() => {
    if (orderData) {
      if (orderData.free || orderData.testMode || orderData.amount === 0) {
        // Free event or test mode — booking confirmed directly
        navigate('/payment/success', { state: { booking: orderData.booking } });
      } else {
        navigate(`/payment/${orderData.booking._id}`, { state: { orderData } });
      }
    }
  }, [orderData, navigate]);

  const handleProceed = async () => {
    if (!attendee.name || !attendee.email) {
      toast.error('Please fill in attendee details');
      return;
    }

    const ticketType = event.ticketTypes[selectedTicket];
    if (ticketType.availableSeats < quantity) {
      toast.error('Not enough seats available');
      return;
    }

    dispatch(createOrder({
      eventId,
      ticketTypeIndex: selectedTicket,
      quantity,
      attendeeDetails: attendee,
    }));
  };

  if (eventLoading || !event) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const selectedTicketType = event.ticketTypes[selectedTicket];
  const total = selectedTicketType ? selectedTicketType.price * quantity : 0;

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Complete Your Booking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Ticket Selection */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Ticket Type</h2>
                <div className="space-y-3">
                  {event.ticketTypes.map((ticket, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTicket(i)}
                      disabled={ticket.availableSeats === 0}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedTicket === i
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{ticket.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{ticket.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {ticket.availableSeats === 0 ? 'Sold Out' : `${ticket.availableSeats} seats available`}
                          </p>
                        </div>
                        <p className="font-bold text-primary-600 dark:text-primary-400 text-lg">
                          {formatCurrency(ticket.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                <div className="mt-4">
                  <label className="label">Number of Tickets</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-xl">−</button>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(Math.min(10, selectedTicketType?.availableSeats || 10), q + 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-xl">+</button>
                  </div>
                </div>
              </div>

              {/* Attendee Details */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Attendee Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={attendee.name}
                        onChange={(e) => setAttendee(p => ({ ...p, name: e.target.value }))}
                        className="input-field pl-11"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={attendee.email}
                        onChange={(e) => setAttendee(p => ({ ...p, email: e.target.value }))}
                        className="input-field pl-11"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={attendee.phone}
                        onChange={(e) => setAttendee(p => ({ ...p, phone: e.target.value }))}
                        className="input-field pl-11"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="card p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

                {/* Event Info */}
                <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <img
                    src={getImageUrl(event.poster)}
                    alt={event.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200'; }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{event.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <FiCalendar className="text-primary-500" /> {formatDate(event.date)}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FiMapPin className="text-primary-500" /> {event.venue?.city}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{selectedTicketType?.name} × {quantity}</span>
                    <span>{formatCurrency(selectedTicketType?.price || 0)} each</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Platform Fee</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 text-lg">
                    <span>Total</span>
                    <span className="text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceed}
                  disabled={paymentLoading || !selectedTicketType}
                  className="btn-primary w-full py-4 text-base"
                >
                  {paymentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : total === 0 ? 'Confirm Free Booking' : `Pay ${formatCurrency(total)}`}
                </button>

                <p className="text-xs text-center text-gray-400 mt-3">
                  🔒 Secured by Razorpay. Your payment info is safe.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingPage;
