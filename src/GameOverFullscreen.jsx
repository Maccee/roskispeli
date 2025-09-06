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
      gap: 50
    }}>
        
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
        style={{ fontSize: 22, padding: '14px 44px', borderRadius: 10, background: '#1a73e8', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: 12 }}
      >
        Uudestaan
      </button>
    </div>
  );
}
