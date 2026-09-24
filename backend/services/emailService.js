const nodemailer = require('nodemailer');

// Create Transporter
const getTransporter = () => {
  if (
    process.env.EMAIL_USER &&
    process.env.EMAIL_USER !== 'your_smtp_user' &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_PASS !== 'your_smtp_password'
  ) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '2525'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
};

/**
 * Send an email notification.
 * Falls back gracefully to console logs if transporter is not set up.
 */
async function sendEmail({ to, subject, text, html }) {
  const fromEmail = process.env.EMAIL_FROM || 'noreply@rentmatefinder.in';

  console.log('\n======================================================');
  console.log(`📧 EMAIL SENDING SIMULATION`);
  console.log(`From: ${fromEmail}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Text: ${text}`);
  console.log('======================================================\n');

  try {
    const transporter = getTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"RentMate Finder" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`✓ Real email sent successfully: ${info.messageId}`);
      return true;
    } else {
      console.log('ℹ Real SMTP credentials not provided. Simulating email completion.');
      return true;
    }
  } catch (error) {
    console.error('⚠️ Email sending failed:', error.message);
    // Return true since we handled it gracefully and we don't want to crash the request
    return false;
  }
}

/**
 * Notify owner of high-compatibility interest (score > 80)
 */
async function notifyOwnerOfInterest(owner, tenant, listing, score) {
  const subject = `🔥 High Match Tenant Interested in Your Room! (Score: ${score}%)`;
  const text = `Hi ${owner.name},\n\nTenant ${tenant.name} has shown interest in your listing at ${listing.address}, ${listing.location}.\n\nAI Compatibility Score: ${score}%\n\nPlease log in to RentMate Finder to review this request and start a chat.\n\nBest,\nRentMate Finder Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px;">
      <h2 style="color: #6366f1;">High Match Tenant Interested!</h2>
      <p>Hi <strong>${owner.name}</strong>,</p>
      <p>Tenant <strong>${tenant.name}</strong> has shown interest in your room listing at:</p>
      <blockquote style="background: #f9fafb; padding: 10px; border-left: 4px solid #6366f1; margin: 10px 0;">
        ${listing.address}, <strong>${listing.location}</strong>
      </blockquote>
      <div style="background: #e0e7ff; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: center;">
        <span style="font-size: 18px; font-weight: bold; color: #4338ca;">AI Compatibility Score: ${score}%</span>
      </div>
      <p>Please log in to your dashboard to accept/decline the request and chat with them in real time.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">RentMate Finder India | Professional Flatmate Finder</p>
    </div>
  `;

  return await sendEmail({ to: owner.email, subject, text, html });
}

/**
 * Notify tenant when owner accepts request
 */
async function notifyTenantOfAcceptance(tenant, owner, listing) {
  const subject = `🎉 Match Approved! Owner ${owner.name} Accepted Your Request`;
  const text = `Hi ${tenant.name},\n\nGreat news! Owner ${owner.name} has accepted your interest request for the room listing at ${listing.address}, ${listing.location}.\n\nReal-time chat is now unlocked. Log in to start chatting with ${owner.name} now!\n\nBest,\nRentMate Finder Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px;">
      <h2 style="color: #10b981;">Interest Request Accepted!</h2>
      <p>Hi <strong>${tenant.name}</strong>,</p>
      <p>Great news! The owner <strong>${owner.name}</strong> has accepted your interest request for the room listing at:</p>
      <blockquote style="background: #f9fafb; padding: 10px; border-left: 4px solid #10b981; margin: 10px 0;">
        ${listing.address}, <strong>${listing.location}</strong>
      </blockquote>
      <p><strong>Real-time chat is now unlocked!</strong> Go to your dashboard to connect with the owner directly.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">RentMate Finder India | Professional Flatmate Finder</p>
    </div>
  `;

  return await sendEmail({ to: tenant.email, subject, text, html });
}

/**
 * Notify tenant when owner declines request
 */
async function notifyTenantOfDecline(tenant, owner, listing) {
  const subject = `Update on your Room Request - RentMate Finder`;
  const text = `Hi ${tenant.name},\n\nWe wanted to let you know that owner ${owner.name} has declined your interest request for the listing at ${listing.address}, ${listing.location}.\n\nDon't worry, there are plenty of other options available on RentMate Finder! Keep exploring.\n\nBest,\nRentMate Finder Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 600px;">
      <h2 style="color: #ef4444;">Listing Request Update</h2>
      <p>Hi <strong>${tenant.name}</strong>,</p>
      <p>We want to let you know that the owner <strong>${owner.name}</strong> has declined your interest request for the listing at:</p>
      <blockquote style="background: #f9fafb; padding: 10px; border-left: 4px solid #ef4444; margin: 10px 0;">
        ${listing.address}, <strong>${listing.location}</strong>
      </blockquote>
      <p>Don't worry, there are many other matching listings waiting for you. Keep browsing!</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">RentMate Finder India | Professional Flatmate Finder</p>
    </div>
  `;

  return await sendEmail({ to: tenant.email, subject, text, html });
}

module.exports = {
  sendEmail,
  notifyOwnerOfInterest,
  notifyTenantOfAcceptance,
  notifyTenantOfDecline,
};
