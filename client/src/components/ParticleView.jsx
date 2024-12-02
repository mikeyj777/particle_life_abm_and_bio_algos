import React, { useEffect, useState } from 'react';

const ParticleView = ({ particle }) => {
  const angle = Math.atan2(particle.velocity.y, particle.velocity.x);
  const length = particle.velocity.magnitude() * 8;
  
  return (
    <g 
      transform={`
        translate(${particle.position.x}, ${particle.position.y})
        rotate(${angle * (180/Math.PI)})
      `}
    >
      <line
        x1="0"
        y1="0"
        x2={length}
        y2="0"
        stroke={`hsl(${particle.mass}, 70%, 50%)`}
        strokeWidth="2"
      />
    </g>
  );
};

export default ParticleView;