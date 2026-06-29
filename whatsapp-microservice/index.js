const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY || 'gt-super-secret-key-123';

// Setup WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;

client.on('qr', (qr) => {
    console.log('Scan the QR code below to connect WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    isReady = true;
    console.log('✅ WhatsApp Client is ready!');
});

client.on('disconnected', (reason) => {
    isReady = false;
    console.log('❌ WhatsApp Client was disconnected:', reason);
});

client.initialize();

// Middleware to check API key
const checkAuth = (req, res, next) => {
    const key = req.headers['x-api-key'] || req.query.key;
    if (key !== API_KEY) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
    }
    next();
};

// Health Check
app.get('/health', (req, res) => {
    res.json({ success: true, status: isReady ? 'Connected' : 'Waiting for QR scan or connecting' });
});

// Endpoint to send message
app.post('/send', checkAuth, async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ success: false, message: 'WhatsApp is not ready. Scan the QR code first.' });
    }

    let { to, message } = req.body;
    if (!to || !message) {
        return res.status(400).json({ success: false, message: 'Missing "to" or "message" in request body' });
    }

    try {
        // Format phone number: remove +, spaces, and append @c.us
        let phone = to.replace(/[\+\s]/g, '');
        // If it starts with 0 (e.g. 0333...), replace 0 with 92
        if (phone.startsWith('0') && phone.length === 11) {
            phone = '92' + phone.substring(1);
        }
        const chatId = `${phone}@c.us`;

        await client.sendMessage(chatId, message);
        console.log(`Message sent to ${chatId}`);
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`WhatsApp Microservice running on port ${PORT}`);
});
