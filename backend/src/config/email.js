const nodemailer = require('nodemailer');

/**
 * Nodemailer transporter using Gmail SMTP.
 *
 * Setup:
 * 1. Use your business Gmail: e.g., [EMAIL_ADDRESS]
 * 2. Enable 2-Factor Authentication on that Gmail account
 * 3. Go to Google Account → Security → App Passwords
 * 4. Create an App Password for "Mail" → copy the 16-char code
 * 5. Paste it as EMAIL_APP_PASSWORD in your .env file
 *
 * This approach is safe — it uses an app-specific password,
 * not your main account password.
 */
const getTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,         // e.g., geniustailors110@gmail.com
      pass: process.env.EMAIL_APP_PASSWORD  // 16-char Gmail App Password
    },
    tls: {
      // do not fail on invalid certs in shared hosting environments
      rejectUnauthorized: false
    }
  });
};

// ── Helper: status update email messages ────────────────────────────────────
const statusMessages = {
  Cutting: {
    subject: '✂️ Your order has started — Genius Tailors',
    heading: 'We\'ve Started Cutting Your Garment!',
    body: 'Your tailor has begun working on your order. The fabric is being cut to your exact measurements.'
  },
  Stitching: {
    subject: '🪡 Stitching in progress — Genius Tailors',
    heading: 'Stitching is Underway!',
    body: 'Your garment is now being stitched with care. We\'re putting the finishing touches on your order.'
  },
  Ready: {
    subject: '🎉 Your order is ready for pickup — Genius Tailors',
    heading: 'Your Order is Ready!',
    body: 'Great news! Your garment has been completed and is ready for pickup from our shop.'
  },
  Delivered: {
    subject: '✅ Order delivered — Genius Tailors',
    heading: 'Order Delivered. Thank You!',
    body: 'Your order has been marked as delivered. Thank you for choosing Genius Tailors, Hyderabad. We hope to serve you again!'
  }
};

// ── Email 1: Order Status Update Notification ───────────────────────────────
const sendStatusUpdateEmail = async (customerEmail, customerName, serviceName, status, estimatedDelivery) => {
  const msg = statusMessages[status];
  if (!msg) return; // Don't send email for Pending or Cancelled status changes

  const deliveryLine = estimatedDelivery
    ? `<p style="color:#555;">📅 <strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>`
    : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffd700; margin: 0; font-size: 22px;">✂️ Genius Tailors</h1>
        <p style="color: #ccc; margin: 4px 0 0 0; font-size: 13px;">Hyderabad, Pakistan</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1a1a2e;">${msg.heading}</h2>
        <p style="color: #333;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555;">${msg.body}</p>
        <div style="background: #f9f9f9; border-left: 4px solid #ffd700; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333;"><strong>Service:</strong> ${serviceName}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Status:</strong> <span style="color: #27ae60;">${status}</span></p>
          ${deliveryLine}
        </div>
        <p style="color: #777; font-size: 13px;">For any queries, feel free to contact us at your nearest visit or reply to this email or whatsapp at 03332662110 or 03243041248.</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Genius Tailors, Hyderabad. All rights reserved.</p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Genius Tailors" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: msg.subject,
    html
  });
};

// ── Email 2: Password Reset ──────────────────────────────────────────────────
const sendPasswordResetEmail = async (customerEmail, customerName, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffd700; margin: 0; font-size: 22px;">✂️ Genius Tailors</h1>
        <p style="color: #ccc; margin: 4px 0 0 0; font-size: 13px;">Hyderabad, Pakistan</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1a1a2e;">Password Reset Request</h2>
        <p style="color: #333;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #ffd700; color: #1a1a2e; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset My Password</a>
        </div>
        <p style="color: #777; font-size: 13px; word-break: break-all; margin-bottom: 24px;">
          If the button doesn't work, click or copy-paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
        </p>
        <p style="color: #999; font-size: 13px;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Genius Tailors, Hyderabad. All rights reserved.</p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Genius Tailors" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: '🔑 Reset your password — Genius Tailors',
    html
  });
};

