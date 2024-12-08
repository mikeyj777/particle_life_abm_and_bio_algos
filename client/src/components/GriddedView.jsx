import React, { useRef, useEffect } from 'react';
import '../styles/GriddedView.css';

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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const canvasSize = Math.min(canvas.width, canvas.height);
    const cellSize = canvasSize / GRID_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    cells.forEach(cell => {
      if (cell.color !== -1) {
        ctx.fillStyle = `#${cell.color.toString(16).padStart(6, '0')}`;
        ctx.fillRect(
          cell.x * cellSize,
          cell.y * cellSize,
          cellSize,
          cellSize
        );
      }
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