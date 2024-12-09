import React, { useCallback, useEffect, useRef, useState } from "react";
import FluidCell from "../classes/FluidCell";
import GriddedView from "./GriddedView";
import { getFluidFlowFieldsForAllCellsAndReturnUpdatedFluidCells } from "../utils/fluidCalcsAndConstants";
import { getPressureColor } from "../utils/helpers";

const GRID_SIZE = 100;
const pressure_psig = 300;
const mw = 30;
const dt_sec = 0.1;

const FluidFlow = () => {
  const [fluidCells, setFluidCells] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [highPressureCellCount, setHighPressureCellCount] = useState(300);
  const [temperatureDegF, setTemperatureDegF] = useState(300);
  const [isInitialized, setIsInitialized] = useState(false);
  const [exampleCell, setExampleCell] = useState(null);
  const animationFrameIdRef = useRef(null);
  const lastTimeRef = useRef(0);
  const exampleCellRef = useRef(null);  // New ref to store exampleCell
  const [getBlankGrid, setGetBlankGrid] = useState(true);

  // Update ref when exampleCell state changes
  useEffect(() => {
    exampleCellRef.current = exampleCell;
  }, [exampleCell]);

  const handleReset = () => {
    setIsRunning(false);
    setHighPressureCellCount(300);
    setTemperatureDegF(300);
    setFluidCells([]);
    setIsInitialized(false);
    setGetBlankGrid(true);
  };

  // populate grid with fluidCells, all at 0 pressure
  useEffect(() => {
    if (!getBlankGrid) return;
    setFluidCells(() => {
      const newFluidCells = [];
      for (let i = 0; i < GRID_SIZE; i++) {
        const row = [];
        for (let j = 0; j < GRID_SIZE; j++) {
          const fluidCell = new FluidCell(GRID_SIZE, i * GRID_SIZE + j, -1, i, j, -1, false, false, null, -1, 0, mw, temperatureDegF);
          row.push(fluidCell);
        }
        newFluidCells.push(row);
      }
      return newFluidCells;
    });
    setGetBlankGrid(false);
  }, [getBlankGrid]);

  const updateTemperature = useCallback(() => {
    setFluidCells(currentCells => {
      const totalCells = GRID_SIZE * GRID_SIZE;
      const newCells = currentCells.map(row => [...row]);
      for (let i = 0; i < newCells.length; i++) {
        for (let j = 0; j < newCells[0].length; j++) {
          if (Math.random() > highPressureCellCount / totalCells) continue;
          
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
  }, [highPressureCellCount, temperatureDegF]);

  useEffect(() => {
    if (isRunning) {
      updateTemperature();
    }
  }, [temperatureDegF, isRunning, updateTemperature]);

  useEffect(() => {
    if (!isInitialized && fluidCells.length > 0) {
      setFluidCells(currentCells => {
        const totalCells = GRID_SIZE * GRID_SIZE;
        const newCells = currentCells.map(row => [...row]);
        for (let i = 0; i < newCells.length; i++) {
          for (let j = 0; j < newCells[0].length; j++) {
            if (Math.random() > highPressureCellCount / totalCells) continue;
            if (!exampleCell) {
              setExampleCell(newCells[i][j]);
            }
            
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
              pressure_psig,
              oldCell.mw,
              oldCell.temperatureDegF
            );
            newCell.colorRgb = getPressureColor(newCell.pressPsia, 14.6959, pressure_psig + 14.6959);
            newCells[i][j] = newCell;
          }
        }
        return newCells;
      });

      setIsInitialized(true);
    }
  }, [isInitialized, fluidCells, exampleCell, highPressureCellCount]);

  const animate = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;

    // Only update if enough time has passed (e.g., targeting 60 FPS)
    if (deltaTime > 16.67) { // roughly 60 FPS (1000ms / 60)
      // console.log("checking in");
      setFluidCells(currentCells => {

        const newCells = getFluidFlowFieldsForAllCellsAndReturnUpdatedFluidCells(
          currentCells, 
          dt_sec, 
          exampleCellRef.current  // Use ref instead of state
        );
        
        let minPressure = Infinity;
        let maxPressure = -Infinity;
        
        return newCells;
      });

      lastTimeRef.current = timestamp;
    }

    if (isRunning) {
      animationFrameIdRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning]); // Removed exampleCell from dependencies

  useEffect(() => {
    if (isRunning) {
      animationFrameIdRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isRunning, animate]);

  return (
    <div className="full-container">
      <GriddedView
        modelName="Fluid Flow"
        GRID_SIZE={GRID_SIZE}
        cells={fluidCells}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        handleReset={handleReset}
        exampleCell={exampleCell}
      >
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
            High Pressure Cell Count: {highPressureCellCount}
          </div>
        </div>
      </GriddedView>
    </div>
  );
};

export default FluidFlow;