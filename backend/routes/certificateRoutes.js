const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const { generateCertificate } = require('../utils/certificateGenerator');

// @desc    Download certificate for ANY confirmed booking
// @route   GET /api/certificates/:bookingId
router.get('/:bookingId', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('event')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only the ticket holder can download
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Must be confirmed or attended
    if (!['confirmed', 'attended'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Certificate is only available after booking is confirmed',
      });
    }

    // Certificate only available for events from today onwards (not past events)
    const eventDate = new Date(booking.event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Certificate is not available for past events',
      });
    }

    // Generate PDF
    const pdfBuffer = await generateCertificate(booking, booking.event, booking.user);

    // Mark as generated
    booking.certificateGenerated = true;
    await booking.save();

    const filename = `Certificate-${booking.event.title.replace(/[^a-zA-Z0-9]/g, '-')}-${booking.user.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    next(error);
  }
});

module.exports = router;
