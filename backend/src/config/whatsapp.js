const axios = require('axios');

/**
 * Ultramsg WhatsApp API Configuration
 * 
 * Setup:
 * 1. Go to https://ultramsg.com/ and create a free trial account.
 * 2. Scan the QR code with your actual WhatsApp phone to link it.
 * 3. Copy your "Instance ID" and "Token" from the dashboard.
 * 4. Add these to your backend/.env file:
 *    ULTRAMSG_INSTANCE_ID=instance12345
 *    ULTRAMSG_TOKEN=your_ultramsg_token_here
 */

// Ensure the phone number format is E.164 compatible for WhatsApp
const formatPhoneForUltramsg = (phone) => {
  let formatted = phone.trim();
  // Remove any non-numeric characters except +
  formatted = formatted.replace(/[^\d+]/g, '');
  
  // If it starts with 0, assume Pakistan prefix (+92)
  if (formatted.startsWith('0')) {
    formatted = '+92' + formatted.substring(1);
  } else if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  
  return formatted;
};

const sendWhatsappMessage = async (toPhone, message) => {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;

  if (!instanceId || !token) {
    console.warn('Ultramsg not configured. Skipping WhatsApp message.');
    return;
  }

  const to = formatPhoneForUltramsg(toPhone);

  try {
    // Ultramsg API endpoint for sending a text message
    const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
    
    // Convert data to URL encoded format for Ultramsg
    const data = new URLSearchParams();
    data.append('token', token);
    data.append('to', to);
    data.append('body', message);

    await axios.post(url, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log(`WhatsApp message sent to ${to} via Ultramsg`);
  } catch (error) {
    console.error('Ultramsg sending failed:', error.response?.data || error.message);
  }
};

const sendWhatsappOrderConfirmation = async (customerPhone, customerName, serviceName, totalPrice, orderId) => {
  const message = `*Genius Tailors* ✂️\n\nHello ${customerName}! 🎉\n\nYour order has been placed successfully. Our tailor will review it and begin working shortly.\n\n*Garment:* ${serviceName}\n*Total Price:* Rs. ${totalPrice.toLocaleString()}\n*Order ID:* ${orderId}\n\nYou will receive a message here whenever your order status is updated!`;
  
  await sendWhatsappMessage(customerPhone, message);
};

const sendWhatsappStatusUpdate = async (customerPhone, customerName, serviceName, status, estimatedDelivery) => {
  let statusMsg = '';
  switch (status) {
    case 'Cutting':
      statusMsg = "We've started cutting your garment! ✂️";
      break;
    case 'Stitching':
      statusMsg = 'Stitching is underway! 🪡';
      break;
    case 'Ready':
      statusMsg = 'Great news! Your order is ready for pickup! 🎉';
      break;
    case 'Delivered':
      statusMsg = 'Your order has been delivered. Thank you for choosing Genius Tailors! ✅';
      break;
    default:
      return; // Don't send for Pending/Cancelled
  }

  let message = `*Genius Tailors Update* ✂️\n\nDear ${customerName},\n\n${statusMsg}\n\n*Service:* ${serviceName}\n*Status:* ${status}`;
  
  if (estimatedDelivery) {
    const delDate = new Date(estimatedDelivery).toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' });
    message += `\n*Estimated Delivery:* ${delDate}`;
  }

  await sendWhatsappMessage(customerPhone, message);
};

const sendWhatsappAccountCreation = async (customerPhone, customerName, email, rawPassword) => {
  const message = `*Genius Tailors* ✂️\n\nWelcome ${customerName}! 🎉\n\nYour account has been created successfully by our staff.\n\nYou can now log in to your dashboard to track your orders, view measurements, and place new orders online.\n\n*Email:* ${email}\n*Password:* ${rawPassword}\n\nFor your security, please change your password after your first login.`;
  await sendWhatsappMessage(customerPhone, message);
};

const sendPromoWhatsapp = async (customerPhone, customerName, promoCode, discountText, minSpend, expiryDate) => {
  let message = `*Exclusive Offer from Genius Tailors!* ✂️🎉\n\nHi ${customerName},\n\nWe have a special discount just for you! Use the promo code *${promoCode}* to get *${discountText}* on your next order.\n\n`;
  if (minSpend > 0) message += `*Minimum Spend:* Rs. ${minSpend}\n`;
  if (expiryDate) message += `*Valid Until:* ${new Date(expiryDate).toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' })}\n\n`;
  message += `Book your tailored fit today!`;
  
  await sendWhatsappMessage(customerPhone, message);
};

module.exports = { sendWhatsappOrderConfirmation, sendWhatsappStatusUpdate, sendWhatsappAccountCreation, sendPromoWhatsapp };
