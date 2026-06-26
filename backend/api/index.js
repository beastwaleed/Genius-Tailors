const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('../src/config/db');

// Import Models
const User = require('../src/models/User');
const Service = require('../src/models/Service');
const MeasurementProfile = require('../src/models/MeasurementProfile');
const Order = require('../src/models/Order');
const LoyaltyRecord = require('../src/models/LoyaltyRecord');
const SeasonConfig = require('../src/models/SeasonConfig');
const Fabric = require('../src/models/Fabric');
const Promo = require('../src/models/Promo');
const AbandonedCart = require('../src/models/AbandonedCart');

// Import Middleware
const { protect, admin } = require('../src/middlewares/authMiddleware');
const { upload } = require('../src/config/cloudinary');
const { sendStatusUpdateEmail, sendPasswordResetEmail, sendOrderConfirmationEmail, sendContactEmail, sendAdminNewOrderNotification, sendAccountCreationEmail, sendPromoEmail, sendAdminAbandonedCartEmail } = require('../src/config/email');
const { sendWhatsappOrderConfirmation, sendWhatsappStatusUpdate, sendWhatsappAccountCreation, sendPromoWhatsapp, sendRecoveryWhatsapp, sendAdminAbandonedCartWhatsapp } = require('../src/config/whatsapp');
const postexService = require('../src/services/postexService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure MongoDB is connected for Vercel Serverless Functions
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Base Route for Vercel Health Check
app.get('/', (req, res) => {
  res.send('Genius Tailors API is successfully running on Vercel!');
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Generate JWT token (2 day expiry)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '2d' });
};

/**
 * Automatically upgrades a user's membership level based on their total loyalty points.
 * Thresholds (per PDF §13):
 *   Bronze  : 0   – 499  points
 *   Silver  : 500 – 1499 points
 *   Gold    : 1500+       points
 * Returns the new level (or the same level if unchanged).
 */
const upgradeMembership = (points) => {
  if (points >= 1500) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'Bronze';
};


// ==========================================
// 1. AUTHENTICATION ROUTES (Register & Login)
// ==========================================

// Register a new customer
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, street, city, country } = req.body;

    if (!name || !email || !password || !phone || !street || !city || !country) {
      return res.status(400).json({ message: 'All fields are required for registration' });
    }

    if (country.trim().toLowerCase() !== 'pakistan') {
      return res.status(400).json({ message: 'We currently only operate and deliver within Pakistan. Please enter Pakistan as your country.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      location: { street, city, country }
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      loyaltyPoints: user.loyaltyPoints,
      membershipLevel: user.membershipLevel,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login user (Customer or Admin)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        membershipLevel: user.membershipLevel,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});


// ==========================================
// 2. USER PROFILE ROUTES (Customer Dashboard)
// ==========================================

// Get current logged-in user's profile
app.get('/api/profile', protect, async (req, res) => {
  try {
    // req.user is already set by the protect middleware (without password)
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update current logged-in user's profile (name, email, password)
app.put('/api/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update fields that were actually sent in the request
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    // If the user wants to change their password, hash the new one
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      loyaltyPoints: updatedUser.loyaltyPoints,
      membershipLevel: updatedUser.membershipLevel,
      token: generateToken(updatedUser._id) // Issue a fresh token in case email changed
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});


// ==========================================
// 3. SERVICE ROUTES (Garment Catalog)
// ==========================================

// Get all active services (Public)
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching services', error: error.message });
  }
});

// Create a new service (Admin Only)
app.post('/api/services', protect, admin, async (req, res) => {
  try {
    const service = new Service(req.body);
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(400).json({ message: 'Invalid service data', error: error.message });
  }
});

// Update a service (Admin Only) — e.g., change price or customization options
app.put('/api/services/:id', protect, admin, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Merge updated fields
    Object.assign(service, req.body);
    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update service', error: error.message });
  }
});

// Deactivate/delete a service (Admin Only) — soft delete by setting isActive: false
app.delete('/api/services/:id', protect, admin, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Soft delete: mark as inactive instead of permanently removing
    service.isActive = false;
    await service.save();
    res.json({ message: 'Service deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to deactivate service', error: error.message });
  }
});


// ==========================================
// 4. MEASUREMENT PROFILE ROUTES
// ==========================================

// Create a new measurement profile (Customer)
app.post('/api/measurements', protect, async (req, res) => {
  try {
    const { profileName, measurements } = req.body;

    if (!profileName || !measurements) {
      return res.status(400).json({ message: 'Profile name and measurements are required' });
    }

    const profile = new MeasurementProfile({
      customer: req.user._id,
      profileName,
      measurements
    });

    const createdProfile = await profile.save();
    res.status(201).json(createdProfile);
  } catch (error) {
    res.status(400).json({ message: 'Invalid measurement data', error: error.message });
  }
});

// Get all measurement profiles for the logged-in customer
app.get('/api/measurements', protect, async (req, res) => {
  try {
    const profiles = await MeasurementProfile.find({ customer: req.user._id });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profiles', error: error.message });
  }
});

// Update a measurement profile (Customer — must own the profile)
app.put('/api/measurements/:id', protect, async (req, res) => {
  try {
    const profile = await MeasurementProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Ownership check
    if (profile.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    if (req.body.profileName) profile.profileName = req.body.profileName;
    if (req.body.measurements) profile.measurements = req.body.measurements;

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update measurement profile', error: error.message });
  }
});

// Delete a measurement profile (Customer — must own the profile)
app.delete('/api/measurements/:id', protect, async (req, res) => {
  try {
    const profile = await MeasurementProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this profile' });
    }

    await profile.deleteOne();
    res.json({ message: 'Profile removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting profile', error: error.message });
  }
});


