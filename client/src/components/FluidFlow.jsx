import React, { useCallback, useEffect, useState } from "react";
import FluidCell from "../classes/FluidCell";
import GriddedView from "./GriddedView";
import { getFluidFlowFieldsForAllCellsAndReturnUpdatedFluidCells } from "../utils/fluidCalcsAndConstants";

const GRID_SIZE = 800;
const pressure_psig = 300;
const mw = 30;
const dt_sec = 0.1; 

const FluidFlow = () => {
  const [fluidCells, setFluidCells] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [highPressureCellCount, setHighPressureCellCount] = useState(300);
  const [temperatureDegF, setTemperatureDegF] = useState(300);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleReset = () => {
    setIsRunning(false);
    setHighPressureCellCount(0);
    setTemperatureDegF(300);
    setIsInitialized(false);
  };

  // populate grid with fluidCells, all at 0 pressure
  useEffect(() => {
      console.log("base grid initialized");
      setFluidCells(() => {
        const newFluidCells = [];
        for (let i = 0; i < GRID_SIZE; i++) {
          const row = [];
          for (let j = 0; j < GRID_SIZE; j++) {
            // constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = -1, pressPsig = 100, mw = 30, temperatureDegF=300)
            const fluidCell = new FluidCell(GRID_SIZE, i * GRID_SIZE + j, -1, i, j, -1, false, false, null, -1, 0, mw, temperatureDegF);
            row.push(fluidCell);
          }
          newFluidCells.push(row);
        }
        return newFluidCells;
      });
  }, []);

  const updateTemperature = () => {
    setFluidCells(currentCells => {
      const totalCells = GRID_SIZE * GRID_SIZE;
      const newCells = [...currentCells];  // Create new array for immutability
      for (let i = 0; i < newCells.length; i++) {
        for (let j = 0; j < newCells[0].length; j++) {
          if (Math.random() > highPressureCellCount / totalCells) continue;
          
          // Only create new cell if we're modifying it
          const oldCell = currentCells[i][j];
          const newCell = new FluidCell(
            GRID_SIZE,
            oldCell.id,
            oldCell.color,
            oldCell.x,
            oldCell.y,
            oldCell.radius,
            oldCell.brownian,
            oldCell.mobile,
            oldCell.velocity,
            oldCell.maxVelocity,
            oldCell.pressPsia - 14.6959,
            oldCell.mw,
            temperatureDegF
          );
          newCells[i][j] = newCell;
        }
      }
      return newCells;
    });
  }

  useEffect(() => {
    if (isRunning) {
      updateTemperature();
    }
  }, [temperatureDegF]);

  // initialize random cells to have high pressure. 
  useEffect(() => {
    if (!isInitialized && fluidCells.length > 0) {
      console.log("high pressure cells initialized");
      setFluidCells(currentCells => {
        const totalCells = GRID_SIZE * GRID_SIZE;
        const newCells = [...currentCells];  // Create new array for immutability
        for (let i = 0; i < newCells.length; i++) {
          for (let j = 0; j < newCells[0].length; j++) {
            if (Math.random() > highPressureCellCount / totalCells) continue;
            
            // Only create new cell if we're modifying it
            const oldCell = currentCells[i][j];
            const newCell = new FluidCell(
              GRID_SIZE,
              oldCell.id,
              oldCell.color,
              oldCell.x,
              oldCell.y,
              oldCell.radius,
              oldCell.brownian,
              oldCell.mobile,
              oldCell.velocity,
              oldCell.maxVelocity,
              pressure_psig,  // New high pressure
              oldCell.mw,
              oldCell.temperatureDegF
            );
            newCells[i][j] = newCell;
          }
        }
        return newCells;
      });

      setIsInitialized(true);
    }
  }, [isInitialized, fluidCells]);

  useEffect(() => {
    
    let animationFrameId;

    const animate = () => {
      setFluidCells(currentCells => {
        console.log("animate.  frameId: ", animationFrameId);
        return getFluidFlowFieldsForAllCellsAndReturnUpdatedFluidCells(currentCells, dt_sec)
      });
    }

    if (isRunning) {
      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isRunning, isInitialized, highPressureCellCount, temperatureDegF]);

  return (
    <div className="full-container">
      <GriddedView
        modelName="Fluid Flow"
        GRID_SIZE={GRID_SIZE}
        cells={fluidCells}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        handleReset={handleReset}
      >
        {/* Swarm-specific controls rendered as children */}
        <div className="control-section">
          <label>Temperature:</label>
          <input
            type="range"
            value={temperatureDegF}
            onChange={(e) => setTemperatureDegF(parseFloat(e.target.value))}
            min={100}
            max={500}
            step={10}
          />
          <div className="stat-item">
            Temperature: {temperatureDegF}
          </div>
        </div>

        {/* Swarm-specific controls rendered as children */}
        <div className="control-section">
          <label>High Pressure Cells:</label>
          <input
            type="range"
            value={highPressureCellCount}
            onChange={(e) => setHighPressureCellCount(parseInt(e.target.value))}
            min={100}
            max={500}
            step={10}
          />
          <div className="stat-item">
            High Pessure Cell Count: {highPressureCellCount}
          </div>
        </div>
        
      </GriddedView>
    </div>
  );
};

export default FluidFlow;