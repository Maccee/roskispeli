
import React, { useState, useEffect } from "react";
import TrashLottie from "./TrashLottie";
import GameOverFullscreen from "./GameOverFullscreen";

const MIN_BOXES = 5;
const MAX_BOXES = 10;
const DEFAULT_BOXES = 5;

export default function Game() {
  const [maxNumber, setMaxNumber] = useState(20);
  const [numBoxes, setNumBoxes] = useState(DEFAULT_BOXES);
  const [boxes, setBoxes] = useState(Array(DEFAULT_BOXES).fill(null));
  const [currentNumber, setCurrentNumber] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [usedNumbers, setUsedNumbers] = useState([]);
  const [trash, setTrash] = useState([]);
  const [trashAnimTrigger, setTrashAnimTrigger] = useState(false);
  // Using a ref for the audio element to avoid re-creation on render
  const [gameOverSound, setGameOverSound] = useState(null);
  
  // Initialize audio element once when component mounts
  useEffect(() => {
    const audio = new Audio("/gameover.mp3");
    setGameOverSound(audio);
  }, []);
  const allBoxesFilled = boxes.every(b => b !== null);

  function startGame() {
    setBoxes(Array(numBoxes).fill(null));
    setUsedNumbers([]);
    setTrash([]);
    setGameStarted(true);
    nextNumber([]);
  }

  function nextNumber(used) {
    const available = [];
    for (let i = 1; i <= maxNumber; i++) {
      if (!used.includes(i)) available.push(i);
    }
    if (available.length === 0) {
      setCurrentNumber(null);
      return;
    }
    const rand = available[Math.floor(Math.random() * available.length)];
    setCurrentNumber(rand);
  }

  function canPlace(num, idx) {
    // Check left side
    for (let i = 0; i < idx; i++) {
      if (boxes[i] !== null && boxes[i] >= num) return false;
    }
    // Check right side
    for (let i = idx + 1; i < boxes.length; i++) {
      if (boxes[i] !== null && boxes[i] <= num) return false;
    }
    if (boxes[idx] !== null) return false;

    // New logic: ensure enough available numbers to fill all empty boxes in strictly increasing order
    // Gather all placed numbers and the candidate
    const filled = boxes.map((v, i) => (i === idx ? num : v)).map(v => v === null ? null : v);
    // Find all empty indices
    const emptyIndices = [];
    for (let i = 0; i < filled.length; i++) {
      if (filled[i] === null) emptyIndices.push(i);
    }
    // Get all available numbers
    const used = [...usedNumbers, num];
    const available = [];
    for (let i = 1; i <= maxNumber; i++) {
      if (!used.includes(i)) available.push(i);
    }
    // Try to greedily assign available numbers to empty slots so that the whole array is strictly increasing
    let prev = -Infinity;
    let availIdx = 0;
    for (let i = 0; i < filled.length; i++) {
      if (filled[i] !== null) {
        if (filled[i] <= prev) return false;
        prev = filled[i];
      } else {
        // Find the smallest available number greater than prev
        while (availIdx < available.length && available[availIdx] <= prev) availIdx++;
        if (availIdx >= available.length) return false;
        prev = available[availIdx];
        availIdx++;
      }
    }
    return true;
  }

  function trashNumber() {
    if (currentNumber === null) return;
    
    // Check if the number can be placed in any box
    let canBePlacedAnywhere = false;
    for (let i = 0; i < boxes.length; i++) {
      if (canPlace(currentNumber, i)) {
        canBePlacedAnywhere = true;
        break;
      }
    }
    
    // Only allow trashing if the number cannot be placed anywhere
    if (!canBePlacedAnywhere) {
      setTrash([...trash, currentNumber]);
      setTrashAnimTrigger(t => !t); // toggle to trigger animation
      const newUsed = [...usedNumbers, currentNumber];
      setUsedNumbers(newUsed);
      nextNumber(newUsed);
    }
  }
  
  function placeNumber(idx) {
    if (currentNumber === null || allBoxesFilled) return;
    if (!canPlace(currentNumber, idx)) return;
    const newBoxes = [...boxes];
    newBoxes[idx] = currentNumber;
    const newUsed = [...usedNumbers, currentNumber];
    setBoxes(newBoxes);
    setUsedNumbers(newUsed);
    setTimeout(() => {
      autoHandleNext(newBoxes, newUsed);
    }, 200);
  }

  // Removed auto-placement of min and max numbers
  // Let users place them manually

  function autoHandleNext(boxesState, usedState) {
    if (boxesState.every(b => b !== null)) {
      setCurrentNumber(null);
      // Play game over sound when all boxes are filled
      playGameOverSound();
      return;
    }
    // Generate the next number without auto-trashing
    const available = [];
    for (let i = 1; i <= maxNumber; i++) {
      if (!usedState.includes(i)) available.push(i);
    }
    if (available.length === 0) {
      setCurrentNumber(null);
      // Play game over sound when no more numbers are available
      playGameOverSound();
      return;
    }
    const rand = available[Math.floor(Math.random() * available.length)];
    setCurrentNumber(rand);
  }
  
  // Function to play the game over sound
  function playGameOverSound() {
    if (!gameOverSound) return;
    
    try {
      gameOverSound.currentTime = 0; // Reset the audio to the start
      gameOverSound.play().catch(e => console.log("Audio play failed:", e));
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  }

  function canPlaceWithState(num, idx, boxesState) {
    for (let i = 0; i < idx; i++) {
      if (boxesState[i] !== null && boxesState[i] >= num) return false;
    }
    for (let i = idx + 1; i < boxesState.length; i++) {
      if (boxesState[i] !== null && boxesState[i] <= num) return false;
    }
    return boxesState[idx] === null;
  }
  
  // Function to check if current number can be placed in any box
  function canTrashCurrentNumber() {
    if (currentNumber === null) return false;
    
    // Check if the number can be placed in any box
    for (let i = 0; i < boxes.length; i++) {
      if (canPlace(currentNumber, i)) {
        return true; // Number can be placed somewhere
      }
    }
    return false; // Number cannot be placed anywhere
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        background: '#f8fafc',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          padding: '0 8px',
          margin: 0,
        }}
      >
      <div style={{ margin: '24px 0 12px 0', display: 'flex', justifyContent: 'center' }}>
        <img src="/roskispeli.webp" alt="Roskis Peli" style={{ maxWidth: '240px', width: '100%' }} />
      </div>
      {!gameStarted ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, color: '#222', marginBottom: 8 }}>
              Laatikoiden määrä:
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 8,
              flexWrap: 'wrap'
            }}>
              {[5, 6, 7, 8, 9, 10].map((num) => (
                <div
                  key={num}
                  onClick={() => setNumBoxes(num)}
                  style={{
                    width: 46,
                    height: 46,
                    border: '2px solid #333',
                    borderRadius: 10,
                    background: numBoxes === num ? '#e3f6e3' : '#f3f3f3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 700,
                    color: numBoxes === num ? '#1a1a1a' : '#666',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s',
                    boxShadow: numBoxes === num ? '0 0 6px #bdf' : 'none'
                  }}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 18, color: '#222' }}>
              Suurin numero:
              <input
                type="number"
                min={numBoxes}
                max={999}
                value={maxNumber}
                onChange={e => setMaxNumber(Math.max(numBoxes, Math.min(999, Number(e.target.value))))}
                style={{ marginLeft: 8, fontSize: 18, width: 70, borderRadius: 6, border: '1.5px solid #bbb', padding: '2px 6px' }}
              />
            </label>
            <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              ({numBoxes}-999)
            </div>
          </div>
          <button onClick={startGame} style={{ marginTop: 16, fontSize: 18, padding: '8px 28px', borderRadius: 8, background: '#1a73e8', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            Aloita peli
          </button>
        </div>
      ) : (
        <>
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: 24 }}>
              {currentNumber !== null && !allBoxesFilled ? (
                <span style={{ fontSize: 24, color: '#1a1a1a' }}>
                  Sijoita numero: <b>{currentNumber}</b>
                </span>
              ) : null}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 16,
                flexWrap: 'wrap',
                maxWidth: 360,
                marginLeft: 'auto',
                marginRight: 'auto',
                width: '100%'
              }}
            >
              {boxes.map((num, idx) => {
                const canClick = currentNumber !== null && canPlace(currentNumber, idx) && !allBoxesFilled;
                return (
                  <div
                    key={idx}
                    onClick={() => canClick && placeNumber(idx)}
                    style={{
                      width: 56,
                      height: 56,
                      border: '2px solid #333',
                      borderRadius: 10,
                      background: num !== null ? '#fff' : canClick ? '#e3f6e3' : '#f3f3f3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      fontWeight: 700,
                      color: num !== null ? '#1a1a1a' : '#888',
                      cursor: canClick ? 'pointer' : 'not-allowed',
                      userSelect: 'none',
                      transition: 'background 0.2s',
                      boxShadow: canClick ? '0 0 6px #bdf' : undefined
                    }}
                  >
                    {num !== null ? num : ''}
                  </div>
                );
              })}
            </div>
            <div style={{ minHeight: 40, marginBottom: 8 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div 
                  style={{ 
                    marginBottom: 4,
                    cursor: currentNumber !== null && !canTrashCurrentNumber() ? 'pointer' : 'not-allowed',
                    opacity: currentNumber !== null && !canTrashCurrentNumber() ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    borderRadius: '50%',
                    boxShadow: currentNumber !== null && !canTrashCurrentNumber() ? '0 0 6px rgba(204,0,0,0.4)' : 'none',
                  }}
                  onClick={trashNumber}
                  title={
                    currentNumber === null 
                      ? "No number to trash" 
                      : canTrashCurrentNumber() 
                        ? "This number can be placed in a box" 
                        : "Trash this number"
                  }
                >
                  <TrashLottie trigger={trashAnimTrigger} />
                </div>
                {trash.length > 0 && (
                  <div
                    style={{
                      minHeight: 32,
                      minWidth: 120,
                      background: '#ffeaea',
                      border: '1.5px dashed #c00',
                      borderRadius: 8,
                      padding: '4px 8px',
                      fontSize: 16,
                      wordBreak: 'break-word',
                      color: '#c00',
                      fontWeight: 600
                    }}
                  >
                    {trash.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
          {(currentNumber === null || allBoxesFilled) && (
            <GameOverFullscreen onRestart={() => setGameStarted(false)} />
          )}
        </>
      )}
      </div>
    </div>
  );
}
