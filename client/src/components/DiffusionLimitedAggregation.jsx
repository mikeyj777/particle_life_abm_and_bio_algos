import { useState, useEffect, useCallback } from 'react';
import Agent from '../classes/Agent';
import AgentGridRenderer from './AgentGridRenderer';

const DiffusionLimitedAggregation = () => {
  const [agents, setAgents] = useState([]);
  const [aggregatedAgents, setAggregatedAgents] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const GRID_SIZE = 800;
  const [numAgents, setNumAgents] = useState(10);
  const [particleRadius, setParticleRadius] = useState(3);
  const [diffusionRadius, setDiffusionRadius] = useState(0);

  // Reset simulation
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsInitialized(false);
    setAggregatedAgents([]);
    
    // Reset all agents
    setAgents(prevAgents => {
      const newAgents = [];
      for (let i = 0; i < numAgents; i++) {
        const newAgent = new Agent(
          GRID_SIZE,
          i,
          "#4A90E2",
          -1,
          -1,
          particleRadius,
          true
        );
        newAgents.push(newAgent);
      }
      return newAgents;
    });
  }, [numAgents, particleRadius, GRID_SIZE]);

  // Initialize agents when numAgents changes
  useEffect(() => {
    handleReset();
  }, [numAgents, handleReset]);

  // Update particle radius when changed
  useEffect(() => {
    agents.forEach(agent => {
      agent.radius = particleRadius;
    });
  }, [particleRadius, agents]);

  // Main DLA simulation
  useEffect(() => {
    if (!isRunning) return;

    // Initialize simulation if not already done
    if (!isInitialized) {
      // Pick random seed particle
      const seedIndex = Math.floor(Math.random() * agents.length);
      const seedAgent = agents[seedIndex];
      seedAgent.brownian = false;
      seedAgent.color = "#FF9340";
      setAggregatedAgents([seedAgent]);
      setIsInitialized(true);
    }

    let animationFrameId;
    
    const animate = () => {
      setAgents(currentAgents => {
        const updatedAgents = [...currentAgents];
        
        // Check each aggregated particle against moving ones
        aggregatedAgents.forEach(baseAgent => {
          updatedAgents.forEach(otherAgent => {
            // Skip if particle is already aggregated
            if (!otherAgent.brownian) return;
            
            // Calculate distance
            const distSquared = 
              Math.pow(baseAgent.x - otherAgent.x, 2) +
              Math.pow(baseAgent.y - otherAgent.y, 2);
              
            // If close enough, aggregate the particle
            if (Math.sqrt(distSquared + baseAgent.radius) <= diffusionRadius) {
              otherAgent.brownian = false;
              otherAgent.color = "#FF9340";
              
              // Add to aggregated agents if not already included
              setAggregatedAgents(current => 
                current.includes(otherAgent) 
                  ? current 
                  : [...current, otherAgent]
              );
            }
          });
        });
        
        return updatedAgents;
      });

      if (isRunning) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isRunning, isInitialized, diffusionRadius, agents, aggregatedAgents]);

  return (
    <div className="container">
      <div className="visualization-panel">
        <AgentGridRenderer agents={agents} />
      </div>

      <div className="control-panel">
        <h2>Diffusion-Limited Aggregation</h2>
        
        <div className="control-section">
          <button 
            className={isRunning ? 'active' : ''}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={handleReset}>
            Reset
          </button>
        </div>

        <div className="control-section">
          <h3>Parameters</h3>
          <label>Number of particles:</label>
          <input
            type="range"
            value={numAgents}
            onChange={(e) => setNumAgents(parseInt(e.target.value))}
            min={0}
            max={1000}
            step={10}
          />
          <div className="stat-item">
            Particles: {numAgents}
          </div>
        </div>

        <div className="control-section">
          <label>Diffusion radius:</label>
          <input
            type="range"
            value={diffusionRadius}
            onChange={(e) => setDiffusionRadius(parseInt(e.target.value))}
            min={0}
            max={20}
            step={1}
          />
          <div className="stat-item">
            Radius: {diffusionRadius}
          </div>
        </div>

        <div className="control-section">
          <label>Particle radius:</label>
          <input
            type="range"
            value={particleRadius}
            onChange={(e) => setParticleRadius(parseInt(e.target.value))}
            min={3}
            max={21}
            step={1}
          />
          <div className="stat-item">
            Size: {particleRadius}
          </div>
        </div>

        <div className="stat-item">
          Aggregated Particles: {aggregatedAgents.length}
        </div>
      </div>
    </div>
  );
};

export default DiffusionLimitedAggregation;