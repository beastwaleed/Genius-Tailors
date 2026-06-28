import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Genius Tailors</title>
        <meta name="description" content="Privacy Policy for Genius Tailors. Read how we collect, use, and protect your personal information and measurements." />
      </Helmet>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ivory)' }}>
        <Navbar />

        <section style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '4rem', flex: 1 }}>
          <div className="container" style={{ maxWidth: '800px', background: 'white', padding: '3rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
            <h1 className="text-heading-1" style={{ marginBottom: '2rem' }}>Privacy Policy</h1>
            
            <div className="policy-content">
              <p><strong>Effective Date:</strong> January 1, 2026</p>
              
              <h2>1. Information We Collect</h2>
              <p>We collect information that you provide directly to us when using Genius Tailors. This includes your name, email address, phone number, shipping address, and specific body measurements required for tailoring services. If you use our AI Measurement Camera, we process your photos solely for the purpose of extracting measurements and do not store the original photos persistently on our servers after extraction.</p>
              
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Create and manage your account.</li>
                <li>Fulfill your custom tailoring orders with precision.</li>
                <li>Communicate with you regarding your orders, appointments, and inquiries.</li>
                <li>Manage our loyalty program and allocate points to your account.</li>
                <li>Improve our website, services, and overall customer experience.</li>
              </ul>
              
              <h2>3. Data Protection and Security</h2>
              <p>We implement strict security measures to protect your personal data. All sensitive information, including passwords and body measurements, is stored securely. We do not sell, trade, or rent your personal identification information to others.</p>
              
              <h2>4. Third-Party Services</h2>
              <p>We may share generic aggregated demographic information not linked to any personal identification information with our business partners and trusted affiliates. We may use third-party service providers to help us operate our business, such as payment processing and delivery logistics.</p>
              
              <h2>5. Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information and measurements at any time through your Profile dashboard. If you need assistance, please contact our support team.</p>
              
              <h2>6. Changes to This Privacy Policy</h2>
              <p>Genius Tailors has the discretion to update this privacy policy at any time. When we do, we will revise the updated date at the top of this page. We encourage Users to frequently check this page for any changes.</p>
              
              <h2>7. Contacting Us</h2>
              <p>If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at:</p>
              <p><strong>Genius Tailors</strong><br/>
              Email: geniustailors110@gmail.com<br/>
              Phone: +92 333 266 2110</p>
            </div>
          </div>
        </section>

        <Footer />

        <style>{`
          .policy-content h2 {
            font-family: var(--font-serif);
            color: var(--onyx);
            font-size: 1.5rem;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
          }
          .policy-content p, .policy-content ul {
            color: var(--stone);
            line-height: 1.8;
            margin-bottom: 1rem;
          }
          .policy-content ul {
            padding-left: 1.5rem;
          }
          .policy-content li {
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
