const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📧 Email not configured, skipping:', subject);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `EventFlow <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

exports.sendBookingConfirmation = async (booking, event, user) => {
  const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0; opacity: 0.9; }
        .body { padding: 32px; }
        .ticket { background: #f8f9ff; border: 2px dashed #667eea; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .ticket-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .ticket-label { color: #666; font-size: 14px; }
        .ticket-value { font-weight: 600; color: #1a1a2e; }
        .qr-section { text-align: center; margin: 24px 0; }
        .qr-section img { width: 200px; height: 200px; border: 4px solid #667eea; border-radius: 12px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
        .footer { background: #f8f9ff; padding: 24px; text-align: center; color: #666; font-size: 13px; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Your ticket is ready. See you at the event!</p>
        </div>
        <div class="body">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your booking for <strong>${event.title}</strong> has been confirmed. Here are your ticket details:</p>
          
          <div class="ticket">
            <div class="ticket-row">
              <span class="ticket-label">Booking ID</span>
              <span class="ticket-value">${booking.bookingId}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Event</span>
              <span class="ticket-value">${event.title}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Date</span>
              <span class="ticket-value">${eventDate}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Time</span>
              <span class="ticket-value">${event.time}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Venue</span>
              <span class="ticket-value">${event.venue?.name}, ${event.venue?.city}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Ticket Type</span>
              <span class="ticket-value">${booking.ticketType?.name}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Quantity</span>
              <span class="ticket-value">${booking.quantity}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Total Paid</span>
              <span class="ticket-value">₹${booking.totalAmount}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Status</span>
              <span class="badge">✓ Confirmed</span>
            </div>
          </div>

          ${booking.qrCode ? `
          <div class="qr-section">
            <p><strong>Your Entry QR Code</strong></p>
            <img src="${booking.qrCode}" alt="QR Code" />
            <p style="color: #666; font-size: 13px;">Show this QR code at the venue for entry</p>
          </div>
          ` : ''}

          <p>📍 <strong>Venue:</strong> ${event.venue?.address}, ${event.venue?.city}</p>
          <p>⏰ Please arrive 15 minutes before the event starts.</p>
        </div>
        <div class="footer">
          <p>© 2024 EventFlow. All rights reserved.</p>
          <p>If you have any questions, contact us at support@eventflow.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: `🎟️ Booking Confirmed - ${event.title}`,
    html,
  });
};

exports.sendEventReminder = async (booking, event, user) => {
  const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; color: white; }
        .body { padding: 32px; }
        .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .footer { background: #f8f9ff; padding: 24px; text-align: center; color: #666; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Event Reminder!</h1>
          <p>Your event is tomorrow!</p>
        </div>
        <div class="body">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>This is a reminder that you have an upcoming event tomorrow!</p>
          <div class="info-box">
            <h3 style="margin: 0 0 8px;">📅 ${event.title}</h3>
            <p style="margin: 4px 0;">📆 ${eventDate} at ${event.time}</p>
            <p style="margin: 4px 0;">📍 ${event.venue?.name}, ${event.venue?.city}</p>
            <p style="margin: 4px 0;">🎟️ Booking ID: ${booking.bookingId}</p>
          </div>
          <p>Don't forget to bring your QR code ticket for entry!</p>
        </div>
        <div class="footer">
          <p>© 2024 EventFlow. See you there! 🎉</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: `⏰ Reminder: ${event.title} is Tomorrow!`,
    html,
  });
};
