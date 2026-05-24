const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Event = require('../models/Event');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventflow');
    console.log('✅ MongoDB Connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventflow.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210',
    });

    // Create regular users
    const users = await User.create([
      { name: 'Rahul Sharma', email: 'rahul@example.com', password: 'user123', phone: '+91 9876543211' },
      { name: 'Priya Patel', email: 'priya@example.com', password: 'user123', phone: '+91 9876543212' },
      { name: 'Amit Kumar', email: 'amit@example.com', password: 'user123', phone: '+91 9876543213' },
    ]);

    console.log('👥 Users created');

    // Create events
    const events = [
      {
        title: 'Sunburn Festival 2024',
        description: 'Asia\'s biggest electronic dance music festival returns with world-class DJs, stunning light shows, and an unforgettable experience. Join thousands of music lovers for 3 days of non-stop music, art installations, and incredible performances.',
        category: 'Music',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '4:00 PM',
        endTime: '11:00 PM',
        venue: {
          name: 'Vagator Beach',
          address: 'Vagator Beach Road',
          city: 'Goa',
          state: 'Goa',
          country: 'India',
          latitude: 15.6007,
          longitude: 73.7443,
        },
        ticketTypes: [
          { name: 'General', price: 1999, totalSeats: 500, availableSeats: 500, description: 'General admission' },
          { name: 'VIP', price: 4999, totalSeats: 100, availableSeats: 100, description: 'VIP lounge access + complimentary drinks' },
          { name: 'Platinum', price: 9999, totalSeats: 50, availableSeats: 50, description: 'Backstage access + meet & greet' },
        ],
        poster: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        organizer: admin._id,
        organizerName: admin.name,
        organizerEmail: admin.email,
        tags: ['EDM', 'Festival', 'Music', 'Dance'],
        isFeatured: true,
        isTrending: true,
        totalBookings: 245,
        averageRating: 4.8,
        totalReviews: 89,
      },
      {
        title: 'TechSummit India 2024',
        description: 'The premier technology conference bringing together India\'s top tech leaders, innovators, and entrepreneurs. Featuring keynotes from industry giants, hands-on workshops, networking sessions, and the latest in AI, blockchain, and cloud computing.',
        category: 'Technology',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: '9:00 AM',
        endTime: '6:00 PM',
        venue: {
          name: 'Bangalore International Exhibition Centre',
          address: '10th Mile, Tumkur Road',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          latitude: 13.0827,
          longitude: 77.5877,
        },
        ticketTypes: [
          { name: 'Standard', price: 2999, totalSeats: 300, availableSeats: 300, description: 'Conference access + lunch' },
          { name: 'Premium', price: 5999, totalSeats: 100, availableSeats: 100, description: 'All sessions + workshops + networking dinner' },
        ],
        poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        organizer: admin._id,
        organizerName: admin.name,
        organizerEmail: admin.email,
        tags: ['Tech', 'AI', 'Innovation', 'Startup'],
        isFeatured: true,
        isTrending: true,
        totalBookings: 178,
        averageRating: 4.6,
        totalReviews: 56,
      },
      {
        title: 'IPL Watch Party - Mumbai vs Chennai',
        description: 'Watch the biggest cricket rivalry live on giant screens with fellow fans! Enjoy the match with food, drinks, and an electric atmosphere. Special commentary, contests, and prizes throughout the event.',
        category: 'Sports',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        time: '7:30 PM',
        endTime: '11:30 PM',
        venue: {
          name: 'Phoenix Palladium',
          address: 'Senapati Bapat Marg, Lower Parel',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          latitude: 19.0760,
          longitude: 72.8777,
        },
        ticketTypes: [
          { name: 'General', price: 499, totalSeats: 200, availableSeats: 200, description: 'General seating' },
          { name: 'Premium', price: 999, totalSeats: 50, availableSeats: 50, description: 'Premium seating + food voucher' },
        ],
        poster: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
        organizer: admin._id,
        organizerName: admin.name,
        organizerEmail: admin.email,
        tags: ['Cricket', 'IPL', 'Sports', 'Watch Party'],
        isTrending: true,
        totalBookings: 89,
        averageRating: 4.5,
        totalReviews: 34,
      },
      {
        title: 'React & Node.js Masterclass Workshop',
        description: 'An intensive 2-day workshop covering advanced React patterns, Node.js microservices, MongoDB optimization, and deployment strategies. Perfect for developers looking to level up their full-stack skills.',
        category: 'Workshop',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        endTime: '5:00 PM',
        venue: {
          name: 'IIT Delhi Innovation Hub',
          address: 'Hauz Khas',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          latitude: 28.6139,
          longitude: 77.2090,
        },
        ticketTypes: [
          { name: 'Early Bird', price: 1499, totalSeats: 30, availableSeats: 30, description: 'Limited early bird seats' },
          { name: 'Regular', price: 2499, totalSeats: 50, availableSeats: 50, description: 'Regular admission + certificate' },
        ],
        poster: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800',
        organizer: admin._id,
        organizerName: admin.name,
        organizerEmail: admin.email,
        tags: ['React', 'Node.js', 'Workshop', 'Coding'],
        isFeatured: true,
        isWorkshop: true,
        totalBookings: 45,
        averageRating: 4.9,
        totalReviews: 23,
      },
      {
        title: 'Zakir Khan Live - Haq Se Single',
        description: 'India\'s most beloved stand-up comedian Zakir Khan is back with his brand new show! Expect relatable stories, hilarious observations, and the signature "Sakht Launda" humor that has won millions of hearts.',
        category: 'Comedy',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        time: '8:00 PM',
        endTime: '10:30 PM',
        venue: {
          name: 'Nehru Centre Auditorium',
          address: 'Dr. Annie Besant Road, Worli',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          latitude: 19.0176,
          longitude: 72.8562,
        },
        ticketTypes: [
          { name: 'Balcony', price: 799, totalSeats: 150, availableSeats: 150, description: 'Balcony seating' },
          { name: 'Stalls', price: 1299, totalSeats: 100, availableSeats: 100, description: 'Stalls seating' },
          { name: 'Front Row', price: 2499, totalSeats: 30, availableSeats: 30, description: 'Front row premium seats' },
        ],
        poster: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800',
        organizer: admin._id,
        organizerName: admin.name,
        organizerEmail: admin.email,
        tags: ['Comedy', 'Stand-up', 'Live Show'],
        isTrending: true,
        totalBookings: 167,
        averageRating: 4.9,
        totalReviews: 78,
      },
      {
        title: 'Startup Pitch Night - Season 5',
        description: 'Watch 10 promising startups pitch their ideas to a panel of top investors and industry experts. Network with entrepreneurs, investors, and innovators. The winning startup gets ₹10 Lakh in seed funding!',
        category: 'Business',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        time: '6:00 PM',
        endTime: '10:00 PM',
        venue: {
          name: 'WeWork Galaxy',
          address: '43, Residency Road',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          latitude: 12.9716,
          longitude: 77.5946,
        },
        ticketTypes: [
          { name: 'Free Pass', price: 0, totalSeats: 100, availableSeats: 100, description: 'Free entry - register now' },
          { name: 'Investor Pass', price: 4999, totalSeats: 20, availableSeats: 20, description: 'Exclusive investor networking + dinner' },
        ],
        poster: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
        organizer: admin._id,
        organizerName: admin.name,
        organizerEmail: admin.email,
        tags: ['Startup', 'Business', 'Networking', 'Investment'],
        isFeatured: true,
        totalBookings: 67,
        averageRating: 4.4,
        totalReviews: 29,
      },
      {
        title: 'Arijit Singh Live Concert',
        description: 'Experience the magic of Arijit Singh live! India\'s most loved playback singer performs his greatest hits in an intimate concert setting. From Tum Hi Ho to Kesariya, relive your favorite Bollywood moments.',
        category: 'Music',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        time: '7:00 PM',
        endTime: '11:00 PM',
        venue: {
          name: 'NSCI Dome',
          address: 'Worli Sports Club, Dr. Annie Besant Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          latitude: 19.0144,
          longitude: 72.8479,
        },
        ticketTypes: [
          { name: 'Silver', price: 2999, totalSeats: 500, availableSeats: 500, description: 'Silver zone' },
          { name: 'Gold', price: 5999, totalSeats: 200, availableSeats: 200, description: 'Gold zone - closer to stage' },
          { name: 'Platinum', price: 9999, totalSeats: 50, availableSeats: 50, description: 'Platinum - front stage' },
        ],
        poster: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        organizer: admin._id,
        organizerName: admin.name,
        organizerEmail: admin.email,
        tags: ['Bollywood', 'Music', 'Concert', 'Live'],
        isFeatured: true,
        isTrending: true,
        totalBookings: 389,
        averageRating: 4.9,
        totalReviews: 145,
      },
      {
        title: 'Food & Culture Festival',
        description: 'A celebration of India\'s diverse culinary heritage! Over 100 food stalls from across India, live cooking demonstrations by celebrity chefs, cultural performances, and food competitions. Bring your appetite!',
        category: 'Food',
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        time: '11:00 AM',
        endTime: '9:00 PM',
        venue: {
          name: 'Jawaharlal Nehru Stadium',
          address: 'Bhishma Pitamah Marg',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          latitude: 28.5665,
          longitude: 77.2431,
        },
        ticketTypes: [
          { name: 'Day Pass', price: 299, totalSeats: 1000, availableSeats: 1000, description: 'Full day access' },
          { name: 'Weekend Pass', price: 499, totalSeats: 500, availableSeats: 500, description: 'Both days access' },
        ],
        poster: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        organizer: admin._id,
        organizerName: admin.name,
        organizerEmail: admin.email,
        tags: ['Food', 'Culture', 'Festival', 'Cuisine'],
        isTrending: true,
        totalBookings: 234,
        averageRating: 4.6,
        totalReviews: 98,
      },
    ];

    await Event.create(events);
    console.log('🎉 Events created');

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@eventflow.com / admin123');
    console.log('User:  rahul@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
