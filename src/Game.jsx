
import React, { useState } from "react";
import GameOverFullscreen from "./GameOverFullscreen";

const DEFAULT_BOXES = 5;

export default function Game() {
  const [maxNumber, setMaxNumber] = useState(20);
  const [boxes, setBoxes] = useState(Array(DEFAULT_BOXES).fill(null));
  const [currentNumber, setCurrentNumber] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [usedNumbers, setUsedNumbers] = useState([]);
  const [trash, setTrash] = useState([]);
  const allBoxesFilled = boxes.every(b => b !== null);

  function startGame() {
    setBoxes(Array(DEFAULT_BOXES).fill(null));
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

  function placeNumber(idx) {
    if (currentNumber === null) return;
    if (!canPlace(currentNumber, idx)) return;
    const newBoxes = [...boxes];
    newBoxes[idx] = currentNumber;
    const newUsed = [...usedNumbers, currentNumber];
    setBoxes(newBoxes);
    setUsedNumbers(newUsed);
    nextNumber(newUsed);
  }

  function trashNumber() {
    if (currentNumber === null) return;
    setTrash([...trash, currentNumber]);
    const newUsed = [...usedNumbers, currentNumber];
    setUsedNumbers(newUsed);
    nextNumber(newUsed);
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

  // Auto-place 1 and maxNumber if drawn
  React.useEffect(() => {
    if (!gameStarted || currentNumber === null || allBoxesFilled) return;
    if (currentNumber === 1) {
      // Place in leftmost available box
      for (let i = 0; i < boxes.length; i++) {
        if (canPlace(1, i)) {
          placeNumber(i);
          break;
        }
      }
    } else if (currentNumber === maxNumber) {
      // Place in rightmost available box
      for (let i = boxes.length - 1; i >= 0; i--) {
        if (canPlace(maxNumber, i)) {
          placeNumber(i);
          break;
        }
      }
    }
    // eslint-disable-next-line
  }, [currentNumber, gameStarted, allBoxesFilled]);

  function autoHandleNext(boxesState, usedState) {
    if (boxesState.every(b => b !== null)) {
      setCurrentNumber(null);
      return;
    }
    // Check if next number can be placed anywhere, else auto-trash
    const available = [];
    for (let i = 1; i <= maxNumber; i++) {
      if (!usedState.includes(i)) available.push(i);
    }
    if (available.length === 0) {
      setCurrentNumber(null);
      return;
    }
    const rand = available[Math.floor(Math.random() * available.length)];
    // Can rand be placed anywhere?
    let canBePlaced = false;
    for (let i = 0; i < boxesState.length; i++) {
      if (canPlaceWithState(rand, i, boxesState)) {
        canBePlaced = true;
        break;
      }
    }
    if (canBePlaced) {
      setCurrentNumber(rand);
    } else {
      setTrash(t => [...t, rand]);
      const newUsed = [...usedState, rand];
      setUsedNumbers(newUsed);
      setTimeout(() => autoHandleNext(boxesState, newUsed), 400);
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

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
      <h2 style={{ fontWeight: 700, fontSize: 28, margin: '24px 0 12px 0', color: '#1a1a1a' }}>Roskis</h2>
      {!gameStarted ? (
        <div>
          <label style={{ fontSize: 18, color: '#222' }}>
            Suurin numero:
            <input
              type="number"
              min={DEFAULT_BOXES}
              value={maxNumber}
              onChange={e => setMaxNumber(Math.max(DEFAULT_BOXES, Number(e.target.value)))}
              style={{ marginLeft: 8, fontSize: 18, width: 70, borderRadius: 6, border: '1.5px solid #bbb', padding: '2px 6px' }}
            />
          </label>
          <br />
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
              {trash.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      color: '#c00',
                      marginBottom: 4
                    }}
                  >
                    🗑️ Roskakori
                  </span>
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
                </div>
              )}
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
