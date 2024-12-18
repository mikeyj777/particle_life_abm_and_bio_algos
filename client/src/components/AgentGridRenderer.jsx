import React, { useEffect, useRef, useState } from 'react';

const AgentGridRenderer = ({ agents , GRID_SIDE_x, GRID_SIDE_y = -1}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [frameCount, setFrameCount] = useState(0);

  if (GRID_SIDE_y === -1) {
    GRID_SIDE_y = GRID_SIDE_x;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      // Update agent positions
      agents.forEach(agent => {
        agent.internalSteps();
      });

      // Clear the canvas
      ctx.clearRect(0, 0, GRID_SIDE_x, GRID_SIDE_y);

      // Draw each agent
      agents.forEach(agent => {
        ctx.beginPath();
        ctx.fillStyle = agent.color;
        ctx.arc(
          agent.x,
          agent.y,
          agent.radius,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
      
      // Increment frame count
      setFrameCount(frameCount + 1);



      // Request next frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animate();

    // Cleanup function to cancel animation when component unmounts
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [agents]); // Re-initialize animation when agents array changes

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIDE_x}
      height={GRID_SIDE_y}
      className="agent-grid-canvas"
    />
  );
};

export default AgentGridRenderer;