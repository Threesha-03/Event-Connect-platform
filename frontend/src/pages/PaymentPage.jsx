import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { verifyPayment } from '../store/slices/bookingSlice';
import { formatCurrency } from '../utils/helpers';
import { FiLock, FiCreditCard, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate('/dashboard');
      return;
    }
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, [orderData, navigate]);

  const handlePayment = () => {
    if (!orderData) return;
    setLoading(true);

    const options = {
      key: orderData.key,
      amount: orderData.order.amount,
      currency: orderData.currency || 'INR',
      name: 'EventFlow',
      description: orderData.eventTitle,
      order_id: orderData.order.id,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      theme: { color: '#7c3aed' },
      handler: async (response) => {
        try {
          const result = await dispatch(verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: orderData.booking.bookingId,
          }));

          if (verifyPayment.fulfilled.match(result)) {
            navigate('/payment/success', { state: { booking: result.payload.booking } });
          }
        } catch {
          toast.error('Payment verification failed');
        } finally {
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          toast.error('Payment cancelled');
        },
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      toast.error('Payment gateway not loaded. Please refresh.');
      setLoading(false);
    }
  };

  if (!orderData) return null;

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiCreditCard className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Complete Payment</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Secure payment powered by Razorpay</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{orderData.eventTitle}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Booking ID</span>
                <span className="font-mono">{orderData.booking?.bookingId}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Ticket Type</span>
                <span>{orderData.booking?.ticketType?.name}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Quantity</span>
                <span>{orderData.booking?.quantity}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 text-base">
                <span>Total Amount</span>
                <span className="text-primary-600 dark:text-primary-400">{formatCurrency(orderData.amount)}</span>
              </div>
            </div>
          </div>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-6 mb-6 text-xs text-gray-400">
            <span className="flex items-center gap-1"><FiLock className="text-green-500" /> SSL Secured</span>
            <span className="flex items-center gap-1"><FiShield className="text-blue-500" /> PCI Compliant</span>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary w-full py-4 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Opening Payment...
              </span>
            ) : (
              `Pay ${formatCurrency(orderData.amount)} Securely`
            )}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full mt-3 py-3 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
