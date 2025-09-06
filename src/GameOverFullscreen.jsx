import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";

export default function GameOverFullscreen({ onRestart }) {
  const [aniData, setAniData] = useState(null);
  useEffect(() => {
    fetch("/ani.json")
      .then(res => res.json())
      .then(setAniData);
  }, []);
  if (!aniData) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'transparent',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'all'
    }}>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 200
      }}>
        <span style={{ fontSize: 32, color: 'green', fontWeight: 700, textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>Peli ohi!</span>
        <div style={{ width: 260, maxWidth: '90vw' }}>
          <Lottie
            animationData={aniData}
            loop={false}
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        <button
          onClick={onRestart}
          style={{ 
            fontSize: 22, 
            padding: '14px 44px',
            borderRadius: 10, 
            background: '#1a73e8', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 700, 
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          Uudestaan
        </button>
      </div>
    </div>
  );
}