// ==========================================
// 4.5 POSTEX WEBHOOKS (Logistics Automations)
// ==========================================
app.post('/api/webhooks/postex', async (req, res) => {
  try {
    const expectedKey = process.env.POSTEX_WEBHOOK_KEY;
    const expectedValue = process.env.POSTEX_WEBHOOK_VALUE;

    // Authenticate Webhook
    if (!expectedKey || req.headers[expectedKey.toLowerCase()] !== expectedValue) {
      console.warn('Unauthorized PostEx Webhook Attempt. Headers provided:', req.headers);
      return res.status(401).json({ message: 'Unauthorized webhook request' });
    }

    const payload = req.body;
    console.log('PostEx Webhook Received:', payload);

    const trackingNumber = payload.trackingNumber;
    const statusCode = payload.transactionStatusMessageCode || payload.statusCode || payload.statusId;
    const statusMessage = payload.transactionStatusMessage || payload.status || payload.remarks;

    if (!trackingNumber) {
      return res.status(400).json({ message: 'Tracking number missing in payload' });
    }

    const order = await Order.findOne({ trackingNumber });
    if (!order) {
      return res.status(404).json({ message: 'Order with this tracking number not found' });
    }

    let updatedStatus = null;

    // Map PostEx status codes to internal GT order statuses
    switch (String(statusCode)) {
      case '0004': // Package on Root (Out for delivery)
        updatedStatus = 'Ready';
        break;
      case '0005': // Delivered
        updatedStatus = 'Delivered';
        break;
      default:
        // Fallback fuzzy matching for generic string remarks
        if (typeof statusMessage === 'string') {
          const msg = statusMessage.toLowerCase();
          if (msg.includes('delivered')) updatedStatus = 'Delivered';
          else if (msg.includes('out for delivery') || msg.includes('on root')) updatedStatus = 'Ready';
        }
    }

    if (updatedStatus && order.status !== updatedStatus) {
      order.status = updatedStatus;
    }

    // Always append an internal note so admins can trace exact logistics events
    order.adminNotes.push({
      text: `PostEx Update: [Code ${statusCode || 'N/A'}] ${statusMessage || 'Status Changed'}`
    });

    await order.save();
    return res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('PostEx Webhook Error:', error);
    return res.status(500).json({ message: 'Internal Server Error processing webhook' });
  }
});

// ==========================================
// 5. ORDER ROUTES (Cash Register & Dashboard)
// ==========================================

let cachedCities = null;
let lastCacheTime = 0;

// Operational Cities caching for frontend dropdown
app.get('/api/shipping/cities', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedCities && now - lastCacheTime < 12 * 60 * 60 * 1000) {
      return res.json(cachedCities);
    }
    
    const postexRes = await postexService.getOperationalCities();
    if (postexRes && postexRes.dist) {
      // Filter for cities where PostEx allows delivery
      cachedCities = postexRes.dist.filter(c => c.isDeliveryCity === 'true' || c.isDeliveryCity === true);
      lastCacheTime = now;
      res.json(cachedCities);
    } else {
      res.status(400).json({ message: 'Failed to parse cities from PostEx' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching operational cities', error: error.message });
  }
});

// Place a new order (Customer)
app.post('/api/orders', protect, async (req, res) => {
  try {
    const { serviceName, styleVariations, measurementSnapshot, totalPrice, pointsUsed, isRush, referenceImageUrl, customerNote, neededByDate, deliveryCity, deliveryAddress, advancePaid, advancePaymentStatus } = req.body;

    if (!serviceName) return res.status(400).json({ message: 'Service name is required' });
    if (!measurementSnapshot || !measurementSnapshot.measurements) return res.status(400).json({ message: 'Measurement snapshot is required' });
    if (!totalPrice || totalPrice <= 0) return res.status(400).json({ message: 'A valid total price is required' });
    if (!deliveryCity || !deliveryAddress) return res.status(400).json({ message: 'Delivery city and address are required' });

    const user = await User.findById(req.user._id);
    let actualPointsUsed = 0;
    if (pointsUsed && pointsUsed > 0) {
      if (user.loyaltyPoints >= pointsUsed) {
        user.loyaltyPoints -= pointsUsed;
        actualPointsUsed = pointsUsed;
      } else {
        return res.status(400).json({ message: 'Insufficient loyalty points' });
      }
    }

    const activeSeason = await SeasonConfig.findOne({ isActive: true });
    const isGoldMember = req.user.membershipLevel === 'Gold';
    const isPriority = activeSeason ? isGoldMember : false;
    const pointsEarned = Math.floor(totalPrice / 100);

    const order = new Order({
      customer: req.user._id,
      serviceName,
      styleVariations,
      measurementSnapshot,
      totalPrice,
      advancePaid: advancePaid || 0,
      remainingBalance: totalPrice - (advancePaid || 0),
      advancePaymentStatus: advancePaymentStatus || 'Pending',
      pointsEarned,
      pointsUsed: actualPointsUsed,
      deliveryCity,
      deliveryAddress,
      isPriority,
      isRush: isRush === true,
      season: activeSeason ? activeSeason.name : '',
      referenceImageUrl: referenceImageUrl || null,
      customerNote: customerNote || '',     // Feature 1
      neededByDate: neededByDate || null    // Feature 8
    });

    const createdOrder = await order.save();

    // ── POSTEX INTEGRATION: PUSH ORDER TO 3PL ──────────────────────────────
    try {
      const postexPayload = {
        cityName: deliveryCity,
        customerName: user.name,
        customerPhone: user.phone || '03000000000',
        deliveryAddress: deliveryAddress,
        invoicePayment: createdOrder.remainingBalance, // CRITICAL: Only collect remaining balance via COD
        orderRefNumber: createdOrder.orderNumber,
        invoiceDivision: 1,
        items: 1,
        orderType: 'Normal',
        pickupAddressCode: process.env.POSTEX_PICKUP_ADDRESS_CODE || '001'
      };
      
      const postexRes = await postexService.createOrder(postexPayload);
      if (postexRes && postexRes.statusCode === '200' && postexRes.dist) {
        createdOrder.trackingNumber = postexRes.dist.trackingNumber;
        createdOrder.postexSyncStatus = 'Synced';
      } else {
        createdOrder.postexSyncStatus = 'Failed';
        console.error('PostEx returned an error status:', postexRes);
      }
      await createdOrder.save();
    } catch (postexErr) {
      console.error('Graceful Degradation: PostEx Order Creation Failed:', postexErr.message);
      createdOrder.postexSyncStatus = 'Failed';
      await createdOrder.save();
    }
    // ───────────────────────────────────────────────────────────────────────

    user.loyaltyPoints += pointsEarned;
    user.membershipLevel = upgradeMembership(user.loyaltyPoints);
    await user.save();

    if (actualPointsUsed > 0) {
      await LoyaltyRecord.create({
        customer: user._id,
        order: createdOrder._id,
        type: 'redeemed',
        points: actualPointsUsed,
        description: `Redeemed ${actualPointsUsed} points for order ${serviceName}`
      });
    }

    await LoyaltyRecord.create({
      customer: user._id,
      order: createdOrder._id,
      type: 'earned',
      points: pointsEarned,
      description: `Earned ${pointsEarned} points on order for ${serviceName} (Rs.${totalPrice})${activeSeason ? ` — ${activeSeason.name}` : ''}`
    });

    // Feature 7: Send order confirmation email (non-blocking — won't crash if email fails)
    sendOrderConfirmationEmail(user.email, user.name, serviceName, totalPrice, createdOrder._id)
      .catch(err => console.error('Confirmation email failed:', err.message));

    // Send admin notification email
    sendAdminNewOrderNotification(user.name, serviceName, totalPrice, createdOrder._id, isPriority, createdOrder.isRush)
      .catch(err => console.error('Admin notification email failed:', err.message));

    // Send WhatsApp confirmation
    if (user.phone) {
      sendWhatsappOrderConfirmation(user.phone, user.name, serviceName, totalPrice, createdOrder._id)
        .catch(err => console.error('WhatsApp confirmation failed:', err.message));
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: 'Order creation failed', error: error.message });
  }
});

