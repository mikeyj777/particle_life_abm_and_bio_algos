import React, { useEffect, useRef, useState } from 'react';

const AgentGridRenderer = ({ agents }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [frameCount, setFrameCount] = useState(0);
  const GRID_SIZE = 800;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      // Update agent positions
      agents.forEach(agent => {
        agent.internalSteps();
      });

      // Clear the canvas
      ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);

      // Draw each agent
      agents.forEach(agent => {
        ctx.beginPath();
        ctx.fillStyle = agent.color;
        ctx.arc(
          agent.x,
          agent.y,
          agent.diameter / 2,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
      
      console.log("Frame count:", frameCount);
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
      width={GRID_SIZE}
      height={GRID_SIZE}
      className="agent-grid-canvas"
    />
  );
};

export default AgentGridRenderer;