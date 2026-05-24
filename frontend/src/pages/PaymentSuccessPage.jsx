import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { FiCalendar, FiMapPin, FiDownload, FiHome, FiList, FiAward } from 'react-icons/fi';
import { formatDate, formatCurrency } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const booking = location.state?.booking;
  const [downloading, setDownloading] = useState(false);

  const isWorkshop = booking?.event?.isWorkshop || booking?.event?.category === 'Workshop';

  const isEligibleForCertificate = (() => {
    if (!booking?.event?.date) return false;
    const eventDate = new Date(booking.event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  })();

  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/certificates/${booking.bookingId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${booking.event?.title?.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded! 🎓');
    } catch {
      toast.error('Certificate not available yet. Check your dashboard after the event.');
    } finally {
      setDownloading(false);
    }
  };

  if (!booking) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking Confirmed!</h2>
          <Link to="/dashboard" className="btn-primary">View My Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-lg"
      >
        {/* Success Animation */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/30"
          >
            <span className="text-4xl">✓</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-black text-gray-900 dark:text-white"
          >
            Booking Confirmed! 🎉
          </motion.h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Your ticket has been booked successfully. Check your email for details.
          </p>
        </div>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card overflow-hidden"
        >
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 text-sm">Booking ID</p>
                <p className="font-mono font-bold text-lg">{booking.bookingId}</p>
              </div>
              <span className="px-3 py-1 bg-green-400 text-green-900 rounded-full text-xs font-bold">
                ✓ CONFIRMED
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {booking.event?.title}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">Date</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1">
                  <FiCalendar className="text-primary-500" />
                  {formatDate(booking.event?.date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Time</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{booking.event?.time}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Venue</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1">
                  <FiMapPin className="text-primary-500" />
                  {booking.event?.venue?.city}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Ticket Type</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{booking.ticketType?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Quantity</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{booking.quantity} ticket(s)</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Amount Paid</p>
                <p className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(booking.totalAmount)}</p>
              </div>
            </div>

            {/* Dashed Divider */}
            <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700 my-6 relative">
              <div className="absolute -left-8 -top-3 w-6 h-6 bg-gray-50 dark:bg-gray-950 rounded-full" />
              <div className="absolute -right-8 -top-3 w-6 h-6 bg-gray-50 dark:bg-gray-950 rounded-full" />
            </div>

            {/* QR Code */}
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                🎟️ Your Entry QR Code
              </p>
              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                {booking.qrCodeData ? (
                  <QRCodeSVG
                    value={booking.qrCodeData}
                    size={180}
                    level="H"
                    includeMargin={true}
                    fgColor="#1a1a2e"
                  />
                ) : booking.qrCode ? (
                  <img src={booking.qrCode} alt="QR Code" className="w-44 h-44" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-gray-400">
                    <p className="text-sm">QR code will be sent via email</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">Show this QR code at the venue for entry</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-3 mt-6"
        >
          {/* Certificate button — only for today's and future events */}
          {booking && isEligibleForCertificate && (
            <button
              onClick={handleDownloadCertificate}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-amber-500/30 disabled:opacity-60 disabled:hover:scale-100"
            >
              {downloading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Certificate...
                </span>
              ) : (
                <><FiAward className="text-xl" /> Download Participation Certificate</>
              )}
            </button>
          )}

          <div className="flex gap-3">
            <Link to="/" className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
              <FiHome /> Home
            </Link>
            <Link to="/dashboard" className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
              <FiList /> My Bookings
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
