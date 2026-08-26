const { default: makeWASocket, fetchLatestBaileysVersion, Browsers, initAuthCreds, BufferJSON, proto, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

let waSocket = null;
let currentQR = null;
let isConnected = false;
let messageQueue = [];
let waInitError = null;
let isInitializing = false;
let waLogs = [];

function addWALog(msg) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${msg}`;
    console.log(entry);
    waLogs.push(entry);
    if (waLogs.length > 35) waLogs.shift();
}

// Single-file auth state to prevent CloudLinux multi-file I/O locks & 503 crashes
const useSingleAuthState = (filePath) => {
    let creds;
    let keys = {};
    if (fs.existsSync(filePath)) {
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(raw, BufferJSON.reviver);
            creds = parsed.creds || initAuthCreds();
            keys = parsed.keys || {};
        } catch (e) {
            creds = initAuthCreds();
        }
    } else {
        creds = initAuthCreds();
    }

    const save = () => {
        try {
            const content = JSON.stringify({ creds, keys }, BufferJSON.replacer, 2);
            fs.writeFileSync(filePath, content);
        } catch (err) {
            console.error('Failed to save auth state:', err);
        }
    };

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const data = {};
                    for (const id of ids) {
                        let value = keys[`${type}-${id}`];
                        if (value) {
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        }
                    }
                    return data;
                },
                set: (data) => {
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                keys[key] = value;
                            } else {
                                delete keys[key];
                            }
                        }
                    }
                    save();
                }
            }
        },
        saveCreds: save
    };
};

const initWhatsApp = async (forceClean = false) => {
    if (isInitializing && !forceClean) {
        addWALog('initWhatsApp skipped: initialization already in progress');
        return;
    }

    try {
        addWALog('Starting initWhatsApp...');
        const authFilePath = path.join(__dirname, '../../auth_single.json');
        const authFolder = path.join(__dirname, '../../auth_info_baileys');
        
        if (forceClean) {
            addWALog('Force clean requested: resetting session...');
            if (waSocket) {
                try { waSocket.end(new Error('Clean restart')); } catch(e){}
                waSocket = null;
            }
            if (fs.existsSync(authFilePath)) {
                try { fs.unlinkSync(authFilePath); } catch(e){}
            }
            if (fs.existsSync(authFolder)) {
                try { fs.rmSync(authFolder, { recursive: true, force: true }); } catch(e){}
            }
            currentQR = null;
            isConnected = false;
        }

        if (waSocket && (isConnected || currentQR)) {
            addWALog(`Socket active. isConnected=${isConnected}, hasQR=${!!currentQR}`);
            return;
        }

        isInitializing = true;
        addWALog('Loading single-file auth state...');
        const { state, saveCreds } = useSingleAuthState(authFilePath);

        let waVersion = [2, 3000, 1015901307];
        try {
            const fetchedVer = await fetchLatestBaileysVersion();
            waVersion = fetchedVer.version;
            addWALog(`Fetched latest WhatsApp Web version: ${waVersion.join('.')}`);
        } catch (verErr) {
            addWALog(`Using default WhatsApp Web version: ${waVersion.join('.')}`);
        }

        addWALog('Creating WASocket instance with Ubuntu Chrome signature...');
        const sock = makeWASocket({
            version: waVersion,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu('Chrome'),
            syncFullHistory: false,
            generateHighQualityLinkPreview: false,
            markOnlineOnConnect: true,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 25000
        });

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                addWALog('✅ Live QR Code emitted/refreshed from Baileys!');
                currentQR = qr;
                isInitializing = false;
            }

            if (connection === 'close') {
                isConnected = false;
                isInitializing = false;
                const statusCode = (lastDisconnect?.error)?.output?.statusCode;
                const errReason = lastDisconnect?.error?.message || 'Unknown';
                addWALog(`❌ Connection closed. Status code: ${statusCode}, Reason: ${errReason}`);
                
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 405) {
                    currentQR = null;
                    if (fs.existsSync(authFilePath)) {
                        try { fs.unlinkSync(authFilePath); } catch(e){}
                    }
                }
            } else if (connection === 'open') {
                addWALog('🎉 WhatsApp connection opened successfully!');
                currentQR = null;
                isConnected = true;
                isInitializing = false;
                
                while (messageQueue.length > 0) {
                    const item = messageQueue.shift();
                    waSocket.sendMessage(item.jid, { text: item.message })
                        .then(() => addWALog(`Queued WhatsApp message sent to ${item.cleanPhone}`))
                        .catch(err => addWALog(`Failed to send queued message to ${item.cleanPhone}: ${err.message}`));
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);
        waSocket = sock;
        waInitError = null;
        addWALog('WASocket instance created. Waiting for connection.update event...');
    } catch (error) {
        waInitError = error.message || String(error);
        isInitializing = false;
        addWALog(`💥 initWhatsApp FATAL ERROR: ${waInitError}`);
        console.error('Failed to initialize WhatsApp:', error);
    }
};

const sendWhatsappMessage = async (toPhone, message) => {
    if (!toPhone) return false;
    let cleanPhone = String(toPhone).replace(/[\+\s\-\(\)]/g, '');
    
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '92' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 10 && (cleanPhone.startsWith('3') || cleanPhone.startsWith('4'))) {
        cleanPhone = '92' + cleanPhone;
    }

    const jid = `${cleanPhone}@s.whatsapp.net`;

    if (!waSocket || !isConnected) {
        addWALog(`WhatsApp offline. Waking up WhatsApp socket for ${cleanPhone}...`);
        getWhatsAppQR();
        messageQueue.push({ jid, message, cleanPhone });
        return false;
    }

    try {
        await waSocket.sendMessage(jid, { text: message });
        addWALog(`✅ WhatsApp message sent instantly to ${cleanPhone}`);
        return true;
    } catch (error) {
        addWALog(`❌ Failed to send WhatsApp message via Baileys to ${cleanPhone}: ${error.message}`);
        return false;
    }
};

const resetWhatsApp = async () => {
    isInitializing = false;
    await initWhatsApp(true);
    return { success: true, message: 'WhatsApp session reset. Generating new QR...' };
};

const getWhatsAppQR = () => {
    if (!waSocket && !isConnected && !isInitializing) {
        initWhatsApp().catch(err => addWALog(`Init WA error: ${err.message}`));
    }
    return { qr: currentQR, socketInitialized: !!waSocket, isConnected, isInitializing, error: waInitError, logs: waLogs };
};

const sendWhatsappOrderConfirmation = async (customerPhone, customerName, serviceName, totalPrice, orderId) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://geniustailors.com';
  const orderUrl = `${baseUrl}/my-orders/${orderId}`;
  const message = `*Genius Tailors* ✂️\n\nHello ${customerName}! 🎉\n\nYour order has been placed successfully. Our tailor will review it and begin working shortly.\n\n*Garment:* ${serviceName}\n*Total Price:* Rs. ${totalPrice.toLocaleString()}\n*Order ID:* ${orderId}\n\n*Preview Your Order:*\n${orderUrl}\n\nYou will receive a message here whenever your order status is updated!`;
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

  if (status === 'Delivered') {
    const reviewUrl = `${process.env.FRONTEND_URL || 'https://geniustailors.com'}/reviews`;
    message += `\n\n*We'd love your feedback!*\nLeave a review and earn 5 Loyalty Points: ${reviewUrl}`;
  }

  await sendWhatsappMessage(customerPhone, message);
};

