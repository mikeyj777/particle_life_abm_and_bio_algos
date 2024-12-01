import React, { useState, useEffect, useCallback } from 'react';
import FlockingAgent from '../classes/FlockingAgent';
import TemplateGridAndControls from './TemplateGridAndControls';

const BASE_BOIDS_PARAMS = {
  maxForce: 0.1,
  separation: 1.5,
  alignment: 1.0,
  cohesion: 1.0,
  perceptionRadius: 50,
  desiredSeparation: 25,
  turnFactor: 0.1,
  minSpeed: 0.5,
  edgeMargin: 30
}

const Swarm = () => {
  // Grid configuration
  const GRID_SIZE = 800;

  // Template-managed states (lifted up from template)
  const [numAgents, setNumAgents] = useState(100);
  const [particleRadius, setParticleRadius] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [perceptionRadius, setPerceptionRadius] = useState(50);
  const [separation, setSeparation] = useState(1.5);
  const [alignment, setAlignment] = useState(1.0);
  const [cohesion, setCohesion] = useState(1.0);



  // Swarm-specific states
  const [agents, setAgents] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset simulation
  const handleReset = useCallback((currentNumAgents, currentParticleRadius) => {
    setIsRunning(false);
    setIsInitialized(false);
    
    // Reset all agents
    const newAgents = [];
    for (let i = 0; i < currentNumAgents; i++) {
      // constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = 5) 
      const newAgent = new FlockingAgent(
        GRID_SIZE,
        i,
        -1,
        -1,
        -1,
        currentParticleRadius,
        false,
        true,
        null,
        5
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
      
      agents.forEach(agent => {
        agent.mobile = true;
        agent.setVelocity();
        agent.setFlockingParams(BASE_BOIDS_PARAMS);
      })
      setIsInitialized(true);
    }

    let animationFrameId;
    
    const animate = () => {
      setAgents(currentAgents => {
        const updatedAgents = [...currentAgents];
        
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
        modelName="Flocking Swarm"
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
        {/* Swarm-specific controls rendered as children */}
        <div className="control-section">
          <label>Perception radius:</label>
          <input
            type="range"
            value={perceptionRadius}
            onChange={(e) => setPerceptionRadius(parseInt(e.target.value))}
            min={0}
            max={100}
            step={5}
          />
          <div className="stat-item">
            Radius: {perceptionRadius}
          </div>
        </div>

        <div className="control-section">
          <label>Separation:</label>
          <input
            type="range"
            value={separation}
            onChange={(e) => setSeparation(parseInt(e.target.value))}
            min={0}
            max={3}
            step={0.1}
          />
          <div className="stat-item">
            Separation: {separation}
          </div>
        </div>

        <div className="control-section">
          <label>Cohesion:</label>
          <input
            type="range"
            value={cohesion}
            onChange={(e) => setCohesion(parseInt(e.target.value))}
            min={0}
            max={1}
            step={0.1}
          />
          <div className="stat-item">
            Cohesion: {cohesion}
          </div>
        </div>

        <div className="control-section">
          <label>Alignment:</label>
          <input
            type="range"
            value={alignment}
            onChange={(e) => setAlignment(parseInt(e.target.value))}
            min={0}
            max={1}
            step={0.1}
          />
          <div className="stat-item">
            Alignment: {alignment}
          </div>
        </div>

        <div className="stat-item">
          Particles: {agents.length}
        </div>
      </TemplateGridAndControls>
    </div>
  );
};

export default Swarm;