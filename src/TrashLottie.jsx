import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function TrashLottie({ trigger }) {
  const [aniData, setAniData] = useState(null);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    fetch("/trash.json")
      .then(res => res.json())
      .then(setAniData);
  }, []);

  // Update key when trigger changes to force restart animation
  useEffect(() => {
    if (trigger !== undefined) {
      setPlayKey(prev => prev + 1);
    }
  }, [trigger]);

  if (!aniData) return <div style={{ width: 48, height: 48 }} />;
  
  return (
    <div style={{ width: 68, height: 68 }}>
      <Lottie
        key={playKey}
        animationData={aniData}
        loop={false}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
