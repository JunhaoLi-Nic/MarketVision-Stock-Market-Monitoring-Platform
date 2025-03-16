import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/header';
import StockDashboard from './components/StockDashboard';

function App() {
  return (
    <div className="App" style={{ padding: 0 }}>
      <header>
        <Header />
      </header>
        
        <main>
            <StockDashboard />
            <Routes>
                <Route path="/" element={<StockDashboard />} />
                <Route path="/aboutme" element={<div>Daily Task Page</div>} />
                <Route path="/resume" element={<div>Resume Page</div>} />
                <Route path="/projects" element={<div>Projects Page</div>} />
            </Routes>
        </main>
    </div>
  );
}

export default App;
