require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const User = require('./src/models/User');

function generateShortId(prefix) {
  return `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const users = await User.find({ customerNumber: { $exists: false } });
  for (const user of users) {
    user.customerNumber = generateShortId('CUS');
    await user.save();
  }
  console.log(`Updated ${users.length} users with customerNumber`);

  const orders = await Order.find({ orderNumber: { $exists: false } });
  for (const order of orders) {
    order.orderNumber = generateShortId('ORD');
    await order.save();
  }
  console.log(`Updated ${orders.length} orders with orderNumber`);

  mongoose.disconnect();
}
run();
