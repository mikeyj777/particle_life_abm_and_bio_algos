import React from 'react';
import AgentGridRenderer from './AgentGridRenderer';

const TemplateGridAndControls = ({
  // Model name with default value
  modelName = "Template Grid",
  
  // Grid configuration
  GRID_SIZE = 800,
  agents = [],
  
  // Control state values and setters passed from parent
  numAgents,
  setNumAgents,
  particleRadius,
  setParticleRadius,
  isRunning,
  setIsRunning,
  
  // Reset handler from parent
  handleReset,
  
  // Optional children for model-specific controls
  children
}) => {
  return (
    <div className="container">
      {/* Visualization Panel */}
      <div className="visualization-panel">
        <AgentGridRenderer 
          agents={agents} 
          GRID_SIZE={GRID_SIZE}
        />
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <h2>{modelName}</h2>
        
        {/* Simulation Controls */}
        <div className="control-section">
          <button 
            className={isRunning ? 'active' : ''}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          
          <button 
            onClick={() => {
              setIsRunning(false);  // Stop simulation before reset
              handleReset(numAgents, particleRadius);
            }}
          >
            Reset
          </button>
        </div>

        {/* Agent Count Control */}
        <div className="control-section">
          <h3>Parameters</h3>
          <label>Number of agents:</label>
          <input
            type="range"
            value={numAgents}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setNumAgents(value);
              handleReset(value, particleRadius);
            }}
            min={10}
            max={300}
            step={10}
          />
          <div className="stat-item">
            Agents: {numAgents}
          </div>
        </div>

        {/* Particle Size Control
        <div className="control-section">
          <label>Particle radius:</label>
          <input
            type="range"
            value={particleRadius}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setParticleRadius(value);
              handleReset(numAgents, value);
            }}
            min={3}
            max={21}
            step={1}
          />
          <div className="stat-item">
            Size: {particleRadius}
          </div>
        </div> */}

        {/* Render any model-specific controls passed as children */}
        {children}
      </div>
    </div>
  );
};

// PropTypes could be added here for better development experience
// But I'll skip them unless you want them included

export default TemplateGridAndControls;