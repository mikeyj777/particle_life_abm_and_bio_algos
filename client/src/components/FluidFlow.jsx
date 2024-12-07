import React, { useEffect, useState } from "react";
import FluidCell from "../classes/FluidCell";
import TemplateGridAndControls from "./TemplateGridAndControls";

const GRID_SIZE = 800;
const pressure_psig = 300;
const mw = 30;

const FluidFlow = () => {
  const [fluidCells, setFluidCells] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [highPressureCellCount, setHighPressureCellCount] = useState(0);
  const [temperatureDegF, setTemperatureDegF] = useState(300);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleReset = () => {
    setIsRunning(false);
    setHighPressureCellCount(0);
    setTemperatureDegF(300);
    setIsInitialized(false);
  };

  useEffect(() => {
    if (!isRunning) return;

    if (!isInitialized) {

      setFluidCells(() => {
        const newFluidCells = [];
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            // constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = -1, pressPsig = 100, mw = 30, temperatureDegF=300)
            const fluidCell = new FluidCell(GRID_SIZE, i * GRID_SIZE + j, -1, i, j, -1, false, false, null, -1, 0, mw, temperatureDegF);
            newFluidCells.push(fluidCell);
          }
        }
        return newFluidCells;
      });

      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    const animate = () => {
      setFluidCells(currentAgents => {
        const newAgents = [];
        for (const agent of currentAgents) {
          if (Math.random() > highPressureCellCount / fluidCells.length) return;
          agent.pressure = pressure_psig;
          newAgents.push(agent);
        }
        return newAgents;
      });
    };

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
      <TemplateGridAndControls
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
        
      </TemplateGridAndControls>
    </div>
  );
};

export default FluidFlow;