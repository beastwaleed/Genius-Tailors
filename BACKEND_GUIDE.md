# 🧵 Genius Tailors — Backend & Database Complete Guide

> **Target Audience:** Hyderabad, Pakistan local tailoring business  
> **Status:** Backend 100% complete. Frontend remaining.

---

## 📧 PART 1 — Gmail Email Setup (Do This Before Going Live)

The backend sends emails for order confirmations, status updates, and password resets.  
You need to fill two values in your `.env` file.

### What You Need
| Variable | What it is |
|---|---|
| `EMAIL_USER` | Your business Gmail address (e.g. `geniustailors110@gmail.com`) |
| `EMAIL_APP_PASSWORD` | A special 16-character password created by Google — NOT your real password |

### Step-by-Step

**Step 1** — Create or use an existing Gmail for the business  
e.g. `geniustailors110@gmail.com`

**Step 2** — Enable 2-Factor Authentication on that Gmail
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Under *"How you sign in to Google"*, click **2-Step Verification**
4. Follow the steps and turn it **ON**

> ⚠️ This step is required. App Passwords only appear after 2FA is enabled.

**Step 3** — Create an App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Type a name like **"Genius Tailors App"**
3. Click **Create**
4. Google shows a 16-character password like: `abcd efgh ijkl mnop`
5. **Copy it immediately** — Google will never show it again

**Step 4** — Paste into your `.env` file
```env
EMAIL_USER=geniustailors.hyd@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop
```
> Remove the spaces. Write all 16 characters together.

**Step 5** — Update `FRONTEND_URL` for production
```env
# Local development:
FRONTEND_URL=http://localhost:5173

# After deploying frontend (replace with your real domain):
FRONTEND_URL=https://geniustailors.vercel.app
```

---

## 🗄️ PART 2 — Database Models (What's Stored in MongoDB)

### 6 Collections in MongoDB

#### 1. `Users`
Stores every person who registers on the platform.
| Field | Purpose |
|---|---|
| `name`, `email`, `password` | Basic account info (password is hashed — never stored in plain text) |
| `role` | `Guest`, `Customer`, or `Admin` — controls what they can access |
| `loyaltyPoints` | Running total of points earned from orders |
| `membershipLevel` | `Bronze` / `Silver` / `Gold` — auto-upgrades as points grow |
| `resetPasswordToken` | Temporary hashed token for forgot-password flow (expires in 15 min) |

#### 2. `Services`
The garment catalog — what the tailor offers.
| Field | Purpose |
|---|---|
| `name` | Garment name (Shalwar Kameez, Kurta, Sherwani, etc.) |
| `basePrice` | Starting price of the garment |
| `customizations` | Available style options: collar, sleeves, front, back, bottom styles |
| `isActive` | Soft delete — deactivated services don't appear on the website |

#### 3. `MeasurementProfiles`
Each customer can save multiple measurement sets (e.g. "Office Wear", "Wedding Suit").
| Field | Purpose |
|---|---|
| `customer` | Links to the User who owns this profile |
| `profileName` | Label for the profile |
| `measurements` | Flexible key-value map (chest: 40, length: 42, shoulder: 18, etc.) |

#### 4. `Orders`
The core of the business — every order placed.
| Field | Purpose |
|---|---|
| `customer` | Who placed the order |
| `serviceName` | Which garment was ordered |
| `styleVariations` | Selected collar, sleeve, front, bottom styles |
| `measurementSnapshot` | **Frozen copy** of measurements at order time — future edits won't break old orders |
| `status` | `Pending → Cutting → Stitching → Ready → Delivered → Cancelled` |
| `totalPrice`, `pointsEarned` | Financial and loyalty data |
| `referenceImageUrl` | Cloudinary link to customer's uploaded design image |
| `customerNote` | Special instructions ("make it 2 inches longer", "loose fit") |
| `adminNotes` | Private tailor notes — not visible to customer |
| `estimatedDelivery` | Date set by tailor when updating status |
| `neededByDate` | Customer's deadline (e.g., wedding date) — used in normal-season sorting |
| `isPriority` | Auto-true for Gold members during peak seasons |
| `isRush` | Customer-requested fast-track delivery |
| `season` | Season name when order was placed (e.g., "Ramazan 2026") |

