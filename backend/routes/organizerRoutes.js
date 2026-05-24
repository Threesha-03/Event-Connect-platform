const express = require('express');
const router = express.Router();
const { protect, organizerOrAdmin } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc  Become an organizer (self-upgrade)
// @route POST /api/organizer/become
router.post('/become', protect, async (req, res, next) => {
  try {
    const { bio, website } = req.body;
    const user = await User.findById(req.user._id);

    if (user.role === 'organizer' || user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Already an organizer' });
    }

    user.role = 'organizer';
    user.organizerProfile = {
      bio: bio || '',
      website: website || '',
      verified: false,
    };
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'You are now an organizer! 🎉', user });
  } catch (error) {
    next(error);
  }
});

// @desc  Get organizer's own events
// @route GET /api/organizer/events
router.get('/events', protect, organizerOrAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 12, status } = req.query;
    const query = { organizer: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      events,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

// @desc  Get bookings for organizer's events
// @route GET /api/organizer/bookings
router.get('/bookings', protect, organizerOrAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, eventId } = req.query;

    // Get all events owned by this organizer
    const myEvents = await Event.find({ organizer: req.user._id }).select('_id');
    const myEventIds = myEvents.map(e => e._id);

    const query = { event: { $in: myEventIds } };
    if (eventId) query.event = eventId;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('event', 'title date time venue')
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
});

// @desc  Get organizer dashboard stats
// @route GET /api/organizer/stats
router.get('/stats', protect, organizerOrAdmin, async (req, res, next) => {
  try {
    const myEvents = await Event.find({ organizer: req.user._id }).select('_id title totalBookings averageRating');
    const myEventIds = myEvents.map(e => e._id);

    const [totalBookings, confirmedBookings, totalEvents, activeEvents] = await Promise.all([
      Booking.countDocuments({ event: { $in: myEventIds } }),
      Booking.countDocuments({ event: { $in: myEventIds }, status: 'confirmed' }),
      Event.countDocuments({ organizer: req.user._id }),
      Event.countDocuments({ organizer: req.user._id, status: 'published', date: { $gte: new Date() } }),
    ]);

    // Revenue from confirmed bookings
    const revenueData = await Booking.aggregate([
      { $match: { event: { $in: myEventIds }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const recentBookings = await Booking.find({ event: { $in: myEventIds } })
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalEvents,
        activeEvents,
        totalBookings,
        confirmedBookings,
        totalRevenue: revenueData[0]?.total || 0,
      },
      myEvents,
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
});

// @desc  Validate QR for organizer's event
// @route POST /api/organizer/validate-qr
router.post('/validate-qr', protect, organizerOrAdmin, async (req, res, next) => {
  try {
    let { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    // Handle QR code JSON data — extract bookingId if full JSON was pasted
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
      .populate('event', 'title date time venue organizer')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: `No booking found with ID: ${bookingId}` });
    }

    // Check this event belongs to the organizer (admins can check any)
    if (req.user.role !== 'admin' && booking.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'This ticket is not for your event' });
    }

    // Already checked in
    if (booking.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: `Already checked in at ${new Date(booking.checkedInAt).toLocaleTimeString()}`,
        booking,
      });
    }

    // Must be confirmed or paid to check in
    if (!['confirmed', 'paid'].includes(booking.status) && booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in — booking status is "${booking.status}"`,
      });
    }

    // Mark as checked in
    booking.isCheckedIn = true;
    booking.checkedInAt = new Date();
    booking.status = 'attended';
    await booking.save();

    res.json({
      success: true,
      message: '✅ Check-in successful!',
      booking,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