// Get logged-in customer's full order history
app.get('/api/orders/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Get a single order by ID (Customer — must own the order, or Admin)
app.get('/api/orders/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email membershipLevel');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow if the requester is the owner OR an admin
    const isOwner = order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// Live Order Tracking Timeline (Customer / Admin)
app.get('/api/orders/:id/tracking', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const isOwner = order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!order.trackingNumber) {
      return res.json({ history: [], message: 'No tracking number assigned yet' });
    }

    const trackRes = await postexService.trackBulkOrders([order.trackingNumber]);
    if (trackRes && trackRes.dist && trackRes.dist.length > 0) {
      const trackingData = trackRes.dist[0].trackingResponse;
      return res.json({ history: trackingData.transactionStatusHistory || [] });
    }
    return res.json({ history: [] });
  } catch (error) {
    console.error('Failed to fetch tracking details:', error);
    res.status(500).json({ message: 'Error fetching live tracking' });
  }
});

// Airway Bill PDF Generation (Admin)
app.get('/api/admin/orders/labels', protect, admin, async (req, res) => {
  try {
    const { trackingNumbers } = req.query; // Comma separated string
    if (!trackingNumbers) return res.status(400).json({ message: 'No tracking numbers provided' });

    const pdfBuffer = await postexService.getInvoice(trackingNumbers);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="shipping_labels_${Date.now()}.pdf"`);
    res.send(Buffer.from(pdfBuffer, 'binary'));
  } catch (error) {
    console.error('Failed to generate shipping labels:', error);
    res.status(500).json({ message: 'Error fetching shipping labels from PostEx' });
  }
});

// Get ALL orders — Admin Dashboard
// Also supports ?membership=Gold for VIP filtering (PDF §11)
app.get('/api/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('customer', 'name email membershipLevel loyaltyPoints tags')
      .sort({ createdAt: -1 });

    // Optional filter by customer membership level for VIP priority view
    const { membership } = req.query;
    if (membership) {
      const filtered = orders.filter(
        o => o.customer && o.customer.membershipLevel === membership
      );
      return res.json(filtered);
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
  }
});

// Update order status — Admin Dashboard (Feature 4: also sets estimatedDelivery)
// Valid statuses: Pending → Cutting → Stitching → Ready → Delivered
app.put('/api/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, estimatedDelivery } = req.body;

    const validStatuses = ['Pending', 'Cutting', 'Stitching', 'Ready', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id).populate('customer', 'name email phone membershipLevel loyaltyPoints tags');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery); // Feature 4

    const updatedOrder = await order.save();

    // Feature 7: Send email & WhatsApp to customer on meaningful status changes (non-blocking)
    if (order.customer) {
      if (order.customer.email) {
        sendStatusUpdateEmail(order.customer.email, order.customer.name, order.serviceName, status, order.estimatedDelivery)
          .catch(err => console.error('Status email failed:', err.message));
      }
      if (order.customer.phone) {
        sendWhatsappStatusUpdate(order.customer.phone, order.customer.name, order.serviceName, status, order.estimatedDelivery)
          .catch(err => console.error('WhatsApp status update failed:', err.message));
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});


// ==========================================
// 6. LOYALTY POINTS ROUTES (PDF §12)
// ==========================================

// Redeem loyalty points for a discount on an order
// Body: { pointsToRedeem: Number, orderId: String }
// Rule: 10 points = Rs.100 discount
app.post('/api/loyalty/redeem', protect, async (req, res) => {
  try {
    const { pointsToRedeem, orderId } = req.body;

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return res.status(400).json({ message: 'Please provide a valid number of points to redeem' });
    }

    const user = await User.findById(req.user._id);

    if (user.loyaltyPoints < pointsToRedeem) {
      return res.status(400).json({
        message: `Insufficient points. You have ${user.loyaltyPoints} points, but tried to redeem ${pointsToRedeem}`
      });
    }

    // Redemption rate: 10 points = Rs.100 discount
    const discountAmount = (pointsToRedeem / 10) * 100;

    // Deduct the redeemed points from the user's total
    user.loyaltyPoints -= pointsToRedeem;

    // Membership level can drop after redemption
    user.membershipLevel = upgradeMembership(user.loyaltyPoints);
    await user.save();

    // Create a redemption transaction record
    await LoyaltyRecord.create({
      customer: user._id,
      order: orderId || null,
      type: 'redeemed',
      points: pointsToRedeem,
      description: `Redeemed ${pointsToRedeem} points for Rs.${discountAmount} discount`
    });

    res.json({
      message: `Successfully redeemed ${pointsToRedeem} points for a Rs.${discountAmount} discount`,
      discountAmount,
      remainingPoints: user.loyaltyPoints,
      membershipLevel: user.membershipLevel
    });
  } catch (error) {
    res.status(500).json({ message: 'Redemption failed', error: error.message });
  }
});

// Get current user's full loyalty transaction history
app.get('/api/loyalty/history', protect, async (req, res) => {
  try {
    const records = await LoyaltyRecord.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('order', 'serviceName totalPrice status');

    res.json({
      totalPoints: req.user.loyaltyPoints,
      membershipLevel: req.user.membershipLevel,
      history: records
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch loyalty history', error: error.message });
  }
});


// ==========================================
// 7. ADMIN — CUSTOMER INSIGHTS (PDF §11)
// ==========================================

// Get all customers with their loyalty stats (Admin Only)
// Supports ?level=Gold to filter VIP customers
app.get('/api/admin/customers', protect, admin, async (req, res) => {
  try {
    const filter = { role: 'Customer' };

    // Filter by membership level — useful for identifying Gold/VIP customers
    if (req.query.level) {
      filter.membershipLevel = req.query.level;
    }

    const customers = await User.find(filter)
      .select('-password')
      .sort({ loyaltyPoints: -1 }); // Highest points first (most valuable customers)

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
});

// Get all orders for a specific customer (Admin Only)
app.get('/api/admin/customers/:id/orders', protect, admin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 });

    res.json({
      customer,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer orders', error: error.message });
  }
});


// ==========================================
// IMAGE UPLOAD ROUTE (Cloudinary)
// ==========================================

/**
 * POST /api/upload/reference-image
 *
 * Accepts a single image file (field name: 'image').
 * Uploads it directly to Cloudinary and returns the secure URL.
 *
 * Workflow:
 *   1. Frontend picks a file → sends it here as multipart/form-data
 *   2. multer-storage-cloudinary streams it straight to Cloudinary
 *   3. This route returns { url } to the frontend
 *   4. Frontend includes that URL in the POST /api/orders body as referenceImageUrl
 *
 * File limits: JPG / PNG / WEBP only, max 5 MB
 */
app.post('/api/upload/reference-image', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('UPLOAD SUCCESS, REQ.FILE:', req.file);
    // Cloudinary URL is attached by multer-storage-cloudinary automatically
    res.json({
      message: 'Image uploaded successfully',
      url: req.file.secure_url || req.file.url || req.file.path,
      publicId: req.file.public_id || req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});


// ==========================================
// 8. SEASON & PRIORITY QUEUE ROUTES
// ==========================================

/**
 * PRIORITY QUEUE LOGIC:
 * During a peak season (Ramazan/Eid), orders are served in this order:
 *   1. isPriority: true  (Gold members — auto-assigned)
 *   2. isRush: true      (customer-requested rush, regardless of tier)
 *   3. Membership rank   (Gold > Silver > Bronze)
 *   4. Order date        (oldest first — FIFO within the same rank)
 *
 * This ensures VIP customers never miss their Eid suits.
 */

// Get the currently active season info (Public — shown on frontend banner)
app.get('/api/season/active', async (req, res) => {
  try {
    const season = await SeasonConfig.findOne({ isActive: true });
    if (!season) {
      return res.json({ active: false, season: null });
    }
    res.json({ active: true, season });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active season', error: error.message });
  }
});

// Get all seasons (Admin — for history/management)
app.get('/api/season', protect, admin, async (req, res) => {
  try {
    const seasons = await SeasonConfig.find({}).sort({ createdAt: -1 });
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch seasons', error: error.message });
  }
});

// Create a new season (Admin)
// Body: { name, type, startDate, endDate, announcement }
app.post('/api/season', protect, admin, async (req, res) => {
  try {
    const { name, type, startDate, endDate, announcement } = req.body;

    if (!name || !type || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, type, startDate and endDate are required' });
    }

    const season = await SeasonConfig.create({
      name,
      type,
      startDate,
      endDate,
      announcement: announcement || '',
      isActive: false // Always starts inactive; use the activate route to go live
    });

    res.status(201).json(season);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create season', error: error.message });
  }
});

// Activate a season (Admin) — deactivates all other seasons first (only 1 active at a time)
app.put('/api/season/:id/activate', protect, admin, async (req, res) => {
  try {
    const season = await SeasonConfig.findById(req.params.id);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    // Deactivate any currently active season first
    await SeasonConfig.updateMany({ isActive: true }, { isActive: false });

    season.isActive = true;
    await season.save();

    res.json({
      message: `'${season.name}' is now the active peak season. Gold members will receive priority on all new orders.`,
      season
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to activate season', error: error.message });
  }
});

// Deactivate the current season (Admin) — returns to normal mode
app.put('/api/season/:id/deactivate', protect, admin, async (req, res) => {
  try {
    const season = await SeasonConfig.findById(req.params.id);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    season.isActive = false;
    await season.save();

    res.json({ message: `'${season.name}' season has ended. Priority mode is off.`, season });
  } catch (error) {
    res.status(500).json({ message: 'Failed to deactivate season', error: error.message });
  }
});

/**
 * GET /api/admin/orders/priority-queue
 *
 * Returns the admin's workload sorted by the priority algorithm:
 *   1. Priority (Gold members in peak season) — served first
 *   2. Rush orders
 *   3. Within same priority, sort by membership rank (Gold > Silver > Bronze)
 *   4. Within same rank, sort by order date (oldest first — FIFO)
 *
 * Optional query param: ?status=Pending  to filter by work stage
 */
app.get('/api/admin/orders/priority-queue', protect, admin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .populate('customer', 'name email membershipLevel loyaltyPoints')
      .sort({ createdAt: 1 }); // Start with oldest (FIFO base)

    // Membership rank weights for in-memory sort
    const membershipWeight = { Gold: 3, Silver: 2, Bronze: 1 };

    const sorted = orders.sort((a, b) => {
      if (activeSeason) {
        // ── PEAK SEASON: Admin controls priority — Gold/Rush/Tier/FIFO ──────
        if (b.isPriority !== a.isPriority) return b.isPriority - a.isPriority;
        if (b.isRush !== a.isRush) return b.isRush - a.isRush;
        const aLevel = a.customer ? (membershipWeight[a.customer.membershipLevel] || 0) : 0;
        const bLevel = b.customer ? (membershipWeight[b.customer.membershipLevel] || 0) : 0;
        if (bLevel !== aLevel) return bLevel - aLevel;
        return 0; // FIFO
      } else {
        // ── NORMAL SEASON: Sort by customer deadline (neededByDate) ─────────
        // Feature 8: neededByDate only applies outside peak season
        const aDate = a.neededByDate ? new Date(a.neededByDate).getTime() : Infinity;
        const bDate = b.neededByDate ? new Date(b.neededByDate).getTime() : Infinity;
        if (aDate !== bDate) return aDate - bDate; // soonest deadline first
        if (b.isRush !== a.isRush) return b.isRush - a.isRush;
        const aLevel = a.customer ? (membershipWeight[a.customer.membershipLevel] || 0) : 0;
        const bLevel = b.customer ? (membershipWeight[b.customer.membershipLevel] || 0) : 0;
        if (bLevel !== aLevel) return bLevel - aLevel;
        return 0; // FIFO
      }
    });

    // Check if a season is currently active so the frontend can show a banner
    const activeSeason = await SeasonConfig.findOne({ isActive: true });

    res.json({
      activeSeason: activeSeason || null,
      totalOrders: sorted.length,
      priorityOrders: sorted.filter(o => o.isPriority).length,
      rushOrders: sorted.filter(o => o.isRush).length,
      queue: sorted
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch priority queue', error: error.message });
  }
});

// Admin can manually override the priority flag on any order
// Useful for special cases outside the normal Gold/season rules
app.put('/api/admin/orders/:id/priority', protect, admin, async (req, res) => {
  try {
    const { isPriority } = req.body;
    if (typeof isPriority !== 'boolean') {
      return res.status(400).json({ message: 'isPriority must be a boolean (true or false)' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPriority = isPriority;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update priority', error: error.message });
  }
});


// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Genius Tailors API is live!' });
});


// ==========================================
// 9. ADDITIONAL FEATURES
// ==========================================

// ── Feature 3: Cancel an Order (Customer) ───────────────────────────────────
// Only allowed if status is still 'Pending'. Once cutting starts, no cancellation.
app.put('/api/orders/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    if (order.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot cancel — order is already in '${order.status}' stage` });
    }

    order.status = 'Cancelled';
    await order.save();
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
});

