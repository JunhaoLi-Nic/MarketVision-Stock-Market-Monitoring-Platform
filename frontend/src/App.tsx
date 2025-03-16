import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/header';
import StockDashboard from './components/StockDashboard';
import DailyTask from './components/DailyTask';

function App() {
  return (
    <div className="App" style={{ padding: 0 }}>
      <header>
        <Header />
      </header>
      
      <main style={{ marginTop: '80px', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<StockDashboard />} />
          <Route path="/DailyTask" element={<DailyTask />} />
          <Route path="/ContactMe" element={<div>Contact me</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