// ── Email 3: Order Confirmation ──────────────────────────────────────────────
const sendOrderConfirmationEmail = async (customerEmail, customerName, serviceName, totalPrice, orderId) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffd700; margin: 0; font-size: 22px;">✂️ Genius Tailors</h1>
        <p style="color: #ccc; margin: 4px 0 0 0; font-size: 13px;">Hyderabad, Pakistan</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1a1a2e;">Order Confirmed! 🎉</h2>
        <p style="color: #333;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555;">Your order has been placed successfully. Our tailor will review it and begin working shortly.</p>
        <div style="background: #f9f9f9; border-left: 4px solid #ffd700; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333;"><strong>Garment:</strong> ${serviceName}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Total Price:</strong> Rs. ${totalPrice.toLocaleString()}</p>
          <p style="margin: 8px 0 0 0; color: #777; font-size: 13px;">Order ID: ${orderId}</p>
        </div>
        <p style="color: #555;">You will receive an email notification each time your order status is updated. You can also track your order from your dashboard.</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Genius Tailors, Hyderabad. All rights reserved.</p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Genius Tailors" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `✅ Order Confirmed — ${serviceName} | Genius Tailors`,
    html
  });
};

// ── Email 4: Contact Us Form ────────────────────────────────────────────────
const sendContactEmail = async (name, email, subject, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffd700; margin: 0; font-size: 22px;">New Contact Message</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333;">You have received a new message from the contact form on your website.</p>
        <div style="background: #f9f9f9; border-left: 4px solid #ffd700; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Subject:</strong> ${subject}</p>
        </div>
        <p style="color: #1a1a2e; font-weight: bold; margin-bottom: 4px;">Message:</p>
        <p style="color: #555; background: #fff; padding: 12px; border: 1px solid #eee; border-radius: 4px; white-space: pre-wrap;">${message}</p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"GT Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `[Contact Form] ${subject}`,
    html
  });
};

// ── Email 5: Admin New Order Notification ────────────────────────────────────
const sendAdminNewOrderNotification = async (customerName, serviceName, totalPrice, orderId, isPriority, isRush, paymentReceiptUrl = '') => {
  const adminEmail = 'geniustailors110@gmail.com';
  
  const priorityBadge = isRush ? '<span style="background: #e74c3c; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 8px;">Rush</span>' : '';
  const VIPBadge = isPriority ? '<span style="background: #f1c40f; color: #333; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 8px;">VIP/Gold Member</span>' : '';
  const baseUrl = process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'https://geniustailors.vercel.app' : 'https://geniustailors.vercel.app'; // Enforce production URL

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffd700; margin: 0; font-size: 22px;">New Order Received! 🛍️</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333;">Hello Admin,</p>
        <p style="color: #555;">A new order has just been placed on the Genius Tailors system.</p>
        <div style="background: #f9f9f9; border-left: 4px solid #27ae60; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333;"><strong>Customer:</strong> ${customerName} ${VIPBadge}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Garment:</strong> ${serviceName} ${priorityBadge}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Total Price:</strong> Rs. ${totalPrice.toLocaleString()}</p>
          <p style="margin: 8px 0 0 0; color: #777; font-size: 13px;">Order ID: ${orderId}</p>
          ${paymentReceiptUrl ? `
            <div style="margin-top: 16px; border-top: 1px solid #eee; padding-top: 16px;">
              <p style="margin: 0 0 8px 0; color: #333;"><strong>Payment Receipt:</strong></p>
              <div style="text-align: center;">
                <img src="${paymentReceiptUrl}" alt="Payment Receipt" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid #ccc; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
              </div>
              <p style="margin: 8px 0 0 0; font-size: 13px; text-align: center;"><a href="${paymentReceiptUrl}" target="_blank" style="color: #2980b9;">Open Receipt in New Tab</a></p>
            </div>
          ` : ''}
        </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${baseUrl}/admin/orders/${orderId}" style="background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin-bottom: 12px;">View Order in Dashboard</a>
            <p style="font-size: 14px; color: #666;">Or use this direct link: <a href="${baseUrl}/admin/orders/${orderId}" style="color: #2980b9;">Admin Panel</a></p>
          </div>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"GT System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🚨 New Order Alert! [${serviceName}] from ${customerName}`,
    html
  });
};

