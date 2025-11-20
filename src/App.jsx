import React from 'react';
import {  Routes, Route } from 'react-router-dom';
import { CountryProvider } from './context/CountryContext';
import Dashboard from './pages/Dashboard';
import CountryDetail from './pages/CountryDetail';
import './App.css';
import { Globe } from 'lucide-react';

function App() {
  return (
    <CountryProvider>
        <div className="app">
          <header className="app-header">
            <div className='nav-items'>
            <Globe size={24} color='blue'/> 
            <h1>The Interstellar Atlas</h1>
            </div>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/country/:code" element={<CountryDetail />} />
            </Routes>
          </main>
        </div>
    </CountryProvider>
  );
}

export default App;