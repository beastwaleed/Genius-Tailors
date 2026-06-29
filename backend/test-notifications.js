require('dotenv').config({ path: 'd:/Waleed/Web Development/GT-Project/backend/.env' });
const { sendAdminNewOrderNotification } = require('./src/config/email');
const { sendAdminNewOrderWhatsapp } = require('./src/config/whatsapp');

async function run() {
  try {
    console.log("Sending email...");
    await sendAdminNewOrderNotification("Test User", "Shalwar Kameez", 4500, "123456789", false, false, "http://example.com/receipt.jpg");
    console.log("Email sent successfully!");

    console.log("Sending WhatsApp...");
    await sendAdminNewOrderWhatsapp("Test User", "Shalwar Kameez", 4500, "123456789", "http://example.com/receipt.jpg");
    console.log("WhatsApp sent successfully!");
  } catch (err) {
    console.error("Test failed:", err);
  }
}
run();
