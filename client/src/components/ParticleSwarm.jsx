import React, { useEffect, useState } from 'react';
import Particle from '../classes/Particle';
import Vector2 from '../classes/Vector2';
import ParticleView from './ParticleView';  

const GRID_SIZE = 800;

const createInitialParticles = (numParticles) => {
  const particles = [];
  for (let i = 0; i < numParticles; i++) {
    const x = Math.random() * GRID_SIZE;
    const y = Math.random() * GRID_SIZE;
    
    const velocity = new Vector2(
      (Math.random() * 2 - 1) * 3,
      (Math.random() * 2 - 1) * 3
    );
    
    particles.push(
      new Particle(
        GRID_SIZE,
        i,
        i * 30,
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

const ParticleSwarm = () => {
  const [numParticles, setNumParticles] = useState(100);
  const [particles, setParticles] = useState([]);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [mousePresent, setMousePresent] = useState(false);

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

          updatedParticle.applyForce(mouseCoords);

          updatedParticle.position.x = (updatedParticle.position.x + GRID_SIZE) % GRID_SIZE;
          updatedParticle.position.y = (updatedParticle.position.y + GRID_SIZE) % GRID_SIZE;


          return updatedParticle;
        })
      );

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [mouseCoords, numParticles]);

  return (
    <div className="particle-system-container">
      <svg 
        width={GRID_SIZE} 
        height={GRID_SIZE}
        className="particle-system"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setMousePresent(true)}
        onMouseLeave={() => setMousePresent(false)}
      >
        {particles.map((particle) => (
          <ParticleView 
            key={particle.id} 
            particle={particle} 
          />
        ))}
      </svg>

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
    </div>
  );
};

export default ParticleSwarm;