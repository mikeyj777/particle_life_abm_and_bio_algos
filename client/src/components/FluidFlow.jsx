import React, { useEffect, useState } from "react";
import FluidCell from "../classes/FluidCell";
import GriddedView from "./GriddedView";

const GRID_SIZE = 800;
const pressure_psig = 300;
const mw = 30;
const dt_sec = 0.1; 

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

  // populate grid with fluidCells, all at 0 pressure
  useEffect(() => {
    
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
  }, []);


  // initialize random cells to have high pressure. 
  useEffect(() => {
    if (!isInitialized) {

      setFluidCells(currentAgents => {
        const newAgents = [];
        for (const agent of currentAgents) {
          if (Math.random() > highPressureCellCount / fluidCells.length) return;
          agent.pressPsig = pressure_psig;
          agent.setHighPressure();
          newAgents.push(agent);
        }
        return newAgents;
      });

      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    
    let animationFrameId;

    const animate = () => {
      setFluidCells(currentAgents => {
        const newAgents = [];
        for (let i = 0; i < currentAgents.length; i++) {
          for (let j = 0; j < currentAgents[0].length; j++) {
            const agent = currentAgents[i][j];
            let numSides = 2;
            const validNeighbors = {
              x: [0],
              y: [0],
            };
            if (agent.x > 0) {
              validNeighbors.x.push(-1);
              numSides += 1;
            }
            if (agent.x < GRID_SIZE-1) 
              {
                validNeighbors.x.push(1);
                numSides += 1;
              }
            if (agent.y > 0) {
              validNeighbors.y.push(-1);
              numSides += 1;
            }
            if (agent.y < GRID_SIZE-1) {
              validNeighbors.y.push(1);
              numSides += 1;
            }
            const totalMassRateOutLbSec = agent.getFlowPatternAndReturnTotalMassRateOut(validNeighbors, currentAgents);
            const massAvailableLb = agent.massLb - agent.baseMassLb;
            let totMassOut = 0
            for (const flowPattern of agent.flowPatterns) {
              const massRateLbSec = flowPattern.massRateLbSec;
              const massOutLb = massRateLbSec * dt_sec;
              totMassOut += massOutLb;
            }
            let scalingFactor = 1;
            if (totMassOut > massAvailableLb) scalingFactor = massAvailableLb / totMassOut;
            for (const flowPattern of agent.flowPatterns) {
              if (flowPattern.xOffset === 0 && flowPattern.yOffset === 0) continue;
              const otherAgent = currentAgents[agent.x + flowPattern.xOffset][agent.y + flowPattern.yOffset];
              const massRateLbSec = flowPattern.massRateLbSec;
              const massOutLb = massRateLbSec * dt_sec * scalingFactor;
              agent.mass -= massOutLb;
              agent.updatePropertiesForFlow();
              otherAgent.mass += massOutLb;
            }
          }
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