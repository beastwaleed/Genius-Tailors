const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Helper function to send email via Resend (HTTP) or NodeMailer (SMTP)
const sendEmail = async ({ to, subject, html, replyTo, fromName = "Genius Tailors" }) => {
  try {
    // OPTION 2: Use Resend HTTP API (Bypasses cPanel Firewall)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY.trim());
      
      // Resend requires verified domain emails. 
      // Replace info@geniustailors.com with the email you verify in Resend
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@geniustailors.com';
      
      const payload = {
        from: `${fromName} <${fromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo || process.env.EMAIL_USER || 'geniustailors110@gmail.com'
      };

      const { data, error } = await resend.emails.send(payload);
      if (error) throw new Error(error.message);
      return data;
    } 
    
    // OPTION 1: Fallback to NodeMailer (Local testing or if SMTP is somehow unblocked)
    const safePass = process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.replace(/['"]/g, '').trim() : 'ccscwamdquwizimb';
    const safeUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/['"]/g, '').trim() : 'geniustailors110@gmail.com';

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      auth: {
        user: safeUser,         
        pass: safePass  
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    return await transporter.sendMail({
      from: `"${fromName}" <${safeUser}>`,
      to,
      subject,
      html,
      replyTo: replyTo || safeUser
    });
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
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

  let reviewSnippet = '';
  if (status === 'Delivered') {
    const reviewUrl = `${process.env.FRONTEND_URL || 'https://geniustailors.com'}/reviews`;
    reviewSnippet = `
      <div style="background: #fdfbf7; border: 1px solid #f1c40f; padding: 16px; margin: 24px 0; border-radius: 6px; text-align: center;">
        <h3 style="color: #1a1a2e; margin: 0 0 8px 0;">We'd love your feedback!</h3>
        <p style="color: #555; margin: 0 0 16px 0;">Leave a review and earn 5 Loyalty Points.</p>
        <a href="${reviewUrl}" style="display: inline-block; background: #1a1a2e; color: #ffd700; padding: 10px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Write a Review</a>
      </div>
    `;
  }

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
        ${reviewSnippet}
        <p style="color: #777; font-size: 13px;">For any queries, feel free to contact us at your nearest visit or reply to this email or whatsapp at 03332662110 or 03243041248.</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Genius Tailors, Hyderabad. All rights reserved.</p>
      </div>
    </div>
  `;

  await sendEmail({
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

  await sendEmail({
    to: customerEmail,
    subject: '🔑 Reset your password — Genius Tailors',
    html
  });
};

// ── Email 3: Order Confirmation ──────────────────────────────────────────────
const sendOrderConfirmationEmail = async (customerEmail, customerName, serviceName, totalPrice, orderId) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://geniustailors.com';
  const orderUrl = `${baseUrl}/my-orders/${orderId}`;
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
        <div style="text-align: center; margin: 32px 0;">
          <a href="${orderUrl}" style="display: inline-block; background: #ffd700; color: #1a1a2e; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Preview Your Order</a>
        </div>
        <p style="color: #555;">You will receive an email notification each time your order status is updated. You can also track your order from your dashboard.</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Genius Tailors, Hyderabad. All rights reserved.</p>
      </div>
    </div>
  `;

  await sendEmail({
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

  await sendEmail({
    fromName: "GT Website",
    to: process.env.EMAIL_USER || 'geniustailors110@gmail.com',
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
  const baseUrl = process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'https://geniustailors.com' : 'https://geniustailors.com'; // Enforce production URL

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

  await sendEmail({
    fromName: "GT System",
    to: adminEmail,
    subject: `🚨 New Order Alert! [${serviceName}] from ${customerName}`,
    html
  });
};

// ── Email 6: Account Creation Notification ──────────────────────────────────
const sendAccountCreationEmail = async (customerEmail, customerName, rawPassword) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://geniustailors.com';
  const loginUrl = `${baseUrl}/login`;
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
          <p style="margin: 0; color: #333;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Email:</strong> ${customerEmail}</p>
          <p style="margin: 8px 0 0 0; color: #333;"><strong>Temporary Password:</strong> ${rawPassword}</p>
        </div>
        <p style="color: #999; font-size: 13px;">For your security, we strongly recommend changing your password from your profile settings after you log in.</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Genius Tailors, Hyderabad. All rights reserved.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `🎉 Welcome to Genius Tailors - Your Account Details`,
    html
  });
};

// ── Email 7: Welcome Email (Self-Registration) ──────────────────────────────
const sendWelcomeEmail = async (customerEmail, customerName) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://geniustailors.com';
  const orderPageUrl = `${baseUrl}/services`;
  const dashboardUrl = `${baseUrl}/my-orders`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffd700; margin: 0; font-size: 24px; letter-spacing: 1px;">GENIUS TAILORS</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1a1a2e; margin-top: 0;">Welcome to Genius Tailors! 🎉</h2>
        <p style="color: #333;">Dear <strong>${customerName}</strong>,</p>
        <p style="color: #555;">Thank you for creating an account with us. You can now easily track your tailored orders, manage your measurement profiles, and experience premium tailoring from the comfort of your home.</p>
        
        <div style="background: #fdfbf7; border: 1px solid #f1c40f; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
          <h3 style="color: #1a1a2e; margin: 0 0 10px 0;">Get 10% off on your first order!</h3>
          <p style="color: #555; margin: 0 0 16px 0;">Start your bespoke journey today.</p>
          <a href="${orderPageUrl}" style="display: inline-block; background: #1a1a2e; color: #ffd700; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Place Your Order</a>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #ffd700; color: #1a1a2e; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Go to My Dashboard</a>
        </div>
        <p style="color: #555;">We look forward to serving you with the perfect fit!</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #777; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Genius Tailors. All rights reserved.</p>
      </div>
    </div>
  `;

  await sendEmail({
    fromName: "Genius Tailors",
    to: customerEmail,
    subject: "Welcome to Genius Tailors! 🎉",
    html
  });
};

// ── Email 8: Promo Code Campaign ─────────────────────────────────────────────
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

  await sendEmail({
    to: customerEmail,
    subject: `🎁 A special gift for you: ${promoCode}`,
    html
  });
};

// ── Email 9: Admin Abandoned Cart Alert ───────────────────────────────────────
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

  await sendEmail({
    fromName: "GT System",
    to: adminEmail,
    subject: `🛒 Abandoned Cart Alert! [${serviceName}]`,
    html
  });
};

module.exports = { 
  sendStatusUpdateEmail, 
  sendPasswordResetEmail, 
  sendOrderConfirmationEmail, 
  sendContactEmail, 
  sendAdminNewOrderNotification, 
  sendAccountCreationEmail, 
  sendWelcomeEmail,
  sendPromoEmail, 
  sendAdminAbandonedCartEmail 
};
