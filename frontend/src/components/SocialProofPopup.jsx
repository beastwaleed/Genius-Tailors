import React, { useState, useEffect } from 'react';
import ShalwarKameezFeaturedImage from '../assets/ShalwarKameezFeaturedImage.jpeg';
import HeroKurtaPajama from '../assets/HeroKurtaPajama.jpeg';
import WaistcoatFront from '../assets/waistcoatfront.jpeg';
import MainShalwarKameez from '../assets/MainShalwarKameez.jpeg';
import angularEdgeMain from '../assets/AngularEdgeMain.jpeg';

const mockData = [
  { name: 'Majid Idrees', city: 'Karachi', service: 'Shalwar Kameez', time: '1 hour ago', img: ShalwarKameezFeaturedImage },
  { name: 'Ali Khan', city: 'Lahore', service: 'Kurta Pajama', time: '2 hours ago', img: HeroKurtaPajama },
  { name: 'Zain Abbas', city: 'Islamabad', service: 'Waistcoat', time: '5 hours ago', img: WaistcoatFront },
  { name: 'Faizan Tariq', city: 'Faisalabad', service: 'Premium Kameez Shalwar', time: '1 day ago', img: MainShalwarKameez },
  { name: 'Usman Ghani', city: 'Rawalpindi', service: 'Angular Edge Kurta', time: '3 hours ago', img: angularEdgeMain },
  { name: 'Ahmed Raza', city: 'Multan', service: 'Shalwar Kameez', time: '30 mins ago', img: ShalwarKameezFeaturedImage },
  { name: 'Bilal Ahmed', city: 'Hyderabad', service: 'Kurta Pajama', time: '10 mins ago', img: HeroKurtaPajama },
];

export default function SocialProofPopup() {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(Math.floor(Math.random() * mockData.length)); // Start at a random index

  useEffect(() => {
    // Show a popup
    const showPopup = () => {
      setVisible(true);

      // Hide after 6 seconds
      setTimeout(() => {
        setVisible(false);
        // After it hides, move to the next item so the next time it shows, it's different
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % mockData.length);
        }, 500); // Wait for the exit animation to finish before swapping data
      }, 6000);
    };

    // Initial timeout before first popup
    const initialDelay = setTimeout(() => {
      showPopup();
    }, 5000); // 5 seconds after page load

    // Then interval every 25 seconds
    const interval = setInterval(() => {
      showPopup();
    }, 25000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  const data = mockData[currentIndex];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        borderRadius: '6px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 9999,
        width: '320px',
        border: '1px solid #eaeaea',
        fontFamily: "'Inter', sans-serif",
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      <button 
        onClick={() => setVisible(false)}
        style={{
          position: 'absolute',
          top: '6px',
          right: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#999',
          fontSize: '14px',
          padding: '4px',
        }}
        aria-label="Close notification"
      >
        <i className="fa-solid fa-times"></i>
      </button>

      <div style={{ flexShrink: 0 }}>
        <img 
          src={data.img} 
          alt={data.service} 
          style={{ 
            width: '50px', 
            height: '50px', 
            objectFit: 'cover', 
            borderRadius: '4px' 
          }} 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {data.name} has purchased!
        </p>
        <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>
          {data.service}
        </p>
        <p style={{ margin: 0, fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i className="fa-regular fa-clock" style={{ fontSize: '10px' }}></i>
          {data.time} - {data.city}, Pakistan
        </p>
      </div>
    </div>
  );
}
