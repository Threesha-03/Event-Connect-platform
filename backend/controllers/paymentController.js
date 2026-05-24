const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');

const isRazorpayConfigured = () => {
  const key = process.env.RAZORPAY_KEY_ID || '';
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  return key && !key.includes('placeholder') && secret && !secret.includes('placeholder');
};

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Helper: generate QR and confirm booking
const confirmBookingWithQR = async (booking) => {
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    eventId: booking.event._id || booking.event,
    userId: booking.user._id || booking.user,
    quantity: booking.quantity,
  });
  booking.qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
  booking.qrCodeData = qrData;
  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  await booking.save();
  return booking;
};

// @desc    Create Razorpay order (or confirm free booking directly)
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { eventId, ticketTypeIndex, quantity, attendeeDetails } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const ticketType = event.ticketTypes[ticketTypeIndex];
    if (!ticketType) {
      return res.status(400).json({ success: false, message: 'Invalid ticket type' });
    }

    if (ticketType.availableSeats < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough seats available' });
    }

    const totalAmount = ticketType.price * quantity;

    // ── FREE EVENT: confirm immediately, no payment needed ──
    if (totalAmount === 0) {
      const booking = await Booking.create({
        user: req.user._id,
        event: eventId,
        ticketType: { name: ticketType.name, price: 0 },
        quantity,
        totalAmount: 0,
        status: 'confirmed',
        paymentStatus: 'paid',
        attendeeDetails: attendeeDetails || { name: req.user.name, email: req.user.email },
      });

      // Reduce seats
      event.ticketTypes[ticketTypeIndex].availableSeats -= quantity;
      event.totalBookings += quantity;
      await event.save();

      // Generate QR
      const qrData = JSON.stringify({
        bookingId: booking.bookingId,
        eventId: event._id,
        userId: req.user._id,
        quantity,
      });
      booking.qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
      booking.qrCodeData = qrData;
      await booking.save();

      // Send email
      try {
        const { sendBookingConfirmation } = require('../utils/emailService');
        await sendBookingConfirmation(booking, event, req.user);
      } catch (e) { console.error('Email error:', e.message); }

      return res.json({
        success: true,
        free: true,
        booking,
        amount: 0,
        eventTitle: event.title,
      });
    }

    // ── PAID EVENT: check Razorpay is configured ──
    if (!isRazorpayConfigured()) {
      // TEST MODE: auto-confirm booking without payment
      console.log('⚠️  Razorpay not configured — auto-confirming booking in test mode');

      const booking = await Booking.create({
        user: req.user._id,
        event: eventId,
        ticketType: { name: ticketType.name, price: ticketType.price },
        quantity,
        totalAmount,
        status: 'confirmed',
        paymentStatus: 'paid',
        attendeeDetails: attendeeDetails || { name: req.user.name, email: req.user.email },
      });

      // Reduce seats
      event.ticketTypes[ticketTypeIndex].availableSeats -= quantity;
      event.totalBookings += quantity;
      await event.save();

      // Generate QR
      const qrData = JSON.stringify({
        bookingId: booking.bookingId,
        eventId: event._id,
        userId: req.user._id,
        quantity,
      });
      booking.qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
      booking.qrCodeData = qrData;
      await booking.save();

      try {
        const { sendBookingConfirmation } = require('../utils/emailService');
        await sendBookingConfirmation(booking, event, req.user);
      } catch (e) { console.error('Email error:', e.message); }

      return res.json({
        success: true,
        free: true,
        testMode: true,
        booking,
        amount: totalAmount,
        eventTitle: event.title,
      });
    }

    // Create booking in pending state
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      ticketType: { name: ticketType.name, price: ticketType.price },
      quantity,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      attendeeDetails: attendeeDetails || { name: req.user.name, email: req.user.email },
    });

    // Create Razorpay order
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: 'INR',
      receipt: booking.bookingId,
      notes: {
        bookingId: booking.bookingId,
        eventTitle: event.title,
        userId: req.user._id.toString(),
      },
    });

    // Save payment record
    const payment = await Payment.create({
      user: req.user._id,
      booking: booking._id,
      razorpayOrderId: order.id,
      amount: totalAmount,
      currency: 'INR',
      description: `Ticket for ${event.title}`,
    });

    booking.paymentId = payment._id;
    await booking.save();

    res.json({
      success: true,
      free: false,
      order,
      booking,
      key: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
      currency: 'INR',
      eventTitle: event.title,
    });
  } catch (error) {
    console.error('Payment createOrder error:', error.message);
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'paid' },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Confirm booking + generate QR
    const booking = await Booking.findById(payment.booking)
      .populate('event')
      .populate('user', 'name email');

    if (booking) {
      await confirmBookingWithQR(booking);

      // Update available seats
      const event = await Event.findById(booking.event._id);
      if (event) {
        const idx = event.ticketTypes.findIndex(t => t.name === booking.ticketType.name);
        if (idx !== -1) {
          event.ticketTypes[idx].availableSeats -= booking.quantity;
          event.totalBookings += booking.quantity;
          await event.save();
        }
      }

      // Send confirmation email
      try {
        const { sendBookingConfirmation } = require('../utils/emailService');
        await sendBookingConfirmation(booking, booking.event, booking.user);
      } catch (e) { console.error('Email error:', e.message); }
    }

    res.json({ success: true, message: 'Payment verified successfully', payment, booking });
  } catch (error) {
    console.error('Payment verify error:', error.message);
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({ path: 'booking', populate: { path: 'event', select: 'title poster date venue' } })
      .sort('-createdAt');
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};
