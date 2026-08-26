/**
 * Meta (Facebook) Pixel Helper for Genius Tailors
 * Enables high-converting retargeting campaigns on Instagram & Facebook.
 */

// Default Meta Pixel ID (can be overridden via import.meta.env.VITE_FACEBOOK_PIXEL_ID)
const PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID || '2263974724436670';

export const initMetaPixel = (customPixelId) => {
  const activeId = customPixelId || PIXEL_ID;
  if (!activeId || typeof window === 'undefined') return;

  if (window.fbq) return; // Already initialized

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', activeId);
  window.fbq('track', 'PageView');
};

/**
 * Track PageView on single-page-application route changes
 */
export const trackPageView = () => {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Track when a user views a specific Service or Fabric
 */
export const trackViewContent = (name, value = 0) => {
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: name,
      content_category: 'Tailoring Service',
      value: value,
      currency: 'PKR'
    });
  }
};

/**
 * Track when a customer begins the booking/checkout process
 */
export const trackInitiateCheckout = (serviceName, value = 0) => {
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: serviceName,
      value: value,
      currency: 'PKR'
    });
  }
};

/**
 * Track when a customer successfully completes an order (Purchase Conversion)
 */
export const trackPurchase = (orderId, value = 0) => {
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_name: 'Custom Tailored Garment',
      content_type: 'product',
      value: value,
      currency: 'PKR',
      order_id: orderId
    });
  }
};

/**
 * Track new user registrations or inquiries (Lead Conversion)
 */
export const trackLead = (leadType = 'Registration') => {
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: leadType
    });
  }
};
