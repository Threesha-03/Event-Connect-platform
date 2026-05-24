const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create review
// @route   POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user attended the event
    const booking = await Booking.findOne({
      user: req.user._id,
      event: eventId,
      status: { $in: ['confirmed', 'attended'] },
    });

    const existingReview = await Review.findOne({ user: req.user._id, event: eventId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this event' });
    }

    const review = await Review.create({
      user: req.user._id,
      event: eventId,
      rating,
      comment,
      isVerifiedAttendee: !!booking,
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, message: 'Review submitted', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event reviews
// @route   GET /api/reviews/event/:eventId
exports.getEventReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Review.countDocuments({ event: req.params.eventId });
    const reviews = await Review.find({ event: req.params.eventId })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      reviews,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
