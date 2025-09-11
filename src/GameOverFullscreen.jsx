import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";

export default function GameOverFullscreen({ onRestart, isPerfectGame = false }) {
  const [perfectGameAnimation, setPerfectGameAnimation] = useState(null);

  useEffect(() => {
    // Only load animation for perfect game
    if (isPerfectGame) {
      fetch("/ani.json") // Using the existing animation for perfect game
        .then(res => res.json())
        .then(setPerfectGameAnimation);
    }
  }, [isPerfectGame]);

  // Only wait for animation to load if it's a perfect game
  if (isPerfectGame && !perfectGameAnimation) return null;

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
      justifyContent: 'space-between',
      alignItems: 'center',
      pointerEvents: 'all'
    }}>
      {/* Animation Container - Takes up top space */}
      <div style={{ 
        width: '100%',
        height: '70%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {isPerfectGame && (
          <div style={{maxWidth: '90vw', height: '90%'}}>
            <Lottie
              animationData={perfectGameAnimation}
              loop={false}
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>
      
      {/* Button Container - Always at the bottom */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20vh'
      }}>
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
          {isPerfectGame ? 'Uudestaan' : 'Uudestaan'}
        </button>
      </div>
    </div>
  );
}

