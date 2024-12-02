import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import TestAgentGrid from './components/TestAgentGrid';
import DiffusionLimitedAggregation from './components/DiffusionLimitedAggregation';
import DiffusionLimitedAggregation_usingTemplate from './components/DiffusionLimitedAggregation_usingTemplate';
import Swarm from './components/Swarm';
// import AnimatedParticleSystem from './components/AnimatedParticleSystem';
import ParticleSwarm from './components/ParticleSwarm';
import './App.css';
import './styles/global.css';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<TestAgentGrid />} />
          <Route path="/dla" element={<DiffusionLimitedAggregation />} />
          <Route path="/dla-template" element={<DiffusionLimitedAggregation_usingTemplate />} />
          <Route path="/swarm" element={<Swarm />} />
          {/* <Route path="/particle-system" element={<AnimatedParticleSystem />} /> */}
          <Route path="/particle-swarm" element={<ParticleSwarm />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;