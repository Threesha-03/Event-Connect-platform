const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const QRCode = require('qrcode');
const { sendBookingConfirmation } = require('../utils/emailService');

// @desc    Create booking (after payment)
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, ticketTypeIndex, quantity, attendeeDetails } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Event is not available for booking' });
    }

    const ticketType = event.ticketTypes[ticketTypeIndex];
    if (!ticketType) {
      return res.status(400).json({ success: false, message: 'Invalid ticket type' });
    }

    if (ticketType.availableSeats < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough seats available' });
    }

    const totalAmount = ticketType.price * quantity;

    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      ticketType: { name: ticketType.name, price: ticketType.price },
      quantity,
      totalAmount,
      status: ticketType.price === 0 ? 'confirmed' : 'pending',
      paymentStatus: ticketType.price === 0 ? 'paid' : 'pending',
      attendeeDetails: attendeeDetails || {
        name: req.user.name,
        email: req.user.email,
      },
    });

    // Reduce available seats
    event.ticketTypes[ticketTypeIndex].availableSeats -= quantity;
    event.totalBookings += quantity;
    await event.save();

    // Generate QR code for free events immediately
    if (ticketType.price === 0) {
      await generateAndSaveQR(booking);
      try {
        await sendBookingConfirmation(booking, event, req.user);
      } catch (emailErr) {
        console.error('Email error:', emailErr.message);
      }
    }

    res.status(201).json({ success: true, message: 'Booking initiated', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking after payment
// @route   PUT /api/bookings/:id/confirm
exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';

    // Generate QR code
    await generateAndSaveQR(booking);
    await booking.save();

    // Send confirmation email
    try {
      await sendBookingConfirmation(booking, booking.event, booking.user);
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.json({ success: true, message: 'Booking confirmed', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('event', 'title poster date time venue category isWorkshop')
      .populate('paymentId')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      bookings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title poster date time venue category isWorkshop organizer organizerName')
      .populate('user', 'name email phone')
      .populate('paymentId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only owner or admin can view
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    // Restore seats
    const event = await Event.findById(booking.event._id);
    if (event) {
      const ticketIdx = event.ticketTypes.findIndex(t => t.name === booking.ticketType.name);
      if (ticketIdx !== -1) {
        event.ticketTypes[ticketIdx].availableSeats += booking.quantity;
        event.totalBookings = Math.max(0, event.totalBookings - booking.quantity);
        await event.save();
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate QR code (Admin)
// @route   POST /api/bookings/validate-qr
exports.validateQR = async (req, res, next) => {
  try {
    let { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    // Handle full QR JSON data
    if (bookingId.startsWith('{')) {
      try {
        const parsed = JSON.parse(bookingId);
        bookingId = parsed.bookingId;
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid QR code format' });
      }
    }

    bookingId = bookingId.trim();

    const booking = await Booking.findOne({ bookingId })
      .populate('event', 'title date time venue')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: `No booking found with ID: ${bookingId}` });
    }

    if (booking.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: `Already checked in at ${new Date(booking.checkedInAt).toLocaleTimeString()}`,
        checkedInAt: booking.checkedInAt,
      });
    }

    if (!['confirmed', 'paid'].includes(booking.status) && booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in — booking status is "${booking.status}"`,
      });
    }

    booking.isCheckedIn = true;
    booking.checkedInAt = new Date();
    booking.status = 'attended';
    await booking.save();

    res.json({ success: true, message: 'Check-in successful', booking });
  } catch (error) {
    next(error);
  }
};

// Helper: Generate and save QR code
async function generateAndSaveQR(booking) {
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    eventId: booking.event._id || booking.event,
    userId: booking.user._id || booking.user,
    quantity: booking.quantity,
  });

  const qrCodeBase64 = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });

  booking.qrCode = qrCodeBase64;
  booking.qrCodeData = qrData;
  await booking.save();
  return qrCodeBase64;
}
