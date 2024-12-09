import React, { useRef, useEffect, useState } from 'react';

const GriddedView = ({ 
  modelName, 
  GRID_SIZE, 
  cells, 
  isRunning, 
  setIsRunning, 
  handleReset,
  exampleCell,
  children 
}) => {
  const canvasRef = useRef(null);
  
  // Fixed canvas size
  const CANVAS_SIZE = 600;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cells || cells.length === 0) return;

    const ctx = canvas.getContext('2d');
    // Calculate cell size based on fixed canvas size
    const cellSize = CANVAS_SIZE / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw cells
    const gap = 0.5;
    cells.forEach(row => {
      row.forEach(cell => {
        if (!cell.colorRgb) {
          // console.log("cell is colorless");
          return;
        };
        
        ctx.fillStyle = cell.colorRgb;
        
        if (cell.pressPsia >= 14.8) {
          if (cell.x === exampleCell?.x && cell.y === exampleCell?.y) {
            console.log("example cell.x: ", cell.x, " | cell.y: ", cell.y, " | cell.pressPsia: ", cell.pressPsia);
          }
        }

        ctx.fillRect(
          cell.x * cellSize + gap,
          cell.y * cellSize + gap,
          cellSize - gap * 2,
          cellSize - gap * 2
        );
      });
    });

    // Only draw grid lines if cells are large enough
    if (cellSize >= 4) {
      ctx.strokeStyle = '#e9ecef';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(CANVAS_SIZE, i * cellSize);
        ctx.stroke();
      }
    }

  }, [cells, GRID_SIZE, exampleCell]);

  return (
    <div className="gridded-view">
      <div className="gridded-view__visualization">
        <h2 className="gridded-view__title">{modelName}</h2>
        <div 
          className="gridded-view__canvas-container"
          style={{ 
            maxWidth: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            style={{
              border: '1px solid #ccc',
              width: `${CANVAS_SIZE}px`,
              height: `${CANVAS_SIZE}px`,
            }}
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