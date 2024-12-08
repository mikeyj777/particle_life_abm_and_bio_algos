import React, { useRef, useEffect } from 'react';

let displayedValue = false;
let displayedValueCount = 0;

const getPressureColor = (pressure, minPressure, maxPressure) => {
  // Add a small epsilon to prevent division by zero
  const epsilon = 0.0001;
  
  // Ensure we have a valid range
  if (Math.abs(maxPressure - minPressure) < epsilon) {
    return 'rgb(135, 206, 235)'; // Sky blue for zero/equal pressure
  }
  
  // Normalize pressure to 0-1 range
  const normalized = Math.max(0, Math.min(1, (pressure - minPressure) / (maxPressure - minPressure)));
  
  // Use a modified color scheme that ensures visible colors
  // Low pressure: sky blue (135, 206, 235)
  // Medium pressure: light green (144, 238, 144)
  // High pressure: red (255, 99, 71)
  
  let r, g, b;
  
  if (normalized <= 0.5) {
    // Sky blue to light green
    const t = normalized * 2;
    r = Math.round(135 + (144 - 135) * t);
    g = Math.round(206 + (238 - 206) * t);
    b = Math.round(235 + (144 - 235) * t);
  } else {
    // Light green to red
    const t = (normalized - 0.5) * 2;
    r = Math.round(144 + (255 - 144) * t);
    g = Math.round(238 + (99 - 238) * t);
    b = Math.round(144 + (71 - 144) * t);
  }

  const col = `rgb(${r}, ${g}, ${b})`;

  // if (!displayedValue) {
  //   console.log("col: ", col);
  // }
  
  return `rgb(${r}, ${g}, ${b})`;
};

const GriddedView = ({ 
  modelName, 
  GRID_SIZE, 
  cells, 
  isRunning, 
  setIsRunning, 
  handleReset, 
  children 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cells || cells.length === 0) return;

    const ctx = canvas.getContext('2d');
    const canvasSize = Math.min(canvas.width, canvas.height);
    const cellSize = canvasSize / GRID_SIZE;

    // Clear canvas with a light background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Find pressure range
    let minPressure = Infinity;
    let maxPressure = -Infinity;
    
    cells.forEach(row => {
      row.forEach(cell => {
        if (cell.pressPsia < minPressure) minPressure = cell.pressPsia;
        if (cell.pressPsia > maxPressure) maxPressure = cell.pressPsia;
      });
    });

    console.log("min pressure: ", minPressure, " | max pressure: ", maxPressure);
    // Draw cells with a small gap between them for better visibility
    const gap = 0.5;
    cells.forEach(row => {
      row.forEach(cell => {
        
        const pressureColor = getPressureColor(cell.pressPsia, minPressure, maxPressure);
        
        ctx.fillStyle = pressureColor;
        
        ctx.fillRect(
          cell.x * cellSize + gap,
          cell.y * cellSize + gap,
          cellSize - gap * 2,
          cellSize - gap * 2
        );
      });
    });

    // Draw grid lines for better visibility
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }
  }, [cells, GRID_SIZE]);

  return (
    <div className="gridded-view">
      <div className="gridded-view__visualization">
        <h2 className="gridded-view__title">{modelName}</h2>
        <div className="gridded-view__canvas-container">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE}
            height={GRID_SIZE}
            className="gridded-view__canvas"
          />
        </div>
      </div>
      
      <div className="gridded-view__parameters">
        <div className="gridded-view__controls">
          <button 
            className="gridded-view__button"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <button 
            className="gridded-view__button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
        <div className="gridded-view__parameters-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GriddedView;