// ── Email 6: Account Creation Notification ──────────────────────────────────
const sendAccountCreationEmail = async (customerEmail, customerName, rawPassword) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffd700; margin: 0; font-size: 22px;">✂️ Genius Tailors</h1>
        <p style="color: #ccc; margin: 4px 0 0 0; font-size: 13px;">Welcome to our digital platform!</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1a1a2e;">Your Account is Ready 🎉</h2>
        <p style="color: #333;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555;">Our staff has successfully created your digital account. You can now log in to track your orders, view your measurement profiles, and easily place new orders online!</p>
        <div style="background: #f9f9f9; border-left: 4px solid #ffd700; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333;"><strong>Email:</strong> ${customerEmail}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Temporary Password:</strong> ${rawPassword}</p>
        </div>
        <p style="color: #999; font-size: 13px;">For your security, we strongly recommend changing your password from your profile settings after you log in.</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Genius Tailors, Hyderabad. All rights reserved.</p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Genius Tailors" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `🎉 Welcome to Genius Tailors - Your Account Details`,
    html
  });
};

// ── Email 7: Promo Code Campaign ─────────────────────────────────────────────
const sendPromoEmail = async (customerEmail, customerName, promoCode, discountText, minSpend, expiryDate) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffd700; margin: 0; font-size: 22px;">✂️ Exclusive Offer for You!</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1a1a2e;">A Special Gift from Genius Tailors 🎉</h2>
        <p style="color: #333;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555;">We have generated a special discount code just for you! Use the code below during your next order to claim your discount.</p>
        <div style="background: #f9f9f9; border-left: 4px solid #ffd700; padding: 16px; margin: 20px 0; border-radius: 4px; text-align: center;">
          <p style="margin: 0; color: #1a1a2e; font-size: 24px; font-weight: 900; letter-spacing: 2px;">${promoCode}</p>
          <p style="margin: 8px 0 0 0; color: #27ae60; font-weight: bold;">${discountText}</p>
          ${minSpend > 0 ? `<p style="margin: 4px 0 0 0; color: #777; font-size: 13px;">Minimum Spend: Rs. ${minSpend}</p>` : ''}
          ${expiryDate ? `<p style="margin: 4px 0 0 0; color: #e74c3c; font-size: 13px;">Valid until: ${new Date(expiryDate).toLocaleDateString()}</p>` : ''}
        </div>
        <p style="color: #999; font-size: 13px;">You can apply this code at checkout. Don't wait, book your custom tailored fit today!</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Genius Tailors, Hyderabad. All rights reserved.</p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Genius Tailors" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `🎁 A special gift for you: ${promoCode}`,
    html
  });
};

// ── Email 8: Admin Abandoned Cart Alert ───────────────────────────────────────
const sendAdminAbandonedCartEmail = async (customerName, serviceName, totalPrice, dropoffStep) => {
  const adminEmail = 'geniustailors110@gmail.com';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #e74c3c; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🚨 Abandoned Cart Alert</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333;">Hello Admin,</p>
        <p style="color: #555;">A customer just left the checkout process without completing their order. Don't lose this sale!</p>
        <div style="background: #fdf2f2; border-left: 4px solid #c0392b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333;"><strong>Customer:</strong> ${customerName}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Garment:</strong> ${serviceName}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Lost Value:</strong> Rs. ${totalPrice.toLocaleString()}</p>
          <p style="margin: 8px 0 0 0; color: #e74c3c; font-weight: bold;"><strong>Dropped Off At:</strong> ${dropoffStep}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <p style="font-size: 14px; color: #666;">Check your Admin Panel to send a quick WhatsApp recovery message.</p>
        </div>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"GT System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🛒 Abandoned Cart Alert! [${serviceName}]`,
    html
  });
};

module.exports = { sendStatusUpdateEmail, sendPasswordResetEmail, sendOrderConfirmationEmail, sendContactEmail, sendAdminNewOrderNotification, sendAccountCreationEmail, sendPromoEmail, sendAdminAbandonedCartEmail };
