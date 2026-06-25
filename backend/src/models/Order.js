const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  serviceName: { 
    type: String, 
    required: true // e.g., "Shalwar Kameez"
  },
  // The customized layers selected by the user
  styleVariations: {
    collar: { type: String },
    collarSub: { type: String },
    cuff: { type: String },
    pockets: { type: String },
    bottomPocket: { type: String },
    bottomDesign: { type: String }
  },
  // The fabric selected by the customer (own fabric or premium store fabric)
  fabricSelection: { 
    type: String, 
    default: 'Provide my own fabric' 
  },
  // The color of the fabric if purchased from store
  fabricColor: {
    type: String,
    default: ''
  },
  // SNAPSHOT: The exact measurements embedded securely at the time of order
  measurementSnapshot: {
    profileName: { type: String, required: true },
    measurements: { type: Map, of: String, required: true } 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Cutting', 'Stitching', 'Ready', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  pointsEarned: { 
    type: Number, 
    default: 0 
  },
  pointsUsed: {
    type: Number,
    default: 0
  },

  // ── PostEx Logistics Integration ─────────────────────────────────────────
  trackingNumber: {
    type: String,
    default: null
  },
  postexSyncStatus: {
    type: String,
    enum: ['Pending', 'Synced', 'Failed'],
    default: 'Pending'
  },
  deliveryCity: {
    type: String,
    default: ''
  },
  deliveryAddress: {
    type: String,
    default: ''
  },

  // ── Priority System (Ramazan/Eid Queue) ──────────────────────────
  // Auto-set to true for Gold members when a peak season is active.
  // Admins can also manually override this.
  isPriority: {
    type: Boolean,
    default: false
  },
  // Customer can request a rush order (comes with extra charge on the frontend)
  isRush: {
    type: Boolean,
    default: false
  },
  // The name of the active season when this order was placed (e.g., "Ramazan 2026")
  // Empty string means it was a regular off-season order.
  season: {
    type: String,
    default: ''
  },

  // Optional reference image uploaded by the customer at order time.
  // Stores only the Cloudinary URL — the actual image lives on Cloudinary's servers.
  referenceImageUrl: {
    type: String,
    default: null
  },

  // ── Feature 1: Special Instructions ─────────────────────────────
  // Customer's free-text note placed at order time.
  // e.g., "Make kameez 2 inches longer", "Loose fit please"
  customerNote: {
    type: String,
    default: ''
  },

  // ── Feature 2: Admin Internal Notes ─────────────────────────────
  // Private notes added by the tailor — NOT exposed to the customer.
  // e.g., "Fabric arrived", "Called customer about collar change"
  adminNotes: [
    {
      text:      { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],

  // ── Feature 4: Estimated Delivery Date ──────────────────────────
  // Set by the admin when updating order status.
  // Shown to the customer: "Your suit will be ready by June 25."
  estimatedDelivery: {
    type: Date,
    default: null
  },

  // ── Feature 8: Needed-By Date (Customer Deadline) ────────────────
  // Customer specifies when they need the order (e.g., wedding date).
  // Used in non-peak-season priority sorting (soonest deadline first).
  // IGNORED during peak seasons — admin decides priority manually.
  neededByDate: {
    type: Date,
    default: null
  }

}, { timestamps: true });

orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);