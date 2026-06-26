import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Chatbot from './components/Chatbot';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Customer pages
import Dashboard from './pages/customer/Dashboard';
import PlaceOrder from './pages/customer/PlaceOrder';
import MyOrders from './pages/customer/MyOrders';
import OrderDetail from './pages/customer/OrderDetail';
import Measurements from './pages/customer/Measurements';
import Loyalty from './pages/customer/Loyalty';
import Profile from './pages/customer/Profile';
import Reviews from './pages/customer/Reviews';
import Booking from './pages/customer/Booking';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import PriorityQueue from './pages/admin/PriorityQueue';
import AdminServices from './pages/admin/AdminServices';
import AdminSeasons from './pages/admin/AdminSeasons';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCustomerDetails from './pages/admin/AdminCustomerDetails';
import AdminFabrics from './pages/admin/AdminFabrics';
import AdminPromos from './pages/admin/AdminPromos';
import AdminAbandonedCarts from './pages/admin/AdminAbandonedCarts';

export default function App() {
  const { isLoggedIn, isAdmin } = useAuth();

  return (
    <>
      <Routes>
      {/* ── Public Routes ─────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ── Customer Routes ───────────────────────── */}
      <Route path="/dashboard" element={<ProtectedRoute role="Customer"><Dashboard /></ProtectedRoute>} />
      <Route path="/order/:serviceId" element={<ProtectedRoute role="Customer"><PlaceOrder /></ProtectedRoute>} />
      <Route path="/my-orders" element={<ProtectedRoute role="Customer"><MyOrders /></ProtectedRoute>} />
      <Route path="/my-orders/:id" element={<ProtectedRoute role="Customer"><OrderDetail /></ProtectedRoute>} />
      <Route path="/measurements" element={<ProtectedRoute role="Customer"><Measurements /></ProtectedRoute>} />
      <Route path="/loyalty" element={<ProtectedRoute role="Customer"><Loyalty /></ProtectedRoute>} />
      <Route path="/reviews" element={<ProtectedRoute role="Customer"><Reviews /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="Customer"><Profile /></ProtectedRoute>} />
      <Route path="/book" element={<ProtectedRoute role="Customer"><Booking /></ProtectedRoute>} />
      
      {/* ── Admin Routes ──────────────────────────── */}
      <Route path="/admin" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute role="Admin"><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/orders/:id" element={<ProtectedRoute role="Admin"><AdminOrderDetails /></ProtectedRoute>} />
      <Route path="/admin/queue" element={<ProtectedRoute role="Admin"><PriorityQueue /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute role="Admin"><AdminServices /></ProtectedRoute>} />
      <Route path="/admin/seasons" element={<ProtectedRoute role="Admin"><AdminSeasons /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute role="Admin"><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/customers/:id" element={<ProtectedRoute role="Admin"><AdminCustomerDetails /></ProtectedRoute>} />
      <Route path="/admin/fabrics" element={<ProtectedRoute role="Admin"><AdminFabrics /></ProtectedRoute>} />
      <Route path="/admin/marketing" element={<ProtectedRoute role="Admin"><AdminPromos /></ProtectedRoute>} />
      <Route path="/admin/abandoned-carts" element={<ProtectedRoute role="Admin"><AdminAbandonedCarts /></ProtectedRoute>} />

      {/* ── Catch All ─────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
      <a 
        href="https://wa.me/923332662110" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          color: '#25D366',
          fontSize: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          textDecoration: 'none',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Chat with us on WhatsApp"
      >
        <i className="fa-brands fa-whatsapp"></i>
      </a>
    </>
  );
}
