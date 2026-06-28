import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function TermsConditions() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Genius Tailors</title>
        <meta name="description" content="Terms and Conditions for Genius Tailors. Understand the rules and regulations for using our online tailoring platform." />
      </Helmet>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ivory)' }}>
        <Navbar />

        <section style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '4rem', flex: 1 }}>
          <div className="container" style={{ maxWidth: '800px', background: 'white', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
            <h1 className="text-heading-1" style={{ marginBottom: '2rem' }}>Terms & Conditions</h1>
            
            <div className="terms-content">
              <p><strong>Effective Date:</strong> January 1, 2026</p>
              
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using the Genius Tailors website and services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
              
              <h2>2. Services Offered</h2>
              <p>Genius Tailors provides bespoke tailoring services for men's traditional wear, including Kameez Shalwar, Kurta Shalwar, Waistcoats, and Zardari Suits. We offer both online measurement submissions and an AI measurement estimation tool.</p>
              
              <h2>3. Order and Payment</h2>
              <ul>
                <li>All orders are subject to acceptance and availability.</li>
                <li>Pricing for services is subject to change without prior notice.</li>
                <li>Full payment or an agreed-upon advance payment is required before we begin processing your tailored garments.</li>
                <li>Once an order has entered the cutting or stitching phase, it cannot be canceled.</li>
              </ul>
              
              <h2>4. Measurements and Alterations</h2>
              <p>We craft garments based precisely on the measurements provided by you or extracted via our AI tool. It is your responsibility to ensure the measurements submitted are accurate. We offer complimentary minor alterations within 7 days of delivery if the final garment deviates from the provided measurements.</p>
              
              <h2>5. Delivery and Timelines</h2>
              <p>Standard turnaround times are provided during checkout (typically 5-12 working days). We strive to meet these timelines, but delays may occur due to high volume, material availability, or unforeseen logistical challenges. We are not liable for delays caused by third-party delivery services.</p>
              
              <h2>6. User Accounts</h2>
              <p>When you create an account with us, you must provide accurate and complete information. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure.</p>
              
              <h2>7. Loyalty Program</h2>
              <p>Loyalty points earned have no cash value and can only be redeemed as discounts on future purchases at Genius Tailors. We reserve the right to modify or terminate the loyalty program at any time.</p>
              
              <h2>8. Intellectual Property</h2>
              <p>All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Genius Tailors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>

              <h2>9. Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws of Pakistan. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of Pakistan.</p>
              
              <h2>10. Contact Information</h2>
              <p>If you have any questions about these Terms & Conditions, please contact us at:</p>
              <p><strong>Genius Tailors</strong><br/>
              Email: geniustailors110@gmail.com<br/>
              Phone: +92 333 266 2110</p>
            </div>
          </div>
        </section>

        <Footer />

        <style>{`
          .terms-content h2 {
            font-family: var(--font-serif);
            color: var(--onyx);
            font-size: 1.5rem;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
          }
          .terms-content p, .terms-content ul {
            color: var(--stone);
            line-height: 1.8;
            margin-bottom: 1rem;
          }
          .terms-content ul {
            padding-left: 1.5rem;
          }
          .terms-content li {
            margin-bottom: 0.5rem;
          }
          @media (max-width: 768px) {
            .container { padding: 2rem !important; }
          }
        `}</style>
      </div>
    </>
  );
}