// ── Feature 2: Admin Notes on Orders ────────────────────────────────────────
// Add a private internal note to an order (tailor-only, not visible to customer)
app.post('/api/admin/orders/:id/notes', protect, admin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.adminNotes.push({ text: text.trim() });
    await order.save();
    res.json({ message: 'Note added', adminNotes: order.adminNotes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add note', error: error.message });
  }
});

// Delete an admin note from an order
app.delete('/api/admin/orders/:id/notes/:noteId', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.adminNotes = order.adminNotes.filter(n => n._id.toString() !== req.params.noteId);
    await order.save();
    res.json({ message: 'Note deleted', adminNotes: order.adminNotes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
});

// ── Feature 5: Business Analytics / Stats ───────────────────────────────────
app.get('/api/admin/stats', protect, admin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      ordersThisMonth,
      revenueResult,
      revenueThisMonthResult,
      ordersByStatus,
      popularServices,
      totalCustomers,
      newCustomersThisMonth,
      membershipBreakdown,
      activeSeason
    ] = await Promise.all([
      Order.countDocuments({ status: { $ne: 'Cancelled' } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth }, status: { $ne: 'Cancelled' } }),
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: '$serviceName', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
      User.countDocuments({ role: 'Customer' }),
      User.countDocuments({ role: 'Customer', createdAt: { $gte: startOfMonth } }),
      User.aggregate([{ $match: { role: 'Customer' } }, { $group: { _id: '$membershipLevel', count: { $sum: 1 } } }]),
      SeasonConfig.findOne({ isActive: true })
    ]);

    res.json({
      orders: {
        total: totalOrders,
        thisMonth: ordersThisMonth,
        byStatus: ordersByStatus
      },
      revenue: {
        total: revenueResult[0]?.total || 0,
        thisMonth: revenueThisMonthResult[0]?.total || 0
      },
      services: { topServices: popularServices },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
        byMembership: membershipBreakdown
      },
      activeSeason: activeSeason || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// ── Feature 6: Password Reset via Email ─────────────────────────────────────
const crypto = require('crypto');

// Step 1: Request a password reset link
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    // Always return 200 so attackers can't probe which emails exist
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    // Generate a secure random token and store its hash in the DB
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    let base = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    if (!base.startsWith('http')) base = `https://${base}`;
    const resetUrl = `${base}/reset-password/${rawToken}`;

    try {
      if (process.env.EMAIL_USER) {
        await sendPasswordResetEmail(user.email, user.name, resetUrl);
      } else {
        console.log('\n--- 🔑 DEV MODE: Password Reset Link ---\n', resetUrl, '\n---------------------------------------\n');
      }
    } catch (emailError) {
      console.error('Failed to send email, but token was generated. Reset link:', resetUrl);
    }

    res.json({ message: 'If that email exists, a reset link has been generated.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process forgot password request', error: error.message });
  }
});