#### 5. `LoyaltyRecords`
A transaction log for every point earned or redeemed.
| Field | Purpose |
|---|---|
| `customer` | Who the record belongs to |
| `order` | Which order triggered this (if applicable) |
| `type` | `earned` or `redeemed` |
| `points` | How many points |
| `description` | Human-readable note (e.g., "Earned 50 points on Shalwar Kameez") |

#### 6. `SeasonConfigs`
Controls Ramazan/Eid priority mode.
| Field | Purpose |
|---|---|
| `name` | Season label ("Ramazan 2026", "Eid ul Fitr 2026") |
| `type` | `Ramazan`, `Eid`, or `Normal` |
| `startDate`, `endDate` | Season duration |
| `isActive` | Only one season can be active at a time |
| `announcement` | Message shown as banner on the website during this season |

---

## 🔌 PART 3 — All API Endpoints (35 Total)

### Authentication
| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create new customer account |
| POST | `/api/auth/login` | Public | Login, get JWT token |
| POST | `/api/auth/forgot-password` | Public | Send password reset link to email |
| POST | `/api/auth/reset-password/:token` | Public | Set new password using reset link |

### User Profile
| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| GET | `/api/profile` | Customer | Get own profile info |
| PUT | `/api/profile` | Customer | Update name, email, or password |

### Services (Garment Catalog)
| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| GET | `/api/services` | Public | Browse all active garments |
| POST | `/api/services` | Admin | Add a new service |
| PUT | `/api/services/:id` | Admin | Update price or styles |
| DELETE | `/api/services/:id` | Admin | Deactivate a service |

### Measurement Profiles
| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| POST | `/api/measurements` | Customer | Save a new measurement profile |
| GET | `/api/measurements` | Customer | Get all own profiles |
| PUT | `/api/measurements/:id` | Customer | Update a profile |
| DELETE | `/api/measurements/:id` | Customer | Delete a profile |

### Orders
| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| POST | `/api/orders` | Customer | Place a new order |
| GET | `/api/orders/myorders` | Customer | View own order history |
| GET | `/api/orders/:id` | Customer/Admin | View single order detail |
| PUT | `/api/orders/:id/cancel` | Customer | Cancel if still Pending |
| POST | `/api/orders/:id/reorder` | Customer | Clone a past order |
| GET | `/api/orders` | Admin | View all orders |
| PUT | `/api/orders/:id/status` | Admin | Update status + estimated delivery |

### Loyalty Points
| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| POST | `/api/loyalty/redeem` | Customer | Redeem points for discount |
| GET | `/api/loyalty/history` | Customer | Full transaction history |

### Image Upload
| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| POST | `/api/upload/reference-image` | Customer | Upload design reference image |

### Seasons & Priority Queue
| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| GET | `/api/season/active` | Public | Check if a peak season is live |
| GET | `/api/season` | Admin | List all seasons |
| POST | `/api/season` | Admin | Create a new season |
| PUT | `/api/season/:id/activate` | Admin | Start a season (auto-deactivates others) |
| PUT | `/api/season/:id/deactivate` | Admin | End a season |
| GET | `/api/admin/orders/priority-queue` | Admin | Smart-sorted workload |
| PUT | `/api/admin/orders/:id/priority` | Admin | Manually override priority |

### Admin Tools
| Method | Endpoint | Who Can Use | What It Does |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Revenue, top services, customer analytics |
| GET | `/api/admin/customers` | Admin | All customers, filter by `?level=Gold` |
| GET | `/api/admin/customers/:id/orders` | Admin | All orders for a specific customer |
| POST | `/api/admin/orders/:id/notes` | Admin | Add private tailor note |
| DELETE | `/api/admin/orders/:id/notes/:noteId` | Admin | Delete a tailor note |

---

## ⚙️ PART 4 — Technology Stack (Plain English)

### Runtime & Framework

| Technology | What It Is | How It Helps This Project |
|---|---|---|
| **Node.js** | JavaScript that runs on a server | Powers the entire backend — handles all incoming requests from customers and admins |
| **Express.js** | A framework that organizes your Node.js server | Creates clean routes like `/api/orders` instead of raw HTTP code. Makes adding new features easy |

### Database

| Technology | What It Is | How It Helps This Project |
|---|---|---|
| **MongoDB** | A database that stores data as flexible JSON-like documents | Stores all customers, orders, measurements, and services. Flexible structure is perfect for variable measurement fields |
| **Mongoose** | A library connecting Node.js to MongoDB | Defines strict schemas — e.g., "price must be a number", "status must be one of 6 values". Prevents bad data from entering the DB |
| **MongoDB Atlas** | Cloud hosting for MongoDB | Your database lives on Atlas servers — no server to manage. Free 512 MB tier fits thousands of customers |

