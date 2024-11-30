// src/components/TestAgentGrid.jsx

import React, { useState } from 'react';
import AgentGridRenderer from './AgentGridRenderer';
import Agent from '../classes/Agent';

const TestAgentGrid = () => {
  const [agents, setAgents] = useState([]);
  const [brownianEnabled, setBrownianEnabled] = useState(false);
  const GRID_SIZE = 800;

  const addRandomAgent = () => {
    const newAgent = new Agent(
      GRID_SIZE,
      agents.length,
      -1,
      -1,
      -1,
      -1,
      brownianEnabled
    );
    setAgents([...agents, newAgent]);
  };

  const addMultipleAgents = (count) => {
    const newAgents = [...agents];
    for (let i = 0; i < count; i++) {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
      newAgents.push(
        new Agent(
          GRID_SIZE,
          newAgents.length,
          -1,
          -1,
          -1,
          -1,
          brownianEnabled
        )
      );
    }
    setAgents(newAgents);
  };

  const clearAgents = () => {
    setAgents([]);
  };

  const toggleBrownian = () => {
    // const updatedAgents = agents.map(agent => {
    //   agent.brownian = !brownianEnabled;
    //   return agent;
    // });
    setBrownianEnabled(!brownianEnabled);
    // setAgents([...updatedAgents]); // Create new reference to trigger update
  };

  return (
    <div className="test-container">
      <div className="visualization-panel">
        <AgentGridRenderer agents={agents} />
      </div>
      
      <div className="control-panel">
        <h2>Agent Controls</h2>
        
        <div className="control-section">
          <h3>Motion Control</h3>
          <button 
            onClick={toggleBrownian}
            className={brownianEnabled ? 'active' : ''}
          >
            Brownian Motion: {brownianEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="control-section">
          <h3>Add Agents</h3>
          <button onClick={addRandomAgent}>Add Single Agent</button>
          <button onClick={() => addMultipleAgents(10)}>Add 10 Agents</button>
          <button onClick={() => addMultipleAgents(100)}>Add 100 Agents</button>
        </div>

        <div className="control-section">
          <h3>Remove Agents</h3>
          <button onClick={clearAgents}>Clear All Agents</button>
        </div>

        <div className="control-section">
          <h3>Statistics</h3>
          <div className="stat-item">
            Total Agents: {agents.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAgentGrid;