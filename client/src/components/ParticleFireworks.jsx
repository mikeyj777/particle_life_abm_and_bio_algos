import React, { useEffect, useState } from 'react';
import Particle from '../classes/Particle';
import Vector2 from '../classes/Vector2';
import ParticleView from './ParticleView';
import AgentGridRenderer from './AgentGridRenderer';
import { generateColors } from '../utils/helpers';

const GRID_SIZE = 800;
const gravity = 0.01;


const createInitialParticles = (numParticles) => {
  const maxVelocity = 2.5;
  const minVelocity = 1.5;
  const colors = generateColors(numParticles);
  const particles = [];
  for (let i = 0; i < numParticles; i++) {
    const x = 0.5 * GRID_SIZE;
    const y = 0.5 * GRID_SIZE;
    const baseVelocity = Math.random() * (maxVelocity - minVelocity) + minVelocity;
    const velocity = new Vector2(
      baseVelocity * Math.cos(i / numParticles * 2 * Math.PI),
      baseVelocity * Math.sin(i / numParticles * 2 * Math.PI)
    );
    // constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = 5, mass = -1, maxMass = 360)
    particles.push(
      new Particle(
        GRID_SIZE,
        i,
        colors[i],
        x,
        y,
        5,
        false,
        true,
        velocity,
        5,
        20 + Math.random() * 40
      )
    );
  }
  return particles;
};

const ParticleFireworks = () => {
  const [numParticles, setNumParticles] = useState(100);
  const [particles, setParticles] = useState([]);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [mousePresent, setMousePresent] = useState(false);
  const [tailLength, setTailLength] = useState(50);

  useEffect(() => {
    setParticles(createInitialParticles(numParticles));
  }, [numParticles]);

  const handleMouseMove = (event) => {
    const svgRect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    console.log("svgRect: ", svgRect, " | mouseX: ", mouseX, " | mouseY: ", mouseY);
    setMouseCoords({ x: mouseX, y: mouseY });
  }

  useEffect(() => {
    
    let frameId;

    const animate = () => {
      setParticles(currentParticles => 
        currentParticles.map(particle => {
          const updatedParticle = new Particle(
            particle.gridSize,
            particle.id,
            particle.color,
            particle.position.x,
            particle.position.y,
            particle.radius,
            particle.brownian,
            particle.mobile,
            particle.velocity,
            particle.maxVelocity,
            particle.mass
          );
          
          // if (mousePresent) updatedParticle.applyForce(mouseCoords);
          updatedParticle.move(gravity)


          return updatedParticle;
        })
      );

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [numParticles]);

  return (
    <div className="container">
      <div className="visualization-panel">
        <AgentGridRenderer 
          agents={particles} 
          GRID_SIZE={GRID_SIZE}
        />
      </div>
      <div className="control-panel">
        <div className="control-section">
          <h3>Parameters</h3>
          <label>Number of particles:</label>
          <input
            type="range"
            value={numParticles}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setNumParticles(value);
            }}
            min={10}
            max={300}
            step={10}
          />
          <div className="stat-item">
            Particles: {numParticles}
          </div>
        </div>
        <div className="control-section">
          <label>Tail length:</label>
          <input
            type="range"
            value={tailLength}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setTailLength(value);
            }}
            min={10}
            max={300}
            step={10}
          />
          <div className="stat-item">
            Tail length: {tailLength}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleFireworks;