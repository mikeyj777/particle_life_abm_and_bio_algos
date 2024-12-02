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

  useEffect(() => {
    setParticles(createInitialParticles(numParticles));
  }, [numParticles]);

  useEffect(() => {
    let frameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

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

          updatedParticle.position = updatedParticle.position.add(
            updatedParticle.velocity.multiply(deltaTime)
          );

          updatedParticle.position.x = (updatedParticle.position.x + GRID_SIZE) % GRID_SIZE;
          updatedParticle.position.y = (updatedParticle.position.y + GRID_SIZE) % GRID_SIZE;

          const randomForce = new Vector2(
            (Math.random() * 2 - 1) * 0.5,
            (Math.random() * 2 - 1) * 0.5
          );
          updatedParticle.velocity = updatedParticle.velocity
            .add(randomForce)
            .limit(updatedParticle.maxVelocity);

          return updatedParticle;
        })
      );

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="particle-system-container">
      <svg 
        width={GRID_SIZE} 
        height={GRID_SIZE}
        className="particle-system"
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