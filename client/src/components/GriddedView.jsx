import React, { useRef, useEffect } from 'react';
import '../styles/GriddedView.css';

const getPressureColor = (pressure, minPressure, maxPressure) => {
  // Normalize pressure to 0-1 range
  const normalized = (pressure - minPressure) / (maxPressure - minPressure);
  
  // Calculate RGB values:
  // First half: red → green (1,0,0) → (0,1,0)
  // Second half: green → blue (0,1,0) → (0,0,1)
  let r = 0, g = 0, b = 0;
  
  if (normalized <= 0.5) {
    // Red to Green (first half)
    const t = normalized * 2;
    r = 255 * (1 - t);
    g = 255 * t;
  } else {
    // Green to Blue (second half)
    const t = (normalized - 0.5) * 2;
    g = 255 * (1 - t);
    b = 255 * t;
  }
  
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find pressure range
    let minPressure = Infinity;
    let maxPressure = -Infinity;
    
    cells.forEach(row => {
      row.forEach(cell => {
        if (cell.pressPsia < minPressure) minPressure = cell.pressPsia;
        if (cell.pressPsia > maxPressure) maxPressure = cell.pressPsia;
      });
    });

    // Draw cells
    cells.forEach(row => {
      row.forEach(cell => {
        if (cell.color === -1) {
          // Use pressure-based coloring
          ctx.fillStyle = getPressureColor(cell.pressPsia, minPressure, maxPressure);
        } else {
          // Use existing color if specified
          ctx.fillStyle = `#${cell.color.toString(16).padStart(6, '0')}`;
        }
        
        ctx.fillRect(
          cell.x * cellSize,
          cell.y * cellSize,
          cellSize,
          cellSize
        );
      });
    });
  }, [cells, GRID_SIZE]);

  return (
    <div className="gridded-view">
      <div className="gridded-view__visualization">
        <h2 className="gridded-view__title">{modelName}</h2>
        <div className="gridded-view__canvas-container">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
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