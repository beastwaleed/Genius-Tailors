const axios = require('axios');

/**
 * Custom WhatsApp Microservice API
 * 
 * Setup:
 * 1. Run the separate `whatsapp-microservice` Node.js server.
 * 2. Add these to your backend/.env file:
 *    WHATSAPP_MICROSERVICE_URL=http://localhost:3005
 *    WHATSAPP_MICROSERVICE_KEY=gt-super-secret-key-123
 */

const sendWhatsappMessage = async (toPhone, message) => {
  const baseUrl = process.env.WHATSAPP_MICROSERVICE_URL || 'http://localhost:3005';
  const apiKey = process.env.WHATSAPP_MICROSERVICE_KEY || 'gt-super-secret-key-123';

  try {
    const url = `${baseUrl}/send`;
    
    await axios.post(url, {
      to: toPhone,
      message: message
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });

    console.log(`WhatsApp message successfully queued to ${toPhone} via custom microservice`);
  } catch (error) {
    console.error('WhatsApp Microservice sending failed:', error.response?.data || error.message);
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

const sendRecoveryWhatsapp = async (customerPhone, customerName) => {
  const message = `*Genius Tailors* ✂️\n\nHi ${customerName}! 👋\n\nWe noticed you left something behind during your recent visit to our website. Can we help you complete your tailored fit?\n\nIf you have any questions about measurements or fabric, feel free to ask us here!`;
  await sendWhatsappMessage(customerPhone, message);
};

const sendAdminAbandonedCartWhatsapp = async (customerName, serviceName, totalPrice, dropoffStep) => {
  const adminPhone = '+923332662110';
  const message = `🚨 *Abandoned Cart Alert* 🚨\n\nA customer just abandoned their checkout process!\n\n*Customer:* ${customerName}\n*Garment:* ${serviceName}\n*Value:* Rs. ${totalPrice.toLocaleString()}\n*Dropped Off At:* ${dropoffStep}\n\nCheck your Admin Panel to recover this cart!`;
  await sendWhatsappMessage(adminPhone, message);
};

const sendAdminNewOrderWhatsapp = async (customerName, serviceName, totalPrice, orderId, paymentReceiptUrl) => {
  // Using the correct admin phone number
  const adminPhone = '+923332662110'; 
  
  let message = `*🔔 New Order Alert!*\n\n`;
  message += `*Customer:* ${customerName}\n`;
  message += `*Service:* ${serviceName}\n`;
  message += `*Total Amount:* Rs. ${totalPrice.toLocaleString()}\n\n`;
  
  if (paymentReceiptUrl) {
    message += `*Payment Receipt:* ${paymentReceiptUrl}\n\n`;
  }
  
  message += `*Admin Order Link:*\n`;
  message += `${process.env.FRONTEND_URL || 'https://geniustailors.vercel.app/'}admin/orders/${orderId}\n\n`;
  message += `Please check the dashboard to verify the payment and approve the order.`;

  await sendWhatsappMessage(adminPhone, message);
};

module.exports = { sendWhatsappOrderConfirmation, sendWhatsappStatusUpdate, sendWhatsappAccountCreation, sendPromoWhatsapp, sendRecoveryWhatsapp, sendAdminAbandonedCartWhatsapp, sendAdminNewOrderWhatsapp };