// Step 2: Submit the new password using the token from the link
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'New password is required' });

    // Hash the incoming token to compare with what's in the DB
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() } // Token must not be expired
    });

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// ── Feature 9: Reorder (Duplicate a Previous Order) ─────────────────────────
// Customer can clone a past order — same service, same snapshot, same style.
// Status resets to Pending. Season/priority recalculated fresh.
app.post('/api/orders/:id/reorder', protect, async (req, res) => {
  try {
    const originalOrder = await Order.findById(req.params.id);
    if (!originalOrder) return res.status(404).json({ message: 'Original order not found' });

    if (originalOrder.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reorder this order' });
    }

    const activeSeason = await SeasonConfig.findOne({ isActive: true });
    const isGoldMember = req.user.membershipLevel === 'Gold';
    const isPriority = activeSeason ? isGoldMember : false;
    const pointsEarned = Math.floor(originalOrder.totalPrice / 100);

    const newOrder = new Order({
      customer: req.user._id,
      serviceName: originalOrder.serviceName,
      styleVariations: originalOrder.styleVariations,
      measurementSnapshot: originalOrder.measurementSnapshot,
      totalPrice: originalOrder.totalPrice,
      pointsEarned,
      isPriority,
      isRush: false,
      season: activeSeason ? activeSeason.name : '',
      referenceImageUrl: originalOrder.referenceImageUrl || null,
      customerNote: originalOrder.customerNote || ''
      // neededByDate is NOT copied — customer sets a fresh deadline if needed
    });

    const createdOrder = await newOrder.save();

    const user = await User.findById(req.user._id);
    user.loyaltyPoints += pointsEarned;
    user.membershipLevel = upgradeMembership(user.loyaltyPoints);
    await user.save();

    await LoyaltyRecord.create({
      customer: user._id,
      order: createdOrder._id,
      type: 'earned',
      points: pointsEarned,
      description: `Reorder: Earned ${pointsEarned} points on ${originalOrder.serviceName} (Rs.${originalOrder.totalPrice})`
    });

    sendOrderConfirmationEmail(user.email, user.name, originalOrder.serviceName, originalOrder.totalPrice, createdOrder._id)
      .catch(err => console.error('Reorder confirmation email failed:', err.message));

    // Send admin notification email for reorder
    sendAdminNewOrderNotification(user.name, originalOrder.serviceName, originalOrder.totalPrice, createdOrder._id, isPriority, createdOrder.isRush)
      .catch(err => console.error('Admin reorder notification email failed:', err.message));

    // Send WhatsApp confirmation for reorder
    if (user.phone) {
      sendWhatsappOrderConfirmation(user.phone, user.name, originalOrder.serviceName, originalOrder.totalPrice, createdOrder._id)
        .catch(err => console.error('WhatsApp confirmation failed:', err.message));
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: 'Reorder failed', error: error.message });
  }
});


