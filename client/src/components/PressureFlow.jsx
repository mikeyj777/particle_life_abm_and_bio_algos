import React, { useState, useCallback, useEffect, useRef } from 'react';
import GriddedView from './GriddedView';
import PressureCell from '../classes/PressureCell';
import { GRID_SIZE, PRESSURE_RANGES } from '../utils/fluidCalcsAndConstants';

const PressureFlow = () => {
  const [cells, setCells] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [temperature, setTemperature] = useState(300);
  const [timeStep, setTimeStep] = useState(0.1);
  const [highPressurePercent, setHighPressurePercent] = useState(10);
  const [frameRate, setFrameRate] = useState(30);
  const [diagnostics, setDiagnostics] = useState({
    fps: 0,
    minFps: Infinity,
    oscillationCount: 0,
    rapidChangeCount: 0,
    massDeviation: '0.00'
  });

  const fpsQueue = useRef([]);
  const lastFrameTime = useRef(0);
  const initialMassRef = useRef(0);

  const calculateMassTransfers = useCallback((grid, dt) => {
    console.log('Calculating mass transfers...'); // Debug log
    const massChanges = Array(GRID_SIZE).fill().map(() => 
      Array(GRID_SIZE).fill().map(() => ({ delta: 0, available: 0 }))
    );

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const cell = grid[i][j];
        cell.resetFlows();

        const availableMass = Math.max(0, cell.mass - cell.baseMass);
        massChanges[i][j].available = availableMass;

        if (i > 0) {
          const flow = cell.calculateFlowTo(grid[i-1][j]);
          if (flow > 0) {
            cell.flows.north = flow;
            const massTransfer = flow * dt;
            massChanges[i][j].delta -= massTransfer;
            massChanges[i-1][j].delta += massTransfer;
          }
        }
        if (i < GRID_SIZE-1) {
          const flow = cell.calculateFlowTo(grid[i+1][j]);
          if (flow > 0) {
            cell.flows.south = flow;
            const massTransfer = flow * dt;
            massChanges[i][j].delta -= massTransfer;
            massChanges[i+1][j].delta += massTransfer;
          }
        }
        if (j > 0) {
          const flow = cell.calculateFlowTo(grid[i][j-1]);
          if (flow > 0) {
            cell.flows.west = flow;
            const massTransfer = flow * dt;
            massChanges[i][j].delta -= massTransfer;
            massChanges[i][j-1].delta += massTransfer;
          }
        }
        if (j < GRID_SIZE-1) {
          const flow = cell.calculateFlowTo(grid[i][j+1]);
          if (flow > 0) {
            cell.flows.east = flow;
            const massTransfer = flow * dt;
            massChanges[i][j].delta -= massTransfer;
            massChanges[i][j+1].delta += massTransfer;
          }
        }
      }
    }

    // Debug log for mass changes
    const maxChange = Math.max(...massChanges.flat().map(c => Math.abs(c.delta)));
    console.log('Mass changes calculated:', {
      hasChanges: maxChange > 0,
      maxChange: maxChange
    });
    
    return massChanges;
  }, []);

  const updateSimulation = useCallback((timestamp) => {
    console.log('Updating simulation...'); // Debug log
    const massChanges = calculateMassTransfers(cells, timeStep);
    let totalMass = 0;
    let rapidChanges = 0;

    const newCells = cells.map((row, i) => 
      row.map((cell, j) => {
        // Clone the cell instead of creating a new one
        const newCell = new PressureCell(cell.x, cell.y, 0, temperature);
        // Apply mass changes and update cell properties
        newCell.mass = cell.mass + massChanges[i][j].delta;
        newCell.pressure = (newCell.mass * newCell.temperature * PressureCell.R) / 
                          (newCell.volume * PressureCell.MW);
        newCell.updateColor();
        
        if (newCell.isChangingRapidly()) rapidChanges++;
        totalMass += newCell.mass;

        // Debug individual cell changes
        if (Math.abs(massChanges[i][j].delta) > 0) {
          console.log(`Cell [${i},${j}] change:`, {
            oldMass: cell.mass,
            newMass: newCell.mass,
            delta: massChanges[i][j].delta,
            oldPressure: cell.pressure,
            newPressure: newCell.pressure
          });
        }

        return newCell;
      })
    );

    // Debug log for state changes
    console.log('State changes:', {
      totalMass,
      rapidChanges,
      samplePressure: newCells[0][0].pressure,
      pressureRange: {
        min: Math.min(...newCells.flat().map(c => c.pressure)),
        max: Math.max(...newCells.flat().map(c => c.pressure))
      }
    });

    setCells(newCells);

    if (lastFrameTime.current) {
      const deltaTime = timestamp - lastFrameTime.current;
      const currentFps = 1000 / deltaTime;
      
      fpsQueue.current.push(currentFps);
      if (fpsQueue.current.length > 30) fpsQueue.current.shift();
      
      const avgFps = fpsQueue.current.reduce((a, b) => a + b) / fpsQueue.current.length;
      
      setDiagnostics(prev => ({
        fps: Math.round(avgFps),
        minFps: Math.round(Math.min(currentFps, prev.minFps)),
        oscillationCount: prev.oscillationCount + (rapidChanges > 0 ? 1 : 0),
        rapidChangeCount: rapidChanges,
        massDeviation: (totalMass - initialMassRef.current).toExponential(2)
      }));
    }
    
    lastFrameTime.current = timestamp;
  }, [cells, timeStep, temperature, calculateMassTransfers]);

  const initializeGrid = useCallback(() => {
    console.log('Initializing grid...'); // Debug log
    const newGrid = Array(GRID_SIZE).fill().map((_, row) => 
      Array(GRID_SIZE).fill().map((_, col) => 
        new PressureCell(col, row, 0, temperature)
      )
    );

    const totalCells = GRID_SIZE * GRID_SIZE;
    const highPressureCells = Math.floor((totalCells * highPressurePercent) / 100);
    
    let assigned = 0;
    while (assigned < highPressureCells) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (newGrid[row][col].getPressureGauge() === 0) {
        newGrid[row][col] = new PressureCell(col, row, PRESSURE_RANGES.MAX, temperature);
        assigned++;
      }
    }

    const totalMass = newGrid.reduce((sum, row) => 
      sum + row.reduce((rowSum, cell) => rowSum + cell.mass, 0), 0
    );

    // Debug log for initialization
    console.log('Grid initialized:', {
      highPressureCells,
      totalMass,
      samplePressure: newGrid[0][0].pressure,
      pressureRange: {
        min: Math.min(...newGrid.flat().map(c => c.pressure)),
        max: Math.max(...newGrid.flat().map(c => c.pressure))
      }
    });

    setCells(newGrid);
    initialMassRef.current = totalMass;
    setDiagnostics({
      fps: 0,
      minFps: Infinity,
      oscillationCount: 0,
      rapidChangeCount: 0,
      massDeviation: '0.00'
    });
    
    fpsQueue.current = [];
    lastFrameTime.current = 0;
  }, [temperature, highPressurePercent]);

  useEffect(() => {
    const animate = (timestamp) => {
      const frameInterval = 1000 / frameRate;
      if (!lastFrameTime.current || timestamp - lastFrameTime.current >= frameInterval) {
        updateSimulation(timestamp);
      }
      if (isRunning) {
        requestAnimationFrame(animate);
      }
    };

    if (isRunning) {
      console.log('Animation started'); // Debug log
      requestAnimationFrame(animate);
    } else {
      console.log('Animation stopped'); // Debug log
    }

    return () => {
      if (isRunning) {
        console.log('Cleaning up animation'); // Debug log
      }
    };
  }, [isRunning, frameRate, updateSimulation]);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const Parameters = () => (
    <div className="pressure-flow">
      <div className="pressure-flow__parameter-section">
        <div className="pressure-flow__slider-container">
          <label className="pressure-flow__label">
            Temperature ({temperature}°F)
          </label>
          <input
            type="range"
            min="100"
            max="500"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="pressure-flow__slider"
          />
        </div>

        <div className="pressure-flow__slider-container">
          <label className="pressure-flow__label">
            Time Step ({timeStep} sec)
          </label>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={timeStep}
            onChange={(e) => setTimeStep(Number(e.target.value))}
            className="pressure-flow__slider"
          />
        </div>

        <div className="pressure-flow__slider-container">
          <label className="pressure-flow__label">
            High Pressure Cells ({highPressurePercent}%)
          </label>
          <input
            type="range"
            min="10"
            max="80"
            value={highPressurePercent}
            onChange={(e) => setHighPressurePercent(Number(e.target.value))}
            className="pressure-flow__slider"
          />
        </div>

        <div className="pressure-flow__slider-container">
          <label className="pressure-flow__label">
            Frame Rate ({frameRate} fps)
          </label>
          <input
            type="range"
            min="20"
            max="60"
            value={frameRate}
            onChange={(e) => setFrameRate(Number(e.target.value))}
            className="pressure-flow__slider"
          />
        </div>

        <div className="pressure-flow__step-controls">
          <button 
            className={`pressure-flow__button ${isRunning ? 'pressure-flow__button--disabled' : ''}`}
            onClick={() => !isRunning && updateSimulation(performance.now())}
            disabled={isRunning}
          >
            Step
          </button>
          <button 
            className={`pressure-flow__button ${isRunning ? 'pressure-flow__button--disabled' : ''}`}
            onClick={() => !isRunning && 
              Array(10).fill().forEach(() => updateSimulation(performance.now()))}
            disabled={isRunning}
          >
            10 Steps
          </button>
        </div>

        <div className="pressure-flow__diagnostics">
          <div className="pressure-flow__diagnostics-header">Diagnostics</div>
          <div className="pressure-flow__diagnostics-value">
            FPS: {diagnostics.fps} (min: {diagnostics.minFps})
          </div>
          <div className="pressure-flow__diagnostics-value">
            Oscillations: {diagnostics.oscillationCount}
          </div>
          <div className="pressure-flow__diagnostics-value">
            Rapid Changes: {diagnostics.rapidChangeCount}
          </div>
          <div className="pressure-flow__diagnostics-value">
            Mass Deviation: {diagnostics.massDeviation} lb
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <GriddedView
      modelName="Pressure Flow Simulation"
      GRID_SIZE={GRID_SIZE}
      cells={cells}
      isRunning={isRunning}
      setIsRunning={setIsRunning}
      handleReset={initializeGrid}
      exampleCell={selectedCell}
    >
      <Parameters />
    </GriddedView>
  );
};

export default PressureFlow;