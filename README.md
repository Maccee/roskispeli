
# ROSKISP3LI

A fun number placement game where you arrange numbers in boxes and trash what doesn't fit!

## Game Overview

ROSKISP3LI is an engaging puzzle game where players must place randomly generated numbers into boxes in ascending order. If a number doesn't fit your strategy, you can trash it! Complete all boxes with valid numbers to win the game.

## Game Rules

### Goal
The goal of ROSKISP3LI is to fill all boxes with numbers in a strictly increasing order from left to right. A perfect game is achieved when you place every number without using the trash bin.

### Basic Rules

1. **Setup**: Choose how many boxes you want to play with and set the maximum number that can be generated (defaults to 20, max 999).

2. **Number Generation**: The game generates random numbers within your selected range for you to place.

3. **Placement Rules**:
   - Numbers must be placed in strictly ascending order from left to right.
   - You can only place a number if it's larger than all numbers to its left.
   - You can only place a number if it's smaller than all numbers to its right.
   - The game checks if placing a number would make it impossible to complete the sequence with remaining available numbers.

4. **Trashing Numbers**: 
   - If a number cannot be placed in any box (it doesn't fit the sequence), you must send it to the trash.
   - You can only trash a number when it cannot be placed anywhere.

5. **Winning**: The game is won when all boxes contain numbers in strictly increasing order.

6. **Perfect Win**: Achieve a "perfect win" by filling all boxes without sending any numbers to the trash.

### Strategic Tips

- Plan ahead! Consider the size of gaps between placed numbers.
- If you place numbers too close together in value, you may create "impossible" situations where future numbers can't fit anywhere.
- Try to distribute your numbers with enough space between them to accommodate future random numbers.
- Sometimes you'll have to trash numbers even when they could technically fit, because the game checks if placing that number would make it impossible to complete the sequence with remaining numbers.

## Features

- Dynamic box selection (choose how many boxes to play with)
- Random number generation
- Trash system for unwanted numbers
- Sound effects for game events
- Special animations for perfect games
- Mobile-friendly design

## Getting Started

### Install dependencies
```
npm install
```

### Start the development server
```
npm run dev
```

The game will be available at the local address shown in the terminal (usually http://localhost:5173).

### Build for production
```
npm run build
```

The built files will be in the `dist` folder, ready for deployment.

## Project Structure
- `src/` - Source code
  - `Game.jsx` - Main game component with core gameplay logic
  - `GameOverFullscreen.jsx` - End-game screen component
- `public/` - Static assets
  - `favicon/` - Favicon files for various platforms
  - Sound effects and animation files

## Technologies Used
- React
- Vite
- Lottie for animations
- Web Audio API for sound effects