// ==========================================
// 11. ADMIN USER ROUTES
// ==========================================

app.get('/api/admin/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

app.post('/api/admin/users', protect, admin, async (req, res) => {
  try {
    const { name, email, password, phone, role, street, city, country, measurements, profileName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'Customer',
      location: {
        street: street || '',
        city: city || '',
        country: country || 'Pakistan'
      }
    });

    if (measurements && Object.keys(measurements).length > 0) {
      const MeasurementProfile = require('../src/models/MeasurementProfile');
      await MeasurementProfile.create({
        customer: user._id,
        profileName: profileName || 'Default Admin Profile',
        measurements: measurements
      });
    }

    try {
      await sendAccountCreationEmail(user.email, user.name, password);
      console.log('Account creation email sent to:', user.email);
    } catch (err) {
      console.error('Account creation email failed:', err.message);
    }

    if (user.phone) {
      try {
        await sendWhatsappAccountCreation(user.phone, user.name, user.email, password);
        console.log('Account creation whatsapp sent to:', user.phone);
      } catch (err) {
        console.error('Account creation whatsapp failed:', err.message);
      }
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Admin Gets a Specific Customer's Measurement Profiles
app.get('/api/admin/users/:id/measurements', protect, admin, async (req, res) => {
  try {
    const profiles = await MeasurementProfile.find({ customer: req.params.id });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profiles', error: error.message });
  }
});

// Admin Creates a Measurement Profile for a Customer
app.post('/api/admin/users/:id/measurements', protect, admin, async (req, res) => {
  try {
    const { profileName, measurements } = req.body;
    if (!profileName || !measurements) {
      return res.status(400).json({ message: 'Profile name and measurements are required' });
    }
    const MeasurementProfile = require('../src/models/MeasurementProfile');
    const profile = await MeasurementProfile.create({
      customer: req.params.id,
      profileName,
      measurements
    });
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create profile', error: error.message });
  }
});

// Admin Places an Order on Behalf of a Customer
app.post('/api/admin/orders/place', protect, admin, async (req, res) => {
  try {
    const { customerId, serviceName, styleVariations, measurementSnapshot, totalPrice, isRush, customerNote, neededByDate } = req.body;

    if (!customerId) return res.status(400).json({ message: 'Customer ID is required' });
    if (!serviceName) return res.status(400).json({ message: 'Service name is required' });
    if (!measurementSnapshot || !measurementSnapshot.measurements) return res.status(400).json({ message: 'Measurement snapshot is required' });
    if (!totalPrice || totalPrice <= 0) return res.status(400).json({ message: 'A valid total price is required' });

    const user = await User.findById(customerId);
    if (!user) return res.status(404).json({ message: 'Customer not found' });

    const activeSeason = await SeasonConfig.findOne({ isActive: true });
    const isGoldMember = user.membershipLevel === 'Gold';
    const isPriority = activeSeason ? isGoldMember : false;
    const pointsEarned = Math.floor(totalPrice / 100);

    const order = new Order({
      customer: customerId,
      serviceName,
      styleVariations,
      measurementSnapshot,
      totalPrice,
      pointsEarned,
      isPriority,
      isRush: isRush === true,
      season: activeSeason ? activeSeason.name : '',
      customerNote: customerNote || '',
      neededByDate: neededByDate || null,
      adminNotes: [{ text: 'Order placed by admin on behalf of customer.' }]
    });

    const createdOrder = await order.save();

    user.loyaltyPoints += pointsEarned;
    user.membershipLevel = upgradeMembership(user.loyaltyPoints);
    await user.save();

    await LoyaltyRecord.create({
      customer: user._id,
      order: createdOrder._id,
      type: 'earned',
      points: pointsEarned,
      description: `Earned ${pointsEarned} points on order for ${serviceName} (Rs.${totalPrice}) (Admin placed)`
    });

    sendOrderConfirmationEmail(user.email, user.name, serviceName, totalPrice, createdOrder._id)
      .catch(err => console.error('Confirmation email failed:', err.message));
    
    sendAdminNewOrderNotification(user.name, serviceName, totalPrice, createdOrder._id, isPriority, createdOrder.isRush)
      .catch(err => console.error('Admin notification email failed:', err.message));

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});


// ==========================================
// 12. FABRIC ROUTES (Admin Managed)
// ==========================================

app.get('/api/fabrics', async (req, res) => {
  try {
    const fabrics = await Fabric.find();
    res.json(fabrics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch fabrics', error: error.message });
  }
});

app.post('/api/fabrics', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (req.file) {
      req.body.imageUrl = req.file.secure_url || req.file.url || req.file.path;
    }
    if (typeof req.body.colors === 'string') {
      req.body.colors = JSON.parse(req.body.colors);
    }
    const fabric = new Fabric(req.body);
    await fabric.save();
    res.status(201).json(fabric);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create fabric', error: error.message });
  }
});

app.put('/api/fabrics/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (req.file) {
      req.body.imageUrl = req.file.secure_url || req.file.url || req.file.path;
    }
    if (typeof req.body.colors === 'string') {
      req.body.colors = JSON.parse(req.body.colors);
    }
    const fabric = await Fabric.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fabric) return res.status(404).json({ message: 'Fabric not found' });
    res.json(fabric);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update fabric', error: error.message });
  }
});

