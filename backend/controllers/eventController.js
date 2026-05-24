const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// @desc    Get all events with filters
// @route   GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, category, city, minPrice, maxPrice,
      date, search, sort = '-createdAt', status = 'published',
      featured, trending,
    } = req.query;

    const query = { status };

    if (category && category !== 'All') query.category = category;
    if (city) query['venue.city'] = { $regex: city, $options: 'i' };
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { 'venue.city': { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query['ticketTypes.price'] = {};
      if (minPrice) query['ticketTypes.price'].$gte = Number(minPrice);
      if (maxPrice) query['ticketTypes.price'].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      events,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar phone');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const eventData = { ...req.body, organizer: req.user._id };

    if (req.file) {
      eventData.poster = `/uploads/${req.file.filename}`;
    }

    // Parse JSON fields if sent as strings
    if (typeof eventData.ticketTypes === 'string') {
      eventData.ticketTypes = JSON.parse(eventData.ticketTypes);
    }
    if (typeof eventData.venue === 'string') {
      eventData.venue = JSON.parse(eventData.venue);
    }
    // Tags: handle both comma-separated string and JSON array
    if (typeof eventData.tags === 'string') {
      try {
        eventData.tags = JSON.parse(eventData.tags);
      } catch {
        // Plain comma-separated string like "Jazz, Live, Music"
        eventData.tags = eventData.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    // Set availableSeats = totalSeats for new tickets
    if (eventData.ticketTypes) {
      eventData.ticketTypes = eventData.ticketTypes.map(t => ({
        ...t,
        availableSeats: t.availableSeats ?? t.totalSeats,
      }));
    }

    eventData.organizerName = req.user.name;
    eventData.organizerEmail = req.user.email;

    const event = await Event.create(eventData);
    res.status(201).json({ success: true, message: 'Event created successfully', event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Only organizer or admin can update
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    const updateData = { ...req.body };
    if (req.file) updateData.poster = `/uploads/${req.file.filename}`;
    if (typeof updateData.ticketTypes === 'string') updateData.ticketTypes = JSON.parse(updateData.ticketTypes);
    if (typeof updateData.venue === 'string') updateData.venue = JSON.parse(updateData.venue);
    if (typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch {
        updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: 'Event updated successfully', event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending events
// @route   GET /api/events/trending
exports.getTrendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'published', isTrending: true })
      .populate('organizer', 'name avatar')
      .sort('-totalBookings')
      .limit(8);
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
exports.getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'published', isFeatured: true })
      .populate('organizer', 'name avatar')
      .sort('-createdAt')
      .limit(6);
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
exports.getUpcomingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'published', date: { $gte: new Date() } })
      .populate('organizer', 'name avatar')
      .sort('date')
      .limit(12);
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};
