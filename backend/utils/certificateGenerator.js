const PDFDocument = require('pdfkit');

/**
 * Generates a Certificate of Participation PDF for any event
 */
const generateCertificate = (booking, event, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = doc.page.width;   // 841.89
      const H = doc.page.height;  // 595.28

      // ── Background ──────────────────────────────────────────
      doc.rect(0, 0, W, H).fill('#0f0c29');

      // Top & bottom purple bars
      doc.rect(0, 0, W, 10).fill('#7c3aed');
      doc.rect(0, H - 10, W, 10).fill('#7c3aed');

      // Left & right bars
      doc.rect(0, 0, 10, H).fill('#7c3aed');
      doc.rect(W - 10, 0, 10, H).fill('#7c3aed');

      // Inner decorative border
      doc
        .rect(28, 28, W - 56, H - 56)
        .lineWidth(1)
        .stroke('#4c1d95');

      // Corner accent diamonds
      const corners = [[28, 28], [W - 28, 28], [28, H - 28], [W - 28, H - 28]];
      corners.forEach(([x, y]) => {
        doc.circle(x, y, 5).fill('#ec4899');
      });

      // Subtle background pattern — small dots grid
      doc.fillColor('#1e1b4b').opacity(0.4);
      for (let x = 60; x < W - 60; x += 40) {
        for (let y = 60; y < H - 60; y += 40) {
          doc.circle(x, y, 1).fill('#7c3aed');
        }
      }
      doc.opacity(1);

      // ── Header ───────────────────────────────────────────────
      // EventFlow logo text
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#a78bfa')
        .text('E V E N T F L O W', 0, 48, { align: 'center', characterSpacing: 6 });

      // Thin divider line
      doc
        .moveTo(W / 2 - 60, 66)
        .lineTo(W / 2 + 60, 66)
        .lineWidth(0.5)
        .stroke('#4c1d95');

      // Main title
      doc
        .fontSize(38)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text('CERTIFICATE', 0, 76, { align: 'center', characterSpacing: 10 });

      doc
        .fontSize(15)
        .font('Helvetica')
        .fillColor('#c4b5fd')
        .text('O F   P A R T I C I P A T I O N', 0, 122, { align: 'center', characterSpacing: 5 });

      // Decorative divider with diamond
      const divY = 152;
      doc.moveTo(W / 2 - 140, divY).lineTo(W / 2 - 18, divY).lineWidth(0.8).stroke('#7c3aed');
      doc.rect(W / 2 - 7, divY - 7, 14, 14).rotate(45, { origin: [W / 2, divY] }).fill('#ec4899');
      doc.rotate(-45, { origin: [W / 2, divY] }); // reset
      doc.moveTo(W / 2 + 18, divY).lineTo(W / 2 + 140, divY).lineWidth(0.8).stroke('#7c3aed');

      // ── Body ─────────────────────────────────────────────────
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text('This is to proudly certify that', 0, 168, { align: 'center' });

      // Attendee name — large and prominent
      const attendeeName = user.name || booking.attendeeDetails?.name || 'Participant';
      doc
        .fontSize(44)
        .font('Helvetica-Bold')
        .fillColor('#f8fafc')
        .text(attendeeName, 80, 188, { align: 'center', width: W - 160 });

      // Name underline
      const nameTextWidth = Math.min(attendeeName.length * 24, 420);
      doc
        .moveTo(W / 2 - nameTextWidth / 2, 248)
        .lineTo(W / 2 + nameTextWidth / 2, 248)
        .lineWidth(1.5)
        .stroke('#7c3aed');

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text('has successfully participated in', 0, 260, { align: 'center' });

      // Event name
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#a78bfa')
        .text(event.title, 80, 280, { align: 'center', width: W - 160 });

      // Event details row
      const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      const location = event.venue?.city ? `${event.venue.city}, India` : 'India';

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`📅  ${eventDate}     📍  ${location}     🎫  ${event.category}`, 0, 322, { align: 'center' });

      // ── Footer ───────────────────────────────────────────────
      const footerY = H - 115;

      // Left signature — Organizer
      doc.moveTo(90, footerY).lineTo(270, footerY).lineWidth(0.8).stroke('#334155');
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#e2e8f0')
        .text(event.organizerName || 'Event Organizer', 90, footerY + 7, { width: 180, align: 'center' });
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Event Organizer', 90, footerY + 21, { width: 180, align: 'center' });

      // Center seal
      const sealX = W / 2;
      const sealY = footerY + 12;
      doc.circle(sealX, sealY, 36).lineWidth(2).stroke('#7c3aed');
      doc.circle(sealX, sealY, 29).lineWidth(1).stroke('#4c1d95');
      doc
        .fontSize(7)
        .font('Helvetica-Bold')
        .fillColor('#a78bfa')
        .text('CERTIFICATE', sealX - 24, sealY - 10, { width: 48, align: 'center' });
      doc
        .fontSize(6)
        .fillColor('#7c3aed')
        .text('OF PARTICIPATION', sealX - 24, sealY, { width: 48, align: 'center' });
      doc
        .fontSize(6)
        .fillColor('#ec4899')
        .text('EVENTFLOW', sealX - 24, sealY + 10, { width: 48, align: 'center' });

      // Right signature — EventFlow
      doc.moveTo(W - 270, footerY).lineTo(W - 90, footerY).lineWidth(0.8).stroke('#334155');
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#e2e8f0')
        .text('EventFlow Platform', W - 270, footerY + 7, { width: 180, align: 'center' });
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Authorized Issuer', W - 270, footerY + 21, { width: 180, align: 'center' });

      // Certificate ID at very bottom
      const certId = `CERT-${booking.bookingId}`;
      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#1e293b')
        .text(`Certificate ID: ${certId}  ·  Issued by EventFlow  ·  ${new Date().toLocaleDateString('en-IN')}`, 0, H - 28, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateCertificate };
