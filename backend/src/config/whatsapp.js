const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

let waSocket = null;

const initWhatsApp = async () => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'silent' }), // Suppress excessive logs
            defaultQueryTimeoutMs: undefined
        });

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('\n\n======================================================');
                console.log('📱 SCAN THIS QR CODE IN WHATSAPP TO LINK YOUR BOT 📱');
                console.log('======================================================\n\n');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('WhatsApp connection closed. Reconnecting:', shouldReconnect);
                if (shouldReconnect) {
                    initWhatsApp();
                } else {
                    console.log('You logged out of WhatsApp. You must scan the QR code again.');
                    fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
                    initWhatsApp();
                }
            } else if (connection === 'open') {
                console.log('WhatsApp connection opened successfully!');
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        waSocket = sock;
    } catch (error) {
        console.error('Failed to initialize WhatsApp:', error);
    }
};

const sendWhatsappMessage = async (toPhone, message) => {
    if (!waSocket) {
        console.error('WhatsApp socket is not initialized');
        return;
    }

    try {
        // Format phone number: remove '+' and spaces
        let cleanPhone = toPhone.replace(/[\+\s\-]/g, '');
        
        // Pakistani numbers must include country code (e.g., 923332662110). If local format (0333...), convert it:
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '92' + cleanPhone.substring(1);
        }

        const jid = `${cleanPhone}@s.whatsapp.net`;
        
        // Wait briefly to ensure socket is ready
        await waSocket.waitForConnectionUpdate((update) => update.connection === 'open' || waSocket.user);
        
        // Check if number is on WhatsApp
        const [result] = await waSocket.onWhatsApp(jid);
        if (result && result.exists) {
            await waSocket.sendMessage(jid, { text: message });
            console.log(`WhatsApp message sent to ${cleanPhone}`);
        } else {
            console.log(`Phone number ${cleanPhone} is not registered on WhatsApp.`);
        }
    } catch (error) {
        console.error('Failed to send WhatsApp message via Baileys:', error);
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
      return; 
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

const sendWhatsappPasswordReset = async (customerPhone, customerName, resetUrl) => {
  const message = `*Genius Tailors Security* 🔐\n\nHi ${customerName},\n\nWe received a request to reset your password. Please click the secure link below to create a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this message.`;
  await sendWhatsappMessage(customerPhone, message);
};

module.exports = { initWhatsApp, sendWhatsappOrderConfirmation, sendWhatsappStatusUpdate, sendWhatsappAccountCreation, sendPromoWhatsapp, sendRecoveryWhatsapp, sendAdminAbandonedCartWhatsapp, sendAdminNewOrderWhatsapp, sendWhatsappPasswordReset };
