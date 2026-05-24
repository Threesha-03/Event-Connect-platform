const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Music', 'Technology', 'Sports', 'Arts', 'Food', 'Business', 'Education', 'Workshop', 'Comedy', 'Other'],
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
  },
  endDate: {
    type: Date,
  },
  endTime: {
    type: String,
  },
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  ticketTypes: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
  }],
  poster: {
    type: String,
    default: '',
  },
  images: [{ type: String }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizerName: { type: String, default: '' },
  organizerEmail: { type: String, default: '' },
  organizerPhone: { type: String, default: '' },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published',
  },
  totalBookings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isWorkshop: { type: Boolean, default: false },
}, { timestamps: true });

// Index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ 'venue.city': 1, category: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