app.delete('/api/fabrics/:id', protect, admin, async (req, res) => {
  try {
    const fabric = await Fabric.findByIdAndDelete(req.params.id);
    if (!fabric) return res.status(404).json({ message: 'Fabric not found' });
    res.json({ message: 'Fabric deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete fabric', error: error.message });
  }
});

// ==========================================
// 10. PUBLIC / MISC ROUTES
// ==========================================

// Contact Form Submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    await sendContactEmail(name, email, subject || 'General Inquiry', message);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

// ==========================================
// SERVERLESS EXPORT & LOCAL LISTENER
// ==========================================

// 1. Export for Vercel Serverless
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
};

// 2. Production Server Startup
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database', err);
});



// AI Chatbot Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
       return res.status(500).json({ reply: "I'm sorry, the AI assistant is currently offline. Please configure the GEMINI_API_KEY." });
    }
    
    const prompt = "You are the official AI Assistant for 'Genius Tailors', a premium tailoring service. You help customers with questions about taking measurements, placing orders, and understanding the website. Be polite, concise, and helpful. Customer message: " + message;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Failed to fetch from Gemini API');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that.";

    res.json({ reply: text });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ reply: 'I encountered an error trying to process your request. Please try again later.', debugError: error.message, stack: error.stack });
  }
});

// ==========================================
// 12. CRM & MARKETING ROUTES
// ==========================================

// Get 360-Degree Customer Profile (CRM)
app.get('/api/admin/crm/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Customer not found' });

    // Calculate real-time AOV and fetch recent orders
    const orders = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 });
    
    // Aggregation for LTV and Order Count (Ensuring accuracy)
    const completedOrders = orders.filter(o => !['Cancelled', 'Refunded'].includes(o.status));
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const orderCount = completedOrders.length;
    const aov = orderCount > 0 ? (totalSpent / orderCount).toFixed(2) : 0;

    // Sync database cache if it's outdated
    if (user.ltv !== totalSpent || user.orderCount !== orderCount) {
      user.ltv = totalSpent;
      user.orderCount = orderCount;
      await user.save();
    }

    res.json({
      profile: user,
      analytics: {
        totalSpent,
        orderCount,
        averageOrderValue: Number(aov),
      },
      recentOrders: orders.slice(0, 5) // Last 5 orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching CRM profile' });
  }
});

// Update Customer Tags
app.put('/api/admin/crm/users/:id/tags', protect, admin, async (req, res) => {
  try {
    const { tags } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Customer not found' });

    user.tags = tags;
    await user.save();
    res.json({ message: 'Tags updated successfully', tags: user.tags });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating tags' });
  }
});

// Update Admin Private Notes
app.put('/api/admin/crm/users/:id/notes', protect, admin, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Customer not found' });

    user.adminNotes = adminNotes;
    await user.save();
    res.json({ message: 'Admin notes updated successfully', adminNotes: user.adminNotes });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating admin notes' });
  }
});

// ==========================================
// 13. PROMO CODE ENGINE ROUTES
// ==========================================

app.get('/api/promos', protect, admin, async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching promos' });
  }
});

app.post('/api/promos', protect, admin, async (req, res) => {
  try {
    const promo = new Promo(req.body);
    await promo.save();

    // Broadcast Campaign to Targeted Users (Non-blocking)
    const broadcastPromo = async () => {
      try {
        let query = {};
        if (promo.requiredTags && promo.requiredTags.length > 0) {
          query = { tags: { $in: promo.requiredTags } };
        }
        
        const targetUsers = await User.find(query);
        const discountText = promo.discountType === 'Percentage' ? `${promo.discountValue}% OFF` : `Rs. ${promo.discountValue} OFF`;

        for (const user of targetUsers) {
          if (user.email) sendPromoEmail(user.email, user.name, promo.code, discountText, promo.minSpend, promo.expiryDate).catch(e => console.error('Promo email error:', e));
          if (user.phone) sendPromoWhatsapp(user.phone, user.name, promo.code, discountText, promo.minSpend, promo.expiryDate).catch(e => console.error('Promo WhatsApp error:', e));
        }
      } catch (err) {
        console.error('Failed to broadcast promo campaign:', err);
      }
    };

    // Execute broadcast in background
    broadcastPromo();

    res.status(201).json(promo);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Promo code already exists' });
    res.status(500).json({ message: 'Server error creating promo code' });
  }
});

