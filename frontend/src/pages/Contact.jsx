import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import api from '../api';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/contact', formData);
      toast.success('Your message has been sent. We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Genius Tailors Pakistan</title>
        <meta name="description" content="Get in touch with Genius Tailors in Hyderabad, Pakistan. Contact us for custom tailoring queries, measurement assistance, or bespoke suit appointments." />
      </Helmet>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ivory)' }}>
      <Navbar />

      <section style={{ paddingTop: 'calc(var(--nav-height) + 5rem)', paddingBottom: '5rem', flex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="text-label" style={{ color: 'var(--onyx)' }}>Get In Touch</span>
            <h1 className="text-heading-1" style={{ marginTop: '0.5rem' }}>Contact Us</h1>
            <p className="text-subtitle" style={{ maxWidth: '600px', margin: '1rem auto 0', color: 'var(--stone)' }}>
              Whether you have a question about our bespoke process, need assistance with measurements, or want to schedule an appointment.
            </p>
          </div>

          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <div className="info-block">
                <h3 className="text-heading-3">Visit the Studio</h3>
                <p>Latifabad Unit 7, near Quba Mosque<br />Hyderabad, Sindh<br />Pakistan</p>
              </div>

              <div className="info-block">
                <h3 className="text-heading-3">Reach Out</h3>
                <p>
                  <strong>Email:</strong> geniustailors110@gmail.com<br />
                  <strong>Phone:</strong> +92 333 266 2110<br />
                  <strong>WhatsApp:</strong> +92 333 266 2110
                </p>
              </div>

              <div className="info-block">
                <h3 className="text-heading-3">Business Hours</h3>
                <p>
                  Monday – Saturday<br />
                  10:00 AM – 10:00 PM<br />
                  Friday: Closed
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-card">
              <h2 className="text-heading-3" style={{ marginBottom: '2rem' }}>Send a Message</h2>
              <form onSubmit={handleSubmit} className="form-layout">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input"
                    rows="5"
                    required
                    style={{ resize: 'vertical' }}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 4rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .info-block {
          margin-bottom: 3rem;
        }

        .info-block h3 {
          margin-bottom: 1rem;
          font-family: var(--font-serif);
          color: var(--onyx);
        }

        .info-block p {
          color: var(--stone);
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .contact-form-card {
          background: white;
          padding: 3rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--ivory-border);
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .contact-form-card {
            padding: 2rem;
          }
        }
      `}</style>
      </div>
    </>
  );
}
