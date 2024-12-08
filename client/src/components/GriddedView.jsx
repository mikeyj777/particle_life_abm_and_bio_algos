import React, { useRef, useEffect } from 'react';

let displayedValue = false;
let displayedValueCount = 0;

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

    console.log("min pressure: ", minPressure, " | max pressure: ", maxPressure);
    // Draw cells with a small gap between them for better visibility
    const gap = 0.5;
    cells.forEach(row => {
      row.forEach(cell => {
        
        ctx.fillStyle = cell.colorRgb;
        
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