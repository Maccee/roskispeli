import React, { useState, useEffect } from "react";
import TrashLottie from "./TrashLottie";
import GameOverFullscreen from "./GameOverFullscreen";

const MIN_BOXES = 5;
const MAX_BOXES = 10;
const DEFAULT_BOXES = MIN_BOXES;

export default function Game() {
  const [maxNumber, setMaxNumber] = useState(20);
  const [numBoxes, setNumBoxes] = useState(DEFAULT_BOXES);
  const [boxes, setBoxes] = useState(Array(DEFAULT_BOXES).fill(null));
  const [currentNumber, setCurrentNumber] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [usedNumbers, setUsedNumbers] = useState([]);
  const [trash, setTrash] = useState([]);
  const [trashAnimTrigger, setTrashAnimTrigger] = useState(false);
  // Audio elements for game end sounds
  const [gameOverSound, setGameOverSound] = useState(null);
  const [clapSound, setClapSound] = useState(null);

  // Initialize audio elements once when component mounts
  useEffect(() => {
    const gameOverAudio = new Audio("/gameover.mp3"); // Played on perfect game (empty trash)
    const clapAudio = new Audio("/clap.mp3"); // Played when game ends with items in trash
    setGameOverSound(gameOverAudio);
    setClapSound(clapAudio);
  }, []);
  const allBoxesFilled = boxes.every((b) => b !== null);

  function startGame() {
    // Validate the maxNumber input
    let validMaxNumber = Number(maxNumber);

    // Ensure it's a valid number
    if (isNaN(validMaxNumber) || validMaxNumber === 0) {
      validMaxNumber = 20; // Default to 20 if invalid
    }

    // Ensure it's at least numBoxes and at most 999
    validMaxNumber = Math.max(numBoxes, Math.min(999, validMaxNumber));

    // Update the state with validated number
    setMaxNumber(validMaxNumber);

    setBoxes(Array(numBoxes).fill(null));
    setUsedNumbers([]);
    setTrash([]);
    setGameStarted(true);
    // Pass the validated number directly to nextNumber
    nextNumber([], validMaxNumber);
  }

  function nextNumber(used, validMaxNum = null) {
    // Use the provided validMaxNum if available, otherwise use state
    const maxValue = validMaxNum !== null ? validMaxNum : maxNumber;

    const available = [];
    for (let i = 1; i <= maxValue; i++) {
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
    const filled = boxes
      .map((v, i) => (i === idx ? num : v))
      .map((v) => (v === null ? null : v));
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
        while (availIdx < available.length && available[availIdx] <= prev)
          availIdx++;
        if (availIdx >= available.length) return false;
        prev = available[availIdx];
        availIdx++;
      }
    }
    return true;
  }

  function trashNumber() {
    if (currentNumber === null) return;

    // Only allow trashing if the number cannot be placed anywhere
    if (!canNumberBePlaced()) {
      setTrash([...trash, currentNumber]);
      setTrashAnimTrigger((t) => !t); // toggle to trigger animation
      const newUsed = [...usedNumbers, currentNumber];
      setUsedNumbers(newUsed);
      // Use the current state value of maxNumber which is already validated
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

  function autoHandleNext(boxesState, usedState) {
    if (boxesState.every((b) => b !== null)) {
      setCurrentNumber(null);
      // Play game over sound when all boxes are filled
      playGameOverSound();
      return;
    }

    // Use the validated maxNumber (which is already constrained to 999 max)
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

  // Function to play sounds based on game outcome
  function playGameOverSound() {
    // When trash is empty, play gameover sound (perfect game)
    // When trash has items, play clap sound
    const soundToPlay = trash.length === 0 ? gameOverSound : clapSound;

    if (!soundToPlay) return;

    try {
      soundToPlay.currentTime = 0; // Reset the audio to the start
      soundToPlay.play().catch(() => {
        // Silent catch - audio might fail in some browsers but shouldn't break the game
      });
    } catch (error) {
      // Silent catch - just prevent the error from breaking the game
    }
  }

  // Function to check if current number can be placed in any box
  function canNumberBePlaced() {
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
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        background: "#f8fafc",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          width: "100%",
          textAlign: "center",
        }}
      >
        <img
          src="/roskispeli.webp"
          alt="Roskis Peli"
          style={{ maxWidth: "240px", width: "100%" }}
        />
        {!gameStarted ? (
          <div>
            <div
              style={{
                margin: "0 0 1rem 0",
                padding: "1rem",
                borderRadius: "1rem",
                backgroundColor: "#f0f7ff",
                boxShadow: "0 8px 10px rgba(0, 0, 0, 0.1)",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  fontSize: "17px",
                  lineHeight: "1.5",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                ROSKISP3LI:n idea on täyttää kaikki laatikot numeroilla, jotka
                kasvavat vasemmalta oikealle. Yritä saada kaikki numerot
                paikoilleen ilman että laitat yhtäkään roskikseen.
              </div>
            </div>

            <div style={{ fontSize: 18, color: "#222", marginBottom: 8 }}>
              Laatikoiden määrä:
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              {Array.from(
                { length: MAX_BOXES - MIN_BOXES + 1 },
                (_, i) => i + MIN_BOXES
              ).map((num) => (
                <div
                  key={num}
                  onClick={() => {
                    setNumBoxes(num);
                    if (maxNumber < num) {
                      setMaxNumber(num);
                    }
                  }}
                  style={{
                    width: 46,
                    height: 46,
                    border: "2px solid #333",
                    borderRadius: 10,
                    background: numBoxes === num ? "#e3f6e3" : "#f3f3f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color: numBoxes === num ? "#1a1a1a" : "#666",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.2s",
                    boxShadow: numBoxes === num ? "0 0 6px #bdf" : "none",
                  }}
                >
                  {num}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 18, color: "#222" }}>
                Suurin numero:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={maxNumber}
                  onChange={(e) => {
                    // Allow only numeric input
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    // Update state with the raw value (validation will happen on game start)
                    setMaxNumber(value === "" ? "" : Number(value));
                  }}
                  style={{
                    marginLeft: 8,
                    fontSize: 18,
                    width: 70,
                    borderRadius: 6,
                    border: "1.5px solid #555",
                    padding: "2px 6px",
                    background: "#f0f0f0",
                    color: "#000",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    fontWeight: 600,
                    outline: "none",
                  }}
                />
              </label>
              <div
                style={{
                  fontSize: 14,
                  color: "#444",
                  marginTop: 4,
                  padding: "2px 4px",
                  borderRadius: 4,
                  display: "inline-block",
                }}
              >
                ({numBoxes}-999)
              </div>
            </div>
            <button
              onClick={startGame}
              style={{
                fontSize: 22,
                padding: "14px 44px",
                borderRadius: 10,
                background: "#1a73e8",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
              title="Aloita peli"
            >
              Aloita peli
            </button>
          </div>
        ) : (
          <>
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: 24 }}>
                {currentNumber !== null && !allBoxesFilled ? (
                  <span style={{ fontSize: 24, color: "#1a1a1a" }}>
                    Sijoita numero: <b>{currentNumber}</b>
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 16,
                  flexWrap: "wrap",
                  maxWidth: 360,
                  marginLeft: "auto",
                  marginRight: "auto",
                  width: "100%",
                }}
              >
                {boxes.map((num, idx) => {
                  const canClick =
                    currentNumber !== null &&
                    canPlace(currentNumber, idx) &&
                    !allBoxesFilled;
                  return (
                    <div
                      key={idx}
                      onClick={() => canClick && placeNumber(idx)}
                      style={{
                        width: 56,
                        height: 56,
                        border: "2px solid #333",
                        borderRadius: 10,
                        background:
                          num !== null
                            ? "#fff"
                            : canClick
                            ? "#e3f6e3"
                            : "#f3f3f3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        fontWeight: 700,
                        color: num !== null ? "#1a1a1a" : "#888",
                        cursor: canClick ? "pointer" : "not-allowed",
                        userSelect: "none",
                        transition: "background 0.2s",
                        boxShadow: canClick ? "0 0 6px #bdf" : undefined,
                      }}
                    >
                      {num !== null ? num : ""}
                    </div>
                  );
                })}
              </div>
              <div style={{ minHeight: 40, marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      marginBottom: 4,
                      cursor:
                        currentNumber !== null && !canNumberBePlaced()
                          ? "pointer"
                          : "not-allowed",
                      opacity:
                        currentNumber !== null && !canNumberBePlaced()
                          ? 1
                          : 0.5,
                      transition: "all 0.2s ease",
                      borderRadius: "50%",
                      boxShadow:
                        currentNumber !== null && !canNumberBePlaced()
                          ? "0 0 6px rgba(204,0,0,0.4)"
                          : "none",
                    }}
                    onClick={trashNumber}
                    title={
                      currentNumber === null
                        ? "No number to trash"
                        : canNumberBePlaced()
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
                        background: "#ffeaea",
                        border: "1.5px dashed #c00",
                        borderRadius: 8,
                        padding: "4px 8px",
                        fontSize: 16,
                        wordBreak: "break-word",
                        color: "#c00",
                        fontWeight: 600,
                      }}
                    >
                      {trash.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {(currentNumber === null || allBoxesFilled) && (
              <GameOverFullscreen
                onRestart={() => setGameStarted(false)}
                isPerfectGame={trash.length === 0}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
