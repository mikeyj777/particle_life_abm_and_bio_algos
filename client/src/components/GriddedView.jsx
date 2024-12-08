import React from 'react';

const GriddedView = ({ 
  modelName, 
  GRID_SIZE, 
  cells, 
  isRunning, 
  setIsRunning, 
  handleReset, 
  children 
}) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cellSize = Math.floor(600 / GRID_SIZE);

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
    <div className="gridded-view-container">
      <div className="gridded-view-header">
        <h2 className="gridded-view-title">{modelName}</h2>
        <div className="gridded-view-controls">
          <button 
            className="gridded-view-button"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <button 
            className="gridded-view-button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="gridded-view-content">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="gridded-view-canvas"
        />
        <div className="gridded-view-controls-container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GriddedView;