### Authentication & Security

| Technology | What It Is | How It Helps This Project |
|---|---|---|
| **JWT (jsonwebtoken)** | Secure tokens that prove identity | Customer logs in → gets a token → sends it with every request. Server verifies without checking the DB each time. Fast and stateless |
| **bcryptjs** | Password hashing library | Converts passwords into unreadable scrambled text before saving. Even if your DB is breached, passwords are safe |
| **crypto** (Node built-in) | Node.js security toolkit | Generates secure random password reset tokens that expire in 15 minutes — unpredictable and one-time-use |

### File & Image Handling

| Technology | What It Is | How It Helps This Project |
|---|---|---|
| **Cloudinary** | Cloud image storage | Customer's reference images go to Cloudinary — not MongoDB. Keeps database tiny and fast. Free tier: 25 GB |
| **Multer** | File upload middleware | Handles receiving image files from the frontend |
| **multer-storage-cloudinary** | Connects Multer to Cloudinary | Images stream directly from customer's browser → your server → Cloudinary. No temp files on your server |

### Email

| Technology | What It Is | How It Helps This Project |
|---|---|---|
| **Nodemailer** | Email sending library | Sends 3 types of branded HTML emails: order confirmation, status update ("Your suit is ready!"), and password reset links |

### Environment & Deployment

| Technology | What It Is | How It Helps This Project |
|---|---|---|
| **dotenv** | Loads secrets from `.env` file | Keeps database passwords, API keys, and JWT secrets out of your code. Never committed to GitHub |
| **cors** | Cross-Origin middleware | Allows your React frontend (different URL) to talk to this backend. Without it, browsers block all requests |
| **Vercel** | Serverless deployment platform | Hosts your backend in the cloud. Each route becomes a serverless function. Scales automatically. Free tier available |

---

## 🚀 PART 5 — Publish Readiness Checklist

### ✅ Already Done
- [x] All 35 API endpoints implemented and boot-tested
- [x] Passwords hashed with bcrypt — never stored in plain text
- [x] JWT authentication on all protected routes
- [x] Role-based access control (Customer vs Admin)
- [x] Ownership checks — customers can only see their own data
- [x] Soft deletes — services deactivated, not permanently removed
- [x] Measurement snapshots — past orders never break if customer edits measurements
- [x] Serverless-compatible MongoDB connection caching
- [x] `vercel.json` configured for deployment
- [x] Non-blocking emails — server never crashes if email fails
- [x] Image upload via Cloudinary — database stays small and fast
- [x] Input validation on all critical routes
- [x] Order cancellation only allowed in Pending stage
- [x] Priority queue respects peak season vs normal season logic
- [x] Password reset tokens expire after 15 minutes

### ⏳ You Must Do Before Going Live
- [ ] **Email setup** — Fill `EMAIL_USER` and `EMAIL_APP_PASSWORD` in `.env` (see Part 1)
- [ ] **Stronger JWT secret** — Replace the current simple one (see below)
- [ ] **Update `FRONTEND_URL`** — Change to your real deployed frontend domain
- [ ] **Add `.env` to `.gitignore`** — Never push secrets to GitHub
- [ ] **Copy all `.env` values to Vercel dashboard** — Under Project Settings → Environment Variables
- [ ] **Run `npm audit fix`** — Fixes the 2 reported dependency vulnerabilities

### 🔒 Generate a Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as your `JWT_SECRET` in `.env`.

### 📁 Final File Structure
```
backend/
├── api/
│   └── index.js              ← All 35 routes
├── src/
│   ├── config/
│   │   ├── db.js             ← MongoDB connection (serverless-safe)
│   │   ├── cloudinary.js     ← Image upload config
│   │   └── email.js          ← 3 HTML email templates
│   ├── middlewares/
│   │   └── authMiddleware.js ← JWT protect + admin guard
│   └── models/
│       ├── User.js
│       ├── Service.js
│       ├── MeasurementProfile.js
│       ├── Order.js
│       ├── LoyaltyRecord.js
│       └── SeasonConfig.js
├── .env                      ← ⚠️ NEVER push to GitHub
├── .gitignore                ← Make sure .env is listed here
├── vercel.json               ← Deployment config
└── package.json
```
