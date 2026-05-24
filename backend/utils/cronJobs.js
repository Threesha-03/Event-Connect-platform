const cron = require('node-cron');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendEventReminder } = require('./emailService');

// Run every day at 9 AM - send reminders for events happening tomorrow
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running event reminder cron job...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const upcomingEvents = await Event.find({
      date: { $gte: tomorrow, $lt: dayAfter },
      status: 'published',
    });

    for (const event of upcomingEvents) {
      const bookings = await Booking.find({
        event: event._id,
        status: 'confirmed',
        reminderSent: false,
      }).populate('user', 'name email');

      for (const booking of bookings) {
        try {
          await sendEventReminder(booking, event, booking.user);
          booking.reminderSent = true;
          await booking.save();
          console.log(`✅ Reminder sent to ${booking.user.email} for ${event.title}`);
        } catch (err) {
          console.error(`❌ Failed to send reminder: ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
});

console.log('✅ Cron jobs initialized');