app.delete('/api/promos/:id', protect, admin, async (req, res) => {
  try {
    await Promo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting promo' });
  }
});

app.post('/api/promos/validate', protect, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const promo = await Promo.findOne({ code: code.toUpperCase(), isActive: true });

    if (!promo) return res.status(404).json({ message: 'Invalid or expired promo code' });
    
    if (new Date() > new Date(promo.expiryDate)) {
      return res.status(400).json({ message: 'This promo code has expired' });
    }

    if (cartTotal < promo.minSpend) {
      return res.status(400).json({ message: `Minimum spend of Rs. ${promo.minSpend} required` });
    }

    // Check tags if the promo is restricted
    if (promo.requiredTags && promo.requiredTags.length > 0) {
      const user = await User.findById(req.user.id);
      const hasRequiredTag = promo.requiredTags.some(tag => user.tags.includes(tag));
      if (!hasRequiredTag) {
        return res.status(403).json({ message: 'You are not eligible for this promo code' });
      }
    }

    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: 'Server error validating promo' });
  }
});

// ==========================================
// 14. ABANDONED CART ENGINE ROUTES
// ==========================================

// Create or update an abandoned cart session
app.post('/api/abandoned-carts', async (req, res) => {
  try {
    const { customerId, customerEmail, customerPhone, customerName, serviceName, totalPrice, dropoffStep, completedSteps, sessionId } = req.body;
    
    // If we have a sessionId (from frontend state), we update the existing record
    // Otherwise we create a new one
    let cart;
    if (sessionId) {
      cart = await AbandonedCart.findById(sessionId);
    }
    
    if (cart) {
      cart.dropoffStep = dropoffStep || cart.dropoffStep;
      cart.completedSteps = completedSteps || cart.completedSteps;
      if (customerEmail) cart.customerEmail = customerEmail;
      if (customerPhone) cart.customerPhone = customerPhone;
      if (customerName) cart.customerName = customerName;
      if (totalPrice) cart.totalPrice = totalPrice;
      await cart.save();
    } else {
      cart = new AbandonedCart({
        customer: customerId || null,
        customerEmail,
        customerPhone,
        customerName,
        serviceName,
        totalPrice,
        dropoffStep,
        completedSteps
      });
      await cart.save();
    }
    
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error tracking abandoned cart' });
  }
});

// Get all abandoned carts for Admin Panel
app.get('/api/abandoned-carts', protect, admin, async (req, res) => {
  try {
    const carts = await AbandonedCart.find().sort({ createdAt: -1 }).populate('customer', 'name email phone tags');
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching abandoned carts' });
  }
});

// Mark an abandoned cart as recovered or update status
app.put('/api/abandoned-carts/:id/recover', protect, admin, async (req, res) => {
  try {
    const { status, messageSent } = req.body;
    const cart = await AbandonedCart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    if (status) cart.recoveryStatus = status;
    if (messageSent !== undefined) {
      cart.recoveryMessageSent = messageSent;
      
      // Feature: Auto-Send Recovery WhatsApp Message
      if (messageSent && req.body.sendAutoMessage && cart.customerPhone) {
        sendRecoveryWhatsapp(cart.customerPhone, cart.customerName || 'Valued Customer').catch(err => console.error('Failed to send auto-recovery whatsapp:', err));
      }
    }
    
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating abandoned cart' });
  }
});

// Notify Admin about Abandoned Cart
app.post('/api/abandoned-carts/:id/notify-admin', protect, async (req, res) => {
  try {
    const cart = await AbandonedCart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    // Prevent spamming if already recovered or marked lost
    if (cart.recoveryStatus !== 'Pending') return res.json({ message: 'Cart no longer pending' });
    
    // Notify admin via Email & WhatsApp
    sendAdminAbandonedCartEmail(cart.customerName || 'Guest', cart.serviceName, cart.totalPrice, cart.dropoffStep).catch(e => console.error(e));
    sendAdminAbandonedCartWhatsapp(cart.customerName || 'Guest', cart.serviceName, cart.totalPrice, cart.dropoffStep).catch(e => console.error(e));
    
    res.json({ message: 'Admin notified' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating abandoned cart' });
  }
});

// ==========================================
// 15. ADMIN ANALYTICS & DASHBOARD STATS
// ==========================================

app.get('/api/admin/stats', protect, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    
    // Revenue and top services
    const orders = await Order.find();
    let totalRevenue = 0;
    const servicesCount = {};
    const statusCount = { Pending: 0, Cutting: 0, Stitching: 0, Ready: 0, Delivered: 0, Cancelled: 0 };
    
    // Time-series data grouping (Last 6 Months)
    const monthlyRevenue = {};
    const monthlyOrders = {};

    orders.forEach(o => {
      // Exclude cancelled from total revenue if needed, but we'll count all valid ones
      if (o.status !== 'Cancelled') {
        totalRevenue += o.totalPrice || 0;
      }
      
      servicesCount[o.serviceName] = (servicesCount[o.serviceName] || 0) + 1;
      if (statusCount[o.status] !== undefined) {
        statusCount[o.status] += 1;
      }

      // Group by Month (e.g., "Jan", "Feb")
      const date = new Date(o.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      
      monthlyOrders[month] = (monthlyOrders[month] || 0) + 1;
      if (o.status !== 'Cancelled') {
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (o.totalPrice || 0);
      }
    });

    const topServices = Object.keys(servicesCount)
      .map(name => ({ _id: name, count: servicesCount[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const byStatus = Object.keys(statusCount).map(key => ({
      _id: key,
      count: statusCount[key]
    }));

    // Format time-series data for recharts
    const chartData = Object.keys(monthlyOrders).map(month => ({
      name: month,
      revenue: monthlyRevenue[month] || 0,
      orders: monthlyOrders[month] || 0
    }));

    res.json({
      orders: { total: totalOrders, byStatus },
      customers: { total: totalCustomers },
      revenue: { total: totalRevenue },
      services: { topServices },
      chartData // Sent to frontend for rendering AreaChart
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

module.exports = app;