const sendWhatsappAccountCreation = async (customerPhone, customerName, email, rawPassword) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://geniustailors.com';
  const loginUrl = `${baseUrl}/login`;
  const orderPageUrl = `${baseUrl}/services`;
  const message = `*Genius Tailors* ✂️\n\nWelcome ${customerName}! 🎉\n\nYour account has been created successfully by our staff.\n\nYou can now log in to your dashboard to track your orders, view measurements, and place new orders online.\n\n*Get 10% off on your first order!*\nPlace your order now: ${orderPageUrl}\n\n*Login Link:*\n${loginUrl}\n\n*Email:* ${email}\n*Password:* ${rawPassword}\n\nFor your security, please change your password after your first login.`;
  await sendWhatsappMessage(customerPhone, message);
};

const sendWelcomeWhatsapp = async (customerPhone, customerName) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://geniustailors.com';
  const orderPageUrl = `${baseUrl}/services`;
  const dashboardUrl = `${baseUrl}/my-orders`;
  const message = `*Genius Tailors* ✂️\n\nWelcome to Genius Tailors, ${customerName}! 🎉\n\nThank you for creating an account with us. You can now track your tailored orders, manage your measurements, and experience premium tailoring from the comfort of your home.\n\n*Get 10% off on your first order!*\nPlace your order now: ${orderPageUrl}\n\n*Your Dashboard:*\n${dashboardUrl}\n\nWe look forward to serving you!`;
  await sendWhatsappMessage(customerPhone, message);
};

const sendPromoWhatsapp = async (customerPhone, customerName, promoCode, discountText, minSpend = 0, expiryDate = null, customMsgText = '') => {
  let message = `*Genius Tailors Special Offer* ✂️🎉\n\nHi ${customerName},\n\n`;
  if (customMsgText) {
    message += `${customMsgText}\n\n*Promo Code:* ${promoCode} (${discountText})\n`;
  } else {
    message += `We have a special discount just for you! Use promo code *${promoCode}* to get *${discountText}* on your next tailored order.\n\n`;
  }
  if (minSpend > 0) message += `*Minimum Spend:* Rs. ${minSpend}\n`;
  if (expiryDate) message += `*Valid Until:* ${new Date(expiryDate).toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' })}\n\n`;
  message += `Book your tailored fit today: ${process.env.FRONTEND_URL || 'https://geniustailors.com'}/services`;
  
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
  message += `${process.env.FRONTEND_URL || 'https://geniustailors.com/'}admin/orders/${orderId}\n\n`;
  message += `Please check the dashboard to verify the payment and approve the order.`;

  await sendWhatsappMessage(adminPhone, message);
};

const sendWhatsappPasswordReset = async (customerPhone, customerName, resetUrl) => {
  const message = `*Genius Tailors Security* 🔐\n\nHi ${customerName},\n\nWe received a request to reset your password. Please click the secure link below to create a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this message.`;
  await sendWhatsappMessage(customerPhone, message);
};

module.exports = { initWhatsApp, resetWhatsApp, sendWhatsappOrderConfirmation, sendWhatsappStatusUpdate, sendWhatsappAccountCreation, sendWelcomeWhatsapp, sendPromoWhatsapp, sendRecoveryWhatsapp, sendAdminAbandonedCartWhatsapp, sendAdminNewOrderWhatsapp, sendWhatsappPasswordReset, getWhatsAppQR };
