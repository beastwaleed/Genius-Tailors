import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import imgDetail from '../assets/port_detail_stitch_1781781054620.png';
import imgModel from '../assets/port_model_classic_1781781070827.png';

export default function About() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ivory)' }}>
      <Navbar />

      <section style={{ paddingTop: 'calc(var(--nav-height) + 5rem)', paddingBottom: '5rem', flex: 1 }}>
        <div className="container">
          <div className="about-hero">
            <span className="text-label" style={{ color: 'var(--onyx)', marginBottom: '1rem', display: 'block' }}>Our Heritage</span>
            <h1 className="text-heading-1" style={{ maxWidth: '800px' }}>
              Masterful Tailoring,<br />Established 1992.
            </h1>
            <p className="text-subtitle" style={{ maxWidth: '700px', margin: '2rem 0', color: 'var(--stone)' }}>
              For over three decades, Genius Tailors has been the premier destination for bespoke traditional menswear in Hyderabad, Pakistan. We blend generations of craftsmanship with a modern, effortless approach to ordering and styling.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-image-wrap">
              <img src={imgDetail} alt="Tailoring Details" />
            </div>
            <div className="about-content">
              <h2 className="text-heading-2">The Pursuit of Perfection</h2>
              <p style={{ marginTop: '1.5rem', lineHeight: '1.8', color: 'var(--stone)' }}>
                Every garment that leaves our workshop is a testament to our dedication to the craft. We source only the finest fabrics and employ master cutters who understand the nuanced geometry of the male form.
              </p>
              <p style={{ marginTop: '1.5rem', lineHeight: '1.8', color: 'var(--stone)' }}>
                A perfectly tailored Kameez Shalwar or Waistcoat isn't just clothing—it's confidence. It's a statement of personal standard. Our bespoke process ensures that not a single millimeter is left to chance. 
              </p>
            </div>
          </div>
          
          <div className="about-grid reverse-grid" style={{ marginTop: '6rem' }}>
            <div className="about-content">
              <h2 className="text-heading-2">Tradition Meets Technology</h2>
              <p style={{ marginTop: '1.5rem', lineHeight: '1.8', color: 'var(--stone)' }}>
                While our needles and threads are steeped in tradition, our service is tailored for the modern gentleman. We have streamlined the bespoke journey, bringing the full tailoring studio experience directly to your doorstep.
              </p>
              <p style={{ marginTop: '1.5rem', lineHeight: '1.8', color: 'var(--stone)' }}>
                With our sophisticated digital platform, managing your measurements, browsing our latest seasons, and tracking your garments is easier than ever before. Your wardrobe is in master hands.
              </p>
            </div>
            <div className="about-image-wrap">
              <img src={imgModel} alt="Classic Tailoring" />
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .about-hero {
          text-align: left;
          margin-bottom: 5rem;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .about-image-wrap {
          width: 100%;
          height: 600px;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .about-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 1024px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .reverse-grid {
            display: flex;
            flex-direction: column-reverse;
          }

          .about-image-wrap {
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
}
