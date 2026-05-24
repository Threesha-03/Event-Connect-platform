const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    default: '',
  },
  isVerifiedAttendee: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// One review per user per event
reviewSchema.index({ user: 1, event: 1 }, { unique: true });

// Update event average rating after review save
reviewSchema.post('save', async function () {
  const Event = mongoose.model('Event');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { event: this.event } },
    { $group: { _id: '$event', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Event.findByIdAndUpdate(this.event, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
