import React, { useState, useEffect, useCallback } from 'react';
import Agent from '../classes/Agent';
import TemplateGridAndControls from './TemplateGridAndControls';

const DiffusionLimitedAggregation_usingTemplate = () => {
  // Grid configuration
  const GRID_SIZE = 800;

  // Template-managed states (lifted up from template)
  const [numAgents, setNumAgents] = useState(100);
  const [particleRadius, setParticleRadius] = useState(10);
  const [isRunning, setIsRunning] = useState(false);

  // DLA-specific states
  const [agents, setAgents] = useState([]);
  const [aggregatedAgents, setAggregatedAgents] = useState([]);
  const [diffusionRadius, setDiffusionRadius] = useState(10);
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset simulation
  const handleReset = useCallback((currentNumAgents, currentParticleRadius) => {
    setIsRunning(false);
    setIsInitialized(false);
    setAggregatedAgents([]);
    
    // Reset all agents
    const newAgents = [];
    for (let i = 0; i < currentNumAgents; i++) {
      const newAgent = new Agent(
        GRID_SIZE,
        i,
        "#4A90E2",
        -1,
        -1,
        currentParticleRadius,
        true
      );
      newAgents.push(newAgent);
    }
    setAgents(newAgents);
  }, []);

  // Initialize simulation when component mounts
  useEffect(() => {
    handleReset(numAgents, particleRadius);
  }, []);

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
    <div className="full-container">
      <TemplateGridAndControls
        modelName="Diffusion-Limited Aggregation"
        GRID_SIZE={GRID_SIZE}
        agents={agents}
        numAgents={numAgents}
        setNumAgents={setNumAgents}
        particleRadius={particleRadius}
        setParticleRadius={setParticleRadius}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        handleReset={handleReset}
      >
        {/* DLA-specific controls rendered as children */}
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

        <div className="stat-item">
          Aggregated Particles: {aggregatedAgents.length}
        </div>
      </TemplateGridAndControls>
    </div>
  );
};

export default DiffusionLimitedAggregation_usingTemplate;